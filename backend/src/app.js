import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

import Landing           from './pages/Landing/Landing';
import Login             from './pages/Auth/Login';
import Register          from './pages/Auth/Register';
import AdminDashboard    from './pages/Admin/AdminDashboard';
import AdminUsers        from './pages/Admin/AdminUsers';
import AdminDrivers      from './pages/Admin/AdminDrivers';
import AdminOrders       from './pages/Admin/AdminOrders';
import AdminStores       from './pages/Admin/AdminStores';
import StoreDashboard    from './pages/Store/StoreDashboard';
import StoreOrders       from './pages/Store/StoreOrders';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import HomePage from './pages/Home/HomePage';
// ...

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
          }} />
          <Routes>
            <Route path="/"               element={<Landing />}           />
            <Route path="/login"          element={<Login />}             />
            <Route path="/register"       element={<Register />}          />
            <Route path="/dashboard"      element={<CustomerDashboard />} />
            <Route path="/admin"          element={<AdminDashboard />}    />
            <Route path="/admin/users"    element={<AdminUsers />}        />
            <Route path="/admin/drivers"  element={<AdminDrivers />}      />
            <Route path="/admin/orders"   element={<AdminOrders />}       />
            <Route path="/admin/stores"   element={<AdminStores />}       />
            <Route path="/store"          element={<StoreDashboard />}    />
            <Route path="/store/orders"   element={<StoreOrders />}       />
          <Route path="/home" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}