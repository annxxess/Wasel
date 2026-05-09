import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { dark } = useTheme();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const card = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const inp  = dark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-100 border-slate-200 text-slate-900';

  const fetchUsers = () => {
    setLoading(true);
    adminAPI.getUsers({ search })
      .then(res => setUsers(res.data.users || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleToggle = async (id, active) => {
    try {
      await adminAPI.toggleStatus(id, 'user');
      toast.success(active ? 'User banned' : 'User activated');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Users 👤</h1>
        <p className={sub}>Manage all registered customers</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users',  value: users.length,                           color: 'text-blue-400'  },
          { label: 'Active',       value: users.filter(u => u.is_active).length,  color: 'text-green-400' },
          { label: 'Banned',       value: users.filter(u => !u.is_active).length, color: 'text-red-400'   },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border text-center ${card}`}>
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl p-4 border mb-6 ${card}`}>
        <input type="text" placeholder="🔍 Search users..."
          value={search} onChange={e => setSearch(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-blue-500 ${inp}`} />
      </div>

      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {loading ? (
          <div className="text-center py-16 text-slate-400">⏳ Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No users found 👤</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={dark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                <tr>
                  {['User','Phone','Wilaya','Wallet','Joined','Status','Action'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={`border-t transition-colors ${dark ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {u.full_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{u.full_name}</p>
                          <p className={`text-xs ${sub}`}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm ${sub}`}>{u.phone || '—'}</td>
                    <td className={`px-4 py-3 text-sm ${sub}`}>{u.wilaya || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-400">{parseFloat(u.wallet_balance || 0).toFixed(0)} DZD</td>
                    <td className={`px-4 py-3 text-xs ${sub}`}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.is_active ? '✅ Active' : '🚫 Banned'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(u.id, u.is_active)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${u.is_active ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'}`}>
                        {u.is_active ? '🚫 Ban' : '✅ Activate'}
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