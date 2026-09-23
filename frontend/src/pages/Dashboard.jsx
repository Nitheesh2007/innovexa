import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  IndianRupee, 
  Activity, 
  Info, 
  CheckSquare, 
  ArrowUpCircle, 
  Users, 
  Truck, 
  Database, 
  Download, 
  Plus, 
  Bot, 
  ShoppingCart, 
  Receipt, 
  Star, 
  FileText,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowUpRight,
  Sparkles,
  Layers,
  ArrowRightLeft,
  Wrench
} from 'lucide-react';
import { dashboardService } from '../services/apiServices';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import SystemGuideModal from '../components/SystemGuideModal';
import toast from 'react-hot-toast';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const formatINR = (val) => {
  if (val === undefined || val === null) return '₹0';
  return `₹${Number(val).toLocaleString('en-IN')}`;
};

const Dashboard = () => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeRecentTab, setActiveRecentTab] = useState('all'); // 'all' | 'sales' | 'logins' | 'inventory' | 'workorders'

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    totalCustomers: 0,
    totalWarehouses: 0,
    inventoryValue: 0,
    lowStock: 0,
    outOfStock: 0,
    todaysStockIn: 0,
    todaysStockOut: 0,
    todaysSalesValue: 0,
    todaysPurchasesValue: 0,
    todaysProfit: 0,
    cashBalance: 0,
    receivables: 0,
    payables: 0,
    expenses: 0,
    deadStockValue: 0,
    overstockValue: 0,
    lowStockProducts: [],
    recentActivity: [],
    recentLogins: [],
    recentWorkOrders: [],
    recentTransfers: [],
    categoryData: [],
    trendData: [],
    recentInvoices: [],
    topSellingProducts: []
  });

  const fetchStats = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const res = await dashboardService.getStats();
      if (res.data && res.data.data) {
        setStats(res.data.data);
        setLastUpdated(new Date());
        if (showToast) {
          toast.success('Live dashboard details updated!', { id: 'dash-refresh' });
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
      if (showToast) {
        toast.error('Failed to refresh dashboard details', { id: 'dash-refresh' });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds for live data sync
    const interval = setInterval(() => {
      fetchStats(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 26 } }
  };

  const handleGenerateReport = () => {
    const reportContent = `
======================================================
STOCKFLOW ENTERPRISE INVENTORY & FINANCIAL PULSE REPORT
Generated: ${new Date().toLocaleString('en-IN')}
Currency: Indian Rupee (INR - ₹)
======================================================

1. INVENTORY SUMMARY:
------------------------------------------------------
Total Products Cataloged: ${stats.totalProducts}
Total Warehouses / Hubs: ${stats.totalWarehouses}
Total Inventory Valuation: ${formatINR(stats.inventoryValue)}
Low Stock Threshold Alerts: ${stats.lowStock}
Out of Stock Items: ${stats.outOfStock}
Dead Stock Holding Value: ${formatINR(stats.deadStockValue)}
Overstock Capital Tied: ${formatINR(stats.overstockValue)}

2. TODAY'S OPERATIONAL PULSE:
------------------------------------------------------
Today's Inbound Stock Receipts: ${stats.todaysStockIn}
Today's Outbound Stock Shipments: ${stats.todaysStockOut}
Today's Realized Gross Sales: ${formatINR(stats.todaysSalesValue)}
Today's Purchases Incurred: ${formatINR(stats.todaysPurchasesValue)}
Today's Gross Operating Profit: ${formatINR(stats.todaysProfit)}

3. BALANCE SHEET & LEDGER:
------------------------------------------------------
Active Cash & Bank Balance: ${formatINR(stats.cashBalance)}
Accounts Receivable (Customers): ${formatINR(stats.receivables)}
Accounts Payable (Suppliers): ${formatINR(stats.payables)}
Total Expenses Logged: ${formatINR(stats.expenses)}

4. STAKEHOLDER DIRECTORY:
------------------------------------------------------
Total Active Customers: ${stats.totalCustomers}
Total Active Suppliers / Vendors: ${stats.totalSuppliers}

======================================================
Generated automatically by StockFlow ERP Platform
`.trim();
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StockFlow_Pulse_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    toast.success('Enterprise summary report downloaded!');
  };

  return (
    <motion.div 
      className="space-y-7 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-display">
              Enterprise Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Sync
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2">
            Real-time multi-warehouse inventory, sales ledger, and production tracking in Indian Rupees (₹).
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
              (Updated: {lastUpdated.toLocaleTimeString('en-IN')})
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button 
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all flex items-center gap-2 shadow-xs"
            title="Refresh live updates"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-sky-600" : ""} />
            <span>{isRefreshing ? "Updating..." : "Refresh Updates"}</span>
          </button>

          <button 
            onClick={() => setIsGuideOpen(true)}
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all font-semibold text-xs border border-indigo-200 dark:border-indigo-800 shadow-xs"
          >
            <Info size={15} />
            <span>Guide</span>
          </button>

          <button 
            onClick={handleGenerateReport}
            className="bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all font-bold text-xs"
          >
            <Download size={15} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Navigation Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link to="/products/new" className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-sky-500 dark:hover:border-sky-500 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 group">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl group-hover:bg-sky-100 dark:group-hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 group-hover:text-sky-700 transition-colors">
            <Plus size={20} />
          </div>
          <span className="font-bold text-xs">Add Product</span>
        </Link>

        <Link to="/pos" className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-sky-500 dark:hover:border-sky-500 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 group">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl group-hover:bg-sky-100 dark:group-hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 group-hover:text-sky-700 transition-colors">
            <ShoppingCart size={20} />
          </div>
          <span className="font-bold text-xs">POS Terminal</span>
        </Link>

        <Link to="/bom" className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-sky-500 dark:hover:border-sky-500 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 group">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl group-hover:bg-sky-100 dark:group-hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 group-hover:text-sky-700 transition-colors">
            <Layers size={20} />
          </div>
          <span className="font-bold text-xs">BOM Builder</span>
        </Link>

        <Link to="/production" className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-sky-500 dark:hover:border-sky-500 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 group">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl group-hover:bg-sky-100 dark:group-hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 group-hover:text-sky-700 transition-colors">
            <Cpu size={20} />
          </div>
          <span className="font-bold text-xs">Work Orders</span>
        </Link>

        <Link to="/warehouses" className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-sky-500 dark:hover:border-sky-500 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 group">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl group-hover:bg-sky-100 dark:group-hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 group-hover:text-sky-700 transition-colors">
            <ArrowRightLeft size={20} />
          </div>
          <span className="font-bold text-xs">Transfers</span>
        </Link>

        <Link to="/assets" className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 group">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">
            <Wrench size={20} />
          </div>
          <span className="font-bold text-xs">Asset Tracking</span>
        </Link>

        <Link to="/activity" className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-sky-500 dark:hover:border-sky-500 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 group">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl group-hover:bg-sky-100 dark:group-hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 group-hover:text-sky-700 transition-colors">
            <Activity size={20} />
          </div>
          <span className="font-bold text-xs">Audit Logs</span>
        </Link>
      </div>

      {/* 3. Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/50 rounded-xl text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
              <Package size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Catalog SKUs</p>
              <h3 className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white font-mono">{stats.totalProducts}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.totalCategories} Active Categories</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <IndianRupee size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Inventory Value</p>
              <h3 className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white font-mono">{formatINR(stats.inventoryValue)}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{stats.totalWarehouses} Storage Hubs</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Users size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Customers & Vendors</p>
              <h3 className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white font-mono">{stats.totalCustomers} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ {stats.totalSuppliers}</span></h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Enterprise Stakeholders</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <AlertTriangle size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Stock Reorder Alerts</p>
              <h3 className="text-2xl font-black mt-0.5 text-rose-600 dark:text-rose-400 font-mono">
                {stats.outOfStock} <span className="text-sm font-normal text-amber-600 dark:text-amber-400">/ {stats.lowStock} Low</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Requires replenishment</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. Financial & Daily Operations Pulse */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-4.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 border-l-4 border-l-emerald-600 shadow-xs">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Today's Sales</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">{formatINR(stats.todaysSalesValue)}</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            Profit: {formatINR(stats.todaysProfit)}
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-4.5 rounded-xl border border-sky-200 dark:border-sky-800/40 border-l-4 border-l-sky-600 shadow-xs">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Cash & Bank Balance</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">{formatINR(stats.cashBalance)}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Available Liquidity</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-4.5 rounded-xl border border-amber-200 dark:border-amber-800/40 border-l-4 border-l-amber-600 shadow-xs">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Customer Receivables</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">{formatINR(stats.receivables)}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending Inward Collections</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-4.5 rounded-xl border border-rose-200 dark:border-rose-800/40 border-l-4 border-l-rose-600 shadow-xs">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Supplier Payables</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">{formatINR(stats.payables)}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending Vendor Dues</p>
        </motion.div>
      </div>

      {/* 5. Inventory Movement Sub-row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="text-emerald-600 dark:text-emerald-400" size={16} />
            <p className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">Today Stock In</p>
          </div>
          <p className="font-bold font-mono text-slate-900 dark:text-white">{stats.todaysStockIn} Units Inward</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="text-sky-600 dark:text-sky-400" size={16} />
            <p className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">Today Stock Out</p>
          </div>
          <p className="font-bold font-mono text-slate-900 dark:text-white">{stats.todaysStockOut} Units Outward</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Database className="text-indigo-600 dark:text-indigo-400" size={16} />
            <p className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">Dead Stock</p>
          </div>
          <p className="font-bold font-mono text-slate-900 dark:text-white">{formatINR(stats.deadStockValue)}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Package className="text-amber-600 dark:text-amber-400" size={16} />
            <p className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">Overstock Capital</p>
          </div>
          <p className="font-bold font-mono text-slate-900 dark:text-white">{formatINR(stats.overstockValue)}</p>
        </div>
      </div>

      {/* 6. Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            <TrendingUp className="text-sky-600" size={18} /> Revenue Trend (Last 7 Days)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trendData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(value) => [formatINR(value), 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, fill: '#0284c7', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution Chart */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            <Activity className="text-sky-600" size={18} /> Inventory Distribution by Category
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {stats.categoryData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">No category distribution data.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* 7. LIVE RECENT UPDATES & DATABASE AUDIT HUB (Core Requirement) */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Hub Header & Filter Tabs */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-850">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="text-sky-600" size={18} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Updates & Activity Stream
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive recent updates: Logins, Inward/Outward movements, Sales & Production orders.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveRecentTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeRecentTab === 'all' ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              All Recent
            </button>
            <button
              onClick={() => setActiveRecentTab('logins')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeRecentTab === 'logins' ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Logins ({stats.recentLogins?.length || 0})
            </button>
            <button
              onClick={() => setActiveRecentTab('sales')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeRecentTab === 'sales' ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Invoices & Sales ({stats.recentInvoices?.length || 0})
            </button>
            <button
              onClick={() => setActiveRecentTab('inventory')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeRecentTab === 'inventory' ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Stock Moves ({stats.recentActivity?.length || 0})
            </button>
            <button
              onClick={() => setActiveRecentTab('workorders')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeRecentTab === 'workorders' ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Work Orders ({stats.recentWorkOrders?.length || 0})
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="p-5">
          {/* ALL OR LOGINS TAB */}
          {(activeRecentTab === 'all' || activeRecentTab === 'logins') && (
            <div className="mb-6 last:mb-0">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  Recent User Logins & Security Audit
                </h4>
                <Link to="/users" className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline">
                  Manage Users &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stats.recentLogins?.length > 0 ? (
                  stats.recentLogins.map((login, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                          {login.user?.name ? login.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                            {login.user?.name || 'Staff User'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[140px]">
                            {login.user?.email || 'user@stockflow.com'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${login.user?.role === 'admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'}`}>
                          {login.user?.role || 'staff'}
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                          {new Date(login.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl col-span-3">
                    No login logs recorded yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ALL OR SALES / INVOICES TAB */}
          {(activeRecentTab === 'all' || activeRecentTab === 'sales') && (
            <div className="mb-6 last:mb-0">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Receipt size={15} className="text-sky-600" />
                  Recent Sales & Customer Invoices (in ₹)
                </h4>
                <Link to="/invoices" className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline">
                  All Invoices &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {stats.recentInvoices?.length > 0 ? (
                  stats.recentInvoices.map((inv, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 gap-2 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                          ₹
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                              {inv.invoiceNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              • {inv.customer?.name || inv.supplier?.companyName || 'Walk-in Retail POS'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {inv.invoiceType === 'STOCK_OUT' ? 'Customer Sale' : 'Supplier Purchase'} • {new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                        <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                          {formatINR(inv.grandTotal)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          inv.status === 'PARTIALLY_PAID' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                          'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    No sales invoices recorded yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ALL OR INVENTORY TAB */}
          {(activeRecentTab === 'all' || activeRecentTab === 'inventory') && (
            <div className="mb-6 last:mb-0">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Activity size={15} className="text-indigo-600" />
                  Recent Inventory Adjustments & Stock Movement
                </h4>
                <Link to="/inventory" className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline">
                  Inventory Ledger &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {stats.recentActivity?.length > 0 ? (
                  stats.recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.transactionType === 'STOCK_IN' || activity.type === 'IN' ? 'bg-emerald-500' :
                          activity.transactionType === 'STOCK_OUT' || activity.type === 'OUT' ? 'bg-sky-500' :
                          'bg-amber-500'
                        }`} />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            <span className="font-mono text-sky-700 dark:text-sky-400">{activity.quantity} units</span> • {activity.product?.productName || 'Unknown Product'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            SKU: {activity.product?.sku || 'N/A'} • Ref: {activity.referenceNumber || 'DIRECT-POST'}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          activity.transactionType === 'STOCK_IN' || activity.type === 'IN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          activity.transactionType === 'STOCK_OUT' || activity.type === 'OUT' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {activity.transactionType || activity.type || 'Movement'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(activity.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    No recent inventory transactions logged.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ALL OR WORK ORDERS TAB */}
          {(activeRecentTab === 'all' || activeRecentTab === 'workorders') && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Cpu size={15} className="text-amber-600" />
                  Manufacturing Work Orders & Shop Floor
                </h4>
                <Link to="/production" className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline">
                  Production Kanban &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {stats.recentWorkOrders?.length > 0 ? (
                  stats.recentWorkOrders.map((wo, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                            {wo.orderNumber}
                          </span>
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                            {wo.finishedProduct?.productName || 'Assembly Unit'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Assigned: {wo.assignedTechnician || 'Shop Floor Line'} • Warehouse: {wo.warehouse?.name || 'Main Facility'}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          wo.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          wo.status === 'in_progress' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {wo.status?.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                          {wo.actualProduced || 0} / {wo.targetQuantity} units built
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    No active manufacturing orders found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 8. Bottom Row: Low Stock Alerts & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <AlertTriangle className="text-rose-600" size={18} /> Critical Low Stock Thresholds
            </h3>
            <Link to="/inventory" className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline">
              Restock &rarr;
            </Link>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {stats.lowStockProducts?.length > 0 ? (
              stats.lowStockProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                      {product.productName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{product.sku}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className={`text-xs font-black font-mono ${product.currentStock === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {product.currentStock} in stock
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Min: {product.minimumStock}</p>
                    </div>
                    <Link to={`/products/${product._id}`} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-xs text-sky-700 hover:bg-slate-50">
                      <ArrowUpCircle size={15} className="rotate-45" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                <CheckSquare size={28} className="mx-auto mb-2 opacity-60" />
                <p className="font-bold text-xs">All Stock Levels Optimal</p>
                <p className="text-[11px] opacity-75 mt-0.5">No immediate replenishment needed.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Selling Products */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Star className="text-amber-500" size={18} /> Top Selling Flagships (by Revenue)
            </h3>
            <Link to="/products" className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline">
              View Catalog &rarr;
            </Link>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {stats.topSellingProducts?.length > 0 ? (
              stats.topSellingProducts.map((product, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {product.productName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{product.qtySold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {formatINR(product.revenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                No sales data available yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <SystemGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </motion.div>
  );
};

export default Dashboard;
