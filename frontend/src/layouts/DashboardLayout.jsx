import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, LayoutDashboard, Package, Moon, Sun, Settings, Camera, Bot, Brain, FileText, Users, ShoppingCart, Truck, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '../components/GlobalSearch';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-hidden">
      {/* Sidebar with Glassmorphism */}
      <aside className="w-64 glass border-r border-white/20 dark:border-white/5 flex flex-col z-10 shadow-lg shadow-blue-900/5">
        <div className="p-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-500">StockFlow</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {[
            { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { to: "/products", icon: Package, label: "Products" },
            { to: "/suppliers", icon: Truck, label: "Suppliers" },
            { to: "/orders", icon: ShoppingCart, label: "Sales & Orders" },
            { to: "/inventory", icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>, label: "Inventory Ledger" },
            { to: "/scanner", icon: Camera, label: "Smart Scanner" },
            { to: "/ai", icon: Bot, label: "StockFlow AI", extraClass: "text-primary bg-primary/10 border border-primary/20 glowing-border" },
            { to: "/intelligence", icon: Brain, label: "ML Intelligence" },
            { to: "/reports", icon: FileText, label: "Reports" },
            { to: "/users", icon: Users, label: "Staff Users" },
          ].map((link, idx) => (
            <Link 
              key={idx}
              to={link.to} 
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300 group ${link.extraClass || ''}`}
            >
              <link.icon size={20} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/20 dark:border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-primary-500/30">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold truncate w-24">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">{user?.role}</p>
              </div>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-white/10 transition-transform hover:rotate-12">
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all duration-300 hover:shadow-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 glass border-b border-white/20 dark:border-white/5 flex items-center justify-between px-8 z-10 sticky top-0">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400">
            Welcome back, {user?.name}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl transition-colors text-sm font-medium border border-gray-200 dark:border-gray-700"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-md font-mono">Ctrl K</kbd>
            </button>
          </div>
        </header>
        
        {/* Animated Outlet Wrapper */}
        <div className="flex-1 overflow-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
