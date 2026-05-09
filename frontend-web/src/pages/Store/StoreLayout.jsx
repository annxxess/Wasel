import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/store',        icon: '📊', label: 'Dashboard'  },
  { path: '/store/orders', icon: '📦', label: 'Orders'     },
  { path: '/store/profile',icon: '🏪', label: 'My Store'   },
];

export default function StoreLayout({ children }) {
  const { dark, toggleTheme } = useTheme();
  const { user, logout }      = useAuth();
  const location               = useLocation();
  const navigate               = useNavigate();
  const [open, setOpen]        = useState(false);

  const bg      = dark ? 'bg-[#0a0f1e]'    : 'bg-gray-50';
  const sidebar = dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const text    = dark ? 'text-white'       : 'text-slate-900';
  const sub     = dark ? 'text-slate-400'   : 'text-slate-500';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className={`min-h-screen flex ${bg} ${text} transition-colors duration-300`}>

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg,#3b82f6,#8b5cf6,#f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`w-64 min-h-screen border-r flex flex-col fixed left-0 top-0 z-30 ${sidebar}`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/30">
              🏪
            </div>
            <div>
              <h1 className="text-base font-black gradient-text leading-none">Store Panel</h1>
              <p className={`text-xs leading-none truncate max-w-[120px] ${sub}`}>{user?.store_name || user?.full_name}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : (dark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                }`}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 bg-orange-400 rounded-full" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 space-y-2 border-t border-slate-800/50">
          <button onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${dark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}>
            {dark ? '☀️' : '🌙'}
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            👋 <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}