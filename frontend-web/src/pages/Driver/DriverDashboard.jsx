import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { driverAPI, ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  on_the_way: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  delivered:  'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled:  'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function DriverDashboard() {
  const { dark, toggleTheme } = useTheme();
  const { user, logout }      = useAuth();
  const navigate               = useNavigate();

  const [tab, setTab]           = useState('available');
  const [orders, setOrders]     = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [earnings, setEarnings] = useState({ total: 0, count: 0 });
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading]   = useState(true);

  const bg   = dark ? 'bg-[#0a0f1e]' : 'bg-gray-50';
  const text = dark ? 'text-white'   : 'text-slate-900';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const card = dark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const navBg= dark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200';

  const delay1 = { animationDelay: '1s' };
  const delay2 = { animationDelay: '2s' };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, myOrdersRes, earningsRes, profileRes] = await Promise.all([
        ordersAPI.getAvailable().catch(() => ({ data: { orders: [] } })),
        driverAPI.getMyOrders().catch(() => ({ data: { orders: [] } })),
        driverAPI.getEarnings().catch(() => ({ data: { total: 0, count: 0 } })),
        driverAPI.getProfile().catch(() => ({ data: { driver: null } })),
      ]);
      setOrders(ordersRes.data.orders || []);
      setMyOrders(myOrdersRes.data.orders || []);
      setEarnings(earningsRes.data);
      setIsOnline(profileRes.data.driver?.is_online || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnline = async () => {
    try {
      const res = await driverAPI.toggleOnline();
      setIsOnline(res.data.is_online);
      toast.success(res.data.is_online ? '🟢 أنت الآن متصل!' : '⚫ أنت الآن غير متصل');
    } catch { toast.error('فشل تغيير الحالة'); }
  };

  const acceptOrder = async (id) => {
    try {
      await ordersAPI.accept(id);
      toast.success('✅ تم قبول الطلب!');
      loadData();
    } catch { toast.error('فشل قبول الطلب'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      toast.success('✅ تم تحديث الحالة');
      loadData();
    } catch { toast.error('فشل التحديث'); }
  };

  const activeOrders = myOrders.filter(o => !['delivered','cancelled'].includes(o.status));
  const doneOrders   = myOrders.filter(o => o.status === 'delivered');

  return (
    <div className={`min-h-screen relative overflow-hidden ${bg} ${text} transition-colors duration-300`}>
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg,#3b82f6,#8b5cf6,#f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .btn-press:active { transform: scale(0.95); }
        .card-hover { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
      `}</style>

      {/* Animated BG */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={delay1} />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={delay2} />
      </div>

      {/* Navbar */}
      <nav className={`relative z-20 sticky top-0 border-b px-4 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl ${navBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
            🏍️
          </div>
          <div>
            <h1 className="text-base font-black gradient-text leading-none">WASEL Driver</h1>
            <p className={`text-xs leading-none ${sub}`}>لوحة تحكم السائق</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Online Toggle */}
          <button onClick={toggleOnline}
            className={`btn-press flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
              isOnline
                ? 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30'
                : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
            }`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
            {isOnline ? 'متصل 🟢' : 'غير متصل ⚫'}
          </button>

          <button onClick={toggleTheme}
            className={`p-2 rounded-xl border text-base btn-press transition-all ${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            {dark ? '☀️' : '🌙'}
          </button>

          <button onClick={() => { logout(); navigate('/'); }}
            className="btn-press px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-medium transition-all">
            خروج 👋
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-1">
            أهلاً، <span className="gradient-text">{user?.full_name?.split(' ')[0]} 🏍️</span>
          </h2>
          <p className={sub}>ابدأ يومك وابحث عن طلبات جديدة</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '📦', label: 'الطلبات المتاحة', value: orders.length,                    color: 'text-blue-400',   g: 'from-blue-600 to-cyan-500'     },
            { icon: '🔄', label: 'الطلبات النشطة',  value: activeOrders.length,              color: 'text-orange-400', g: 'from-orange-600 to-yellow-500' },
            { icon: '✅', label: 'مكتملة',           value: doneOrders.length,                color: 'text-green-400',  g: 'from-green-600 to-teal-500'    },
            { icon: '💰', label: 'أرباحي',           value: parseFloat(earnings.total||0).toFixed(0) + ' DZD', color: 'text-emerald-400', g: 'from-emerald-600 to-teal-500' },
          ].map(s => (
            <div key={s.label} className={`card-hover rounded-2xl p-5 border ${card}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.g} flex items-center justify-center text-lg mb-3 shadow-lg`}>
                {s.icon}
              </div>
              <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className={`text-xs ${sub}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Online Banner */}
        {!isOnline && (
          <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-yellow-400">أنت غير متصل!</p>
                <p className={`text-sm ${sub}`}>فعّل وضع الاتصال لاستقبال الطلبات</p>
              </div>
            </div>
            <button onClick={toggleOnline}
              className="btn-press px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold transition-all">
              تفعيل 🟢
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className={`flex gap-2 p-1 rounded-2xl mb-6 w-fit ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {[
            { id: 'available', label: '📦 متاح'       },
            { id: 'active',    label: '🔄 نشط'         },
            { id: 'history',   label: '✅ المكتملة'    },
            { id: 'earnings',  label: '💰 الأرباح'    },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`btn-press px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                  : (dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* AVAILABLE ORDERS */}
        {tab === 'available' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-16 text-slate-400">⏳ جارٍ التحميل...</div>
            ) : orders.length === 0 ? (
              <div className={`rounded-2xl border p-12 text-center ${card}`}>
                <div className="text-5xl mb-4">📭</div>
                <p className="font-bold text-lg mb-2">لا توجد طلبات متاحة</p>
                <p className={`text-sm ${sub}`}>ستظهر الطلبات الجديدة هنا</p>
              </div>
            ) : orders.map(o => (
              <div key={o.id} className={`card-hover rounded-2xl border p-5 ${card}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                      {o.order_type === 'food' ? '🍔' : o.order_type === 'pharmacy' ? '💊' : '📦'}
                    </div>
                    <div>
                      <p className="font-bold capitalize">{o.order_type} Delivery</p>
                      <p className={`text-xs ${sub}`}>#{o.id} • {new Date(o.created_at).toLocaleDateString('ar')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-black text-lg">{o.delivery_fee} DZD</p>
                    <p className={`text-xs ${sub}`}>{o.payment_method}</p>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-3 mb-4 text-sm ${sub}`}>
                  <div className={`flex items-start gap-2 p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <span>📍</span>
                    <div>
                      <p className="text-xs font-semibold text-blue-400 mb-0.5">الاستلام</p>
                      <p className="text-xs">{o.pickup_address}</p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-2 p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <span>🏠</span>
                    <div>
                      <p className="text-xs font-semibold text-green-400 mb-0.5">التوصيل</p>
                      <p className="text-xs">{o.delivery_address}</p>
                    </div>
                  </div>
                </div>

                <button onClick={() => acceptOrder(o.id)}
                  className="btn-press w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/20">
                  ✅ قبول الطلب — {o.delivery_fee} DZD
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ACTIVE ORDERS */}
        {tab === 'active' && (
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className={`rounded-2xl border p-12 text-center ${card}`}>
                <div className="text-5xl mb-4">🏍️</div>
                <p className="font-bold text-lg mb-2">لا توجد طلبات نشطة</p>
                <p className={`text-sm ${sub}`}>اقبل طلباً من قائمة المتاحة</p>
              </div>
            ) : activeOrders.map(o => (
              <div key={o.id} className={`card-hover rounded-2xl border p-5 ${card}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold capitalize">{o.order_type} Delivery #{o.id}</p>
                    <p className={`text-xs ${sub}`}>{o.customer_name || 'عميل'}</p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${STATUS_COLORS[o.status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                    {o.status?.replace('_',' ')}
                  </span>
                </div>

                <div className={`grid grid-cols-2 gap-3 mb-4 text-xs ${sub}`}>
                  <div className={`p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p className="font-semibold text-blue-400 mb-1">📍 الاستلام</p>
                    <p>{o.pickup_address}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p className="font-semibold text-green-400 mb-1">🏠 التوصيل</p>
                    <p>{o.delivery_address}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {o.status === 'confirmed' && (
                    <button onClick={() => updateStatus(o.id, 'picking_up')}
                      className="btn-press flex-1 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-xl text-sm font-semibold transition-all">
                      🏃 في الطريق للاستلام
                    </button>
                  )}
                  {o.status === 'picking_up' && (
                    <button onClick={() => updateStatus(o.id, 'on_the_way')}
                      className="btn-press flex-1 py-2.5 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded-xl text-sm font-semibold transition-all">
                      🏍️ في الطريق للتوصيل
                    </button>
                  )}
                  {o.status === 'on_the_way' && (
                    <button onClick={() => updateStatus(o.id, 'delivered')}
                      className="btn-press flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/20">
                      🎉 تم التوصيل!
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HISTORY */}
        {tab === 'history' && (
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            {doneOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <p className="font-bold text-lg mb-2">لا توجد طلبات مكتملة بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/30">
                {doneOrders.map(o => (
                  <div key={o.id} className={`p-4 flex items-center justify-between transition-colors ${dark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-xl">🎉</div>
                      <div>
                        <p className="font-semibold text-sm capitalize">{o.order_type} #{o.id}</p>
                        <p className={`text-xs ${sub}`}>{new Date(o.created_at).toLocaleDateString('ar')}</p>
                      </div>
                    </div>
                    <span className="text-green-400 font-black">+{o.delivery_fee} DZD</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EARNINGS */}
        {tab === 'earnings' && (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-8 text-center ${card}`}>
              <div className="text-5xl mb-4">💰</div>
              <p className={`text-sm mb-2 ${sub}`}>إجمالي الأرباح</p>
              <p className="text-5xl font-black text-emerald-400 mb-2">
                {parseFloat(earnings.total || 0).toFixed(0)}
                <span className="text-2xl"> DZD</span>
              </p>
              <p className={`text-sm ${sub}`}>{earnings.count || 0} طلب مكتمل</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '📅', label: 'هذا الأسبوع',  value: parseFloat(earnings.total||0).toFixed(0) + ' DZD', color: 'text-blue-400'    },
                { icon: '📊', label: 'متوسط/طلب',    value: earnings.count ? (earnings.total/earnings.count).toFixed(0) + ' DZD' : '0 DZD', color: 'text-orange-400' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border p-5 text-center ${card}`}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className={`text-xl font-black mb-1 ${s.color}`}>{s.value}</div>
                  <div className={`text-xs ${sub}`}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className={`rounded-2xl border p-6 ${card}`}>
              <h4 className="font-bold mb-4">💡 نصائح لزيادة أرباحك</h4>
              <div className="space-y-3">
                {[
                  { icon: '🕐', tip: 'اعمل خلال أوقات الذروة (12-2 ظ، 7-10 م)' },
                  { icon: '⭐', tip: 'حافظ على تقييم 5 نجوم للحصول على طلبات أكثر' },
                  { icon: '⚡', tip: 'اقبل الطلبات بسرعة لزيادة فرصك' },
                  { icon: '🗺️', tip: 'تعلم الشوارع جيداً لتوصيل أسرع' },
                ].map(n => (
                  <div key={n.tip} className={`flex items-center gap-3 p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <span className="text-xl">{n.icon}</span>
                    <p className={`text-sm ${sub}`}>{n.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className={`relative z-10 text-center text-xs pb-8 mt-4 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
      </p>
    </div>
  );
}