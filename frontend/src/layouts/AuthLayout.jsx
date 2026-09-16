import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, TrendingUp, Bot, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500 overflow-hidden text-gray-900 dark:text-gray-100 relative">
      
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={toggleTheme}
          className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-full text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-110"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Left Showcase Side (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Abstract Background Orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 tracking-tight">StockFlow</h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 font-light max-w-md">The intelligent, enterprise-grade inventory management system for modern businesses.</p>
          </motion.div>
        </div>

        <div className="relative z-10 grid gap-6 max-w-lg mt-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="glass dark:bg-slate-800/50 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl"><Package size={24} /></div>
            <div>
              <h3 className="font-bold text-lg">Smart Inventory</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time tracking, ledger auditing, and automated low-stock alerts.</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="glass dark:bg-slate-800/50 p-6 rounded-2xl flex items-start gap-4 ml-8">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl"><Bot size={24} /></div>
            <div>
              <h3 className="font-bold text-lg">AI & Machine Learning</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Predictive analytics and a conversational AI assistant for instant insights.</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="glass dark:bg-slate-800/50 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl"><TrendingUp size={24} /></div>
            <div>
              <h3 className="font-bold text-lg">Financial Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Beautiful dashboards tracking revenue trends and inventory asset value.</p>
            </div>
          </motion.div>
        </div>
        
        <div className="relative z-10 text-sm text-gray-500 dark:text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} StockFlow Systems Inc.
        </div>
      </div>

      {/* Right Login Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md glass dark:bg-gray-800/80 p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-white/40 dark:border-white/10"
        >
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 tracking-tight mb-2">StockFlow</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage Your Inventory Smarter</p>
          </div>
          <Outlet />
        </motion.div>
      </div>

    </div>
  );
};

export default AuthLayout;
