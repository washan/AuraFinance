"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Plus, Trash2, Edit2, Check, X, Zap, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Toast, ToastType } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("currencies");

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [newCategoryIcon, setNewCategoryIcon] = useState('💰');

    // Edit state for currencies
    const [editingCurrency, setEditingCurrency] = useState<{ code: string; symbol: string } | null>(null);

    // Edit state for categories and items
    const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; icon: string; type?: string } | null>(null);
    const [editingItem, setEditingItem] = useState<{ categoryId: string; id: string; name: string } | null>(null);

    // Emoji Picker state
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null); // 'new' or categoryId

    // Edit state for accounts
    const [editingAccount, setEditingAccount] = useState<{ id: string; name: string; type: string; currencyCode: string; balance: number } | null>(null);

    // State for data
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [editingProject, setEditingProject] = useState<{ id: string; name: string; description?: string } | null>(null);

    // Goals states
    const [goals, setGoals] = useState<any[]>([]);
    const [editingGoal, setEditingGoal] = useState<{ id: string; title: string; type?: string; description?: string; targetAmount?: number; targetDate?: string } | null>(null);
    const [newGoalTargetDate, setNewGoalTargetDate] = useState<Date | null>(null);

    // Inbox Rules states
    const [rules, setRules] = useState<any[]>([]);
    const [editingRule, setEditingRule] = useState<any | null>(null);

    // Recurring Events states
    const [recurringEvents, setRecurringEvents] = useState<any[]>([]);
    const [editingRecurring, setEditingRecurring] = useState<any | null>(null);
    const [newRecurringFreq, setNewRecurringFreq] = useState("monthly");


    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.push("/auth");
        } else {
            setUser(JSON.parse(storedUser));
            fetchCatalogs(token);
        }
    }, [router]);

    const fetchCatalogs = async (token: string) => {
        try {
            const hdrs = { Authorization: `Bearer ${token}` };
            const [curRes, catRes, accRes, projRes, goalsRes, rulesRes, recRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/currencies`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/inbox-rules`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-events`, { headers: hdrs })
            ]);
            if (curRes.ok) setCurrencies(await curRes.json());
            if (catRes.ok) setCategories(await catRes.json());
            if (accRes.ok) setAccounts(await accRes.json());
            if (projRes.ok) setProjects(await projRes.json());
            if (goalsRes.ok) setGoals(await goalsRes.json());
            if (rulesRes.ok) setRules(await rulesRes.json());
            if (recRes.ok) setRecurringEvents(await recRes.json());
            setIsLoading(false);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const handleCreateCurrency = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const formData = new FormData(e.target as HTMLFormElement);
        const code = formData.get("code") as string;
        const symbol = formData.get("symbol") as string || "$";
        const isLocalBase = formData.get("isLocalBase") === "on";

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/currencies`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ code: code.toUpperCase(), symbol, isLocalBase, isActive: true })
        });
        if (res.ok) {
            const newToken = localStorage.getItem("token")!;
            fetchCatalogs(newToken);
            (e.target as HTMLFormElement).reset();
            setToast({ message: "Moneda añadida exitosamente.", type: "success" });
        } else {
            const err = await res.json();
            setToast({ message: `Error: ${err.message || 'No se pudo crear la moneda'}`, type: "error" });
        }
    };

    const handleUpdateCurrency = async (code: string, data: { isLocalBase?: boolean; isActive?: boolean; symbol?: string }) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/currencies/${code}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setEditingCurrency(null);
            setToast({ message: "Moneda actualizada.", type: "success" });
        } else {
            setToast({ message: "No se pudo actualizar la moneda.", type: "error" });
        }
    };

    const handleDeleteCurrency = async (code: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar la moneda ${code}?`)) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/currencies/${code}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setToast({ message: "Moneda eliminada exitosamente.", type: "success" });
        } else {
            setToast({ message: "No se pudo eliminar la moneda. Es posible que tenga cuentas o transacciones asociadas.", type: "error" });
        }
    };

    const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = fd.get("name") as string;
        const icon = fd.get("icon") as string || '📁';
        const type = fd.get("type") as string;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, icon, type })
        });
        if (res.ok) {
            setToast({ message: "Categoría creada.", type: "success" });
            fetchCatalogs(token!);
            (e.target as HTMLFormElement).reset();
            setNewCategoryIcon('💰');
        } else {
            const err = await res.json();
            setToast({ message: `Error: ${err.message || 'No se pudo crear la categoría'}`, type: "error" });
        }
    };

    const handleCreateItem = async (categoryId: string) => {
        if (!newItemName.trim()) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: newItemName.trim() })
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setToast({ message: "Ítem creado exitosamente.", type: "success" });
            setAddingItemTo(null);
            setNewItemName("");
        } else {
            setToast({ message: "Error al crear el ítem.", type: "error" });
        }
    };

    const handleUpdateCategory = async (categoryId: string, data: { name?: string; icon?: string, type?: string }) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setEditingCategory(null);
            setToast({ message: "Categoría actualizada exitosamente.", type: "success" });
        } else {
            setToast({ message: "Error al actualizar la categoría.", type: "error" });
        }
    };

    const handleUpdateItem = async (categoryId: string, itemId: string, name: string) => {
        if (!name.trim()) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}/items/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: name.trim() })
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setEditingItem(null);
            setToast({ message: "Ítem actualizado exitosamente.", type: "success" });
        } else {
            setToast({ message: "Error al actualizar el ítem.", type: "error" });
        }
    };

    const handleDeleteItem = async (categoryId: string, itemId: string) => {
        if (!window.confirm("¿Estás seguro de eliminar este ítem?")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}/items/${itemId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setToast({ message: "Ítem eliminado exitosamente.", type: "success" });
        } else {
            setToast({ message: "No se pudo eliminar el ítem. Probablemente tenga transacciones asociadas.", type: "error" });
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!window.confirm("¿Estás seguro de eliminar esta categoría y sus ítems?")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setToast({ message: "Categoría eliminada exitosamente.", type: "success" });
        } else {
            setToast({ message: "No se pudo eliminar la categoría. Probablemente tenga presupuestos o transacciones.", type: "error" });
        }
    };

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get("name") as string;
        const type = formData.get("type") as string;
        const currencyCode = formData.get("currencyCode") as string;
        const balance = parseFloat(formData.get("balance") as string);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, type, currencyCode, balance })
        });
        if (res.ok) {
            fetchCatalogs(token!);
            (e.target as HTMLFormElement).reset();
            setToast({ message: "Cuenta originada exitosamente.", type: "success" });
        } else {
            const err = await res.json();
            setToast({ message: `Error: ${err.message || 'No se pudo crear la cuenta'}`, type: "error" });
        }
    };

    const handleUpdateAccount = async (id: string, data: { name?: string; type?: string; currencyCode?: string; balance?: number }) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setEditingAccount(null);
            setToast({ message: "Cuenta actualizada.", type: "success" });
        } else {
            setToast({ message: "No se pudo actualizar la cuenta.", type: "error" });
        }
    };

    const handleDeleteAccount = async (accountId: string) => {
        if (!window.confirm("¿Estás seguro de eliminar esta cuenta?")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${accountId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setToast({ message: "Cuenta eliminada exitosamente.", type: "success" });
        } else {
            const err = await res.json();
            setToast({ message: err.message || "No se pudo eliminar la cuenta.", type: "error" });
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get("name") as string;
        const description = (formData.get("description") as string) || "";

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, description })
        });
        if (res.ok) {
            fetchCatalogs(token!);
            (e.target as HTMLFormElement).reset();
            setToast({ message: "Actividad creada exitosamente.", type: "success" });
        } else {
            setToast({ message: "Error al crear la actividad.", type: "error" });
        }
    };

    const handleUpdateProject = async (id: string, data: { name?: string; description?: string }) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setEditingProject(null);
            setToast({ message: "Actividad actualizada.", type: "success" });
        } else {
            setToast({ message: "Error al actualizar.", type: "error" });
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!window.confirm("¿Estás seguro de eliminar esta actividad económica?")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setToast({ message: "Actividad eliminada.", type: "success" });
        } else {
            setToast({ message: "No se pudo eliminar. Seguramente tiene transacciones asociadas.", type: "error" });
        }
    };

    // Goals CRUD
    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const formData = new FormData(e.target as HTMLFormElement);
        const title = formData.get("title") as string;
        const description = (formData.get("description") as string) || "";
        const targetAmountStr = formData.get("targetAmount") as string;
        const targetAmount = targetAmountStr ? parseFloat(targetAmountStr) : undefined;
        const targetDate = newGoalTargetDate ? format(newGoalTargetDate, 'yyyy-MM-dd') : undefined;

        const type = (formData.get("type") as string) || "savings";

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title, description, type, targetAmount, targetDate })
        });
        if (res.ok) {
            fetchCatalogs(token!);
            (e.target as HTMLFormElement).reset();
            setNewGoalTargetDate(null);
            setToast({ message: "Meta de ahorro creada exitosamente.", type: "success" });
        } else {
            setToast({ message: "Error al crear la meta.", type: "error" });
        }
    };

    const handleUpdateGoal = async (id: string, data: { title?: string; description?: string; targetAmount?: number; targetDate?: string; type?: string }) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setEditingGoal(null);
            setToast({ message: "Meta actualizada.", type: "success" });
        } else {
            setToast({ message: "Error al actualizar la meta.", type: "error" });
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (!window.confirm("¿Estás seguro de eliminar esta meta? Se desvincularán las transferencias asociadas pero NO se borrará tu dinero líquido de las cuentas.")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setToast({ message: "Meta eliminada.", type: "success" });
        } else {
            setToast({ message: "No se pudo eliminar la meta.", type: "error" });
        }
    };

    // Inbox Rules CRUD
    const handleCreateRule = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const fd = new FormData(e.target as HTMLFormElement);
        const name = fd.get("name") as string;
        const matchValue = fd.get("matchValue") as string;
        const accountId = (fd.get("accountId") as string) || undefined;
        const itemId = (fd.get("itemId") as string) || undefined;
        const projectId = (fd.get("projectId") as string) || undefined;
        const goalId = (fd.get("goalId") as string) || undefined;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inbox-rules`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, matchValue, accountId, itemId, projectId, goalId })
        });
        if (res.ok) {
            fetchCatalogs(token!);
            (e.target as HTMLFormElement).reset();
            setToast({ message: "Regla creada exitosamente.", type: "success" });
        } else {
            setToast({ message: "Error al crear la regla.", type: "error" });
        }
    };

    const handleUpdateRule = async (id: string, data: any) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inbox-rules/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setEditingRule(null);
            setToast({ message: "Regla actualizada.", type: "success" });
        } else {
            setToast({ message: "Error al actualizar la regla.", type: "error" });
        }
    };

    const handleDeleteRule = async (id: string) => {
        if (!window.confirm("¿Estás seguro de eliminar esta regla?")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inbox-rules/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setToast({ message: "Regla eliminada.", type: "success" });
        } else {
            setToast({ message: "No se pudo eliminar la regla.", type: "error" });
        }
    };

    // Helper: get all items flat from categories
    const allItems = categories.flatMap((c: any) => (c.items || []).map((i: any) => ({ ...i, categoryName: c.name, categoryIcon: c.icon })));

    // Recurring Events CRUD
    const handleCreateRecurring = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const fd = new FormData(e.target as HTMLFormElement);
        const body: any = {
            name: fd.get("name") as string,
            merchant: fd.get("merchant") as string,
            amount: parseFloat(fd.get("amount") as string),
            currency: fd.get("currency") as string || "CRC",
            frequency: fd.get("frequency") as string,
        };
        const dayOfMonth = fd.get("dayOfMonth") as string;
        if (dayOfMonth) body.dayOfMonth = parseInt(dayOfMonth);
        const dayOfMonth2 = fd.get("dayOfMonth2") as string;
        if (dayOfMonth2) body.dayOfMonth2 = parseInt(dayOfMonth2);
        const dayOfWeek = fd.get("dayOfWeek") as string;
        if (dayOfWeek !== null && dayOfWeek !== "") body.dayOfWeek = parseInt(dayOfWeek);
        const monthOfYear = fd.get("monthOfYear") as string;
        if (monthOfYear) body.monthOfYear = parseInt(monthOfYear);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-events`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        if (res.ok) {
            fetchCatalogs(token!);
            (e.target as HTMLFormElement).reset();
            setToast({ message: "Evento recurrente creado.", type: "success" });
        } else {
            setToast({ message: "Error al crear evento.", type: "error" });
        }
    };

    const handleUpdateRecurring = async (id: string, data: any) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-events/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setEditingRecurring(null);
            setToast({ message: "Evento actualizado.", type: "success" });
        } else {
            setToast({ message: "Error al actualizar.", type: "error" });
        }
    };

    const handleDeleteRecurring = async (id: string) => {
        if (!window.confirm("¿Eliminar este evento recurrente?")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-events/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchCatalogs(token!);
            setToast({ message: "Evento eliminado.", type: "success" });
        } else {
            setToast({ message: "Error al eliminar.", type: "error" });
        }
    };

    const handleGenerateRecurring = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-events/generate`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setToast({ message: `Se generaron ${data.generated} transacción(es) en el buzón.`, type: "success" });
        } else {
            setToast({ message: "Error al generar.", type: "error" });
        }
    };

    const frequencyLabels: Record<string, string> = { monthly: "Mensual", biweekly: "Quincenal", weekly: "Semanal", annually: "Anual" };
    const dayOfWeekLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const monthLabels = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

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
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center px-4 pl-16 md:px-8 shrink-0 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-xl md:text-2xl font-light tracking-tight">Ajustes & Catálogos</h1>
                </header>

                <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 pb-20">

                    {/* Tabs — horizontally scrollable on mobile */}
                    <div className="flex gap-1 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:gap-2">
                        <button
                            className={`shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "currencies" ? "bg-indigo-500/20 text-indigo-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveTab("currencies")}
                        >
                            Monedas
                        </button>
                        <button
                            className={`shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "categories" ? "bg-indigo-500/20 text-indigo-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveTab("categories")}
                        >
                            Categorías
                        </button>
                        <button
                            className={`shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "accounts" ? "bg-indigo-500/20 text-indigo-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveTab("accounts")}
                        >
                            Cuentas
                        </button>
                        <button
                            className={`shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "projects" ? "bg-indigo-500/20 text-indigo-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveTab("projects")}
                        >
                            Actividades
                        </button>
                        <button
                            className={`shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "goals" ? "bg-indigo-500/20 text-indigo-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveTab("goals")}
                        >
                            Metas
                        </button>
                        <button
                            className={`shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === "rules" ? "bg-amber-500/20 text-amber-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveTab("rules")}
                        >
                            <Zap size={14} /> Reglas
                        </button>
                        <button
                            className={`shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === "recurring" ? "bg-cyan-500/20 text-cyan-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveTab("recurring")}
                        >
                            <RefreshCw size={14} /> Recurrentes
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                        {activeTab === "currencies" && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <h3 className="text-lg font-medium">Monedas Activas</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currencies.map(c => (
                                        <div key={c.code} className="p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-4 group">
                                            {editingCurrency?.code === c.code ? (
                                                // ─── Edit Mode ───────────────────────────────────────
                                                <>
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-bold text-sm text-indigo-300">Editando {c.code}</p>
                                                        <button onClick={() => setEditingCurrency(null)} className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Símbolo</label>
                                                            <input
                                                                autoFocus
                                                                maxLength={5}
                                                                value={editingCurrency!.symbol}
                                                                onChange={e => setEditingCurrency(prev => prev ? { ...prev, symbol: e.target.value } : null)}
                                                                className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-bold"
                                                            />
                                                        </div>
                                                        <div className="flex items-end">
                                                            <button
                                                                onClick={() => handleUpdateCurrency(c.code, { symbol: editingCurrency!.symbol })}
                                                                className="w-full py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <Check size={14} /> Guardar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                // ─── View Mode ───────────────────────────────────────
                                                <>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-lg">{c.code} ({c.symbol || '$'})</p>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
                                                                    {c.isActive ? 'Activa' : 'Inactiva'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-indigo-400 mt-1">{c.isLocalBase ? "⭐ Moneda Base" : "Moneda Secundaria"}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => setEditingCurrency({ code: c.code, symbol: c.symbol || '$' })}
                                                                className="p-1.5 bg-white/5 hover:bg-indigo-500/20 rounded-md text-gray-400 hover:text-indigo-300 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button onClick={() => handleDeleteCurrency(c.code)} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                                                        <button
                                                            onClick={() => handleUpdateCurrency(c.code, { isActive: !c.isActive })}
                                                            className="flex-1 py-1.5 text-xs font-medium rounded bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                                                        >
                                                            {c.isActive ? 'Desactivar' : 'Activar'}
                                                        </button>
                                                        {!c.isLocalBase && (
                                                            <button
                                                                onClick={() => handleUpdateCurrency(c.code, { isLocalBase: true })}
                                                                className="flex-1 py-1.5 text-xs font-medium rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors"
                                                            >
                                                                Hacer Base
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 mt-6 border-t border-white/10">
                                    <h4 className="text-md font-medium mb-4">Añadir Moneda</h4>
                                    <form onSubmit={handleCreateCurrency} className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 mb-1">Código (Ej. EUR, MXN)</label>
                                            <input name="code" maxLength={3} required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs text-gray-400 mb-1">Símbolo (Ej. $, €)</label>
                                            <input name="symbol" maxLength={5} defaultValue="$" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center" />
                                        </div>
                                        <div className="flex items-center gap-2 pb-2">
                                            <input type="checkbox" name="isLocalBase" id="isLocalBase" className="rounded bg-black/50 border-white/10 text-indigo-500" />
                                            <label htmlFor="isLocalBase" className="text-sm text-gray-400">Es Moneda Base</label>
                                        </div>
                                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                            <Plus size={16} /> Añadir
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === "categories" && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <h3 className="text-lg font-medium">Categorías del Hogar</h3>
                                </div>

                                {[
                                    { type: 'expense', label: '💸 Gastos', color: 'rose', borderColor: 'border-rose-500/30', bgColor: 'bg-rose-500/5', textColor: 'text-rose-400' },
                                    { type: 'income', label: '💰 Ingresos', color: 'emerald', borderColor: 'border-emerald-500/30', bgColor: 'bg-emerald-500/5', textColor: 'text-emerald-400' },
                                    { type: 'ahorro', label: '🏦 Ahorro / Inversión', color: 'blue', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500/5', textColor: 'text-blue-400' },
                                ].map(group => {
                                    const groupCats = categories.filter(c => (c.type || 'expense') === group.type);
                                    return (
                                        <div key={group.type} className={`mb-6 rounded-2xl border ${group.borderColor} ${group.bgColor} p-4`}>
                                            <h4 className={`text-md font-semibold mb-3 ${group.textColor} flex items-center gap-2`}>
                                                {group.label}
                                                <span className="text-xs font-normal text-gray-500">({groupCats.length})</span>
                                            </h4>
                                            {groupCats.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">No hay categorías de este tipo.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-4">
                                                    {groupCats.map(cat => (
                                                        <div key={cat.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-3 group/cat">
                                                            {editingCategory?.id === cat.id ? (
                                                                <div className="flex items-center gap-3 bg-black/50 p-2 rounded-lg border border-indigo-500/40 relative">
                                                                    <div className="relative">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setShowEmojiPicker(showEmojiPicker === cat.id ? null : cat.id)}
                                                                            className="w-12 h-10 bg-white/5 hover:bg-white/10 rounded border border-white/10 flex items-center justify-center text-xl transition-colors"
                                                                        >
                                                                            {editingCategory!.icon || '📁'}
                                                                        </button>
                                                                        {showEmojiPicker === cat.id && (
                                                                            <div className="absolute top-12 left-0 z-50">
                                                                                <Picker
                                                                                    data={data}
                                                                                    locale="es"
                                                                                    theme="dark"
                                                                                    searchPosition="top"
                                                                                    navPosition="bottom"
                                                                                    onEmojiSelect={(emoji: any) => {
                                                                                        setEditingCategory({ ...editingCategory!, icon: emoji.native });
                                                                                        setShowEmojiPicker(null);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <input
                                                                        autoFocus
                                                                        value={editingCategory!.name}
                                                                        onChange={e => setEditingCategory({ ...editingCategory!, name: e.target.value })}
                                                                        className="flex-1 bg-transparent text-sm font-bold focus:outline-none placeholder-gray-600"
                                                                        placeholder="Nombre de categoría"
                                                                    />
                                                                    <select
                                                                        value={editingCategory!.type || 'expense'}
                                                                        onChange={e => setEditingCategory({ ...editingCategory!, type: e.target.value })}
                                                                        className="bg-black/80 border border-white/20 rounded-md text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                    >
                                                                        <option value="expense">Gasto</option>
                                                                        <option value="income">Ingreso</option>
                                                                        <option value="ahorro">Ahorro / Inversión</option>
                                                                    </select>
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            onClick={() => {
                                                                                handleUpdateCategory(cat.id, { name: editingCategory!.name, icon: editingCategory!.icon, type: editingCategory!.type });
                                                                                setShowEmojiPicker(null);
                                                                            }}
                                                                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors"
                                                                        >
                                                                            <Check size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingCategory(null);
                                                                                setShowEmojiPicker(null);
                                                                            }}
                                                                            className="p-1.5 text-gray-400 hover:bg-white/10 rounded transition-colors"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-2xl">{cat.icon || '📁'}</span>
                                                                        <span className="font-bold">{cat.name}</span>
                                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cat.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : cat.type === 'ahorro' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                                            {cat.type === 'income' ? 'Ingreso' : cat.type === 'ahorro' ? 'Ahorro/Inversión' : 'Gasto'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                                                                        <button onClick={() => setEditingCategory({ id: cat.id, name: cat.name, icon: cat.icon || '', type: cat.type || 'expense' })} className="p-1.5 bg-white/5 hover:bg-indigo-500/20 rounded-md text-gray-400 hover:text-indigo-300 transition-colors"><Edit2 size={14} /></button>
                                                                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="pl-9 flex flex-wrap gap-2">
                                                                {cat.items?.map((item: any) => (
                                                                    editingItem?.id === item.id ? (
                                                                        <div key={item.id} className="flex items-center gap-1 bg-black/50 border border-indigo-500/30 rounded-md p-0.5 shadow-inner">
                                                                            <input
                                                                                autoFocus
                                                                                value={editingItem!.name}
                                                                                onChange={(e) => setEditingItem({ ...editingItem!, name: e.target.value })}
                                                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateItem(cat.id, item.id, editingItem!.name)}
                                                                                className="text-xs bg-transparent border-none text-white px-2 py-1 w-24 focus:outline-none"
                                                                            />
                                                                            <button onClick={() => handleUpdateItem(cat.id, item.id, editingItem!.name)} className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors"><Check size={12} /></button>
                                                                            <button onClick={() => setEditingItem(null)} className="p-1 text-gray-400 hover:bg-white/10 rounded transition-colors"><X size={12} /></button>
                                                                        </div>
                                                                    ) : (
                                                                        <div key={item.id} className="group/item flex items-center bg-white/5 border border-white/10 rounded-md overflow-hidden">
                                                                            <span className="text-xs text-gray-300 px-2 py-1">{item.name}</span>
                                                                            <div className="flex items-center bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                                <button onClick={() => setEditingItem({ categoryId: cat.id, id: item.id, name: item.name })} className="p-1 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-300 transition-colors">
                                                                                    <Edit2 size={10} />
                                                                                </button>
                                                                                <button onClick={() => handleDeleteItem(cat.id, item.id)} className="p-1 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                                                                                    <Trash2 size={10} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                ))}
                                                                {addingItemTo === cat.id ? (
                                                                    <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded-md p-0.5 shadow-inner">
                                                                        <input
                                                                            autoFocus
                                                                            value={newItemName}
                                                                            onChange={(e) => setNewItemName(e.target.value)}
                                                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateItem(cat.id)}
                                                                            className="text-xs bg-transparent border-none text-white px-2 py-1 w-28 focus:outline-none placeholder-gray-600"
                                                                            placeholder="Nuevo ítem..."
                                                                        />
                                                                        <button onClick={() => handleCreateItem(cat.id)} className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors">
                                                                            <Check size={12} />
                                                                        </button>
                                                                        <button onClick={() => { setAddingItemTo(null); setNewItemName(""); }} className="p-1 text-gray-400 hover:bg-white/10 rounded transition-colors">
                                                                            <X size={12} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button onClick={() => setAddingItemTo(cat.id)} className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                                                                        <Plus size={12} /> Ítem
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                <div className="pt-6 mt-6 border-t border-white/10">
                                    <h4 className="text-md font-medium mb-4">Nueva Categoría</h4>
                                    <form
                                        onSubmit={(e) => {
                                            handleCreateCategory(e);
                                            setShowEmojiPicker(null);
                                        }}
                                        className="flex gap-4 items-end"
                                    >
                                        <div className="w-24 relative">
                                            <label className="block text-xs text-gray-400 mb-1">Emoji / Icono</label>
                                            <input type="hidden" name="icon" value={newCategoryIcon} readOnly />
                                            <button
                                                type="button"
                                                onClick={() => setShowEmojiPicker(showEmojiPicker === 'new' ? null : 'new')}
                                                className="w-full h-[38px] bg-black/50 hover:bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-xl transition-colors"
                                            >
                                                {newCategoryIcon}
                                            </button>
                                            {showEmojiPicker === 'new' && (
                                                <div className="absolute bottom-16 left-0 z-50">
                                                    <Picker
                                                        data={data}
                                                        locale="es"
                                                        theme="dark"
                                                        searchPosition="top"
                                                        navPosition="bottom"
                                                        onEmojiSelect={(emoji: any) => {
                                                            setNewCategoryIcon(emoji.native);
                                                            setShowEmojiPicker(null);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 mb-1">Nombre (Ej. Alimentación)</label>
                                            <input name="name" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                                            <select name="type" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                                <option value="expense">Gasto</option>
                                                <option value="income">Ingreso</option>
                                                <option value="ahorro">Ahorro / Inversión</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                            <Plus size={16} /> Crear
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )
                        }

                        {activeTab === "accounts" && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <h3 className="text-lg font-medium">Cuentas Financieras</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {accounts.map(acc => (
                                        <div key={acc.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-3 group/acc">
                                            {editingAccount?.id === acc.id ? (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-bold text-sm text-indigo-300">Editando cuenta</p>
                                                        <button onClick={() => setEditingAccount(null)} className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="col-span-2">
                                                            <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                                                            <input
                                                                autoFocus
                                                                value={editingAccount!.name}
                                                                onChange={e => setEditingAccount({ ...editingAccount!, name: e.target.value })}
                                                                className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                                                            <select
                                                                value={editingAccount!.type}
                                                                onChange={e => setEditingAccount({ ...editingAccount!, type: e.target.value })}
                                                                className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200"
                                                            >
                                                                <option value="bank">Banco</option>
                                                                <option value="cash">Efectivo</option>
                                                                <option value="credit">Tarjeta Crédito</option>
                                                                <option value="investment">Inversión</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Moneda</label>
                                                            <select
                                                                value={editingAccount!.currencyCode}
                                                                onChange={e => setEditingAccount({ ...editingAccount!, currencyCode: e.target.value })}
                                                                className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200"
                                                            >
                                                                <option value="">Seleccione</option>
                                                                {currencies.filter(c => c.isActive || c.code === editingAccount!.currencyCode).map(c => (
                                                                    <option key={c.code} value={c.code}>{c.code}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="col-span-2 flex items-end gap-3 mt-1">
                                                            <div className="flex-1">
                                                                <label className="block text-xs text-gray-400 mb-1">Balance Inicial</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={editingAccount!.balance}
                                                                    onChange={e => setEditingAccount({ ...editingAccount!, balance: parseFloat(e.target.value) || 0 })}
                                                                    className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => handleUpdateAccount(acc.id, {
                                                                    name: editingAccount!.name,
                                                                    type: editingAccount!.type,
                                                                    currencyCode: editingAccount!.currencyCode,
                                                                    balance: editingAccount!.balance
                                                                })}
                                                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <Check size={14} /> Guardar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-lg">{acc.name}</h4>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-blue-500/20 text-blue-400">
                                                                {acc.type === 'bank' ? 'Banco' : acc.type === 'cash' ? 'Efectivo' : acc.type === 'credit' ? 'Crédito' : 'Inversión'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xl font-light tracking-tight mt-2 text-indigo-300">
                                                            {formatCurrency(acc.balance, acc.currency?.symbol)} <span className="text-sm text-gray-400">{acc.currencyCode}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover/acc:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditingAccount({ id: acc.id, name: acc.name, type: acc.type, currencyCode: acc.currencyCode, balance: acc.balance })}
                                                            className="p-1.5 bg-white/5 hover:bg-indigo-500/20 rounded-md text-gray-400 hover:text-indigo-300 transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteAccount(acc.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 mt-6 border-t border-white/10">
                                    <h4 className="text-md font-medium mb-4">Añadir Cuenta</h4>
                                    <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs text-gray-400 mb-1">Nombre (Ej. Débito BAC)</label>
                                            <input name="name" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                                            <select name="type" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200">
                                                <option value="bank">Banco</option>
                                                <option value="cash">Efectivo</option>
                                                <option value="credit">Tarjeta Crédito</option>
                                                <option value="investment">Inversión</option>
                                            </select>
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs text-gray-400 mb-1">Moneda</label>
                                            <select name="currencyCode" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200">
                                                <option value="">Seleccione</option>
                                                {currencies.filter(c => c.isActive).map(c => (
                                                    <option key={c.code} value={c.code}>{c.code}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs text-gray-400 mb-1">Balance Inicial</label>
                                            <input type="number" step="0.01" name="balance" defaultValue="0" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 h-[38px] lg:col-span-1">
                                            <Plus size={16} /> Crear
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === "projects" && (
                            <div className="space-y-6">
                                <div className="border-b border-white/10 pb-4">
                                    <h3 className="text-lg font-medium">Actividades Económicas / Proyectos</h3>
                                    <p className="text-sm text-gray-400 mt-1">Crea centros de costo o ingresos independientes (Ej. Salario, Ventas) para medir su rentabilidad en el Dashboard.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.map(proj => (
                                        <div key={proj.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-3 group/proj">
                                            {editingProject?.id === proj.id ? (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-bold text-sm text-indigo-300">Editando Actividad</p>
                                                        <button onClick={() => setEditingProject(null)} className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                                                        <input
                                                            autoFocus
                                                            value={editingProject!.name}
                                                            onChange={e => setEditingProject({ ...editingProject!, name: e.target.value })}
                                                            className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                                                        />
                                                        <label className="block text-xs text-gray-400 mb-1">Descripción</label>
                                                        <input
                                                            value={editingProject!.description || ''}
                                                            onChange={e => setEditingProject({ ...editingProject!, description: e.target.value })}
                                                            className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleUpdateProject(proj.id, { name: editingProject!.name, description: editingProject!.description })}
                                                        className="py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Check size={14} /> Guardar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-white">{proj.name}</h4>
                                                        {proj.description && <p className="text-sm text-gray-400 mt-1">{proj.description}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover/proj:opacity-100 transition-opacity">
                                                        <button onClick={() => setEditingProject({ id: proj.id, name: proj.name, description: proj.description })} className="p-1.5 bg-white/5 hover:bg-indigo-500/20 rounded-md text-gray-400 hover:text-indigo-300 transition-colors">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteProject(proj.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 mt-6 border-t border-white/10">
                                    <h4 className="text-md font-medium mb-4">Añadir Actividad</h4>
                                    <form onSubmit={handleCreateProject} className="flex gap-4 items-end max-w-2xl">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 mb-1">Nombre (Ej. Salario, Ventas)</label>
                                            <input name="name" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 mb-1">Descripción</label>
                                            <input name="description" placeholder="Opcional" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 h-[38px]">
                                            <Plus size={16} /> Crear
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === "goals" && (
                            <div className="space-y-6">
                                <div className="border-b border-white/10 pb-4">
                                    <h3 className="text-lg font-medium">Metas</h3>
                                    <p className="text-sm text-gray-400 mt-1">Crea metas de ahorro (para transferencias) o metas de pago (para rastrear gastos hacia un objetivo como pagar un vehículo).</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {goals.map(goal => (
                                        <div key={goal.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-3 group/goal">
                                            {editingGoal?.id === goal.id ? (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-bold text-sm text-indigo-300">Editando Meta</p>
                                                        <button onClick={() => setEditingGoal(null)} className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Título</label>
                                                        <input
                                                            autoFocus
                                                            value={editingGoal!.title}
                                                            onChange={e => setEditingGoal({ ...editingGoal!, title: e.target.value })}
                                                            className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                                                        />
                                                        <label className="block text-xs text-gray-400 mb-1">Descripción</label>
                                                        <input
                                                            value={editingGoal!.description || ''}
                                                            onChange={e => setEditingGoal({ ...editingGoal!, description: e.target.value })}
                                                            className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                                                        />
                                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                                            <div>
                                                                <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                                                                <select
                                                                    value={editingGoal!.type || 'savings'}
                                                                    onChange={e => setEditingGoal({ ...editingGoal!, type: e.target.value })}
                                                                    className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200"
                                                                >
                                                                    <option value="savings">💰 Ahorro / Inversión</option>
                                                                    <option value="expense">📋 Pago / Deuda</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                                            <div>
                                                                <label className="block text-xs text-gray-400 mb-1">Monto Objetivo ({currencies.find(c => c.isLocalBase)?.symbol})</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={editingGoal!.targetAmount || ''}
                                                                    onChange={e => setEditingGoal({ ...editingGoal!, targetAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                                                                    className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-400 mb-1">Fecha Límite</label>
                                                                <DatePicker
                                                                    selected={editingGoal!.targetDate ? new Date(editingGoal!.targetDate + "T12:00:00") : null}
                                                                    onChange={(date: Date | null) => {
                                                                        if (date) {
                                                                            setEditingGoal({ ...editingGoal!, targetDate: format(date, 'yyyy-MM-dd') });
                                                                        } else {
                                                                            setEditingGoal({ ...editingGoal!, targetDate: undefined });
                                                                        }
                                                                    }}
                                                                    dateFormat="yyyy-MM-dd"
                                                                    isClearable
                                                                    placeholderText="Seleccionar fecha"
                                                                    className="w-full bg-black/50 border border-indigo-500/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                                                                    calendarClassName="bg-zinc-900 border-white/10 text-white shadow-xl rounded-xl"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleUpdateGoal(goal.id, { title: editingGoal!.title, description: editingGoal!.description, type: editingGoal!.type, targetAmount: editingGoal!.targetAmount, targetDate: editingGoal!.targetDate })}
                                                        className="py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Check size={14} /> Guardar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col h-full justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-lg text-white flex items-center gap-2">
                                                                    {(goal.type || 'savings') === 'expense' ? '📋' : '🎯'} {goal.title}
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${(goal.type || 'savings') === 'expense' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                                        {(goal.type || 'savings') === 'expense' ? 'Pago/Deuda' : 'Ahorro'}
                                                                    </span>
                                                                </h4>
                                                                {goal.description && <p className="text-sm text-gray-400 mt-1">{goal.description}</p>}
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover/goal:opacity-100 transition-opacity">
                                                                <button onClick={() => setEditingGoal({ id: goal.id, title: goal.title, description: goal.description, type: goal.type || 'savings', targetAmount: goal.targetAmount, targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : undefined })} className="p-1.5 bg-white/5 hover:bg-indigo-500/20 rounded-md text-gray-400 hover:text-indigo-300 transition-colors">
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button onClick={() => handleDeleteGoal(goal.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 transition-colors">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {goal.targetAmount ? (
                                                            <div className="mt-4">
                                                                <div className="flex justify-between text-xs mb-1">
                                                                    <span className={(goal.type || 'savings') === 'expense' ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>{(goal.type || 'savings') === 'expense' ? 'Pagado' : 'Logrado'}: {formatCurrency(goal.currentAmount || 0, currencies.find(c => c.isLocalBase)?.symbol)}</span>
                                                                    <span className="text-gray-500">Objetivo: {formatCurrency(goal.targetAmount, currencies.find(c => c.isLocalBase)?.symbol)}</span>
                                                                </div>
                                                                <div className="w-full bg-white/5 rounded-full h-2">
                                                                    <div className={`${(goal.type || 'savings') === 'expense' ? 'bg-amber-500' : 'bg-emerald-500'} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(((goal.currentAmount || 0) / goal.targetAmount) * 100, 100)}%` }}></div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-4 text-emerald-400 font-medium text-lg">
                                                                Acumulado: {formatCurrency(goal.currentAmount || 0, currencies.find(c => c.isLocalBase)?.symbol)}
                                                            </div>
                                                        )}
                                                        {goal.targetDate && (
                                                            <p className="text-xs text-gray-500 mt-2">🕒 Fecha límite: {format(new Date(goal.targetDate.split('T')[0] + 'T12:00:00'), 'dd/MM/yyyy')}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 mt-6 border-t border-white/10">
                                    <h4 className="text-md font-medium mb-4">Añadir Meta</h4>
                                    <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end max-w-5xl">
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs text-gray-400 mb-1">Título (Ej. Viaje)</label>
                                            <input name="title" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                                            <select name="type" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200">
                                                <option value="savings">💰 Ahorro / Inversión</option>
                                                <option value="expense">📋 Pago / Deuda</option>
                                            </select>
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs text-gray-400 mb-1">Monto Objetivo (Opcional)</label>
                                            <input type="number" step="0.01" name="targetAmount" placeholder="Ej. 5000" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs text-gray-400 mb-1">Fecha Límite (Opcional)</label>
                                            <DatePicker
                                                selected={newGoalTargetDate}
                                                onChange={(date: Date | null) => setNewGoalTargetDate(date)}
                                                dateFormat="yyyy-MM-dd"
                                                isClearable
                                                placeholderText="Seleccionar fecha"
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200"
                                                calendarClassName="bg-zinc-900 border-white/10 text-white shadow-xl rounded-xl"
                                            />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs text-gray-400 mb-1">Descripción</label>
                                            <input name="description" placeholder="Opcional" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 h-[38px] lg:col-span-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                            <Plus size={16} /> Crear
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === "rules" && (
                            <div className="space-y-6">
                                <div className="border-b border-white/10 pb-4">
                                    <h3 className="text-lg font-medium flex items-center gap-2"><Zap className="text-amber-400" size={20} /> Reglas de Clasificación del Buzón</h3>
                                    <p className="text-sm text-gray-400 mt-1">Define reglas para pre-llenar automáticamente campos del formulario cuando una transacción del buzón coincida con un patrón de texto.</p>
                                </div>

                                <div className="space-y-3">
                                    {rules.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8 italic">No hay reglas definidas. Crea una abajo.</p>
                                    ) : rules.map(rule => (
                                        <div key={rule.id} className="p-4 bg-black/40 border border-amber-500/10 rounded-xl flex flex-col gap-3 group/rule hover:border-amber-500/30 transition-colors">
                                            {editingRule?.id === rule.id ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                                                            <input autoFocus value={editingRule.name} onChange={e => setEditingRule({ ...editingRule, name: e.target.value })} className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Texto a Buscar</label>
                                                            <input value={editingRule.matchValue} onChange={e => setEditingRule({ ...editingRule, matchValue: e.target.value })} className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Cuenta</label>
                                                            <select value={editingRule.accountId || ""} onChange={e => setEditingRule({ ...editingRule, accountId: e.target.value || null })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-200 appearance-none">
                                                                <option value="">Sin sugerencia</option>
                                                                {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Subcategoría</label>
                                                            <select value={editingRule.itemId || ""} onChange={e => setEditingRule({ ...editingRule, itemId: e.target.value || null })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-200 appearance-none">
                                                                <option value="">Sin sugerencia</option>
                                                                {allItems.map((i: any) => <option key={i.id} value={i.id}>{i.categoryIcon} {i.categoryName} → {i.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Actividad</label>
                                                            <select value={editingRule.projectId || ""} onChange={e => setEditingRule({ ...editingRule, projectId: e.target.value || null })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-200 appearance-none">
                                                                <option value="">Sin sugerencia</option>
                                                                {projects.map((p: any) => <option key={p.id} value={p.id}>💼 {p.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Meta</label>
                                                            <select value={editingRule.goalId || ""} onChange={e => setEditingRule({ ...editingRule, goalId: e.target.value || null })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-200 appearance-none">
                                                                <option value="">Sin sugerencia</option>
                                                                {goals.map((g: any) => <option key={g.id} value={g.id}>🎯 {g.title}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setEditingRule(null)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Cancelar</button>
                                                        <button onClick={() => handleUpdateRule(rule.id, { name: editingRule.name, matchValue: editingRule.matchValue, accountId: editingRule.accountId || null, itemId: editingRule.itemId || null, projectId: editingRule.projectId || null, goalId: editingRule.goalId || null })} className="px-3 py-1.5 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center gap-1"><Check size={14} /> Guardar</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Zap size={14} className="text-amber-400" />
                                                            <h4 className="font-bold text-white">{rule.name}</h4>
                                                            <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md font-mono">contiene "{rule.matchValue}"</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {rule.account && <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">🏦 {rule.account.name}</span>}
                                                            {rule.item && <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">{rule.item.category?.name} → {rule.item.name}</span>}
                                                            {rule.project && <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">💼 {rule.project.name}</span>}
                                                            {rule.goal && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">🎯 {rule.goal.title}</span>}
                                                            {!rule.account && !rule.item && !rule.project && !rule.goal && <span className="text-[10px] text-gray-500 italic">Sin campos sugeridos</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover/rule:opacity-100 transition-opacity">
                                                        <button onClick={() => setEditingRule({ id: rule.id, name: rule.name, matchValue: rule.matchValue, accountId: rule.accountId, itemId: rule.itemId, projectId: rule.projectId, goalId: rule.goalId })} className="p-1.5 bg-white/5 hover:bg-amber-500/20 rounded-md text-gray-400 hover:text-amber-300 transition-colors"><Edit2 size={14} /></button>
                                                        <button onClick={() => handleDeleteRule(rule.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 mt-6 border-t border-white/10 bg-amber-900/10 p-4 rounded-xl">
                                    <h4 className="text-md font-medium mb-4 text-amber-300">Crear Nueva Regla</h4>
                                    <form onSubmit={handleCreateRule} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Nombre Descriptivo</label>
                                                <input name="name" required placeholder='Ej. "Pago BAC"' className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Texto a Buscar en Merchant</label>
                                                <input name="matchValue" required placeholder='Ej. "BAC CREDITO"' className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Cuenta Sugerida</label>
                                                <select name="accountId" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-200 appearance-none">
                                                    <option value="">Ninguna</option>
                                                    {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Subcategoría Sugerida</label>
                                                <select name="itemId" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-200 appearance-none">
                                                    <option value="">Ninguna</option>
                                                    {allItems.map((i: any) => <option key={i.id} value={i.id}>{i.categoryIcon} {i.categoryName} → {i.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Actividad Económica</label>
                                                <select name="projectId" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-200 appearance-none">
                                                    <option value="">Ninguna</option>
                                                    {projects.map((p: any) => <option key={p.id} value={p.id}>💼 {p.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Meta</label>
                                                <select name="goalId" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-200 appearance-none">
                                                    <option value="">Ninguna</option>
                                                    {goals.map((g: any) => <option key={g.id} value={g.id}>🎯 {g.title}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                                <Plus size={16} /> Crear Regla
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === "recurring" && (
                            <div className="space-y-6">
                                <div className="border-b border-white/10 pb-4 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-medium flex items-center gap-2"><RefreshCw className="text-cyan-400" size={20} /> Eventos Recurrentes</h3>
                                        <p className="text-sm text-gray-400 mt-1">Define gastos/ingresos periódicos que se inyectan automáticamente al buzón según su frecuencia.</p>
                                    </div>
                                    <button onClick={handleGenerateRecurring} className="bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5">
                                        <RefreshCw size={14} /> Generar Hoy
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {recurringEvents.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8 italic">No hay eventos recurrentes. Crea uno abajo.</p>
                                    ) : recurringEvents.map(ev => (
                                        <div key={ev.id} className={`p-4 bg-black/40 border rounded-xl flex flex-col gap-3 group/rec hover:border-cyan-500/30 transition-colors ${ev.isActive ? 'border-cyan-500/10' : 'border-white/5 opacity-50'}`}>
                                            {editingRecurring?.id === ev.id ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                                                            <input autoFocus value={editingRecurring.name} onChange={e => setEditingRecurring({ ...editingRecurring, name: e.target.value })} className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Merchant</label>
                                                            <input value={editingRecurring.merchant} onChange={e => setEditingRecurring({ ...editingRecurring, merchant: e.target.value })} className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Monto</label>
                                                            <input type="number" step="0.01" value={editingRecurring.amount} onChange={e => setEditingRecurring({ ...editingRecurring, amount: parseFloat(e.target.value) })} className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Moneda</label>
                                                            <select value={editingRecurring.currency} onChange={e => setEditingRecurring({ ...editingRecurring, currency: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200">
                                                                {currencies.map((c: any) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Frecuencia</label>
                                                            <select value={editingRecurring.frequency} onChange={e => setEditingRecurring({ ...editingRecurring, frequency: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200">
                                                                <option value="monthly">Mensual</option>
                                                                <option value="biweekly">Quincenal</option>
                                                                <option value="weekly">Semanal</option>
                                                                <option value="annually">Anual</option>
                                                            </select>
                                                        </div>
                                                        {(editingRecurring.frequency === 'monthly' || editingRecurring.frequency === 'biweekly' || editingRecurring.frequency === 'annually') && (
                                                            <div>
                                                                <label className="block text-xs text-gray-400 mb-1">{editingRecurring.frequency === 'biweekly' ? 'Día 1' : 'Día del Mes'}</label>
                                                                <input type="number" min="1" max="31" value={editingRecurring.dayOfMonth || ""} onChange={e => setEditingRecurring({ ...editingRecurring, dayOfMonth: e.target.value ? parseInt(e.target.value) : null })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                                            </div>
                                                        )}
                                                        {editingRecurring.frequency === 'biweekly' && (
                                                            <div>
                                                                <label className="block text-xs text-gray-400 mb-1">Día 2</label>
                                                                <input type="number" min="1" max="31" value={editingRecurring.dayOfMonth2 || ""} onChange={e => setEditingRecurring({ ...editingRecurring, dayOfMonth2: e.target.value ? parseInt(e.target.value) : null })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                                            </div>
                                                        )}
                                                        {editingRecurring.frequency === 'weekly' && (
                                                            <div>
                                                                <label className="block text-xs text-gray-400 mb-1">Día de Semana</label>
                                                                <select value={editingRecurring.dayOfWeek ?? ""} onChange={e => setEditingRecurring({ ...editingRecurring, dayOfWeek: parseInt(e.target.value) })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200">
                                                                    <option value="">Seleccionar</option>
                                                                    {dayOfWeekLabels.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                                                </select>
                                                            </div>
                                                        )}
                                                        {editingRecurring.frequency === 'annually' && (
                                                            <div>
                                                                <label className="block text-xs text-gray-400 mb-1">Mes</label>
                                                                <select value={editingRecurring.monthOfYear ?? ""} onChange={e => setEditingRecurring({ ...editingRecurring, monthOfYear: parseInt(e.target.value) })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200">
                                                                    <option value="">Seleccionar</option>
                                                                    {monthLabels.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                                                                </select>
                                                            </div>
                                                        )}
                                                        <div className="flex items-end gap-2">
                                                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                                <input type="checkbox" checked={editingRecurring.isActive} onChange={e => setEditingRecurring({ ...editingRecurring, isActive: e.target.checked })} className="accent-cyan-500" />
                                                                Activo
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setEditingRecurring(null)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Cancelar</button>
                                                        <button onClick={() => handleUpdateRecurring(ev.id, { name: editingRecurring.name, merchant: editingRecurring.merchant, amount: editingRecurring.amount, currency: editingRecurring.currency, frequency: editingRecurring.frequency, dayOfMonth: editingRecurring.dayOfMonth, dayOfMonth2: editingRecurring.dayOfMonth2, dayOfWeek: editingRecurring.dayOfWeek, monthOfYear: editingRecurring.monthOfYear, isActive: editingRecurring.isActive })} className="px-3 py-1.5 text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1"><Check size={14} /> Guardar</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <RefreshCw size={14} className="text-cyan-400" />
                                                            <h4 className="font-bold text-white">{ev.name}</h4>
                                                            <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-md">{frequencyLabels[ev.frequency] || ev.frequency}</span>
                                                            {!ev.isActive && <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">Pausado</span>}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <span className="text-xs text-gray-300 font-mono">{ev.currency === 'CRC' ? '₡' : '$'}{parseFloat(ev.amount).toLocaleString()}</span>
                                                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">{ev.merchant}</span>
                                                            {(ev.frequency === 'monthly') && ev.dayOfMonth && <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">Día {ev.dayOfMonth}</span>}
                                                            {ev.frequency === 'biweekly' && ev.dayOfMonth && <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">Días {ev.dayOfMonth} y {ev.dayOfMonth2}</span>}
                                                            {ev.frequency === 'weekly' && ev.dayOfWeek != null && <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">{dayOfWeekLabels[ev.dayOfWeek]}</span>}
                                                            {ev.frequency === 'annually' && ev.monthOfYear && <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">{ev.dayOfMonth} de {monthLabels[ev.monthOfYear]}</span>}
                                                            {ev.lastGeneratedAt && <span className="text-[10px] text-gray-500">Último: {format(new Date(ev.lastGeneratedAt), 'dd/MM/yyyy')}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover/rec:opacity-100 transition-opacity">
                                                        <button onClick={() => setEditingRecurring({ id: ev.id, name: ev.name, merchant: ev.merchant, amount: parseFloat(ev.amount), currency: ev.currency, frequency: ev.frequency, dayOfMonth: ev.dayOfMonth, dayOfMonth2: ev.dayOfMonth2, dayOfWeek: ev.dayOfWeek, monthOfYear: ev.monthOfYear, isActive: ev.isActive })} className="p-1.5 bg-white/5 hover:bg-cyan-500/20 rounded-md text-gray-400 hover:text-cyan-300 transition-colors"><Edit2 size={14} /></button>
                                                        <button onClick={() => handleDeleteRecurring(ev.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 mt-6 border-t border-white/10 bg-cyan-900/10 p-4 rounded-xl">
                                    <h4 className="text-md font-medium mb-4 text-cyan-300">Crear Evento Recurrente</h4>
                                    <form onSubmit={handleCreateRecurring} className="space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                                                <input name="name" required placeholder='Ej. "Cuota Asociación"' className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Merchant / Comercio</label>
                                                <input name="merchant" required placeholder='Ej. "ASOC SOLIDARISTA"' className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Monto</label>
                                                <input type="number" step="0.01" name="amount" required placeholder="5000" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Moneda</label>
                                                <select name="currency" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200">
                                                    {currencies.map((c: any) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Frecuencia</label>
                                                <select name="frequency" value={newRecurringFreq} onChange={e => setNewRecurringFreq(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200">
                                                    <option value="monthly">Mensual</option>
                                                    <option value="biweekly">Quincenal</option>
                                                    <option value="weekly">Semanal</option>
                                                    <option value="annually">Anual</option>
                                                </select>
                                            </div>
                                            {(newRecurringFreq === 'monthly' || newRecurringFreq === 'biweekly' || newRecurringFreq === 'annually') && (
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">{newRecurringFreq === 'biweekly' ? 'Día 1' : 'Día del Mes'}</label>
                                                    <input type="number" min="1" max="31" name="dayOfMonth" placeholder="Ej. 1" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                                </div>
                                            )}
                                            {newRecurringFreq === 'biweekly' && (
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Día 2</label>
                                                    <input type="number" min="1" max="31" name="dayOfMonth2" placeholder="Ej. 15" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                                </div>
                                            )}
                                            {newRecurringFreq === 'weekly' && (
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Día de la Semana</label>
                                                    <select name="dayOfWeek" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200">
                                                        <option value="">Seleccionar</option>
                                                        {dayOfWeekLabels.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                            {newRecurringFreq === 'annually' && (
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Mes</label>
                                                    <select name="monthOfYear" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200">
                                                        <option value="">Seleccionar</option>
                                                        {monthLabels.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                                <Plus size={16} /> Crear
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
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
