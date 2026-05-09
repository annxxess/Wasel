import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../utils/api';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const { dark } = useTheme();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(res => setStats(res.data))
      .catch(() => setStats({
        users: 0, drivers: 0, orders: 0, stores: 0, revenue: 0, chart: []
      }))
      .finally(() => setLoading(false));
  }, []);

  const card    = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const sub     = dark ? 'text-slate-400' : 'text-slate-500';
  const gridC   = dark ? '#334155' : '#e2e8f0';
  const tickC   = dark ? '#94a3b8' : '#64748b';
  const tipBg   = dark ? '#1e293b' : '#ffffff';

  const tickStyle = { fill: tickC, fontSize: 11 };
  const tipStyle  = { background: tipBg, border: '1px solid #334155', borderRadius: 8 };
  const marginObj = { top: 5, right: 20, left: 0, bottom: 5 };

  const statCards = stats ? [
    { icon: '👤', label: 'Total Users',   value: stats.users,   color: 'text-blue-400',   g: 'from-blue-600 to-cyan-500',      badge: 'Users'    },
    { icon: '🏍️', label: 'Drivers',       value: stats.drivers, color: 'text-green-400',  g: 'from-green-600 to-teal-500',     badge: 'Drivers'  },
    { icon: '📦', label: 'Total Orders',  value: stats.orders,  color: 'text-orange-400', g: 'from-orange-600 to-yellow-500',  badge: 'Orders'   },
    { icon: '🏪', label: 'Stores',        value: stats.stores,  color: 'text-purple-400', g: 'from-purple-600 to-pink-500',    badge: 'Stores'   },
    { icon: '💰', label: 'Total Revenue', value: parseFloat(stats.revenue || 0).toFixed(0) + ' DZD', color: 'text-emerald-400', g: 'from-emerald-600 to-teal-500', badge: 'Income' },
  ] : [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Dashboard 📊</h1>
        <p className={sub}>Welcome to WASEL Admin Panel</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-lg">⏳ Loading dashboard...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {statCards.map(s => (
              <div key={s.label} className={`rounded-2xl p-5 border ${card}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.g} flex items-center justify-center text-2xl shadow-lg`}>
                    {s.icon}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    {s.badge}
                  </span>
                </div>
                <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
                <div className={`text-xs ${sub}`}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          {stats?.chart?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`rounded-2xl p-6 border ${card}`}>
                <h2 className="text-base font-bold mb-5">📈 Orders This Week</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.chart} margin={marginObj}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridC} />
                    <XAxis dataKey="day" tick={tickStyle} />
                    <YAxis tick={tickStyle} />
                    <Tooltip contentStyle={tipStyle} />
                    <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className={`rounded-2xl p-6 border ${card}`}>
                <h2 className="text-base font-bold mb-5">💰 Revenue This Week</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.chart} margin={marginObj}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridC} />
                    <XAxis dataKey="day" tick={tickStyle} />
                    <YAxis tick={tickStyle} />
                    <Tooltip contentStyle={tipStyle} />
                    <Bar dataKey="revenue" fill="#f97316" radius={6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className={`rounded-2xl p-6 border ${card}`}>
            <h2 className="text-base font-bold mb-4">⚡ Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Manage Users',   path: '/admin/users',   icon: '👤', color: 'from-blue-600 to-cyan-500'    },
                { label: 'View Drivers',   path: '/admin/drivers', icon: '🏍️', color: 'from-green-600 to-teal-500'   },
                { label: 'All Orders',     path: '/admin/orders',  icon: '📦', color: 'from-orange-600 to-yellow-500'},
                { label: 'Manage Stores',  path: '/admin/stores',  icon: '🏪', color: 'from-purple-600 to-pink-500'  },
              ].map(a => (
                <a key={a.label} href={a.path}
                  className={`p-4 rounded-xl bg-gradient-to-br ${a.color} text-white text-center font-semibold text-sm hover:opacity-90 transition-all shadow-lg`}>
                  <div className="text-2xl mb-2">{a.icon}</div>
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      <p className={`text-center text-xs mt-8 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
      </p>
    </AdminLayout>
  );
}