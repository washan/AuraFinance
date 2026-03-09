"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Check, X, RefreshCw, Zap } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Toast, ToastType } from "@/components/ui/toast";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export default function InboxPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.push("/auth");
        } else {
            setUser(JSON.parse(storedUser));
            fetchData(token);
        }

        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get('action') === 'saved') {
                setToast({ message: "Transacción registrada exitosamente.", type: "success" });
                // Remove the query parameter without refreshing the page
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [router]);

    const fetchData = async (token: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inbox`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setTransactions(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSync = async () => {
        const token = localStorage.getItem("token");
        setIsSyncing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inbox/sync`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setToast({ message: "Sincronización completada.", type: "success" });
                fetchData(token!);
            } else {
                setToast({ message: "Error al sincronizar.", type: "error" });
            }
        } catch (e) {
            setToast({ message: "Error de red al sincronizar.", type: "error" });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDismiss = async (id: string) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inbox/${id}/dismiss`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setTransactions(prev => prev.filter(t => t.id !== id));
                setToast({ message: "Transacción descartada.", type: "success" });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleInclude = (tx: any) => {
        const params: Record<string, string> = {
            inboxId: tx.id,
            origin: 'inbox',
            amount: tx.amount.toString(),
            date: format(new Date(tx.date), 'yyyy-MM-dd'),
            merchant: tx.merchant,
            currency: tx.currency
        };

        // Add rule-suggested fields to query params
        if (tx.matchedRule) {
            if (tx.matchedRule.accountId) params.accountId = tx.matchedRule.accountId;
            if (tx.matchedRule.itemId) params.itemId = tx.matchedRule.itemId;
            if (tx.matchedRule.projectId) params.projectId = tx.matchedRule.projectId;
            if (tx.matchedRule.goalId) params.goalId = tx.matchedRule.goalId;
        }

        const queryParams = new URLSearchParams(params).toString();
        router.push(`/transactions?${queryParams}`);
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black overflow-y-auto">
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-4 pl-16 md:px-8 shrink-0 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-2xl font-light tracking-tight flex items-center gap-3">
                        <Bell className="text-indigo-400" />
                        Buzón de Transacciones
                        {transactions.length > 0 && (
                            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/30">
                                {transactions.length} Nuevas
                            </span>
                        )}
                    </h1>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> Sincronizar
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8 pb-20">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                            <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-medium text-gray-300">Buzón Vacío</h3>
                            <p className="text-gray-500 mt-2">No tienes nuevas notificaciones del banco.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map(tx => (
                                <div key={tx.id} className={`bg-black/40 border rounded-2xl p-6 hover:bg-white/5 transition-colors flex items-center justify-between group relative overflow-hidden ${tx.source === 'RECURRING' ? 'border-cyan-500/30' : tx.matchedRule ? 'border-amber-500/30' : 'border-white/10'}`}>
                                    {/* Left highlight */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${tx.source === 'RECURRING' ? 'from-cyan-400 to-blue-500' : tx.matchedRule ? 'from-amber-400 to-orange-500' : 'from-indigo-500 to-purple-500'}`}></div>

                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.source === 'RECURRING' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : tx.matchedRule ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'}`}>
                                            {tx.source === 'RECURRING' ? <RefreshCw size={24} /> : tx.matchedRule ? <Zap size={24} /> : <Bell size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-medium text-white">{tx.merchant}</h3>
                                                {tx.source === 'RECURRING' && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-semibold flex items-center gap-1">
                                                        <RefreshCw size={10} /> Recurrente
                                                    </span>
                                                )}
                                                {tx.matchedRule && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 font-semibold flex items-center gap-1">
                                                        <Zap size={10} /> {tx.matchedRule.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                                <span>{format(new Date(tx.date), 'MMM dd, yyyy')}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                <span className="font-mono text-xs px-2 py-0.5 bg-white/5 rounded border border-white/10">{tx.accountInfo || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="font-bold text-xl text-white">
                                                {formatCurrency(parseFloat(tx.amount), tx.currency === 'CRC' ? '₡' : '$')}
                                            </p>
                                            <p className="text-xs text-gray-500">{tx.currency}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleInclude(tx)}
                                                className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                                            >
                                                <Check size={16} /> Incluir
                                            </button>
                                            <button
                                                onClick={() => handleDismiss(tx.id)}
                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                                                title="Descartar"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
