import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storesAPI, ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: '',         icon: '🌟', label: 'الكل',      labelEn: 'All'      },
  { id: 'food',     icon: '🍔', label: 'طعام',      labelEn: 'Food'     },
  { id: 'pharmacy', icon: '💊', label: 'صيدلية',    labelEn: 'Pharmacy' },
  { id: 'market',   icon: '🛒', label: 'سوق',       labelEn: 'Market'   },
  { id: 'document', icon: '📄', label: 'وثائق',     labelEn: 'Document' },
];

const ORDER_TYPES = [
  { id: 'food',     icon: '🍔', label: 'طلب طعام',     color: 'from-orange-600 to-yellow-500' },
  { id: 'parcel',   icon: '📦', label: 'إرسال طرد',    color: 'from-blue-600 to-cyan-500'    },
  { id: 'pharmacy', icon: '💊', label: 'صيدلية',       color: 'from-green-600 to-teal-500'   },
  { id: 'document', icon: '📄', label: 'وثيقة',        color: 'from-purple-600 to-pink-500'  },
];

export default function HomePage() {
  const { dark, toggleTheme } = useTheme();
  const { user, logout }      = useAuth();
  const navigate               = useNavigate();

  const [stores, setStores]       = useState([]);
  const [category, setCategory]   = useState('');
  const [loading, setLoading]     = useState(true);
  const [showOrder, setShowOrder] = useState(false);
  const [orderType, setOrderType] = useState('parcel');
  const [form, setForm]           = useState({ pickup: '', delivery: '', notes: '' });
  const [placing, setPlacing]     = useState(false);
  const [lang, setLang]           = useState('ar');

  const t = (ar, en) => lang === 'ar' ? ar : en;

  const bg      = dark ? 'bg-[#0a0f1e]' : 'bg-gray-50';
  const text    = dark ? 'text-white'   : 'text-slate-900';
  const sub     = dark ? 'text-slate-400' : 'text-slate-500';
  const card    = dark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const inp     = dark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-100 border-slate-200 text-slate-900';
  const navBg   = dark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200';

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    storesAPI.getAll({ category })
      .then(res => setStores(res.data.stores || []))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, [user, category]);

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!form.pickup || !form.delivery) return toast.error(t('أدخل العناوين', 'Enter addresses'));
    setPlacing(true);
    try {
      await ordersAPI.create({
        customer_id:      user.id,
        order_type:       orderType,
        pickup_address:   form.pickup,
        delivery_address: form.delivery,
        delivery_fee:     250,
        payment_method:   'cash',
        notes:            form.notes,
      });
      toast.success(t('✅ تم تقديم الطلب!', '✅ Order placed!'));
      setShowOrder(false);
      setForm({ pickup: '', delivery: '', notes: '' });
    } catch { toast.error(t('فشل الطلب', 'Order failed')); }
    finally { setPlacing(false); }
  };

  const delay1 = { animationDelay: '1s' };
  const delay2 = { animationDelay: '2s' };

  return (
    <div className={`min-h-screen relative overflow-hidden ${bg} ${text} transition-colors duration-300`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg,#3b82f6,#8b5cf6,#f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .btn-press:active { transform: scale(0.95); }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        .float { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* Animated BG */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={delay1} />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={delay2} />
      </div>

      {/* Navbar */}
      <nav className={`relative z-20 sticky top-0 border-b px-4 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl ${navBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/30">
            W
          </div>
          <div>
            <h1 className="text-lg font-black gradient-text leading-none">WASEL</h1>
            <p className={`text-xs leading-none ${sub}`}>{t('واصل — منصة التوصيل', 'Smart Delivery Platform')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all btn-press ${dark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Theme Toggle */}
          <button onClick={toggleTheme}
            className={`p-2 rounded-xl border text-base transition-all btn-press ${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            {dark ? '☀️' : '🌙'}
          </button>

          {/* My Orders */}
          <Link to="/dashboard"
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all btn-press ${dark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
            📦 {t('طلباتي', 'My Orders')}
          </Link>

          {/* User */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {user?.full_name?.[0]}
            </div>
            <span className="text-xs font-semibold hidden md:block">{user?.full_name?.split(' ')[0]}</span>
          </div>

          <button onClick={() => { logout(); navigate('/'); }}
            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-medium transition-all btn-press">
            {t('خروج', 'Logout')}
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="float inline-block text-6xl mb-4">🚀</div>
          <h2 className="text-4xl md:text-5xl font-black mb-3">
            {t('مرحباً ', 'Welcome, ')}
            <span className="gradient-text">{user?.full_name?.split(' ')[0]}!</span>
          </h2>
          <p className={`text-lg mb-8 ${sub}`}>
            {t('اطلب أي شيء وسنوصله إليك بسرعة ⚡', 'Order anything and we\'ll deliver it fast ⚡')}
          </p>

          {/* Order Button */}
          <button onClick={() => setShowOrder(true)}
            className="btn-press inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white font-black text-lg rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105">
            <span>📍</span>
            {t('اطلب الآن', 'Order Now')}
            <span>→</span>
          </button>
        </div>

        {/* Order Types */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {ORDER_TYPES.map(type => (
            <button key={type.id} onClick={() => { setOrderType(type.id); setShowOrder(true); }}
              className={`card-hover btn-press p-5 rounded-2xl bg-gradient-to-br ${type.color} text-white text-center shadow-lg hover:shadow-xl`}>
              <div className="text-4xl mb-2">{type.icon}</div>
              <p className="font-bold text-sm">{lang === 'ar' ? type.label : type.id}</p>
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`btn-press flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : (dark ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50')
              }`}>
              <span>{cat.icon}</span>
              <span>{lang === 'ar' ? cat.label : cat.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Stores Grid */}
        <h3 className="text-xl font-black mb-5">
          {t('🏪 المتاجر المتاحة', '🏪 Available Stores')}
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className={`rounded-2xl p-6 border animate-pulse ${card}`}>
                <div className={`w-12 h-12 rounded-xl mb-4 ${dark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <div className={`h-4 rounded mb-2 ${dark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <div className={`h-3 rounded w-2/3 ${dark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏪</div>
            <p className="font-bold text-lg mb-2">{t('لا توجد متاجر بعد', 'No stores yet')}</p>
            <p className={`text-sm ${sub}`}>{t('ستظهر المتاجر هنا قريباً', 'Stores will appear here soon')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stores.map(store => (
              <div key={store.id} className={`card-hover rounded-2xl border p-5 cursor-pointer ${card}`}
                onClick={() => { setOrderType(store.category || 'parcel'); setShowOrder(true); }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    {store.category === 'food' ? '🍔' : store.category === 'pharmacy' ? '💊' : store.category === 'market' ? '🛒' : '🏪'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base truncate">{store.name}</h4>
                    <p className={`text-xs capitalize ${sub}`}>{store.category}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-yellow-400 text-xs">⭐</span>
                      <span className="text-xs font-semibold">{store.rating || '5.0'}</span>
                      <span className={`text-xs ${sub}`}>• {store.total_orders || 0} {t('طلب', 'orders')}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${store.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {store.is_active ? t('مفتوح', 'Open') : t('مغلق', 'Closed')}
                  </span>
                </div>

                <div className={`text-xs ${sub} mb-4`}>
                  <div className="flex items-center gap-1 truncate">
                    <span>📍</span><span className="truncate">{store.address || t('تلمسان', 'Tlemcen')}</span>
                  </div>
                </div>

                <button className="btn-press w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20">
                  {t('اطلب الآن 🚀', 'Order Now 🚀')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowOrder(false)}>
          <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">{t('🚀 طلب جديد', '🚀 New Order')}</h3>
              <button onClick={() => setShowOrder(false)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all btn-press ${dark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>
                ✕
              </button>
            </div>

            {/* Order Type */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {ORDER_TYPES.map(type => (
                <button key={type.id} onClick={() => setOrderType(type.id)}
                  className={`btn-press p-2 rounded-xl text-center transition-all ${
                    orderType === type.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : (dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')
                  }`}>
                  <div className="text-xl">{type.icon}</div>
                  <div className="text-xs font-medium mt-1">{type.id}</div>
                </button>
              ))}
            </div>

            <form onSubmit={placeOrder} className="space-y-4">
              <div>
                <label className={`text-sm font-semibold mb-1.5 block ${sub}`}>
                  📍 {t('عنوان الاستلام', 'Pickup Address')}
                </label>
                <input type="text" value={form.pickup}
                  onChange={e => setForm(p => ({ ...p, pickup: e.target.value }))}
                  placeholder={t('أدخل عنوان الاستلام', 'Enter pickup address')}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-colors ${inp}`} />
              </div>
              <div>
                <label className={`text-sm font-semibold mb-1.5 block ${sub}`}>
                  🏠 {t('عنوان التوصيل', 'Delivery Address')}
                </label>
                <input type="text" value={form.delivery}
                  onChange={e => setForm(p => ({ ...p, delivery: e.target.value }))}
                  placeholder={t('أدخل عنوان التوصيل', 'Enter delivery address')}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-colors ${inp}`} />
              </div>
              <div>
                <label className={`text-sm font-semibold mb-1.5 block ${sub}`}>
                  📝 {t('ملاحظات (اختياري)', 'Notes (optional)')}
                </label>
                <textarea value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder={t('أي ملاحظات إضافية...', 'Any additional notes...')}
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 resize-none transition-colors ${inp}`} />
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl ${dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <span className={`text-sm ${sub}`}>{t('رسوم التوصيل', 'Delivery Fee')}</span>
                <span className="text-green-400 font-bold">250 DZD</span>
              </div>

              <button type="submit" disabled={placing}
                className="btn-press w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-base transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50">
                {placing ? t('⏳ جارٍ الطلب...', '⏳ Placing...') : t('🚀 تأكيد الطلب — 250 DZD', '🚀 Confirm Order — 250 DZD')}
              </button>
            </form>
          </div>
        </div>
      )}

      <p className={`relative z-10 text-center text-xs pb-8 mt-8 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 WASEL | واصل. All Rights Reserved. Created by Marref Mohammed Anas.
      </p>
    </div>
  );
}