import { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Check, ExternalLink } from 'lucide-react';
import { getTransactions, deleteInvestmentTransaction, updateInvestmentTransaction } from '@/services/investmentService';

export function TransactionsHistoryModal({
  isOpen,
  onClose,
  onUpdate
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      loadTransactions();
    }
  }, [isOpen]);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data = await getTransactions(token);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta transacción? Esto recalculará tu portafolio.")) return;
    try {
      const token = localStorage.getItem('token');
      await deleteInvestmentTransaction(token!, id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEdit = (tx: any) => {
    setEditingId(tx.id);
    setEditForm({
      type: tx.type,
      quantity: tx.quantity.toString(),
      price: tx.price.toString(),
      commission: tx.commission.toString(),
      date: new Date(tx.date).toISOString().split('T')[0]
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await updateInvestmentTransaction(token!, id, {
        type: editForm.type,
        quantity: parseFloat(editForm.quantity),
        price: parseFloat(editForm.price),
        commission: parseFloat(editForm.commission),
        date: new Date(editForm.date).toISOString()
      });
      setEditingId(null);
      await loadTransactions();
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-bold text-white">Historial de Transacciones</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-0 overflow-y-auto flex-1">
          {loading ? (
             <div className="p-8 text-center text-gray-400">Cargando...</div>
          ) : error ? (
             <div className="p-8 text-center text-red-400">{error}</div>
          ) : transactions.length === 0 ? (
             <div className="p-8 text-center text-gray-500">No hay transacciones registradas.</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-gray-400 border-b border-white/10 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Instrumento</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium text-right">Cantidad</th>
                  <th className="px-6 py-4 font-medium text-right">Precio</th>
                  <th className="px-6 py-4 font-medium text-right">Comisión</th>
                  <th className="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map(tx => {
                  const isEditing = editingId === tx.id;
                  
                  if (isEditing) {
                    return (
                       <tr key={tx.id} className="bg-indigo-500/10">
                         <td className="px-4 py-3">
                           <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="bg-black/50 border border-white/10 rounded p-1.5 text-white w-full text-xs" />
                         </td>
                         <td className="px-4 py-3 text-gray-300 font-bold">{tx.instrument.symbol}</td>
                         <td className="px-4 py-3">
                            <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} className="bg-black/50 border border-white/10 rounded p-1.5 text-white w-full text-xs">
                              <option value="BUY">BUY</option>
                              <option value="SELL">SELL</option>
                              <option value="DIVIDEND">DIVIDEND</option>
                            </select>
                         </td>
                         <td className="px-4 py-3">
                           <input type="number" step="any" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: e.target.value})} className="bg-black/50 border border-white/10 rounded p-1.5 text-white w-full text-xs text-right" />
                         </td>
                         <td className="px-4 py-3">
                           <input type="number" step="any" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="bg-black/50 border border-white/10 rounded p-1.5 text-white w-full text-xs text-right" />
                         </td>
                         <td className="px-4 py-3">
                           <input type="number" step="any" value={editForm.commission} onChange={e => setEditForm({...editForm, commission: e.target.value})} className="bg-black/50 border border-white/10 rounded p-1.5 text-white w-full text-xs text-right" />
                         </td>
                         <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                           <button onClick={() => saveEdit(tx.id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30">
                             <Check size={16} />
                           </button>
                           <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30">
                             <X size={16} />
                           </button>
                         </td>
                       </tr>
                    );
                  }

                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{tx.instrument.symbol}</div>
                        <div className="text-xs text-gray-500">{tx.account.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${tx.type === 'BUY' ? 'bg-indigo-500/20 text-indigo-300' : tx.type === 'SELL' ? 'bg-orange-500/20 text-orange-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                           {tx.type === 'BUY' ? 'Compra' : tx.type === 'SELL' ? 'Venta' : 'Dividendo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300 text-sm">
                        {tx.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300 text-sm">
                        ${tx.price}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400 text-sm text-xs">
                        {tx.commission > 0 ? `$${tx.commission}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => startEdit(tx)} className="text-gray-400 hover:text-indigo-400 transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(tx.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
