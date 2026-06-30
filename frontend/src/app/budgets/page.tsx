"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Target, ChevronLeft, ChevronRight, Edit2, Info, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { Toast, ToastType } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { getBudgetSummary, upsertBudget, BudgetSummaryItem } from "@/services/budgetService";

export default function BudgetsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [budgets, setBudgets] = useState<BudgetSummaryItem[]>([]);
    
    // Month navigation
    const getCurrentMonth = () => {
        const now = new Date();
        return `${String(now.getUTCMonth() + 1).padStart(2, '0')}-${now.getUTCFullYear()}`;
    };
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

    const navigateMonth = (direction: -1 | 1) => {
        const [m, y] = selectedMonth.split('-').map(Number);
        let newMonth = m + direction;
        let newYear = y;
        if (newMonth < 1) { newMonth = 12; newYear--; }
        if (newMonth > 12) { newMonth = 1; newYear++; }
        setSelectedMonth(`${String(newMonth).padStart(2, '0')}-${newYear}`);
    };

    const formatMonthLabel = (monthStr: string) => {
        const [m, y] = monthStr.split('-').map(Number);
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${monthNames[m - 1]} ${y}`;
    };

    // Modal state
    const [editingItem, setEditingItem] = useState<BudgetSummaryItem | null>(null);
    const [isBaseEdit, setIsBaseEdit] = useState(true);
    const [editAmount, setEditAmount] = useState("");

    const fetchData = async (token: string) => {
        setIsLoading(true);
        try {
            const data = await getBudgetSummary(token, selectedMonth);
            setBudgets(data);
        } catch (error: any) {
            setToast({ message: error.message || 'Error cargando presupuestos', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth");
            return;
        }
        fetchData(token);
    }, [selectedMonth, router]);

    const handleSaveBudget = async () => {
        if (!editingItem) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await upsertBudget(
                token,
                editingItem.itemId,
                Number(editAmount),
                isBaseEdit,
                isBaseEdit ? undefined : selectedMonth,
                editingItem.currency
            );
            setToast({ message: 'Presupuesto guardado con éxito', type: 'success' });
            setEditingItem(null);
            fetchData(token);
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        }
    };

    const openEditModal = (item: BudgetSummaryItem, base: boolean) => {
        setEditingItem(item);
        setIsBaseEdit(base);
        setEditAmount(base ? item.baseAmount.toString() : item.extraAmount.toString());
    };

    // Calculate totals
    const totalFormulated = budgets.reduce((acc, b) => acc + b.formulated, 0);
    const totalConsumed = budgets.reduce((acc, b) => acc + b.consumed, 0);
    const globalStatus = totalFormulated > 0 ? (totalConsumed > totalFormulated ? 'EXCEEDED' : totalConsumed > totalFormulated * 0.8 ? 'WARNING' : 'OK') : 'OK';

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <Sidebar />

            <main className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black overflow-y-auto">
                {/* Header */}
                <header className="border-b border-white/10 shrink-0 bg-black/20 backdrop-blur-md sticky top-0 z-10 h-16 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                            <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-light tracking-tight">Presupuestos</h1>
                    </div>

                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-1 py-0.5">
                        <button onClick={() => navigateMonth(-1)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Mes anterior">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium text-purple-300 min-w-[120px] text-center">
                            {formatMonthLabel(selectedMonth)}
                        </span>
                        <button onClick={() => navigateMonth(1)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Mes siguiente">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 pb-20">
                    
                    {/* Resumen Global */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mx-20 -my-20 pointer-events-none"></div>
                        
                        <div className="flex-1 w-full">
                            <h2 className="text-lg font-medium text-gray-300 mb-2">Presupuesto Mensual Total</h2>
                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-4xl font-bold">{formatCurrency(totalFormulated, 'CRC')}</span>
                            </div>
                            
                            {/* Progress bar global */}
                            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mt-4 relative">
                                <div 
                                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${globalStatus === 'EXCEEDED' ? 'bg-red-500' : globalStatus === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min((totalConsumed / Math.max(totalFormulated, 1)) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                                <span>Consumido: <strong className="text-white">{formatCurrency(totalConsumed, 'CRC')}</strong></span>
                                <span>{(totalConsumed / Math.max(totalFormulated, 1) * 100).toFixed(1)}%</span>
                            </div>
                        </div>

                        {globalStatus === 'EXCEEDED' && (
                            <div className="shrink-0 bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 max-w-sm">
                                <AlertCircle className="text-red-400 shrink-0" size={24} />
                                <p className="text-sm text-red-200">Has superado tu presupuesto total planificado para este mes. Revisa los detalles abajo.</p>
                            </div>
                        )}
                    </div>

                    {/* Lista de Presupuestos por Categoría */}
                    {isLoading ? (
                        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(budgets.reduce((acc, curr) => {
                                (acc[curr.categoryName] = acc[curr.categoryName] || []).push(curr);
                                return acc;
                            }, {} as Record<string, BudgetSummaryItem[]>)).map(([categoryName, items]) => (
                                <div key={categoryName} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                    <div className="bg-white/5 px-6 py-3 border-b border-white/10">
                                        <h3 className="font-medium text-gray-200 uppercase tracking-wider text-xs">{categoryName}</h3>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {items.map(item => (
                                            <div key={item.itemId} className="p-6 transition-colors hover:bg-white/[0.02]">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    
                                                    {/* Nombre y Barras */}
                                                    <Link href={`/transactions?itemId=${item.itemId}&month=${selectedMonth}`} className="flex-1 block group cursor-pointer hover:opacity-80 transition-opacity">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium text-white group-hover:text-indigo-300 transition-colors">{item.itemName}</h4>
                                                                {item.status === 'EXCEEDED' && <AlertCircle size={14} className="text-red-400" />}
                                                            </div>
                                                            <div className="text-sm text-gray-400 text-right">
                                                                <span className={item.status === 'EXCEEDED' ? 'text-red-400 font-medium' : 'text-white'}>{formatCurrency(item.consumed, item.currency)}</span>
                                                                {' / '}
                                                                <span>{formatCurrency(item.formulated, item.currency)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
                                                            <div 
                                                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${item.status === 'EXCEEDED' ? 'bg-red-500' : item.status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                                                style={{ width: `${Math.min((item.consumed / Math.max(item.formulated, 1)) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </Link>

                                                    {/* Botones de Edición */}
                                                    <div className="flex items-center gap-2 md:w-64 shrink-0 justify-end">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <button 
                                                                onClick={() => openEditModal(item, true)}
                                                                className="group flex items-center gap-2 text-xs text-gray-400 hover:text-white bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/20 transition-all"
                                                            >
                                                                <span>Base: {formatCurrency(item.baseAmount, item.currency)}</span>
                                                                <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </button>
                                                            
                                                            <button 
                                                                onClick={() => openEditModal(item, false)}
                                                                className={`group flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all ${item.extraAmount > 0 ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:border-purple-500/60' : 'text-gray-500 hover:text-white bg-transparent border-dashed border-gray-700 hover:border-gray-500'}`}
                                                            >
                                                                <span>Extra mes: {formatCurrency(item.extraAmount, item.currency)}</span>
                                                                {item.extraAmount === 0 ? <Plus size={12} /> : <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Edición */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mx-10 -my-10 pointer-events-none"></div>
                        
                        <h3 className="text-xl font-medium mb-1 relative z-10">{editingItem.itemName}</h3>
                        <p className="text-sm text-gray-400 mb-6 relative z-10">
                            {isBaseEdit ? 'Presupuesto Base (todos los meses)' : `Gasto Extra para ${formatMonthLabel(selectedMonth)}`}
                        </p>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Monto ({editingItem.currency})</label>
                                <input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>

                            <div className="bg-white/5 p-3 rounded-lg flex items-start gap-2 text-xs text-gray-400">
                                <Info size={14} className="shrink-0 mt-0.5 text-purple-400" />
                                <p>
                                    {isBaseEdit 
                                        ? 'Al guardar un presupuesto base, este aplicará indefinidamente para todos los meses a partir de ahora, a menos que lo cambies.' 
                                        : 'Este monto se sumará al presupuesto base ÚNICAMENTE durante el mes seleccionado.'}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveBudget}
                                    className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
