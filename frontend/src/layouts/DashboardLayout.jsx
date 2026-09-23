import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LogOut, 
  LayoutDashboard, 
  Package, 
  Moon, 
  Sun, 
  Bot, 
  Brain, 
  FileText, 
  Users, 
  ShoppingCart, 
  Truck, 
  Search, 
  Shield, 
  Receipt, 
  Store, 
  RotateCcw, 
  PieChart, 
  Layers, 
  Sparkles,
  Factory,
  Wrench,
  Building2,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '../components/GlobalSearch';
import { useLanguage } from '../context/LanguageContext';

const navigationSections = [
  {
    category: "OPERATIONS",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/pos", icon: Store, label: "POS Terminal", badge: "Live" },
      { to: "/products", icon: Package, label: "Products Catalog" },
      { to: "/inventory", icon: Layers, label: "Inventory Ledger" },
      { to: "/warehouses", icon: Building2, label: "Multi-Warehouse", badge: "Network" },
      { to: "/orders", icon: ShoppingCart, label: "Sales & Orders" },
      { to: "/invoices", icon: Receipt, label: "Invoices & Billing" },
      { to: "/returns", icon: RotateCcw, label: "Returns & RMA" },
      { to: "/suppliers", icon: Truck, label: "Suppliers" },
    ]
  },
  {
    category: "MANUFACTURING & ASSETS",
    items: [
      { to: "/bom", icon: Layers, label: "Bill of Materials", badge: "BOM" },
      { to: "/production", icon: Factory, label: "Work Orders", badge: "Floor" },
      { to: "/assets", icon: Wrench, label: "Asset Tracking", badge: "Equip" }
    ]
  },
  {
    category: "INTELLIGENCE & FINANCE",
    items: [
      { to: "/ai", icon: Bot, label: "StockFlow AI", highlight: true },
      { to: "/intelligence", icon: Brain, label: "ML Forecasting" },
      { to: "/finance", icon: PieChart, label: "Financial Ledger" },
      { to: "/reports", icon: FileText, label: "Reports & Analytics" },
    ]
  },
  {
    category: "ADMINISTRATION",
    items: [
      { to: "/users", icon: Users, label: "Staff & Team" },
      { to: "/activity", icon: Shield, label: "Audit & Logs" },
    ]
  }
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden font-sans">
      {/* Sidebar with Professional Grouping */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-sm">
        {/* Brand Header matching stockflowsystems.com */}
        <div className="p-4 border-b border-hairline flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-700 text-white shadow-xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white" aria-hidden="true">
                <path d="M16.5 9.4 7.5 4.21"></path>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                <line x1="12" y1="22" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                stockflow
              </span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Inventory App</p>
            </div>
          </Link>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
          {navigationSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                {t(sec.category)}
              </div>
              <div className="space-y-0.5">
                {sec.items.map((item, idx) => {
                  const active = isActive(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      to={item.to}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        active 
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold' 
                          : item.highlight
                            ? 'text-sky-700 dark:text-sky-400 hover:bg-sky-50/60 dark:hover:bg-sky-950/30'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <Icon 
                          size={18} 
                          className={`shrink-0 transition-colors ${
                            active 
                              ? 'text-sky-700 dark:text-sky-300' 
                              : item.highlight
                                ? 'text-sky-600 animate-pulse'
                                : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`} 
                        />
                        <span className="truncate">{t(item.label)}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          {t(item.badge)}
                        </span>
                      )}
                      {item.highlight && !item.badge && (
                        <Sparkles size={13} className="text-indigo-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 mb-2">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 capitalize font-medium leading-none">{user?.role || 'Staff'}</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme} 
              aria-label="Toggle theme"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
            </button>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            <span>{t('Sign Out')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top App Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10 sticky top-0 shadow-xs">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {t(navigationSections.flatMap(s => s.items).find(i => isActive(i.to))?.label || 'Overview')}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>StockFlow Cloud Active</span>
            </div>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 rounded-lg transition-colors text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              <Search size={14} />
              <span className="hidden sm:inline">{t('Search records...')}</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 font-mono">Ctrl K</kbd>
            </button>
          </div>
        </header>
        
        {/* Animated Page Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
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
