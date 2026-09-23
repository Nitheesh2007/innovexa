import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Receipt, Building2, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { StockFlowLogo } from '../pages/LandingPage';

const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-surface-muted dark:bg-slate-950 transition-colors duration-300 overflow-hidden text-slate-900 dark:text-slate-100 font-sans relative">
      
      {/* Top Header Bar */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between">
        <Link to="/">
          <StockFlowLogo />
        </Link>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={toggleTheme}
            type="button"
            className="p-2.5 bg-white dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition-colors border border-hairline"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Left Showcase Side (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 pt-28 border-r border-hairline bg-white dark:bg-slate-900">
        <div>
          <h2 className="font-display text-4xl font-bold tracking-[-0.02em] text-slate-900 dark:text-white max-w-md leading-tight">
            Simple inventory management for small businesses.
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 max-w-md">
            Track stock across multiple warehouses, scan barcodes with your phone, and automate reorder alerts — without enterprise pricing.
          </p>

          <div className="mt-12 space-y-6 max-w-md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Multi-Location Tracking</h3>
                <p className="text-xs text-slate-500 mt-1">Real-time inventory levels across every warehouse and retail store.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Receipt size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Fast POS & Instant Billing</h3>
                <p className="text-xs text-slate-500 mt-1">Speed through checkouts with automated PDF invoice generation.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Automated Low-Stock Alerts</h3>
                <p className="text-xs text-slate-500 mt-1">Prevent stockouts with automated reorder thresholds and notifications.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          © {new Date().getFullYear()} StockFlow Systems · Free Starter Plan
        </div>
      </div>

      {/* Right Form Card Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 pt-28 relative z-20">
        <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-2xl border border-hairline shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_24px_-12px_rgba(15,23,42,0.08)]">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
