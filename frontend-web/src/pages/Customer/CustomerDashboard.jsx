import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, reviewsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:    'bg-yellow-500/20 text-yellow-400',
  confirmed:  'bg-blue-500/20 text-blue-400',
  picking_up: 'bg-purple-500/20 text-purple-400',
  on_the_way: 'bg-orange-500/20 text-orange-400',
  delivered:  'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
};

const STATUS_ICONS = {
  pending: '⏳', confirmed: '✅', picking_up: '🏃',
  on_the_way: '🏍️', delivered: '🎉', cancelled: '❌',
};

const TYPE_ICONS = {
  food: '🍔', parcel: '📦', pharmacy: '💊', document: '📄',
};

export default function CustomerDashboard() {
  const { dark, toggleTheme } = useTheme();
  const { user, logout }      = useAuth();
  const navigate               = useNavigate();

  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('orders');
  const [review, setReview]         = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const bg   = dark ? 'bg-[#0a0f1e]' : 'bg-gray-50';
  const text = dark ? 'text-white'   : 'text-slate-900';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const card = dark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const inp  = dark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
    : 'bg-slate-100 border-slate-200 text-slate-900';

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    ordersAPI.getMyOrders()
      .then(res => setOrders(res.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!review.comment.trim()) return toast.error('Please write a comment');
    setSubmitting(true);
    try {
      await reviewsAPI.submit({ user_id: user.id, rating: review.rating, comment: review.comment });
      toast.success('Review submitted! Thank you 🎉');
      setReview({ rating: 5, comment: '' });
    } catch { toast.error('Failed to submit review'); }
    finally { setSubmitting(false); }
  };

  const delivered  = orders.filter(o => o.status === 'delivered').length;
  const active     = orders.filter(o => !['delivered','cancelled'].includes(o.status)).length;
  const totalSpent = orders
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + parseFloat(o.delivery_fee || 0), 0);

  const delay1 = { animationDelay: '1s' };
  const delay2 = { animationDelay: '2s' };

  return (
    <div className={`min-h-screen relative overflow-hidden ${bg} ${text} transition-colors duration-300`}>

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg,#3b82f6,#8b5cf6,#f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={delay1} />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={delay2} />
      </div>

      {/* Navbar */}
      <nav className={`relative z-10 sticky top-0 border-b px-4 md:px-8 py-4 flex items-center justify-between backdrop-blur-md ${dark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <Link to="/" className="w-9 h-9 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
            W
          </Link>
          <div>
            <h1 className="text-base font-black gradient-text leading-none">WASEL</h1>
            <p className={`text-xs leading-none ${sub}`}>My Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme}
            className={`p-2 rounded-xl border text-base transition-all ${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={() => { logout(); navigate('/'); }}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-all">
            Logout 👋
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-1">
            Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0]} 👋</span>
          </h2>
          <p className={sub}>Track your orders and manage your account</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: '📦', label: 'Total Orders', value: orders.length,                  color: 'text-blue-400',   g: 'from-blue-600 to-cyan-500'     },
            { icon: '🎉', label: 'Delivered',    value: delivered,                      color: 'text-green-400',  g: 'from-green-600 to-teal-500'    },
            { icon: '💰', label: 'Total Spent',  value: totalSpent.toFixed(0) + ' DZD', color: 'text-orange-400', g: 'from-orange-600 to-yellow-500' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-5 border ${card}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.g} flex items-center justify-center text-xl mb-3 shadow-lg`}>
                {s.icon}
              </div>
              <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className={`text-xs ${sub}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active Order Banner */}
        {active > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center gap-3">
            <span className="text-2xl animate-pulse">🏍️</span>
            <div>
              <p className="font-bold text-blue-400">You have {active} active order{active > 1 ? 's' : ''}!</p>
              <p className={`text-sm ${sub}`}>Your delivery is on the way</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className={`flex gap-2 p-1 rounded-2xl mb-6 w-fit ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {[
            { id: 'orders',  label: '📦 My Orders'   },
            { id: 'review',  label: '⭐ Leave Review' },
            { id: 'profile', label: '👤 Profile'      },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : (dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            {loading ? (
              <div className="text-center py-16 text-slate-400">⏳ Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📦</div>
                <p className="font-bold text-lg mb-2">No orders yet!</p>
                <p className={`text-sm mb-6 ${sub}`}>Place your first order now</p>
                <Link to="/" className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all">
                  Order Now 🚀
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/30">
                {orders.map(o => (
                  <div key={o.id} className={`p-5 transition-colors ${dark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{TYPE_ICONS[o.order_type] || '📦'}</span>
                        <div>
                          <p className="font-semibold text-sm capitalize">{o.order_type} Delivery</p>
                          <p className={`text-xs ${sub}`}>{new Date(o.created_at).toLocaleDateString('en-GB')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-green-400 text-sm">{o.delivery_fee} DZD</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[o.status] || 'bg-slate-500/20 text-slate-400'}`}>
                          {STATUS_ICONS[o.status]} {o.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className={`grid grid-cols-2 gap-2 text-xs ${sub}`}>
                      <div className="flex items-center gap-1 truncate">
                        <span>📍</span><span className="truncate">{o.pickup_address}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <span>🏠</span><span className="truncate">{o.delivery_address}</span>
                      </div>
                    </div>
                    {o.driver_name && (
                      <div className={`mt-2 text-xs flex items-center gap-1 ${sub}`}>
                        <span>🏍️</span>
                        <span>Driver: <strong className={dark ? 'text-white' : 'text-slate-900'}>{o.driver_name}</strong></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEW TAB */}
        {tab === 'review' && (
          <div className={`rounded-2xl border p-8 ${card}`}>
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">⭐</div>
              <h3 className="text-2xl font-black mb-2">Leave a Review</h3>
              <p className={`text-sm ${sub}`}>Share your experience with WASEL</p>
            </div>
            <form onSubmit={handleReview} className="max-w-md mx-auto space-y-5">
              <div>
                <label className={`text-sm font-semibold mb-2 block ${sub}`}>Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(r => (
                    <button key={r} type="button" onClick={() => setReview(p => ({ ...p, rating: r }))}
                      className={`text-3xl transition-transform hover:scale-110 ${r <= review.rating ? '' : 'grayscale opacity-30'}`}>
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`text-sm font-semibold mb-2 block ${sub}`}>Your Comment</label>
                <textarea value={review.comment}
                  onChange={e => setReview(p => ({ ...p, comment: e.target.value }))}
                  placeholder="Tell us about your experience..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 resize-none transition-colors ${inp}`} />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50">
                {submitting ? '⏳ Submitting...' : '🚀 Submit Review'}
              </button>
            </form>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div className={`rounded-2xl border p-8 ${card}`}>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-xl shadow-blue-500/30">
                {user?.full_name?.[0] || '?'}
              </div>
              <h3 className="text-2xl font-black">{user?.full_name}</h3>
              <p className={`text-sm ${sub}`}>{user?.email}</p>
              <span className="inline-block mt-2 text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-medium capitalize">
                {user?.role}
              </span>
            </div>
            <div className="space-y-3 max-w-sm mx-auto">
              {[
                { icon: '📱', label: 'Phone',       value: user?.phone           || '—' },
                { icon: '📍', label: 'Wilaya',       value: user?.wilaya          || '—' },
                { icon: '💰', label: 'Wallet',       value: (user?.wallet_balance || 0) + ' DZD' },
                { icon: '📅', label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
              ].map(f => (
                <div key={f.label} className={`flex items-center justify-between p-4 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{f.icon}</span>
                    <span className={`text-sm ${sub}`}>{f.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <p className={`relative z-10 text-center text-xs pb-8 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
      </p>
    </div>
  );
}