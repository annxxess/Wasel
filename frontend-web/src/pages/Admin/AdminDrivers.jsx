import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDrivers() {
  const { dark } = useTheme();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const handleToggle = async (id) => {
    try {
      const res = await adminAPI.toggleStatus(id, 'driver');
      toast.success(res.data.message);
      fetchDrivers();
    } catch {
      toast.error('Failed to update driver');
    }
  };

  const handleVerify = async (id) => {
    try {
      const res = await adminAPI.verifyDriver(id);
      toast.success(res.data.message);
      fetchDrivers();
    } catch {
      toast.error('Failed to verify driver');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Drivers 🏍️</h1>
        <p className={sub}>Manage all delivery drivers</p>
      </div>

      {/* Search */}
      <div className={`rounded-2xl p-6 border mb-6 ${card}`}>
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-colors ${inp}`}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Drivers', value: drivers.length,                                  color: 'text-blue-400',   bg: 'bg-blue-500/10'  },
          { label: 'Online Now',    value: drivers.filter(d => d.is_online).length,         color: 'text-green-400',  bg: 'bg-green-500/10' },
          { label: 'Not Verified',  value: drivers.filter(d => !d.is_verified).length,      color: 'text-orange-400', bg: 'bg-orange-500/10'},
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border text-center ${card}`}>
            <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {loading ? (
          <div className="text-center py-16 text-slate-400">⏳ Loading drivers...</div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No drivers found 🏍️</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={dark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                <tr>
                  {['Driver', 'Phone', 'Status', 'Online', 'Rating', 'Deliveries', 'Wallet', 'Actions'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drivers.map(d => (
                  <tr key={d.id} className={`border-t transition-colors ${dark ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {d.full_name?.[0]}
                          </div>
                          {d.is_online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{d.full_name}</p>
                          <p className={`text-xs ${sub}`}>{d.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className={`px-4 py-3 text-sm ${sub}`}>{d.phone}</td>

                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {d.is_active ? '✅ Active' : '🚫 Banned'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.is_online ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {d.is_online ? '🟢 Online' : '⚫ Offline'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-yellow-400 font-bold text-sm">⭐ {d.rating}</span>
                    </td>

                    <td className={`px-4 py-3 text-sm font-semibold ${sub}`}>{d.total_deliveries}</td>

                    <td className="px-4 py-3 text-sm font-semibold text-green-400">{d.wallet_balance} DZD</td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {!d.is_verified && (
                          <button
                            onClick={() => handleVerify(d.id)}
                            className="text-xs px-2 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-all">
                            ✅ Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleToggle(d.id)}
                          className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-all ${d.is_active ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'}`}>
                          {d.is_active ? '🚫 Ban' : '✅ Unban'}
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