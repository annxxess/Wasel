// ============================================
// WASEL | واصل - Login Page
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
export default function Login() {
   const theme = useTheme();
const dark = theme?.dark ?? true;
const toggleTheme = theme?.toggleTheme ?? (() => {});
  const [form, setForm] = useState({ email: '', password: '' });
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await authAPI.login({ email, password, role });
    const data = res.data;                          // ← تأكد هذا السطر موجود
    localStorage.setItem('wasel_token', data.token);
    localStorage.setItem('wasel_user', JSON.stringify(data.user));

    if (data.user.role === 'admin')        navigate('/admin');
    else if (data.user.role === 'driver')  navigate('/driver');
    else if (data.user.role === 'store')   navigate('/store');
    else                                   navigate('/dashboard');

  } catch (err) {
    toast.error(err.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};
      const { token, user, driver, admin } = res.data;
      const userData = user || driver || admin;

      login(userData, token, role);
      toast.success(res.data.message);
if (data.user.role === 'admin')  navigate('/admin');
else if (data.user.role === 'driver') navigate('/driver');
else if (data.user.role === 'store')  navigate('/store');
else navigate('/dashboard');

    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${dark ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md">
<button onClick={toggleTheme}
  className="fixed top-4 right-4 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-lg hover:scale-110 transition-all z-50">
  {dark ? '☀️' : '🌙'}
</button>
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black gradient-text">WASEL</h1>
          <p className="text-slate-400 mt-2">واصل — Smart Delivery Platform</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Welcome Back 👋</h2>

          {/* Role Selector */}
          <div className="flex gap-2 mb-6">
            {['customer', 'driver', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  role === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-1 block">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In 🚀'}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
              Register
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
        </p>
      </div>
    </div>
  );
}