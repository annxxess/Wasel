import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../utils/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899'];

export default function AdminIncome() {
  const { dark } = useTheme();
  const [stats, setStats] = useState(null);

  const card    = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const sub     = dark ? 'text-slate-400' : 'text-slate-500';
  const gridC   = dark ? '#334155' : '#e2e8f0';
  const tickC   = dark ? '#94a3b8' : '#64748b';
  const tipBg   = dark ? '#1e293b' : '#ffffff';

  const tickStyle = { fill: tickC, fontSize: 11 };
  const tipStyle  = { background: tipBg, border: '1px solid #334155', borderRadius: 8 };
  const marginObj = { top: 5, right: 20, left: 0, bottom: 5 };

  useEffect(() => {
    adminAPI.getStats()
      .then(res => setStats(res.data))
      .catch(() => setStats({ revenue: 0, chart: [], orders: 0 }));
  }, []);

  const pieData = stats ? [
    { name: 'Food',     value: 40 },
    { name: 'Parcel',   value: 30 },
    { name: 'Pharmacy', value: 15 },
    { name: 'Document', value: 10 },
    { name: 'Other',    value: 5  },
  ] : [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Income 💰</h1>
        <p className={sub}>Track your platform revenue and earnings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '💰', label: 'Total Revenue',    value: parseFloat(stats?.revenue || 0).toFixed(0) + ' DZD', color: 'text-emerald-400', g: 'from-emerald-600 to-teal-500'    },
          { icon: '📦', label: 'Total Orders',     value: stats?.orders || 0,                                   color: 'text-blue-400',    g: 'from-blue-600 to-cyan-500'       },
          { icon: '📊', label: 'Avg per Order',    value: stats?.orders ? (stats.revenue / stats.orders).toFixed(0) + ' DZD' : '0 DZD', color: 'text-orange-400', g: 'from-orange-600 to-yellow-500' },
          { icon: '📅', label: 'This Week',        value: stats?.chart?.reduce((s, d) => s + parseFloat(d.revenue || 0), 0).toFixed(0) + ' DZD', color: 'text-purple-400', g: 'from-purple-600 to-pink-500' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border ${card}`}>
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.g} flex items-center justify-center text-2xl mb-3 shadow-lg`}>
              {s.icon}
            </div>
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <div className={`rounded-2xl p-6 border mb-6 ${card}`}>
        <h2 className="text-lg font-bold mb-6">📈 Revenue Over Time</h2>
        {stats?.chart?.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.chart} margin={marginObj}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridC} />
              <XAxis dataKey="day" tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tipStyle} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">📊</div>
            <p>No revenue data yet — orders will populate this chart</p>
          </div>
        )}
      </div>

      {/* Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 border ${card}`}>
          <h2 className="text-lg font-bold mb-6">🥧 Revenue by Order Type</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-2xl p-6 border ${card}`}>
          <h2 className="text-lg font-bold mb-6">💡 Revenue Tips</h2>
          <div className="space-y-4">
            {[
              { icon: '🚀', t: 'Add more drivers',      d: 'More drivers = faster delivery = more orders'   },
              { icon: '🏪', t: 'Partner with stores',   d: 'More stores = more order types & volume'        },
              { icon: '📣', t: 'Promote the platform',  d: 'Social media ads increase new user sign-ups'    },
              { icon: '⭐', t: 'Maintain quality',      d: 'High ratings attract repeat customers'          },
            ].map(tip => (
              <div key={tip.t} className={`flex items-start gap-3 p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <span className="text-xl">{tip.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{tip.t}</p>
                  <p className={`text-xs ${sub}`}>{tip.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className={`text-center text-xs mt-8 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
      </p>
    </AdminLayout>
  );
}