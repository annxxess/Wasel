import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth }  from '../../context/AuthContext';

const navItems = [
  { path: '/admin',         icon: '📊', label: 'Dashboard' },
  { path: '/admin/users',   icon: '👤', label: 'Users'     },
  { path: '/admin/drivers', icon: '🏍️', label: 'Drivers'   },
  { path: '/admin/orders',  icon: '📦', label: 'Orders'    },
  { path: '/admin/stores',  icon: '🏪', label: 'Stores'    },
  { path: '/admin/income', icon: '💰', label: 'Income' },
];

export default function AdminLayout({ children }) {
  const { dark, toggleTheme } = useTheme();
  const { user, logout }      = useAuth();
  const location               = useLocation();
  const navigate               = useNavigate();

  const sidebar = dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg';
  const bg      = dark ? 'bg-[#0a0f1e]' : 'bg-gray-50';
  const text    = dark ? 'text-white'   : 'text-slate-900';
  const sub     = dark ? 'text-slate-400' : 'text-slate-500';

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
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
              W
            </div>
            <div>
              <h1 className="text-base font-black gradient-text leading-none">WASEL</h1>
              <p className={`text-xs leading-none ${sub}`}>Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : (dark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                }`}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.full_name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.full_name || 'Admin'}</p>
              <p className={`text-xs truncate ${sub}`}>{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${dark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}>
            {dark ? '☀️' : '🌙'} <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            👋 <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 min-h-screen">{children}</main>
    </div>
  );
}