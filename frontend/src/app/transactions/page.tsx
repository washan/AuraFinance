"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Plus, Trash2, Edit2, ArrowDownRight, ArrowUpRight, DollarSign, X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Toast, ToastType } from "@/components/ui/toast";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TransactionsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

    // Catalogs
    const [accounts, setAccounts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);
    const [parameters, setParameters] = useState<any[]>([]);

    // Data
    const [transactions, setTransactions] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [returnTo, setReturnTo] = useState<string | null>(null);

    const handleCloseModal = (wasSaved = false) => {
        setIsFormOpen(false);
        setEditingTransactionId(null);
        if (returnTo) {
            router.push(`${returnTo}${wasSaved ? '?action=saved' : ''}`);
            setReturnTo(null);
        }
    };

    // Filters
    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    };
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
    const [filterProjectId, setFilterProjectId] = useState<string>("");

    // Direct fetch for transactions only (called from filter handlers)
    const fetchTransactions = async (month: string, projectId: string) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const params = new URLSearchParams();
        if (month) params.set('month', month);
        if (projectId) params.set('projectId', projectId);
        const qs = params.toString();
        const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions${qs ? `?${qs}` : ''}`;

        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setTransactions(await res.json());
            }
        } catch (e) {
            console.error('Error fetching transactions:', e);
        }
    };

    const navigateMonth = (direction: -1 | 1) => {
        const [y, m] = selectedMonth.split('-').map(Number);
        let newMonth = m + direction;
        let newYear = y;
        if (newMonth < 1) { newMonth = 12; newYear--; }
        if (newMonth > 12) { newMonth = 1; newYear++; }
        const newValue = `${newYear}-${String(newMonth).padStart(2, '0')}`;
        setSelectedMonth(newValue);
        fetchTransactions(newValue, filterProjectId);
    };

    const goToCurrentMonth = () => {
        const current = getCurrentMonth();
        setSelectedMonth(current);
        fetchTransactions(current, filterProjectId);
    };

    const handleProjectFilterChange = (newProjectId: string) => {
        setFilterProjectId(newProjectId);
        fetchTransactions(selectedMonth, newProjectId);
    };

    const formatMonthLabel = (monthStr: string) => {
        const [y, m] = monthStr.split('-').map(Number);
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${monthNames[m - 1]} ${y}`;
    };

    const isCurrentMonth = selectedMonth === getCurrentMonth();

    // Form State
    // Load cached form defaults from localStorage
    const getCachedDefaults = () => {
        try {
            const cached = localStorage.getItem('txFormDefaults');
            if (cached) return JSON.parse(cached);
        } catch { }
        return {};
    };

    const cachedDefaults = getCachedDefaults();

    const [formData, setFormData] = useState({
        accountId: cachedDefaults.accountId || "",
        type: cachedDefaults.type || "expense",
        amountOriginal: "",
        currencyOriginal: cachedDefaults.currencyOriginal || "",
        exchangeRate: "1.0",
        amountBase: "",
        transactionDate: format(new Date(), 'yyyy-MM-dd'),
        categoryId: cachedDefaults.categoryId || "",
        itemId: cachedDefaults.itemId || "",
        projectId: cachedDefaults.projectId || "",
        destinationAccountId: cachedDefaults.destinationAccountId || "",
        goalId: cachedDefaults.goalId || "",
        notes: "",
        inboxTransactionId: "" as string | undefined
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.push("/auth");
        } else {
            setUser(JSON.parse(storedUser));
            fetchData(token, selectedMonth, filterProjectId || undefined);

            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const inboxId = params.get('inboxId');
                const origin = params.get('origin');

                if (origin === 'inbox') {
                    setReturnTo('/inbox');
                }

                if (inboxId) {
                    // Read rule-suggested fields
                    const ruleAccountId = params.get('accountId') || "";
                    const ruleItemId = params.get('itemId') || "";
                    const ruleProjectId = params.get('projectId') || "";
                    const ruleGoalId = params.get('goalId') || "";

                    setFormData(prev => ({
                        ...prev,
                        type: 'expense',
                        amountOriginal: params.get('amount') || "",
                        transactionDate: params.get('date') || format(new Date(), 'yyyy-MM-dd'),
                        notes: "Comercio: " + (params.get('merchant') || ""),
                        currencyOriginal: params.get('currency') || "CRC",
                        inboxTransactionId: inboxId,
                        // Rule pre-fill
                        accountId: ruleAccountId || prev.accountId,
                        itemId: ruleItemId || prev.itemId,
                        projectId: ruleProjectId || prev.projectId,
                        goalId: ruleGoalId || prev.goalId,
                    }));

                    // Derive categoryId from itemId using loaded categories
                    if (ruleItemId) {
                        // We need to wait for categories to load, so we'll set it after fetchData
                        const deriveCategoryFromItem = () => {
                            const token2 = localStorage.getItem("token");
                            if (!token2) return;
                            fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
                                headers: { Authorization: `Bearer ${token2}` }
                            }).then(r => r.json()).then((cats: any[]) => {
                                for (const cat of cats) {
                                    if (cat.items?.some((i: any) => i.id === ruleItemId)) {
                                        setFormData(prev => ({ ...prev, categoryId: cat.id }));
                                        break;
                                    }
                                }
                            }).catch(() => { });
                        };
                        deriveCategoryFromItem();
                    }

                    setIsFormOpen(true);
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        }
    }, [router]);

    const fetchData = async (token: string, month?: string, projectId?: string) => {
        try {
            const hdrs = { Authorization: `Bearer ${token}` };

            // Build transactions URL with filters
            const txParams = new URLSearchParams();
            if (month) txParams.set('month', month);
            if (projectId) txParams.set('projectId', projectId);
            const txQs = txParams.toString();
            const txUrl = `${process.env.NEXT_PUBLIC_API_URL}/transactions${txQs ? `?${txQs}` : ''}`;

            const [accRes, catRes, curRes, txRes, projRes, goalsRes, paramsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/currencies`, { headers: hdrs }),
                fetch(txUrl, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/parameters`, { headers: hdrs })
            ]);

            if (accRes.ok) setAccounts(await accRes.json());
            if (catRes.ok) setCategories(await catRes.json());
            if (curRes.ok) {
                const curData = await curRes.json();
                setCurrencies(curData.filter((c: any) => c.isActive));
            }
            if (txRes.ok) setTransactions(await txRes.json());
            if (projRes.ok) setProjects(await projRes.json());
            if (goalsRes.ok) setGoals(await goalsRes.json());
            if (paramsRes.ok) setParameters(await paramsRes.json());

            setIsLoading(false);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    // Logic for Multi-Currency
    const selectedAccount = accounts.find(a => a.id === formData.accountId);
    const accountCurrency = selectedAccount?.currencyCode;
    const isMultiCurrency = formData.currencyOriginal && accountCurrency && formData.currencyOriginal !== accountCurrency;

    // Derived Items for selected Category
    const selectedCategory = categories.find(c => c.id === formData.categoryId);
    const availableItems = selectedCategory?.items || [];

    // Auto-calculate base amount based on exchange rate
    useEffect(() => {
        if (formData.amountOriginal) {
            const amt = parseFloat(formData.amountOriginal);
            const rate = parseFloat(formData.exchangeRate);
            if (!isNaN(amt) && !isNaN(rate)) {
                // Keep to 2 decimal places for input field display
                setFormData(prev => ({ ...prev, amountBase: (amt * rate).toFixed(2) }));
            }
        } else {
            setFormData(prev => ({ ...prev, amountBase: "" }));
        }
    }, [formData.amountOriginal, formData.exchangeRate]);

    // Default form currency to account currency when account changes (but not when pre-filling from inbox)
    useEffect(() => {
        if (accountCurrency && !formData.inboxTransactionId) {
            const lastRate = parameters.find(p => p.code === 'LAST_EXCHANGE_RATE')?.value || "1.0";
            setFormData(prev => ({ ...prev, currencyOriginal: accountCurrency, exchangeRate: lastRate, amountBase: prev.amountOriginal }));
        }
    }, [formData.accountId, accountCurrency, parameters, formData.inboxTransactionId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        // Prepare amount logic
        let rawAmountBase = parseFloat(formData.amountBase);
        let rawAmountOriginal = parseFloat(formData.amountOriginal);

        // If expense, amount is negative
        if (formData.type === "expense") {
            rawAmountBase = -Math.abs(rawAmountBase);
            rawAmountOriginal = -Math.abs(rawAmountOriginal);
        } else {
            rawAmountBase = Math.abs(rawAmountBase);
            rawAmountOriginal = Math.abs(rawAmountOriginal);
        }

        const payload = {
            accountId: formData.accountId,
            destinationAccountId: formData.type === 'transfer' ? formData.destinationAccountId : undefined,
            goalId: (formData.type === 'transfer' || formData.type === 'expense') && formData.goalId ? formData.goalId : undefined,
            type: formData.type,
            itemId: formData.itemId ? formData.itemId : undefined,
            projectId: formData.type === 'transfer' ? undefined : (formData.projectId ? formData.projectId : undefined),
            amountOriginal: rawAmountOriginal.toString(),
            currencyOriginal: formData.currencyOriginal,
            exchangeRate: formData.exchangeRate,
            amountBase: rawAmountBase.toString(),
            transactionDate: formData.transactionDate,
            notes: formData.notes,
            inboxTransactionId: formData.inboxTransactionId
        };

        const isEditing = !!editingTransactionId;
        const endpoint = isEditing ? `${process.env.NEXT_PUBLIC_API_URL}/transactions/${editingTransactionId}` : `${process.env.NEXT_PUBLIC_API_URL}/transactions`;
        const method = isEditing ? "PATCH" : "POST";

        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            // Cache repetitive form fields for next time
            if (!isEditing) {
                const defaults = {
                    type: formData.type,
                    accountId: formData.accountId,
                    currencyOriginal: formData.currencyOriginal,
                    categoryId: formData.categoryId,
                    itemId: formData.itemId,
                    projectId: formData.projectId,
                    destinationAccountId: formData.type === 'transfer' ? formData.destinationAccountId : "",
                    goalId: formData.goalId,
                };
                localStorage.setItem('txFormDefaults', JSON.stringify(defaults));
            }
            fetchData(token!, selectedMonth, filterProjectId || undefined);
            if (!isEditing && !returnTo) {
                setToast({ message: "Transacción registrada exitosamente.", type: "success" });
            } else if (isEditing) {
                setToast({ message: "Transacción actualizada.", type: "success" });
            }

            // Reset only volatile fields (keep cached defaults)
            setFormData(prev => ({ ...prev, amountOriginal: "", amountBase: "", notes: "", inboxTransactionId: undefined }));
            handleCloseModal(true);
        } else {
            const err = await res.json();
            setToast({ message: `Error: ${err.message || 'No se pudo guardar.'}`, type: "error" });
        }
    };

    const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent opening the edit modal
        if (!window.confirm("¿Estás seguro de eliminar esta transacción? Esto revertirá el saldo aplicado a la cuenta.")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setToast({ message: "Transacción eliminada.", type: "success" });
            fetchData(token!, selectedMonth, filterProjectId || undefined);
        } else {
            setToast({ message: "Ocurrió un error al eliminar la transacción.", type: "error" });
        }
    };

    const openEditModal = (tx: any) => {
        setEditingTransactionId(tx.id);
        const isExpense = parseFloat(tx.amountBase) < 0;

        // Try to reverse-engineer Category ID from the Item, if it exists
        const matchedCategory = tx.item && tx.item.category;

        setFormData({
            type: tx.type || (isExpense ? "expense" : "income"),
            accountId: tx.account?.id || "",
            destinationAccountId: tx.destinationAccountId || "",
            goalId: tx.goalId || "",
            categoryId: matchedCategory ? tx.item.categoryId : "", // we'll need item.categoryId accessible
            itemId: tx.item?.id || "",
            projectId: tx.projectId || "",
            amountOriginal: Math.abs(parseFloat(tx.amountOriginal || '0')).toString(),
            currencyOriginal: tx.currencyOriginal || "USD",
            exchangeRate: tx.exchangeRate?.toString() || "1.0",
            amountBase: Math.abs(parseFloat(tx.amountBase || '0')).toString(),
            transactionDate: tx.transactionDate.split('T')[0],
            notes: tx.notes || "",
            inboxTransactionId: undefined
        });
        setIsFormOpen(true);
    };

    const filteredTransactions = transactions.filter(tx => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const itemName = (tx.item?.name || 'Manual').toLowerCase();
        const catName = (tx.item?.category?.name || '').toLowerCase();
        const accName = (tx.account?.name || '').toLowerCase();
        const notes = (tx.notes || '').toLowerCase();
        const amount = Math.abs(parseFloat(tx.amountBase || '0')).toString();

        return itemName.includes(term) || catName.includes(term) || accName.includes(term) || notes.includes(term) || amount.includes(term);
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black overflow-y-auto">
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-4 pl-16 md:px-8 shrink-0 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-light tracking-tight">Transacciones</h1>

                        {/* Month Navigator */}
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-1 py-0.5">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                title="Mes anterior"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => goToCurrentMonth()}
                                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${isCurrentMonth ? 'text-indigo-300' : 'text-amber-300 hover:bg-white/10'
                                    }`}
                                title={isCurrentMonth ? 'Mes actual' : 'Ir al mes actual'}
                            >
                                <Calendar size={14} />
                                {formatMonthLabel(selectedMonth)}
                            </button>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                title="Mes siguiente"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Project Filter */}
                        {projects.length > 0 && (
                            <select
                                value={filterProjectId}
                                onChange={e => handleProjectFilterChange(e.target.value)}
                                className="bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] appearance-none"
                            >
                                <option value="" className="bg-zinc-900 text-white">Todas las actividades</option>
                                <option value="__none__" className="bg-zinc-900 text-gray-400">📭 Sin Actividad</option>
                                {projects.map(p => <option key={p.id} value={p.id} className="bg-zinc-900 text-white">💼 {p.name}</option>)}
                            </select>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={() => {
                            setEditingTransactionId(null);
                            const cached = getCachedDefaults();
                            const lastRate = parameters.find((p: any) => p.code === 'LAST_EXCHANGE_RATE')?.value || "1.0";
                            setFormData({
                                type: cached.type || "expense",
                                accountId: cached.accountId || "",
                                destinationAccountId: cached.destinationAccountId || "",
                                goalId: cached.goalId || "",
                                categoryId: cached.categoryId || "",
                                itemId: cached.itemId || "",
                                projectId: cached.projectId || "",
                                amountOriginal: "",
                                currencyOriginal: cached.currencyOriginal || "",
                                exchangeRate: lastRate,
                                amountBase: "",
                                transactionDate: format(new Date(), 'yyyy-MM-dd'),
                                notes: "",
                                inboxTransactionId: undefined
                            });
                            setIsFormOpen(true);
                            setReturnTo(null);
                        }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            <Plus size={16} /> Nueva Transacción
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8 pb-20">
                    {/* Activity List */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium">Historial Reciente</h3>
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-black/50 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-gray-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {filteredTransactions.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No hay transacciones registradas.</p>
                            ) : (
                                filteredTransactions.map(tx => {
                                    const isExpense = parseFloat(tx.amountBase) < 0;
                                    return (
                                        <div
                                            key={tx.id}
                                            onClick={() => openEditModal(tx)}
                                            className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer relative"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${isExpense ? 'from-red-500/20 to-orange-500/20 text-red-400' : 'from-emerald-500/20 to-teal-500/20 text-emerald-400'}`}>
                                                    {isExpense ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-200">{tx.item?.name || 'Manual'}</p>
                                                        {tx.item?.category && <span className="text-[10px] px-2 py-0.5 rounded flex items-center gap-1 bg-white/5 text-gray-400 border border-white/10"><span className="text-sm">{tx.item.category.icon}</span> {tx.item.category.name}</span>}
                                                        {tx.projectId && <span className="text-[10px] px-2 py-0.5 rounded flex items-center gap-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">💼 {projects.find(p => p.id === tx.projectId)?.name || 'Actividad Economica'}</span>}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                        <span>{format(new Date(tx.transactionDate.split('T')[0] + 'T12:00:00'), 'MMM dd, yyyy')}</span> •
                                                        <span>{tx.account?.name}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Hover Actions */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                                                <button onClick={(e) => { e.stopPropagation(); openEditModal(tx); }} className="p-1.5 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <div className="w-px h-4 bg-white/20"></div>
                                                <button onClick={(e) => handleDeleteTransaction(tx.id, e)} className="p-1.5 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className={`font-bold ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {isExpense ? '' : '+'}{formatCurrency(parseFloat(tx.amountBase), currencies.find(c => c.code === tx.account?.currencyCode)?.symbol)} <span className="text-xs opacity-70">{tx.account?.currencyCode}</span>
                                                </p>
                                                {tx.currencyOriginal !== tx.account?.currencyCode && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Original: {formatCurrency(parseFloat(tx.amountOriginal), currencies.find(c => c.code === tx.currencyOriginal)?.symbol)} {tx.currencyOriginal} (Tipo: {tx.exchangeRate})
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => handleCloseModal(false)}></div>
                        <div className="relative bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-medium">{editingTransactionId ? 'Editar Transacción' : 'Nueva Transacción'}</h3>
                                <button onClick={() => handleCloseModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm text-gray-400 mb-1.5">Naturaleza</label>
                                        <div className="flex bg-black/50 border border-white/10 rounded-lg p-1">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, type: "expense" }))}
                                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'expense' ? 'bg-red-500/20 text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
                                            >Gasto</button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, type: "income" }))}
                                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'income' ? 'bg-emerald-500/20 text-emerald-500' : 'text-gray-500 hover:text-gray-300'}`}
                                            >Ingreso</button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, type: "transfer" }))}
                                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'transfer' ? 'bg-blue-500/20 text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                                            >Transferencia</button>
                                        </div>
                                    </div>

                                    <div className={`col-span-${formData.type === 'transfer' ? '1' : '1'}`}>
                                        <label className="block text-sm text-gray-400 mb-1.5">{formData.type === 'transfer' ? 'Cuenta Origen' : 'Cuenta Origen/Destino'}</label>
                                        <select
                                            required
                                            value={formData.accountId}
                                            onChange={e => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 appearance-none"
                                        >
                                            <option value="" className="bg-zinc-900 text-white">Seleccione Cuenta</option>
                                            {accounts.map(a => <option key={a.id} value={a.id} className="bg-zinc-900 text-white">{a.name} ({a.currencyCode})</option>)}
                                        </select>
                                    </div>

                                    {formData.type === 'transfer' && (
                                        <div className="col-span-1">
                                            <label className="block text-sm text-gray-400 mb-1.5">Cuenta Destino</label>
                                            <select
                                                required
                                                value={formData.destinationAccountId}
                                                onChange={e => setFormData(prev => ({ ...prev, destinationAccountId: e.target.value }))}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 appearance-none"
                                            >
                                                <option value="" className="bg-zinc-900 text-white">Seleccione Cuenta</option>
                                                {accounts.map(a => <option disabled={a.id === formData.accountId} key={a.id} value={a.id} className="bg-zinc-900 text-white">{a.name} ({a.currencyCode})</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div className="col-span-1">
                                        <label className="block text-sm text-gray-400 mb-1.5">Fecha</label>
                                        <DatePicker
                                            selected={new Date(formData.transactionDate + "T12:00:00")}
                                            onChange={(date: Date | null) => {
                                                if (date) {
                                                    setFormData(prev => ({ ...prev, transactionDate: format(date, 'yyyy-MM-dd') }));
                                                }
                                            }}
                                            dateFormat="yyyy-MM-dd"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                                            calendarClassName="bg-zinc-900 border-white/10 text-white shadow-xl rounded-xl"
                                        />
                                    </div>

                                    {/* Currency Selection */}
                                    <div className="col-span-1">
                                        <label className="block text-sm text-gray-400 mb-1.5">Moneda de la Transacción</label>
                                        <select
                                            required
                                            disabled={!formData.accountId}
                                            value={formData.currencyOriginal}
                                            onChange={e => setFormData(prev => ({ ...prev, currencyOriginal: e.target.value }))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 disabled:opacity-50 appearance-none"
                                        >
                                            {currencies.map(c => <option key={c.code} value={c.code} className="bg-zinc-900 text-white">{c.code}</option>)}
                                        </select>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-sm text-gray-400 mb-1.5">Monto {formData.type === 'expense' ? '(Pagado)' : (formData.type === 'transfer' ? '(Deducido)' : '(Recibido)')}</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><DollarSign size={14} /></div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                disabled={!formData.accountId}
                                                value={formData.amountOriginal}
                                                onChange={e => setFormData(prev => ({ ...prev, amountOriginal: e.target.value }))}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-lg disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Multi-currency Block */}
                                    {isMultiCurrency && (
                                        <div className="col-span-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <p className="text-xs text-indigo-300 font-medium">💱 Conversión a moneda de la cuenta ({accountCurrency})</p>
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-xs text-indigo-400 mb-1">Tipo de Cambio Aplicado</label>
                                                <input
                                                    type="number"
                                                    step="0.0001"
                                                    required
                                                    value={formData.exchangeRate}
                                                    onChange={e => setFormData(prev => ({ ...prev, exchangeRate: e.target.value }))}
                                                    className="w-full bg-black/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-xs text-indigo-400 mb-1">Monto a liquidar ({accountCurrency})</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={formData.amountBase}
                                                    onChange={e => setFormData(prev => ({ ...prev, amountBase: e.target.value }))}
                                                    className="w-full bg-black/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Categorization */}
                                    <div className="col-span-1">
                                        <label className="block text-sm text-gray-400 mb-1.5">Categoría General (Opcional en Transferencias)</label>
                                        <select
                                            required={formData.type !== 'transfer'}
                                            value={formData.categoryId}
                                            onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value, itemId: "" }))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 appearance-none"
                                        >
                                            <option value="" className="bg-zinc-900 text-white">Seleccione</option>
                                            {categories.filter(c => formData.type === 'transfer' ? c.type === 'ahorro' : c.type === formData.type).map(c => <option key={c.id} value={c.id} className="bg-zinc-900 text-white">{c.icon} {c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-sm text-gray-400 mb-1.5">Sub-Categoría (Ítem)</label>
                                        <select
                                            required={formData.type !== 'transfer' || !!formData.categoryId}
                                            disabled={!formData.categoryId}
                                            value={formData.itemId}
                                            onChange={e => setFormData(prev => ({ ...prev, itemId: e.target.value }))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 disabled:opacity-50 appearance-none"
                                        >
                                            <option value="" className="bg-zinc-900 text-white">Selecciona Sub-Categoría</option>
                                            {availableItems.map((i: any) => <option key={i.id} value={i.id} className="bg-zinc-900 text-white">{i.name}</option>)}
                                        </select>
                                    </div>

                                    {formData.type === 'transfer' && goals.filter((g: any) => (g.type || 'savings') === 'savings').length > 0 && (
                                        <div className="col-span-2 border-t border-white/10 pt-4 mt-2">
                                            <label className="block text-sm text-emerald-300 mb-1.5 font-medium">Fondo de Ahorro / Meta (Opcional)</label>
                                            <p className="text-xs text-gray-500 mb-3">Vincular esta transferencia a una meta de ahorro aumentará tu progreso total de "Ahorros Activos" en el panel de control general, motivándote a guardar más.</p>
                                            <select
                                                value={formData.goalId}
                                                onChange={e => setFormData(prev => ({ ...prev, goalId: e.target.value }))}
                                                className="w-full bg-emerald-950/30 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-100 placeholder-emerald-300/50 appearance-none"
                                            >
                                                <option value="" className="bg-zinc-900 text-white">Ninguna - Transferencia Ordinaria (Sin acumulación de meta)</option>
                                                {goals.filter((g: any) => (g.type || 'savings') === 'savings').map((g: any) => <option key={g.id} value={g.id} className="bg-zinc-900 text-white">🎯 {g.title}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {formData.type !== 'transfer' && projects.length > 0 && (
                                        <div className="col-span-2 border-t border-white/10 pt-4 mt-2">
                                            <label className="block text-sm text-indigo-300 mb-1.5 font-medium">Actividad Económica (Opcional)</label>
                                            <p className="text-xs text-gray-500 mb-3">Vincular a un proyecto o centro de centro te permite ver su rentabilidad individual en el Dashboard.</p>
                                            <select
                                                value={formData.projectId}
                                                onChange={e => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                                                className="w-full bg-indigo-950/30 border border-indigo-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-100 placeholder-indigo-300/50 appearance-none"
                                            >
                                                <option value="" className="bg-zinc-900 text-white">Ninguna - Gasto/Ingreso General del Hogar</option>
                                                {projects.map((p: any) => <option key={p.id} value={p.id} className="bg-zinc-900 text-white">💼 {p.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {formData.type === 'expense' && goals.filter((g: any) => g.type === 'expense').length > 0 && (
                                        <div className="col-span-2 border-t border-amber-500/20 pt-4 mt-2">
                                            <label className="block text-sm text-amber-300 mb-1.5 font-medium">📋 Meta de Pago (Opcional)</label>
                                            <p className="text-xs text-gray-500 mb-3">Vincular este gasto a una meta de pago te permite rastrear cuánto llevas pagado hacia un objetivo (ej. cuotas de un vehículo, deuda).</p>
                                            <select
                                                value={formData.goalId}
                                                onChange={e => setFormData(prev => ({ ...prev, goalId: e.target.value }))}
                                                className="w-full bg-amber-950/30 border border-amber-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-100 placeholder-amber-300/50 appearance-none"
                                            >
                                                <option value="" className="bg-zinc-900 text-white">Ninguna - Gasto sin meta de pago</option>
                                                {goals.filter((g: any) => g.type === 'expense').map((g: any) => <option key={g.id} value={g.id} className="bg-zinc-900 text-white">📋 {g.title}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div className="col-span-2">
                                        <label className="block text-sm text-gray-400 mb-1.5">Notas / Referencia</label>
                                        <input
                                            type="text"
                                            value={formData.notes}
                                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Ej. Cena con amigos en restaurante..."
                                        />
                                    </div>

                                </div>

                                <div className="pt-4 border-t border-white/10 flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => handleCloseModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancelar</button>
                                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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
