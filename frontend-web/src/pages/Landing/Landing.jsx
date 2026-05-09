import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, useInView } from 'framer-motion';
import axios from 'axios';

// ════════════════════════════════════════════
// ALL ANIMATION CONSTANTS — defined outside JSX
// ════════════════════════════════════════════
const V = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0  },
};
const VS = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1    },
};
const VF = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};
const VP        = { once: true, amount: 0.15 };
const T0        = { duration: 0.5, ease: 'easeOut' };
const T1        = { duration: 0.6, ease: 'easeOut', delay: 0.1 };
const T2        = { duration: 0.6, ease: 'easeOut', delay: 0.2 };
const T3        = { duration: 0.6, ease: 'easeOut', delay: 0.3 };
const T4        = { duration: 0.6, ease: 'easeOut', delay: 0.4 };
const T5        = { duration: 0.6, ease: 'easeOut', delay: 0.5 };
const THOVER    = { scale: 1.05 };
const TTAP      = { scale: 0.97 };
const TICONHOV  = { scale: 1.2, rotate: 10 };
const TFLOAT    = { duration: 3, repeat: Infinity, ease: 'easeInOut' };
const TROCKET   = { duration: 4, repeat: Infinity, ease: 'easeInOut' };
const AFLOAT    = { y: [0, -15, 0] };
const AROCKET   = { y: [0, -20, 0], rotate: [0, 5, -5, 0] };
const TSTEP0    = { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0   };
const TSTEP1    = { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 };
const TSTEP2    = { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 };
const TSTEP3    = { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.9 };
const STEPDELAYS = [TSTEP0, TSTEP1, TSTEP2, TSTEP3];
const TAGNAV    = { duration: 0.6, ease: 'easeOut', delay: 0.0 };
const TAGNAV2   = { duration: 0.6, ease: 'easeOut', delay: 0.1 };
const TAGHERO0  = { duration: 0.5, ease: 'easeOut', delay: 0.1 };
const TAGHERO1  = { duration: 0.7, ease: 'easeOut', delay: 0.2 };
const TAGHERO2  = { duration: 0.7, ease: 'easeOut', delay: 0.4 };
const TAGHERO3  = { duration: 0.7, ease: 'easeOut', delay: 0.6 };
const TAGSCROLL = { duration: 0.5, ease: 'easeOut', delay: 1.2 };
const TAG0      = { duration: 0.5, ease: 'easeOut', delay: 0.1 };
const TAG1      = { duration: 0.5, ease: 'easeOut', delay: 0.2 };
const TAG2      = { duration: 0.5, ease: 'easeOut', delay: 0.3 };
const TAG3      = { duration: 0.5, ease: 'easeOut', delay: 0.4 };
const TAG4      = { duration: 0.5, ease: 'easeOut', delay: 0.5 };
const TAGDELAYS = [TAG0, TAG1, TAG2, TAG3, TAG4];
const STAT0     = { duration: 0.5, ease: 'easeOut', delay: 0.0 };
const STAT1     = { duration: 0.5, ease: 'easeOut', delay: 0.1 };
const STAT2     = { duration: 0.5, ease: 'easeOut', delay: 0.2 };
const STAT3     = { duration: 0.5, ease: 'easeOut', delay: 0.3 };
const STAT4     = { duration: 0.5, ease: 'easeOut', delay: 0.4 };
const STATDELAYS = [STAT0, STAT1, STAT2, STAT3, STAT4];
const FEAT0     = { duration: 0.5, ease: 'easeOut', delay: 0.0 };
const FEAT1     = { duration: 0.5, ease: 'easeOut', delay: 0.1 };
const FEAT2     = { duration: 0.5, ease: 'easeOut', delay: 0.2 };
const FEAT3     = { duration: 0.5, ease: 'easeOut', delay: 0.3 };
const FEAT4     = { duration: 0.5, ease: 'easeOut', delay: 0.4 };
const FEAT5     = { duration: 0.5, ease: 'easeOut', delay: 0.5 };
const FEATDELAYS = [FEAT0, FEAT1, FEAT2, FEAT3, FEAT4, FEAT5];
const TESTD0    = { duration: 0.5, ease: 'easeOut', delay: 0.0 };
const TESTD1    = { duration: 0.5, ease: 'easeOut', delay: 0.15 };
const TESTD2    = { duration: 0.5, ease: 'easeOut', delay: 0.3  };
const TESTDELAYS = [TESTD0, TESTD1, TESTD2];

