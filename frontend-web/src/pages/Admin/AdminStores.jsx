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

  const totalRevenue = stores.reduce((s, st) => s + parseFloat(st.total_revenue || 0), 0);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Stores 🏪</h1>
        <p className={sub}>Manage all partner stores and their income</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Stores',    value: stores.length,                            color: 'text-blue-400'   },
          { label: 'Active Stores',   value: stores.filter(s => s.is_active).length,   color: 'text-green-400'  },
          { label: 'Total Revenue',   value: totalRevenue.toFixed(0) + ' DZD',         color: 'text-orange-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border text-center ${card}`}>
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className={`rounded-2xl p-4 border mb-6 ${card}`}>
        <input type="text" placeholder="🔍 Search stores..."
          value={search} onChange={e => setSearch(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-blue-500 ${inp}`} />
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {loading ? (
          <div className="text-center py-16 text-slate-400">⏳ Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No stores found 🏪</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={dark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                <tr>
                  {['Store', 'Category', 'Phone', 'Orders', 'Revenue', 'Rating', 'Status', 'Action'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id} className={`border-t transition-colors ${dark ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.logo_url ? (
                          <img src={s.logo_url} alt="" className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {s.name?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className={`text-xs ${sub}`}>{s.address?.slice(0, 20)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium bg-blue-500/20 text-blue-400`}>
                        {s.category}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${sub}`}>{s.phone}</td>
                    <td className={`px-4 py-3 text-sm font-semibold`}>{s.total_orders || 0}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-400">{parseFloat(s.total_revenue || 0).toFixed(0)} DZD</td>
                    <td className="px-4 py-3 text-yellow-400 font-bold text-sm">⭐ {s.rating || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {s.is_active ? '✅ Active' : '🚫 Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(s.id, s.is_active)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${s.is_active ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'}`}>
                        {s.is_active ? '🚫 Suspend' : '✅ Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className={`text-center text-xs mt-8 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
      </p>
    </AdminLayout>
  );
}