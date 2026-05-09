import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../utils/api';

const STATUS_COLORS = {
  pending:    'bg-yellow-500/20 text-yellow-400',
  confirmed:  'bg-blue-500/20 text-blue-400',
  on_the_way: 'bg-orange-500/20 text-orange-400',
  delivered:  'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
};

export default function AdminOrders() {
  const { dark } = useTheme();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');

  const card = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';

  useEffect(() => {
    setLoading(true);
    adminAPI.getOrders({ status: filter })
      .then(res => setOrders(res.data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const filters = [
    { v: '',            l: '📋 All'        },
    { v: 'pending',     l: '⏳ Pending'    },
    { v: 'confirmed',   l: '✅ Confirmed'  },
    { v: 'on_the_way',  l: '🏍️ On the way' },
    { v: 'delivered',   l: '🎉 Delivered'  },
    { v: 'cancelled',   l: '❌ Cancelled'  },
  ];

  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + parseFloat(o.delivery_fee || 0), 0);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Orders 📦</h1>
        <p className={sub}>Monitor all platform orders</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',     value: orders.length,                                     color: 'text-white'       },
          { label: 'Pending',   value: orders.filter(o => o.status === 'pending').length, color: 'text-yellow-400'  },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length,color: 'text-green-400'  },
          { label: 'Revenue',   value: totalRevenue.toFixed(0) + ' DZD',                  color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border text-center ${card}`}>
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`flex gap-2 flex-wrap p-4 rounded-2xl border mb-6 ${card}`}>
        {filters.map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === f.v
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : (dark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {loading ? (
          <div className="text-center py-16 text-slate-400">⏳ Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No orders found 📦</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={dark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                <tr>
                  {['#','Customer','Driver','Type','Pickup','Delivery','Fee','Status','Date'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className={`border-t transition-colors ${dark ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className={`px-4 py-3 text-sm font-bold text-blue-400`}>#{o.id}</td>
                    <td className={`px-4 py-3 text-sm`}>{o.customer_name || '—'}</td>
                    <td className={`px-4 py-3 text-sm ${sub}`}>{o.driver_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium bg-blue-500/20 text-blue-400`}>
                        {o.order_type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${sub} max-w-[120px] truncate`}>{o.pickup_address}</td>
                    <td className={`px-4 py-3 text-xs ${sub} max-w-[120px] truncate`}>{o.delivery_address}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-400">{o.delivery_fee} DZD</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[o.status] || 'bg-slate-500/20 text-slate-400'}`}>
                        {o.status?.replace('_',' ')}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${sub}`}>{new Date(o.created_at).toLocaleDateString()}</td>
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