import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, DollarSign, Activity, Info } from 'lucide-react';
import { dashboardService } from '../services/apiServices';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import SystemGuideModal from '../components/SystemGuideModal';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    inventoryValue: 0,
    recentActivity: [],
    categoryData: [],
    trendData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      }
    };
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Here is what's happening with your inventory today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsGuideOpen(true)}
            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:-translate-y-1 font-medium border border-indigo-200 dark:border-indigo-800/50"
          >
            <Info size={18} />
            <span className="hidden sm:inline">Module Guide</span>
          </button>
          <button className="bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-1">
            <Activity size={18} />
            <span className="hidden sm:inline">Generate Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="glass dark:bg-gray-800/80 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
              <Package size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Products</p>
              <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{stats.totalProducts}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass dark:bg-gray-800/80 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/40 rounded-xl text-red-600 dark:text-red-400">
              <AlertTriangle size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Low Stock Alerts</p>
              <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{stats.lowStock}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass dark:bg-gray-800/80 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 dark:bg-green-900/40 rounded-xl text-green-600 dark:text-green-400">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Inventory Value</p>
              <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">₹{stats.inventoryValue?.toLocaleString()}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Trend Chart */}
        <motion.div variants={itemVariants} className="glass dark:bg-gray-800/80 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
            <TrendingUp className="text-primary" /> Revenue Trend (7 Days)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution Chart */}
        <motion.div variants={itemVariants} className="glass dark:bg-gray-800/80 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
            <Activity className="text-primary" /> Category Distribution
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            {stats.categoryData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No category data available.</p>
            )}
          </div>
        </motion.div>

      </div>

      <motion.div variants={itemVariants} className="glass dark:bg-gray-800/80 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Activity className="text-primary" /> Recent Inventory Activity
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.recentActivity?.length > 0 ? (
              stats.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 hover:bg-white/50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                  <div className={`w-3 h-3 mt-1.5 rounded-full ${
                    activity.type === 'IN' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 
                    activity.type === 'ADJUSTMENT' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 
                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      <span className="font-bold">{activity.quantity}</span>x {activity.product?.productName || 'Unknown Product'}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        activity.type === 'IN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        activity.type === 'ADJUSTMENT' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {activity.type === 'IN' ? 'Restocked' : activity.type === 'ADJUSTMENT' ? 'Adjusted' : 'Sold/Deducted'}
                      </span>
                      <p className="text-xs text-gray-500 font-mono">{new Date(activity.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                No recent activity to display.
              </div>
            )}
          </div>
        </motion.div>
      
      <SystemGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </motion.div>
  );
};

export default Dashboard;
