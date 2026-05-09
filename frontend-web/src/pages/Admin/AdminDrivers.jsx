import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDrivers() {
  const { dark } = useTheme();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const card = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const inp  = dark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-100 border-slate-200 text-slate-900';

  const fetchDrivers = () => {
    setLoading(true);
    adminAPI.getDrivers({ search })
      .then(res => setDrivers(res.data.drivers || []))
      .catch(() => toast.error('Failed to load drivers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDrivers(); }, [search]);

  const handleToggle = async (id, active) => {
    try {
      await adminAPI.toggleStatus(id, 'user');
      toast.success(active ? 'Driver suspended' : 'Driver activated');
      fetchDrivers();
    } catch { toast.error('Failed'); }
  };

  const handleVerify = async (id) => {
    try {
      await adminAPI.verifyDriver(id);
      toast.success('Driver verified! ✅');
      fetchDrivers();
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Drivers 🏍️</h1>
        <p className={sub}>Manage all delivery drivers</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',    value: drivers.length,                              color: 'text-white'       },
          { label: 'Online',   value: drivers.filter(d => d.is_online).length,    color: 'text-green-400'   },
          { label: 'Verified', value: drivers.filter(d => d.is_verified).length,  color: 'text-blue-400'    },
          { label: 'Pending',  value: drivers.filter(d => !d.is_verified).length, color: 'text-yellow-400'  },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border text-center ${card}`}>
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl p-4 border mb-6 ${card}`}>
        <input type="text" placeholder="🔍 Search drivers..."
          value={search} onChange={e => setSearch(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-blue-500 ${inp}`} />
      </div>

      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {loading ? (
          <div className="text-center py-16 text-slate-400">⏳ Loading...</div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No drivers found 🏍️</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={dark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                <tr>
                  {['Driver','Phone','Rating','Deliveries','Wallet','Online','Verified','Actions'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drivers.map(d => (
                  <tr key={d.id} className={`border-t transition-colors ${dark ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {d.full_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{d.full_name}</p>
                          <p className={`text-xs ${sub}`}>{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm ${sub}`}>{d.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-yellow-400 font-semibold">⭐ {d.rating || '5.0'}</td>
                    <td className={`px-4 py-3 text-sm font-semibold`}>{d.total_deliveries || 0}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-400">{parseFloat(d.wallet_balance || 0).toFixed(0)} DZD</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.is_online ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {d.is_online ? '🟢 Online' : '⚫ Offline'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.is_verified ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {d.is_verified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {!d.is_verified && (
                          <button onClick={() => handleVerify(d.id)}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-all">
                            ✅ Verify
                          </button>
                        )}
                        <button onClick={() => handleToggle(d.id, d.is_active)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${d.is_active ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'}`}>
                          {d.is_active ? '🚫 Ban' : '✅ Activate'}
                        </button>
                      </div>
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