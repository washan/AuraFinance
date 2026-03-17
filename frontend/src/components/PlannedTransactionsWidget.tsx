"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, CheckCircle2, Edit2, Trash2, ArrowUpRight, ArrowDownRight, X, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastType } from "@/components/ui/toast";

export default function PlannedTransactionsWidget({ currencySymbol, onToast, onTransactionRealized }: any) {
  const [plannedTransactions, setPlannedTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Catalogs
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRealizeOpen, setIsRealizeOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [realizeError, setRealizeError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    currency: "CRC",
    plannedDate: format(new Date(), 'yyyy-MM-dd'),
    categoryId: "",
    itemId: "",
    projectId: "",
    notes: ""
  });

  const [realizeData, setRealizeData] = useState({
    accountId: "",
    amountOriginal: "",
    transactionDate: format(new Date(), 'yyyy-MM-dd'),
    notes: ""
  });

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planned-transactions?status=PENDING`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPlannedTransactions(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCatalogs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const hdrs = { Authorization: `Bearer ${token}` };
      const [accRes, catRes, curRes, projRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, { headers: hdrs }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { headers: hdrs }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/currencies`, { headers: hdrs }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, { headers: hdrs })
      ]);
      if (accRes.ok) setAccounts(await accRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (curRes.ok) setCurrencies(await curRes.json());
      if (projRes.ok) setProjects(await projRes.json());
    } catch (e) {
      console.error("Failed to load catalogs");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenForm = async (pt: any = null) => {
    await loadCatalogs();
    if (pt) {
      setEditingId(pt.id);
      setFormData({
        type: pt.type,
        amount: Math.abs(parseFloat(pt.amount)).toString(),
        currency: pt.currency,
        plannedDate: pt.plannedDate.split('T')[0],
        categoryId: pt.item?.categoryId || "",
        itemId: pt.itemId || "",
        projectId: pt.projectId || "",
        notes: pt.notes || ""
      });
    } else {
      setEditingId(null);
      setFormData({
        type: "expense",
        amount: "",
        currency: "CRC",
        plannedDate: format(new Date(), 'yyyy-MM-dd'),
        categoryId: "",
        itemId: "",
        projectId: "",
        notes: ""
      });
    }
    setIsFormOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    let rawAmount = parseFloat(formData.amount);
    if (formData.type === "expense") rawAmount = -Math.abs(rawAmount);
    else rawAmount = Math.abs(rawAmount);

    const payload = {
      type: formData.type,
      amount: rawAmount.toString(),
      currency: formData.currency,
      plannedDate: formData.plannedDate,
      itemId: formData.itemId || undefined,
      projectId: formData.projectId || undefined,
      notes: formData.notes
    };

    const endpoint = editingId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/planned-transactions/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/planned-transactions`;
    
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      onToast("Proyección guardada.", "success");
      setIsFormOpen(false);
      fetchData();
    } else {
      onToast("Error al guardar.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta proyección?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planned-transactions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      onToast("Eliminada.", "success");
      fetchData();
    }
  };

  const handleOpenRealize = async (pt: any) => {
    setRealizeError(null);
    await loadCatalogs();
    setEditingId(pt.id);
    setRealizeData({
      accountId: pt.accountId || "",
      amountOriginal: Math.abs(parseFloat(pt.amount)).toString(),
      transactionDate: format(new Date(), 'yyyy-MM-dd'),
      notes: pt.notes || ""
    });
    setIsRealizeOpen(true);
  };

  const handleRealize = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const pt = plannedTransactions.find(p => p.id === editingId);
    if (!pt || !realizeData.accountId) return;

    let rawAmount = parseFloat(realizeData.amountOriginal);
    if (pt.type === "expense") rawAmount = -Math.abs(rawAmount);
    else rawAmount = Math.abs(rawAmount);

    const payload = {
      accountId: realizeData.accountId,
      amountOriginal: rawAmount.toString(),
      amountBase: rawAmount.toString(), // assuming same currency for simplicity
      transactionDate: realizeData.transactionDate,
      notes: realizeData.notes
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planned-transactions/${editingId}/realize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      onToast("Transacción completada y registrada en el banco.", "success");
      setIsRealizeOpen(false);
      fetchData();
      if (onTransactionRealized) onTransactionRealized();
    } else {
      const text = await res.text();
      let errMsg = "Error al completar.";
      try {
        const json = JSON.parse(text);
        errMsg = json.message || errMsg;
      } catch (e) {
        errMsg = text || errMsg;
      }
      setRealizeError(errMsg);
      onToast("Error al completar.", "error");
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const availableItems = selectedCategory?.items || [];

  return (
    <>
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col mt-8">
        <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-amber-100 flex items-center gap-2">
            🗓️ Proyecciones & CRM
          </h3>
          <p className="text-sm text-gray-400">Ingresos o pagos pendientes a futuro</p>
        </div>
        <button 
          onClick={() => handleOpenForm()} 
          className="bg-amber-600/20 text-amber-400 hover:bg-amber-600/40 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-amber-500/30 flex items-center gap-2"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Nueva Proyección</span>
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
            <div className="text-center text-gray-500 py-4 text-sm">Cargando...</div>
        ) : plannedTransactions.length === 0 ? (
            <div className="text-center text-gray-500 py-6 text-sm">No hay proyecciones pendientes.</div>
        ) : (
          plannedTransactions.map(pt => {
            const isExpense = parseFloat(pt.amount) < 0;
            return (
              <div key={pt.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-black/40 border border-white/5 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-gradient-to-br ${isExpense ? 'from-red-500/20 to-orange-500/20 text-red-400' : 'from-emerald-500/20 to-teal-500/20 text-emerald-400'}`}>
                    {isExpense ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200">
                      {pt.item?.name ? `${pt.item.category?.icon || ''} ${pt.item.name}` : 'Sin clasificar'}
                      {pt.projectId && <span className="ml-2 text-xs text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">💼 {pt.project?.name}</span>}
                    </h4>
                    {pt.notes && <p className="text-sm text-gray-400 mt-1 italic">"{pt.notes}"</p>}
                    <p className="text-xs text-amber-500/70 mt-1 flex items-center gap-1">⏱ Esperado para: {format(new Date(pt.plannedDate.split('T')[0] + 'T12:00:00'), 'dd MMM yyyy', {locale: es})}</p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-white/5">
                  <div className="text-left md:text-right">
                    <p className={`font-bold text-lg ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isExpense ? '' : '+'}{formatCurrency(parseFloat(pt.amount), pt.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => handleOpenRealize(pt)} className="bg-emerald-600/30 hover:bg-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 border border-emerald-500/30 transition-colors">
                      <CheckCircle2 size={14} /> Completar
                    </button>
                    <button onClick={() => handleOpenForm(pt)} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(pt.id)} className="p-1.5 hover:bg-red-500/20 rounded-md text-red-500/70 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

      {/* Form Modal (Create/Edit Proyection) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
          <div className="relative bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">{editingId ? 'Editar Proyección' : 'Nueva Proyección'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex bg-black/50 border border-white/10 rounded-lg p-1">
                  <button type="button" onClick={() => setFormData(p => ({...p, type: 'expense'}))} className={`flex-1 py-1.5 text-sm rounded ${formData.type==='expense' ? 'bg-red-500/20 text-red-500' : 'text-gray-500'}`}>Gasto</button>
                  <button type="button" onClick={() => setFormData(p => ({...p, type: 'income'}))} className={`flex-1 py-1.5 text-sm rounded ${formData.type==='income' ? 'bg-emerald-500/20 text-emerald-500' : 'text-gray-500'}`}>Ingreso</button>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm text-gray-400 mb-1">Monto Tentativo</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><DollarSign size={14} /></div>
                        <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData(p => ({...p, amount: e.target.value}))} className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white" />
                    </div>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm text-gray-400 mb-1">Moneda</label>
                    <select value={formData.currency} onChange={e => setFormData(p => ({...p, currency: e.target.value}))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                        {currencies.map(c => <option key={c.code} value={c.code} className="bg-zinc-900">{c.code}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Fecha Esperada</label>
                    <DatePicker selected={new Date(formData.plannedDate + "T12:00:00")} onChange={(date: Date | null) => { if(date) setFormData(p => ({...p, plannedDate: format(date, 'yyyy-MM-dd')})) }} dateFormat="yyyy-MM-dd" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" calendarClassName="bg-zinc-900 text-white border-white/10" />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm text-gray-400 mb-1">Categoría</label>
                    <select value={formData.categoryId} onChange={e => setFormData(p => ({...p, categoryId: e.target.value, itemId: ""}))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                        <option value="" className="bg-zinc-900">General</option>
                        {categories.filter(c => c.type === formData.type).map(c => <option key={c.id} value={c.id} className="bg-zinc-900">{c.icon} {c.name}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm text-gray-400 mb-1">Ítem</label>
                    <select disabled={!formData.categoryId} value={formData.itemId} onChange={e => setFormData(p => ({...p, itemId: e.target.value}))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50">
                        <option value="" className="bg-zinc-900">Específico</option>
                        {availableItems.map((i:any) => <option key={i.id} value={i.id} className="bg-zinc-900">{i.name}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm text-amber-400/80 mb-1 flex items-center gap-1">💼 CRM / Proyecto (Opcional)</label>
                    <select value={formData.projectId} onChange={e => setFormData(p => ({...p, projectId: e.target.value}))} className="w-full bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-100">
                        <option value="" className="bg-zinc-900">Sin Proyecto</option>
                        {projects.map(p => <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Notas / Recordatorios (Teléfono, Dirección...)</label>
                    <textarea value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-amber-500" placeholder="Ej. Juan Pérez - 8888-8888, llevar a la playa..."></textarea>
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 rounded-lg transition-colors">Guardar Proyección</button>
            </form>
          </div>
        </div>
      )}

      {/* Realize Modal */}
      {isRealizeOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsRealizeOpen(false)}></div>
          <div className="relative bg-emerald-950/40 border border-emerald-500/20 rounded-3xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-xl font-medium text-emerald-400 mb-2 flex items-center gap-2"><CheckCircle2 /> Completar Transacción</h3>
            <p className="text-sm text-gray-400 mb-6">Selecciona en qué cuenta aplicarás este movimiento para que se refleje en tus saldos reales.</p>
            
            {realizeError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-4">
                {realizeError}
              </div>
            )}

            <form onSubmit={handleRealize} className="space-y-4">
                <div>
                    <label className="block text-sm text-emerald-200 mb-1">Monto Exacto</label>
                    <input type="number" step="0.01" required value={realizeData.amountOriginal} onChange={e => setRealizeData(p => ({...p, amountOriginal: e.target.value}))} className="w-full bg-black/50 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm text-emerald-200 mb-1">Cuenta Banco / Efectivo</label>
                    <select required value={realizeData.accountId} onChange={e => setRealizeData(p => ({...p, accountId: e.target.value}))} className="w-full bg-black/50 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm text-white">
                        <option value="" className="bg-zinc-900">Seleccione Cuenta</option>
                        {accounts.map(a => <option key={a.id} value={a.id} className="bg-zinc-900">{a.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-emerald-200 mb-1">Fecha Real</label>
                    <DatePicker selected={new Date(realizeData.transactionDate + "T12:00:00")} onChange={(date: Date | null) => { if(date) setRealizeData(p => ({...p, transactionDate: format(date, 'yyyy-MM-dd')})) }} dateFormat="yyyy-MM-dd" className="w-full bg-black/50 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm text-white" calendarClassName="bg-zinc-900 text-white border-white/10" />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition-colors mt-4 shadow-lg shadow-emerald-900/50">✅ Confirmar Ingreso/Gasto</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
