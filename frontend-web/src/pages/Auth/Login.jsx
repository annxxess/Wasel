import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { dark, toggleTheme } = useTheme();
  const { login }             = useAuth();
  const { t, toggleLang, lang, isRTL } = useLang();
  const navigate              = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [role, setRole]       = useState('customer');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res      = await authAPI.login({ email: form.email, password: form.password, role });
      const data     = res.data;
      const userData = data.user || data.driver || data.admin;
      login(userData, data.token);
      toast.success(data.message || t('welcomeBack'));
      if (userData?.role === 'admin')       navigate('/admin');
      else if (userData?.role === 'driver') navigate('/driver');
      else if (userData?.role === 'store')  navigate('/store');
      else                                  navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const bg     = dark ? 'bg-[#0f172a]' : 'bg-gray-50';
  const text   = dark ? 'text-white'   : 'text-slate-900';
  const sub    = dark ? 'text-slate-400' : 'text-slate-500';
  const inp    = dark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500';
  const cardBg = dark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xl';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${bg} ${text}`}>
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg,#3b82f6,#8b5cf6,#f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .btn-press:active { transform: scale(0.95); }
      `}</style>

      {/* Top Buttons */}
      <div className={`fixed top-4 flex gap-2 ${isRTL ? 'left-4' : 'right-4'} z-50`}>
        <button onClick={toggleLang}
          className={`px-3 py-2 rounded-xl border text-xs font-bold btn-press transition-all ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'}`}>
          {lang === 'ar' ? 'EN' : 'عربي'}
        </button>
        <button onClick={toggleTheme}
          className={`p-2.5 rounded-xl border text-lg btn-press transition-all ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'}`}>
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><h1 className="text-5xl font-black gradient-text mb-2">WASEL</h1></Link>
          <p className={sub}>{t('tagline')}</p>
        </div>

        <div className={`rounded-2xl border p-8 backdrop-blur-md ${cardBg}`}>
          <h2 className="text-2xl font-bold mb-6">{t('welcomeBack')}</h2>

          <div className="flex gap-2 mb-6">
            {['customer','driver','store','admin'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`btn-press flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  role === r
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : (dark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
                }`}>
                {r === 'customer' ? '👤' : r === 'driver' ? '🏍️' : r === 'store' ? '🏪' : '⚙️'} {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`text-sm mb-1.5 block font-medium ${sub}`}>{t('email')}</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="your@email.com"
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-colors ${inp}`} />
            </div>
            <div>
              <label className={`text-sm mb-1.5 block font-medium ${sub}`}>{t('password')}</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="••••••••"
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-colors ${inp}`} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-press w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 mt-2">
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          <p className={`text-center mt-6 text-sm ${sub}`}>
            {t('noAccount')}{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
              {t('createAccount')}
            </Link>
          </p>
        </div>

        <p className={`text-center text-xs mt-6 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
          © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
        </p>
      </div>
    </div>
  );
}