import { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

function StatCard({ icon, label, value, badgeColor, dark }) {
  return (
    <div className={`rounded-2xl p-6 border transition-all hover:scale-105 cursor-default ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColor}`}>Live</span>
      </div>
      <div className="text-3xl font-black mb-1">{(value || 0).toLocaleString()}</div>
      <div className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex items-center justify-center h-52 text-slate-500">{message}</div>
  );
}

export default function AdminDashboard() {
  const { dark } = useTheme();
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getRevenue()])
      .then(([s, r]) => {
        setStats(s.data.stats);
        setRevenue(r.data.daily_revenue || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
  adminAPI.getStats()
    .then(res => setStats(res.data))
    .catch(() => {});
}, []);

  const gridColor   = dark ? '#334155' : '#e2e8f0';
  const tickColor   = dark ? '#94a3b8' : '#64748b';
  const tipBg       = dark ? '#1e293b' : '#ffffff';
  const card        = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const sub         = dark ? 'text-slate-400' : 'text-slate-500';

  const tickProps    = { fill: tickColor, fontSize: 11 };
  const tipStyle     = { background: tipBg, border: '1px solid #334155', borderRadius: '8px' };
  const dateFormat   = (v) => v.slice(5);

  return (
    <AdminLayout>

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg,#3b82f6,#f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1">Dashboard 📊</h1>
          <p className={sub}>Welcome back! Here's what's happening.</p>
        </div>
        <div className={`text-sm px-4 py-2 rounded-xl flex items-center gap-2 ${dark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
          Live Data
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xl">⏳ Loading dashboard...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard icon="👤" label="Users"         value={stats?.total_users}    badgeColor="bg-blue-500/20 text-blue-400"       dark={dark} />
            <StatCard icon="🏍️" label="Drivers"       value={stats?.total_drivers}  badgeColor="bg-green-500/20 text-green-400"     dark={dark} />
            <StatCard icon="🏪" label="Stores"        value={stats?.total_stores}   badgeColor="bg-purple-500/20 text-purple-400"   dark={dark} />
            <StatCard icon="📦" label="Orders"        value={stats?.total_orders}   badgeColor="bg-orange-500/20 text-orange-400"   dark={dark} />
            <StatCard icon="⏳" label="Pending"       value={stats?.pending_orders} badgeColor="bg-yellow-500/20 text-yellow-400"   dark={dark} />
            <StatCard icon="💰" label="Revenue (DZD)" value={stats?.total_revenue}  badgeColor="bg-emerald-500/20 text-emerald-400" dark={dark} />
          </div>
          {/* Revenue Card — أضفه مع بقية الـ Cards */}
<div className={`rounded-2xl p-6 border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
  <div className="flex items-center justify-between mb-4">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
      💰
    </div>
    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Income</span>
  </div>
  <div className="text-3xl font-black text-emerald-400 mb-1">{stats.revenue?.toFixed(0) || 0} DZD</div>
  <div className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Total Revenue</div>
</div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            <div className={`rounded-2xl p-6 border ${card}`}>
              <h3 className="font-bold text-lg mb-6">📈 Revenue — Last 30 Days</h3>
              {revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={tickProps} tickFormatter={dateFormat} />
                    <YAxis tick={tickProps} />
                    <Tooltip contentStyle={tipStyle} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="📦 No revenue data yet — start accepting orders!" />
              )}
            </div>

            <div className={`rounded-2xl p-6 border ${card}`}>
              <h3 className="font-bold text-lg mb-6">📦 Orders — Last 30 Days</h3>
              {revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={tickProps} tickFormatter={dateFormat} />
                    <YAxis tick={tickProps} />
                    <Tooltip contentStyle={tipStyle} />
                    <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="🚀 No orders data yet!" />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`rounded-2xl p-6 border ${card}`}>
            <h3 className="font-bold text-lg mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'All Orders',      icon: '📦', path: '/admin/orders'  },
                { label: 'Manage Drivers',  icon: '🏍️', path: '/admin/drivers' },
                { label: 'Manage Users',    icon: '👤', path: '/admin/users'   },
                { label: 'Support Tickets', icon: '🎫', path: '/admin/tickets' },
              ].map((a) => (
                <a key={a.label} href={a.path}
                  className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium transition-all hover:scale-105 ${dark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-50 hover:bg-slate-100'}`}>
                  <span className="text-2xl">{a.icon}</span>
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