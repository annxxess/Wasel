import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminStores() {
  const { dark } = useTheme();
  const [stores, setStores]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const card = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const inp  = dark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-100 border-slate-200 text-slate-900';

  const fetchStores = () => {
    setLoading(true);
    adminAPI.getStores({ search })
      .then(res => setStores(res.data.stores || []))
      .catch(() => toast.error('Failed to load stores'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStores(); }, [search]);

  const handleToggle = async (id, active) => {
    try {
      await adminAPI.toggleStatus(id, 'store');
      toast.success(active ? 'Store suspended' : 'Store activated');
      fetchStores();
    } catch { toast.error('Failed'); }
  };

  const CATEGORY_ICONS = { food: '🍔', pharmacy: '💊', market: '🛒', document: '📄', other: '📦' };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Stores 🏪</h1>
        <p className={sub}>Manage all registered stores</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Stores',  value: stores.length,                           color: 'text-purple-400' },
          { label: 'Active',        value: stores.filter(s => s.is_active).length,  color: 'text-green-400'  },
          { label: 'Suspended',     value: stores.filter(s => !s.is_active).length, color: 'text-red-400'    },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border text-center ${card}`}>
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl p-4 border mb-6 ${card}`}>
        <input type="text" placeholder="🔍 Search stores..."
          value={search} onChange={e => setSearch(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-blue-500 ${inp}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-16 text-slate-400">⏳ Loading...</div>
        ) : stores.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-slate-400">No stores found 🏪</div>
        ) : stores.map(s => (
          <div key={s.id} className={`rounded-2xl border p-5 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                  {CATEGORY_ICONS[s.category] || '🏪'}
                </div>
                <div>
                  <p className="font-bold text-sm">{s.name}</p>
                  <p className={`text-xs capitalize ${sub}`}>{s.category}</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {s.is_active ? '✅ Active' : '🚫 Suspended'}
              </span>
            </div>

            <div className={`space-y-2 text-xs ${sub} mb-4`}>
              <div className="flex items-center gap-2"><span>📍</span><span className="truncate">{s.address || '—'}</span></div>
              <div className="flex items-center gap-2"><span>📱</span><span>{s.phone || '—'}</span></div>
              <div className="flex items-center gap-2"><span>⭐</span><span>{s.rating || '5.0'}</span><span>•</span><span>{s.total_orders || 0} orders</span></div>
              <div className="flex items-center gap-2"><span>💰</span><span className="text-green-400 font-semibold">{parseFloat(s.total_revenue || 0).toFixed(0)} DZD</span></div>
            </div>

            <button onClick={() => handleToggle(s.id, s.is_active)}
              className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${s.is_active ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'}`}>
              {s.is_active ? '🚫 Suspend Store' : '✅ Activate Store'}
            </button>
          </div>
        ))}
      </div>

      <p className={`text-center text-xs mt-8 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
      </p>
    </AdminLayout>
  );
}