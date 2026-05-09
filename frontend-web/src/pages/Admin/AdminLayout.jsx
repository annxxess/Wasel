// ============================================
// WASEL | واصل - Admin Layout
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/admin',          icon: '📊', label: 'Dashboard'  },
  { path: '/admin/users',    icon: '👤', label: 'Users'      },
  { path: '/admin/drivers',  icon: '🏍️', label: 'Drivers'   },
  { path: '/admin/orders',   icon: '📦', label: 'Orders'     },
  { path: '/admin/stores',   icon: '🏪', label: 'Stores'     },
  { path: '/admin/revenue',  icon: '💰', label: 'Revenue'    },
  { path: '/admin/tickets',  icon: '🎫', label: 'Support'    },
];

export default function AdminLayout({ children }) {
  const { dark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const bg      = dark ? 'bg-slate-900 text-white'   : 'bg-gray-50 text-slate-900';
  const sidebar = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const active  = dark ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500' : 'bg-blue-50 text-blue-600 border-l-2 border-blue-500';
  const inactive = dark ? 'text-slate-400 hover:bg-slate-700/50 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`flex min-h-screen ${bg}`}>

      {/* Sidebar */}
      <aside className={`w-64 fixed top-0 left-0 h-full border-r flex flex-col ${sidebar}`}>

        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center text-white font-black">W</div>
            <div>
              <h1 className="font-black text-sm gradient-text">WASEL | واصل</h1>
              <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path ? active : inactive
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className={`p-4 border-t ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.full_name || 'Admin'}</p>
              <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Super Admin</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleTheme}
              className={`flex-1 py-2 rounded-lg text-sm transition-all ${dark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>
              {dark ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout}
              className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-all">
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}