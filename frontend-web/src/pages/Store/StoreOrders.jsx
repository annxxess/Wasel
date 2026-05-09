import { useEffect, useState } from 'react';
import StoreLayout from './StoreLayout';
import { useTheme } from '../../context/ThemeContext';
import { storesAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:   'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-red-500/20 text-red-400',
  delivered: 'bg-green-500/20 text-green-400',
};

export default function StoreOrders() {
  const { dark }      = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');

  const card = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';

  const fetchOrders = () => {
    setLoading(true);
    storesAPI.getOrders({ status: filter })
      .then(r => setOrders(r.data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleUpdate = async (id, status) => {
    try {
      await storesAPI.updateOrder(id, status);
      toast.success('Order updated!');
      fetchOrders();
    } catch { toast.error('Failed to update'); }
  };

  const filters = [
    { v: '',          l: '📋 All'       },
    { v: 'pending',   l: '⏳ Pending'   },
    { v: 'confirmed', l: '✅ Confirmed' },
    { v: 'delivered', l: '🎉 Delivered' },
    { v: 'cancelled', l: '❌ Cancelled' },
  ];

  return (
    <StoreLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Orders 📦</h1>
        <p className={sub}>Manage your incoming orders</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { l: 'Total',    v: orders.length,                                      c: 'text-white'       },
          { l: 'Pending',  v: orders.filter(o => o.status === 'pending').length,  c: 'text-yellow-400'  },
          { l: 'Active',   v: orders.filter(o => o.status === 'confirmed').length,c: 'text-blue-400'    },
          { l: 'Done',     v: orders.filter(o => o.status === 'delivered').length,c: 'text-green-400'   },
        ].map(s => (
          <div key={s.l} className={`rounded-xl p-4 border text-center ${card}`}>
            <div className={`text-2xl font-black mb-1 ${s.c}`}>{s.v}</div>
            <div className={`text-xs ${sub}`}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className={`flex gap-2 flex-wrap p-4 rounded-2xl border mb-6 ${card}`}>
        {filters.map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === f.v
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : (dark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-400">⏳ Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className={`rounded-2xl border p-16 text-center ${card}`}>
            <div className="text-5xl mb-4">📦</div>
            <p className="font-bold text-lg mb-2">No orders yet</p>
            <p className={`text-sm ${sub}`}>Orders will appear here when customers place them</p>
          </div>
        ) : orders.map(o => (
          <div key={o.id} className={`rounded-2xl border p-5 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-black">
                  #{o.id}
                </div>
                <div>
                  <p className="font-semibold text-sm">{o.customer_name}</p>
                  <p className={`text-xs ${sub}`}>{new Date(o.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-green-400">{o.delivery_fee} DZD</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[o.status] || 'bg-slate-500/20 text-slate-400'}`}>
                  {o.status}
                </span>
              </div>
            </div>

            {o.notes && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                📝 {o.notes}
              </div>
            )}

            {/* Actions */}
            {o.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => handleUpdate(o.id, 'confirmed')}
                  className="flex-1 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl text-sm font-semibold transition-all">
                  ✅ Accept Order
                </button>
                <button onClick={() => handleUpdate(o.id, 'cancelled')}
                  className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-semibold transition-all">
                  ❌ Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className={`text-center text-xs mt-8 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
      </p>
    </StoreLayout>
  );
}