// ════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════
const features = [
  { icon: '🍔', title: 'Food Delivery',   desc: 'Order from top restaurants instantly'  },
  { icon: '📦', title: 'Parcel Delivery', desc: 'Send parcels fast and secure'          },
  { icon: '💊', title: 'Pharmacy',        desc: 'Get medicine delivered to your door'   },
  { icon: '📄', title: 'Documents',       desc: 'Urgent document delivery service'      },
  { icon: '🛍️', title: 'E-Commerce',     desc: 'Receive online orders same day'        },
  { icon: '📍', title: 'Live Tracking',   desc: 'Track your delivery in real-time'      },
];

const steps = [
  { n: '01', t: 'Place Order',     e: '📱', d: 'Choose service & location' },
  { n: '02', t: 'Driver Assigned', e: '🏍️', d: 'Nearby driver accepts'    },
  { n: '03', t: 'Live Tracking',   e: '📍', d: 'Watch driver in real-time' },
  { n: '04', t: 'Delivered!',      e: '🎉', d: 'Fast & secure delivery'    },
];

const testimonials = [
  { name: 'Amina B.',  city: 'Tlemcen', text: 'WASEL delivered my order in 20 minutes! Amazing 🔥'                    },
  { name: 'Karim M.',  city: 'Tlemcen', text: 'Best delivery app in Algeria. Super fast drivers!'                      },
  { name: 'Fatima Z.', city: 'Tlemcen', text: 'Live tracking is incredible. I always know where my order is!'          },
];

const ticker = [
  '🚀 WASEL | واصل','⚡ Fast Delivery','📦 Parcel','🍔 Food',
  '💊 Pharmacy','📍 Live Tracking','🔒 Secure','🇩🇿 Algeria',
  '🚀 WASEL | واصل','⚡ Fast Delivery','📦 Parcel','🍔 Food',
  '💊 Pharmacy','📍 Live Tracking','🔒 Secure','🇩🇿 Algeria',
];

const tags = ['🍔 Food', '📦 Parcels', '💊 Pharmacy', '📍 Tracking', '🔒 Secure'];

// ════════════════════════════════════════════
// COUNTER COMPONENT
// ════════════════════════════════════════════
function Counter({ target }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !target) return;
    let cur = 0;
    const step = target / 120;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}+</span>;
}

