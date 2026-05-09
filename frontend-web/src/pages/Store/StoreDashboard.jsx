import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreLayout from './StoreLayout';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storesAPI } from '../../utils/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

export default function StoreDashboard() {
  const { dark }      = useTheme();
  const { user }      = useAuth();
  const navigate       = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const card    = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const sub     = dark ? 'text-slate-400' : 'text-slate-500';
  const chartBg = dark ? '#1e293b' : '#ffffff';
  const gridC   = dark ? '#334155' : '#e2e8f0';
  const tickC   = dark ? '#94a3b8' : '#64748b';
  const tipBg   = dark ? '#1e293b' : '#ffffff';

  // Pre-define chart props as variables
  const tickStyle  = { fill: tickC, fontSize: 11 };
  const tipStyle   = { background: tipBg, border: '1px solid #334155', borderRadius: 8 };
  const gridStyle  = { stroke: gridC };
  const marginObj  = { top: 5, right: 20, left: 0, bottom: 5 };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    storesAPI.getStats()
      .then(r => setStats(r.data))
      .catch(() => setStats({
        total_orders: 0, delivered: 0, pending: 0,
        revenue: 0, rating: 0, chart: [],
      }))
      .finally(() => setLoading(false));
  }, [user]);

  const statCards = stats ? [
    { icon: '📦', label: 'Total Orders',  value: stats.total_orders, color: 'text-blue-400',   g: 'from-blue-600 to-cyan-500'     },
    { icon: '🎉', label: 'Delivered',     value: stats.delivered,    color: 'text-green-400',  g: 'from-green-600 to-teal-500'    },
    { icon: '⏳', label: 'Pending',       value: stats.pending,      color: 'text-yellow-400', g: 'from-yellow-600 to-orange-500' },
    { icon: '💰', label: 'Revenue',       value: parseFloat(stats.revenue || 0).toFixed(0) + ' DZD', color: 'text-emerald-400', g: 'from-emerald-600 to-teal-500' },
    { icon: '⭐', label: 'Rating',        value: stats.rating || '—', color: 'text-yellow-400', g: 'from-yellow-500 to-orange-500' },
  ] : [];

  return (
    <StoreLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Store Dashboard 🏪</h1>
        <p className={sub}>Welcome back, {user?.full_name}</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-lg">⏳ Loading your dashboard...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {statCards.map(s => (
              <div key={s.label} className={`rounded-2xl p-5 border ${card}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.g} flex items-center justify-center text-xl mb-3 shadow-lg`}>
                  {s.icon}
                </div>
                <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
                <div className={`text-xs ${sub}`}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          {stats?.chart?.length > 0 && (
            <div className={`rounded-2xl p-6 border mb-8 ${card}`}>
              <h2 className="text-lg font-bold mb-6">📈 Revenue This Week</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.chart} margin={marginObj}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridC} />
                  <XAxis dataKey="day" tick={tickStyle} />
                  <YAxis tick={tickStyle} />
                  <Tooltip contentStyle={tipStyle} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick Tips */}
          <div className={`rounded-2xl p-6 border ${card}`}>
            <h2 className="text-lg font-bold mb-4">💡 Quick Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '⚡', t: 'Accept orders fast', d: 'Quick acceptance improves your rating' },
                { icon: '📍', t: 'Keep address updated', d: 'Accurate location helps drivers'     },
                { icon: '⭐', t: 'Quality = more orders', d: 'Happy customers order again'        },
              ].map(tip => (
                <div key={tip.t} className={`p-4 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="text-2xl mb-2">{tip.icon}</div>
                  <p className="font-semibold text-sm mb-1">{tip.t}</p>
                  <p className={`text-xs ${sub}`}>{tip.d}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <p className={`text-center text-xs mt-8 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
      </p>
    </StoreLayout>
  );
}