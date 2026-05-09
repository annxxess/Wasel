import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster }         from 'react-hot-toast';
import { ThemeProvider }   from './context/ThemeContext';
import { AuthProvider }    from './context/AuthContext';
import { LangProvider }    from './context/LangContext';

import Landing           from './pages/Landing/Landing';
import Login             from './pages/Auth/Login';
import Register          from './pages/Auth/Register';
import HomePage          from './pages/Home/HomePage';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import DriverDashboard   from './pages/Driver/DriverDashboard';
import AdminDashboard    from './pages/Admin/AdminDashboard';
import AdminUsers        from './pages/Admin/AdminUsers';
import AdminDrivers      from './pages/Admin/AdminDrivers';
import AdminOrders       from './pages/Admin/AdminOrders';
import AdminStores       from './pages/Admin/AdminStores';
import AdminIncome       from './pages/Admin/AdminIncome';
import StoreDashboard    from './pages/Store/StoreDashboard';
import StoreOrders       from './pages/Store/StoreOrders';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LangProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background:   '#1e293b',
                  color:        '#fff',
                  border:       '1px solid #334155',
                  borderRadius: '12px',
                },
              }}
            />
            <Routes>
              <Route path="/"              element={<Landing />}           />
              <Route path="/login"         element={<Login />}             />
              <Route path="/register"      element={<Register />}          />
              <Route path="/home"          element={<HomePage />}          />
              <Route path="/dashboard"     element={<CustomerDashboard />} />
              <Route path="/driver"        element={<DriverDashboard />}   />
              <Route path="/admin"         element={<AdminDashboard />}    />
              <Route path="/admin/users"   element={<AdminUsers />}        />
              <Route path="/admin/drivers" element={<AdminDrivers />}      />
              <Route path="/admin/orders"  element={<AdminOrders />}       />
              <Route path="/admin/stores"  element={<AdminStores />}       />
              <Route path="/admin/income"  element={<AdminIncome />}       />
              <Route path="/store"         element={<StoreDashboard />}    />
              <Route path="/store/orders"  element={<StoreOrders />}       />
            </Routes>
          </BrowserRouter>
        </LangProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}