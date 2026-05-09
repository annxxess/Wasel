// ============================================
// WASEL | واصل - Main App Router
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
// Pages
import Landing  from './pages/Landing/Landing';
import Login    from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminStores from './pages/Admin/AdminStores';
import AdminDrivers from './pages/Admin/AdminDrivers';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import StoreDashboard from './pages/Store/StoreDashboard';
import StoreOrders    from './pages/Store/StoreOrders';
function App() {
  return (
     <ThemeProvider>
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155'
            }
          }}
        />
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
       <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/drivers" element={<AdminDrivers />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/stores" element={<AdminStores />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/store"         element={<StoreDashboard />} />
<Route path="/store/orders"  element={<StoreOrders />}    />
</Routes>
      </Router>
    </AuthProvider>
     </ThemeProvider>
  );
}

export default App;