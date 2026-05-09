import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { dark } = useTheme();
  const [users, setUsers] = useState([]);
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

  const handleToggle = async (id) => {
    try {
      const res = await adminAPI.toggleStatus(id, 'user');
      toast.success(res.data.message);
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Users 👤</h1>
        <p className={sub}>Manage all registered customers</p>
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

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {loading ? (
          <div className="text-center py-16 text-slate-400">⏳ Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No users found 👤</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={dark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                <tr>
                  {['Name', 'Email', 'Phone', 'Wallet', 'Status', 'Joined', 'Action'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-t transition-colors ${
                    dark ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'
                  }`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {u.full_name?.[0]}
                        </div>
                        <span className="text-sm font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm ${sub}`}>{u.email}</td>
                    <td className={`px-4 py-3 text-sm ${sub}`}>{u.phone}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-400">{u.wallet_balance} DZD</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        u.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.is_active ? '✅ Active' : '🚫 Banned'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${sub}`}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(u.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                          u.is_active
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                        }`}
                      >
                        {u.is_active ? '🚫 Ban' : '✅ Unban'}
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