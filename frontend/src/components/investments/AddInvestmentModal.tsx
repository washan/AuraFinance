import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { createInvestmentTransaction } from '@/services/investmentService';

interface Account {
  id: string;
  name: string;
  type: string;
}

export function AddInvestmentModal({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    accountId: '',
    symbol: '',
    type: 'BUY',
    quantity: '',
    price: '',
    commission: '0',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  const loadAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch accounts');
      const data = await res.json();
      const investmentAccounts = data.filter((a: any) => a.type === 'investment' || a.type === 'bank');
      setAccounts(investmentAccounts);
      if (investmentAccounts.length > 0) {
        setFormData(prev => ({ ...prev, accountId: investmentAccounts[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No autenticado");

      await createInvestmentTransaction(token, {
        accountId: formData.accountId,
        symbol: formData.symbol.toUpperCase(),
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        commission: parseFloat(formData.commission),
        date: new Date(formData.date).toISOString(),
        notes: formData.notes
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Registrar Transacción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Cuenta/Broker</label>
            <select
              required
              value={formData.accountId}
              onChange={e => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Instrumento</label>
              <input
                required
                placeholder="Ej. VUAA.L"
                value={formData.symbol}
                onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
              <select
                required
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="BUY">Compra</option>
                <option value="SELL">Venta</option>
                <option value="DIVIDEND">Dividendo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Cantidad de Acciones</label>
              <input
                required
                type="number"
                step="any"
                min="0"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Precio Unitario ($)</label>
              <input
                required
                type="number"
                step="any"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Comisión del Broker ($)</label>
              <input
                required
                type="number"
                step="any"
                min="0"
                value={formData.commission}
                onChange={e => setFormData({ ...formData, commission: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Fecha</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
