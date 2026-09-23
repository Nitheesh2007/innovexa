import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import ProductDetails from './pages/ProductDetails';
import Suppliers from './pages/Suppliers';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AIAssistant from './pages/AIAssistant';
import Intelligence from './pages/Intelligence';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Orders from './pages/Orders';
import OrderForm from './pages/OrderForm';
import ActivityLogs from './pages/ActivityLogs';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import POS from './pages/POS';
import Finance from './pages/Finance';
import Returns from './pages/Returns';
import BOM from './pages/BOM';
import Production from './pages/Production';
import Assets from './pages/Assets';
import Warehouses from './pages/Warehouses';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Authenticating...</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Authenticating...</span>
        </div>
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/bom" element={<BOM />} />
          <Route path="/production" element={<Production />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/scanner" element={<Navigate to="/products" replace />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/new" element={<InvoiceForm />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/activity" element={<ActivityLogs />} />
        </Route>

        {/* Unauthenticated / unknown route fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