// ════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════
export default function Landing() {
  const { dark, toggleTheme } = useTheme();
  const [stats, setStats]       = useState({ users: 0, drivers: 0, orders: 0, stores: 0, visitors: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [realReviews, setRealReviews] = useState([]);

useEffect(() => {
  axios.get('http://localhost:3500/api/admin/public-reviews')
    .then(r => setRealReviews(r.data.reviews || []))
    .catch(() => setRealReviews([]));
}, []);

  useEffect(() => {
    axios.get('http://localhost:3500/api/admin/public-stats')
      .then(r => setStats(r.data))
      .catch(() => setStats({ users: 1240, drivers: 87, orders: 3420, stores: 156, visitors: 5800 }));
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const bg   = dark ? 'bg-[#080d1a]' : 'bg-gray-50';
  const text = dark ? 'text-white'   : 'text-slate-900';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const card = dark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-md';
  const navBg = scrolled
    ? (dark ? 'bg-slate-900/95 border-slate-700 shadow-2xl' : 'bg-white/95 border-slate-200 shadow-lg')
    : 'bg-transparent border-transparent';

  const statData = [
    { icon: '👁️', label: 'Site Visitors',   value: stats.visitors, g: 'from-blue-600 to-cyan-500'     },
    { icon: '👤', label: 'Registered Users', value: stats.users,    g: 'from-purple-600 to-blue-500'   },
    { icon: '🏍️', label: 'Active Drivers',   value: stats.drivers,  g: 'from-green-600 to-teal-500'    },
    { icon: '📦', label: 'Total Orders',     value: stats.orders,   g: 'from-orange-600 to-yellow-500' },
    { icon: '🏪', label: 'Partner Stores',   value: stats.stores,   g: 'from-pink-600 to-rose-500'     },
  ];

  return (
    <div className={`min-h-screen overflow-x-hidden relative ${bg} ${text} transition-colors duration-500`}>

      {/* CSS */}
      <style>{`
        @keyframes ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes orb1    { 0%,100%{transform:translate(0,0)} 50%{transform:translate(50px,-50px)} }
        @keyframes orb2    { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,40px)} }
        @keyframes shimmer { from{background-position:-200% center} to{background-position:200% center} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 25px #3b82f6,0 0 50px #3b82f640} 50%{box-shadow:0 0 60px #3b82f6,0 0 90px #f9731650} }
        @keyframes bpulse  { 0%,100%{border-color:rgba(59,130,246,0.3)} 50%{border-color:rgba(249,115,22,0.5)} }
        .ticker-anim { animation: ticker 28s linear infinite; }
        .orb-a       { animation: orb1 14s ease-in-out infinite; }
        .orb-b       { animation: orb2 18s ease-in-out infinite; }
        .glow-btn    { animation: glow 3s ease-in-out infinite; }
        .b-pulse     { animation: bpulse 3s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg,#3b82f6 0%,#8b5cf6 50%,#f97316 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .g-card {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 20px;
          border: 1px solid;
          transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        .g-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(59,130,246,0.2);
        }
      `}</style>

      {/* Orbs */}
      {dark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="orb-a absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.12] bg-blue-600 -top-32 -left-32" />
          <div className="orb-b absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.08] bg-orange-500 bottom-20 -right-20" />
          <div className="orb-a absolute w-[350px] h-[350px] rounded-full blur-3xl opacity-[0.06] bg-purple-600 top-1/2 left-1/2" />
          <div className="orb-b absolute w-[250px] h-[250px] rounded-full blur-3xl opacity-[0.08] bg-cyan-500 bottom-40 left-20" />
        </div>
      )}

      {/* Ticker */}
      <div className="fixed top-0 left-0 right-0 z-50 overflow-hidden py-1.5 bg-gradient-to-r from-blue-800 via-indigo-600 to-orange-500">
        <div className="ticker-anim flex gap-14 whitespace-nowrap">
          {ticker.map((item, i) => (
            <span key={i} className="text-white text-xs font-bold flex-shrink-0 tracking-wide">{item}</span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <motion.nav
        variants={VF} initial="hidden" animate="visible" transition={TAGNAV}
        className={`fixed top-6 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-4 border transition-all duration-500 ${navBg}`}
      >
        <div className="flex items-center gap-3">
          <motion.div whileHover={THOVER}
            className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/30">
            W
          </motion.div>
          <div>
            <h1 className="text-xl font-black gradient-text leading-none">WASEL</h1>
            <p className={`text-xs leading-none ${sub}`}>واصل — Smart Delivery</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button whileHover={THOVER} whileTap={TTAP} onClick={toggleTheme}
            className={`p-2.5 rounded-xl border text-lg transition-all ${dark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            {dark ? '☀️' : '🌙'}
          </motion.button>
          <Link to="/login" className={`hidden md:block px-4 py-2 text-sm font-medium transition-colors rounded-lg ${dark ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            Sign In
          </Link>
          <motion.div whileHover={THOVER} whileTap={TTAP}>
            <Link to="/register" className="glow-btn px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/30">
              Get Started 🚀
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-28 pb-20 z-10">
        <motion.div variants={VS} initial="hidden" animate="visible" transition={TAGHERO0}
          className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/40 text-blue-400 text-sm px-5 py-2 rounded-full mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse" />
          🇩🇿 Algeria's #1 Smart Delivery Platform
        </motion.div>

        <motion.h1 variants={V} initial="hidden" animate="visible" transition={TAGHERO1}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
          Deliver Anything,<br />
          <span className="gradient-text">Anywhere in Minutes</span>
        </motion.h1>

        <motion.p variants={V} initial="hidden" animate="visible" transition={TAGHERO2}
          className={`text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${sub}`}>
          WASEL connects customers, drivers, and businesses in one powerful ecosystem.
          Fast, secure, and smart delivery in{' '}
          <strong className={dark ? 'text-white' : 'text-slate-900'}>Tlemcen, Algeria</strong>.
        </motion.p>

        <motion.div variants={V} initial="hidden" animate="visible" transition={TAGHERO3}
          className="flex gap-4 justify-center flex-wrap mb-16">
          <motion.div whileHover={THOVER} whileTap={TTAP}>
            <Link to="/register" className="glow-btn inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/30">
              Start Delivering 🚀
            </Link>
          </motion.div>
          <motion.div whileHover={THOVER} whileTap={TTAP}>
            <Link to="/login" className={`inline-block px-10 py-4 g-card font-bold text-lg ${card}`}>
              Sign In →
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Tags */}
        <div className="flex gap-3 justify-center flex-wrap">
          {tags.map((tag, i) => (
            <motion.span key={tag} variants={VS} initial="hidden" animate="visible" transition={TAGDELAYS[i]}
              className={`g-card px-5 py-2.5 text-sm font-semibold ${card} ${sub}`}>
              {tag}
            </motion.span>
          ))}
        </div>

        {/* Scroll */}
        <motion.div variants={VF} initial="hidden" animate="visible" transition={TAGSCROLL}
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 ${sub}`}>
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div animate={AFLOAT} transition={TFLOAT} className="text-blue-400 text-xl">↓</motion.div>
        </motion.div>
      </section>

      {/* REAL STATS */}
      <section className="py-24 px-4 z-10 relative">
        <motion.div variants={V} initial="hidden" whileInView="visible" viewport={VP} transition={T0} className="text-center mb-14">
          <h2 className="text-4xl font-black mb-3">
            Live Platform <span className="gradient-text">Statistics</span>
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
            <p className={`text-sm ${sub}`}>Real-time data from our database</p>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          {statData.map((s, i) => (
            <motion.div key={s.label} variants={VS} initial="hidden" whileInView="visible" viewport={VP} transition={STATDELAYS[i]}
              className={`b-pulse g-card p-6 text-center ${card}`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.g} flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg`}>
                {s.icon}
              </div>
              <div className="text-3xl font-black gradient-text mb-1">
                <Counter target={s.value} />
              </div>
              <div className={`text-xs font-medium ${sub}`}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-4 z-10 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={V} initial="hidden" whileInView="visible" viewport={VP} transition={T0} className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">
              Everything You Need to <span className="gradient-text">Deliver</span>
            </h2>
            <p className={sub}>One platform for all your delivery needs in Algeria</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={V} initial="hidden" whileInView="visible" viewport={VP} transition={FEATDELAYS[i]}
                className={`g-card p-8 cursor-default ${card}`}>
                <motion.div whileHover={TICONHOV} className="text-5xl mb-5 inline-block">{f.icon}</motion.div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className={sub}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={`py-24 px-4 z-10 relative ${dark ? 'bg-slate-900/50' : 'bg-slate-100/60'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={V} initial="hidden" whileInView="visible" viewport={VP} transition={T0}>
            <h2 className="text-4xl font-black mb-16">
              How <span className="gradient-text">WASEL</span> Works
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.n} variants={V} initial="hidden" whileInView="visible" viewport={VP} transition={STATDELAYS[i]}
                className={`g-card p-6 ${card}`}>
                <motion.div animate={AFLOAT} transition={STEPDELAYS[i]} className="text-4xl mb-3">{s.e}</motion.div>
                <div className="text-3xl font-black gradient-text mb-2">{s.n}</div>
                <div className="font-bold text-sm mb-1">{s.t}</div>
                <div className={`text-xs ${sub}`}>{s.d}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {/* TESTIMONIALS — Real from DB */}
<section className="py-24 px-4 z-10 relative">
  <div className="max-w-5xl mx-auto">
    <motion.div variants={V} initial="hidden" whileInView="visible" viewport={VP} transition={T0} className="text-center mb-14">
      <h2 className="text-4xl font-black mb-2">
        What People <span className="gradient-text">Say</span>
      </h2>
      <p className={sub}>Real reviews from verified WASEL customers</p>
    </motion.div>

    {realReviews.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {realReviews.map((t, i) => (
          <motion.div key={i} variants={V} initial="hidden" whileInView="visible" viewport={VP} transition={TESTDELAYS[i] || T0}
            className={`g-card p-6 ${card}`}>
            <div className="text-yellow-400 text-xl mb-3">{'⭐'.repeat(t.rating)}</div>
            <p className={`text-sm leading-relaxed mb-5 ${sub}`}>"{t.comment}"</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {t.full_name?.[0] || '?'}
              </div>
              <div>
                <p className="font-semibold text-sm">{t.full_name}</p>
                <p className={`text-xs ${sub}`}>📍 {t.wilaya || 'Tlemcen'}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    ) : (
      <motion.div variants={V} initial="hidden" whileInView="visible" viewport={VP} transition={T0}
        className={`g-card p-12 text-center ${card}`}>
        <div className="text-5xl mb-4">💬</div>
        <p className="font-bold text-lg mb-2">Be the first to review WASEL!</p>
        <p className={`text-sm mb-6 ${sub}`}>Order now and share your experience</p>
        <motion.div whileHover={THOVER} whileTap={TTAP}>
          <Link to="/register" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm glow-btn">
            Get Started & Review 🚀
          </Link>
        </motion.div>
      </motion.div>
    )}
  </div>
</section>

      {/* CTA */}
      <section className="py-32 px-4 text-center z-10 relative">
        <motion.div variants={V} initial="hidden" whileInView="visible" viewport={VP} transition={T0}>
          <motion.div animate={AROCKET} transition={TROCKET} className="text-7xl mb-8 inline-block">🚀</motion.div>
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            Ready to <span className="gradient-text">Get Started?</span>
          </h2>
          <p className={`mb-10 text-xl ${sub}`}>Join thousands in Tlemcen, Algeria 🇩🇿</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.div whileHover={THOVER} whileTap={TTAP}>
              <Link to="/register" className="inline-block px-12 py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-2xl font-black text-xl shadow-2xl shadow-orange-500/30 transition-all">
                Join WASEL Today 🎉
              </Link>
            </motion.div>
            <motion.div whileHover={THOVER} whileTap={TTAP}>
              <Link to="/login" className={`inline-block px-12 py-5 g-card font-black text-xl transition-all ${card}`}>
                Sign In →
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className={`border-t py-12 px-4 z-10 relative ${dark ? 'border-slate-800/60' : 'border-slate-200'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">W</div>
            <h3 className="text-2xl font-black gradient-text">WASEL | واصل</h3>
          </div>
          <p className={`mb-2 ${sub}`}>Smart Delivery Platform — Tlemcen, Algeria 🇩🇿</p>
          <p className={`text-sm ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
            © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
          </p>
        </div>
      </footer>

    </div>
  );
}