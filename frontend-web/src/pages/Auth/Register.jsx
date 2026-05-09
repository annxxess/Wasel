import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const WILAYAS = ['Tlemcen','Oran','Alger','Constantine','Annaba','Sétif','Blida','Batna'];

export default function Register() {
  const theme       = useTheme();
  const dark        = theme?.dark ?? true;
  const toggleTheme = theme?.toggleTheme ?? (() => {});
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', wilaya: 'Tlemcen',
  });
  const [role, setRole]       = useState('customer');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await authAPI.register({ ...form, role });
      const data = res.data;
      const userData = data.user || data.driver;
      login(userData, data.token);
      toast.success('Account created! Welcome to WASEL 🎉');
      if (userData?.role === 'driver') navigate('/driver');
      else if (userData?.role === 'store') navigate('/store');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const bg     = dark ? 'bg-[#0f172a]' : 'bg-gray-50';
  const text   = dark ? 'text-white'   : 'text-slate-900';
  const sub    = dark ? 'text-slate-400' : 'text-slate-500';
  const inp    = dark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500';
  const cardBg = dark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xl';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-10 transition-colors duration-300 ${bg} ${text}`}>
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg,#3b82f6,#8b5cf6,#f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <button onClick={toggleTheme}
        className={`fixed top-4 right-4 p-2.5 rounded-xl border text-lg hover:scale-110 transition-all z-50 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'}`}>
        {dark ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><h1 className="text-5xl font-black gradient-text mb-2">WASEL</h1></Link>
          <p className={sub}>واصل — Create your account</p>
        </div>

        <div className={`rounded-2xl border p-8 backdrop-blur-md ${cardBg}`}>
          <h2 className="text-2xl font-bold mb-6">Create Account 🚀</h2>

          <div className="flex gap-2 mb-6">
            {['customer','driver','store'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  role === r
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : (dark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
                }`}>
                {r === 'customer' ? '👤' : r === 'driver' ? '🏍️' : '🏪'} {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', name: 'full_name', type: 'text',     placeholder: 'Mohammed Anas Marref' },
              { label: 'Email',     name: 'email',     type: 'email',    placeholder: 'your@email.com'       },
              { label: 'Phone',     name: 'phone',     type: 'tel',      placeholder: '0550000000'            },
              { label: 'Password',  name: 'password',  type: 'password', placeholder: '••••••••'              },
            ].map(field => (
              <div key={field.name}>
                <label className={`text-sm mb-1.5 block font-medium ${sub}`}>{field.label}</label>
                <input type={field.type} name={field.name} value={form[field.name]}
                  onChange={handleChange} required placeholder={field.placeholder}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-colors ${inp}`} />
              </div>
            ))}

            <div>
              <label className={`text-sm mb-1.5 block font-medium ${sub}`}>Wilaya</label>
              <select name="wilaya" value={form.wilaya} onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-colors ${inp}`}>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 mt-2">
              {loading ? '⏳ Creating account...' : 'Create Account 🎉'}
            </button>
          </form>

          <p className={`text-center mt-6 text-sm ${sub}`}>
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">Sign In</Link>
          </p>
        </div>

        <p className={`text-center text-xs mt-6 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
          © 2026 WASEL. All Rights Reserved. Created by Marref Mohammed Anas.
        </p>
      </div>
    </div>
  );
}