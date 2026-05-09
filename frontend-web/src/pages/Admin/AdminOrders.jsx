import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../utils/api';

const STATUS_COLORS = {
  pending:    'bg-yellow-500/20 text-yellow-400',
  confirmed:  'bg-blue-500/20 text-blue-400',
  picking_up: 'bg-purple-500/20 text-purple-400',
  on_the_way: 'bg-orange-500/20 text-orange-400',
  delivered:  'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
};

const STATUS_ICONS = {
  pending:    '⏳',
  confirmed:  '✅',
  picking_up: '🏃',
  on_the_way: '🏍️',
  delivered:  '🎉',
  cancelled:  '❌',
};

const TYPE_ICONS = {
  food:     '🍔',
  parcel:   '📦',
  document: '📄',
  pharmacy: '💊',
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

  const statuses = ['', 'pending', 'confirmed', 'picking_up', 'on_the_way', 'delivered', 'cancelled'];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Orders 📦</h1>
        <p className={sub}>Monitor and manage all delivery orders</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total',      value: orders.length,                                        color: 'text-white'        },
          { label: 'Pending',    value: orders.filter(o => o.status === 'pending').length,    color: 'text-yellow-400'   },
          { label: 'On The Way', value: orders.filter(o => o.status === 'on_the_way').length, color: 'text-orange-400'   },
          { label: 'Delivered',  value: orders.filter(o => o.status === 'delivered').length,  color: 'text-green-400'    },
          { label: 'Cancelled',  value: orders.filter(o => o.status === 'cancelled').length,  color: 'text-red-400'      },
          {
            label: 'Revenue',
            value: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + parseFloat(o.delivery_fee || 0), 0).toFixed(0) + ' DZD',
            color: 'text-emerald-400'
          },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 border text-center ${card}`}>
            <div className={`text-xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className={`rounded-2xl p-4 border mb-6 flex gap-2 flex-wrap ${card}`}>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === s
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : dark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {s === '' ? '📋 All Orders' : `${STATUS_ICONS[s]} ${s.replace('_', ' ')}`}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {loading ? (
          <div className="text-center py-16 text-slate-400">⏳ Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No orders found 📦</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={dark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                <tr>
                  {['Type', 'Customer', 'Driver', 'Pickup', 'Delivery', 'Fee', 'Payment', 'Status', 'Date'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className={`border-t transition-colors ${dark ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>

                    <td className="px-4 py-3">
                      <span className="text-2xl">{TYPE_ICONS[o.order_type] || '📦'}</span>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{o.customer_name || '—'}</p>
                    </td>

                    <td className="px-4 py-3">
                      <p className={`text-sm ${o.driver_name ? '' : sub}`}>
                        {o.driver_name || '⏳ Waiting...'}
                      </p>
                    </td>

                    <td className={`px-4 py-3 text-xs max-w-32 truncate ${sub}`}>
                      {o.pickup_address}
                    </td>

                    <td className={`px-4 py-3 text-xs max-w-32 truncate ${sub}`}>
                      {o.delivery_address}
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-green-400">
                      {o.delivery_fee} DZD
                    </td>

                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        o.payment_method === 'cash'
                          ? 'bg-slate-500/20 text-slate-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {o.payment_method === 'cash' ? '💵 Cash' : '💳 Online'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[o.status] || 'bg-slate-500/20 text-slate-400'}`}>
                        {STATUS_ICONS[o.status]} {o.status?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className={`px-4 py-3 text-xs ${sub}`}>
                      {new Date(o.created_at).toLocaleDateString()}
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