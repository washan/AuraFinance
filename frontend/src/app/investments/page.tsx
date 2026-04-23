"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Bell, Plus, TrendingUp, TrendingDown, DollarSign, BrainCircuit, RefreshCw, History } from "lucide-react";
import { getPortfolio, getAiInsights, PortfolioSummary } from "@/services/investmentService";
import { AddInvestmentModal } from "@/components/investments/AddInvestmentModal";
import { TransactionsHistoryModal } from "@/components/investments/TransactionsHistoryModal";

export default function InvestmentsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    
    // Currency states
    const [isColones, setIsColones] = useState(false);
    const [exchangeRate, setExchangeRate] = useState<number>(1);
    
    // AI States
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth");
        } else {
            fetchData(token);
        }
    }, [router]);

    const fetchData = async (token: string) => {
        try {
            const [data, paramsRes] = await Promise.all([
                getPortfolio(token),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/parameters`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setPortfolio(data);
            if (paramsRes.ok) {
                const params = await paramsRes.json();
                const rateParam = params.find((p: any) => p.code === 'LAST_EXCHANGE_RATE');
                if (rateParam && rateParam.value) {
                    setExchangeRate(parseFloat(rateParam.value));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        const token = localStorage.getItem("token");
        if (token) fetchData(token);
    };

    const handleGetInsights = async () => {
        setLoadingAi(true);
        setAiError(null);
        setAiInsight(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await getAiInsights(token);
            setAiInsight(res.analysis);
        } catch (e: any) {
            setAiError(e.message);
        } finally {
            setLoadingAi(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const formatCurrency = (val: number, isColonesOverride = isColones) => {
        const finalVal = val * (isColonesOverride ? exchangeRate : 1);
        return new Intl.NumberFormat(isColonesOverride ? 'es-CR' : 'en-US', { 
            style: 'currency', 
            currency: isColonesOverride ? 'CRC' : 'USD' 
        }).format(finalVal);
    };
    const formatPct = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black overflow-y-auto">
                {/* Header */}
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-4 pl-16 md:px-8 shrink-0 bg-black/40 backdrop-blur-md sticky top-0 z-30">
                    <h1 className="text-2xl font-light tracking-tight">Portafolio de Inversión</h1>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsColones(!isColones)} 
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${isColones ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5'}`}
                            title="Cambiar Moneda"
                        >
                            {isColones ? '₡ CRC' : '$ USD'}
                        </button>
                        <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-300">
                            <RefreshCw size={18} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => setIsHistoryOpen(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-300" title="Historial de Transacciones">
                            <History size={18} />
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                            <Plus size={16} /> Nueva Transacción
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 pb-32">
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group">
                            <div>
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                                <h3 className="text-sm font-medium text-gray-400 mb-2">Valor Actual Total</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-light tracking-tight text-white">{formatCurrency(portfolio?.totalMarketValue || 0)}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-1.5 border-t border-white/5 pt-3">
                                {portfolio?.positions.map(pos => (
                                    <div key={pos.instrumentId} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">{pos.symbol}</span>
                                        <span className="text-gray-300">
                                            {formatCurrency(pos.marketValue)}
                                            <span className="text-gray-500 ml-1">
                                                ({portfolio.totalMarketValue ? ((pos.marketValue / portfolio.totalMarketValue) * 100).toFixed(1) : 0}%)
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group">
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-2">Monto Total Invertido</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-light tracking-tight text-gray-200">{formatCurrency(portfolio?.totalInvested || 0)}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-1.5 border-t border-white/5 pt-3">
                                {portfolio?.positions.map(pos => (
                                    <div key={pos.instrumentId} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">{pos.symbol}</span>
                                        <span className="text-gray-300">
                                            {formatCurrency(pos.costBasis)}
                                            <span className="text-gray-500 ml-1">
                                                ({portfolio.totalInvested ? ((pos.costBasis / portfolio.totalInvested) * 100).toFixed(1) : 0}%)
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group">
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-2">Ganancia/Pérdida Neta</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-light tracking-tight ${(portfolio?.totalUnrealizedPl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatCurrency(portfolio?.totalUnrealizedPl || 0)}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm font-medium text-gray-400 flex items-center gap-1">
                                    {(portfolio?.totalUnrealizedPl || 0) >= 0 ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-red-400" />}
                                    <span className={(portfolio?.totalUnrealizedPl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                        {portfolio?.totalInvested ? formatPct(((portfolio.totalUnrealizedPl) / portfolio.totalInvested) * 100) : '0.00%'}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-1.5 border-t border-white/5 pt-3">
                                {portfolio?.positions.map(pos => (
                                    <div key={pos.instrumentId} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">{pos.symbol}</span>
                                        <span className={`flex items-center gap-1 ${pos.unrealizedPl >= 0 ? 'text-emerald-400/90' : 'text-red-400/90'}`}>
                                            <span>{pos.unrealizedPl > 0 ? '+' : ''}{formatCurrency(pos.unrealizedPl)}</span>
                                            <span className={`px-1.5 py-0.5 rounded-md bg-black/20 ${pos.unrealizedPl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {formatPct(pos.unrealizedPlPct)}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Advisor Section */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                    <BrainCircuit className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Asesor de Inteligencia Artificial</h2>
                                    <p className="text-sm text-gray-400">Analiza tu portafolio en tiempo real con Gemini</p>
                                </div>
                            </div>
                            <button
                                onClick={handleGetInsights}
                                disabled={loadingAi}
                                className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors focus:ring-2 focus:ring-indigo-500 outline-none flex items-center gap-2"
                            >
                                {loadingAi ? <RefreshCw size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
                                {loadingAi ? 'Analizando...' : 'Generar Análisis'}
                            </button>
                        </div>
                        
                        {aiError && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4 relative z-10">
                                {aiError}
                            </div>
                        )}
                        
                        {aiInsight && (
                            <div className="prose prose-invert prose-indigo max-w-none text-gray-300 text-sm md:text-base leading-relaxed p-6 bg-black/40 border border-white/5 rounded-2xl relative z-10" dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n\n/g, '<br/><br/>') }}>
                            </div>
                        )}
                        {!aiInsight && !loadingAi && !aiError && (
                            <div className="text-center py-6 text-gray-500 text-sm relative z-10">
                                Haz clic en "Generar Análisis" para recibir consejos personalizados sobre tus inversiones actuales.
                            </div>
                        )}
                    </div>

                    {/* Positions Table (Broker View) */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Tus Participaciones</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {portfolio?.positions.length === 0 ? (
                                <div className="col-span-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center text-gray-400">
                                    No tienes inversiones registradas. Registra tu primera transacción.
                                </div>
                            ) : (
                                portfolio?.positions.map(pos => (
                                    <div key={pos.instrumentId} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group hover:bg-white/10 transition-colors">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mx-10 -my-10 transition-transform duration-700 group-hover:scale-150"></div>
                                        
                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div>
                                                <h3 className="text-xl font-bold text-white tracking-tight">{pos.symbol}</h3>
                                                <p className="text-xs text-gray-400 truncate max-w-[150px]" title={pos.name}>{pos.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-lg font-semibold ${pos.unrealizedPl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {pos.unrealizedPl > 0 ? '+' : ''}{formatCurrency(pos.unrealizedPl)}
                                                </div>
                                                <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 bg-black/40 border border-white/5 ${pos.unrealizedPl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {formatPct(pos.unrealizedPlPct)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10 border-b border-indigo-500/20 pb-6">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">Valor Actual Total</p>
                                                <p className="text-2xl font-light text-white">{formatCurrency(pos.marketValue)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 mb-1">N° de Acciones</p>
                                                <p className="text-xl font-light text-indigo-300">{pos.position.toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm relative z-10">
                                            <div>
                                                <p className="text-xs text-gray-500">Monto Invertido</p>
                                                <p className="text-gray-200 font-medium">{formatCurrency(pos.costBasis)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Comisiones Totales</p>
                                                <p className="text-red-300/80 font-medium">-{formatCurrency(pos.totalCommissions || 0)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Precio Actual</p>
                                                <p className="text-gray-300">{formatCurrency(pos.currentPrice)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Precio Promedio Compra</p>
                                                <p className="text-gray-400">{formatCurrency(pos.avgPrice)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </main>

            <AddInvestmentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => {
                    setIsModalOpen(false);
                    handleRefresh();
                }} 
            />

            <TransactionsHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onUpdate={handleRefresh}
            />
        </div>
    );
}
