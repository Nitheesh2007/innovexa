import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { activityService } from '../services/apiServices';
import { Shield, Clock, Calendar, User, Activity, AlertCircle, FileText, CheckCircle, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('today');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await activityService.getLogs(range);
      setLogs(res.data.data);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [range]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'UPDATE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'LOGIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="text-primary" size={32} /> System Audit Logs
          </h1>
          <p className="text-gray-500 mt-1">Track every action taken across the entire platform.</p>
        </div>
        
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <select 
              className="appearance-none pl-10 pr-8 py-2.5 glass dark:bg-gray-800/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer border border-gray-200 dark:border-gray-700"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="all">All Time</option>
            </select>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={16} />
          </div>
          <button 
            onClick={fetchLogs}
            className="p-2.5 glass rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-700 dark:text-gray-300"
            title="Refresh Logs"
          >
            <Clock size={18} />
          </button>
        </div>
      </div>

      <div className="glass dark:bg-gray-800/80 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-primary">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-sm font-bold">Scanning secure logs...</p>
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
            <Search size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Activities Found</h3>
            <p>No actions match the selected time range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Module</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                {logs.map((log) => (
                  <motion.tr 
                    variants={itemVariants}
                    key={log._id} 
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary flex items-center justify-center">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {log.user ? log.user.name : 'System / Guest'}
                          </p>
                          {log.user && (
                            <p className="text-xs text-gray-500">{log.user.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {log.entity}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-700 dark:text-gray-300 max-w-md truncate" title={log.details}>
                        {log.details}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1 truncate max-w-md" title={log.endpoint}>
                        {log.method} {log.endpoint}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {log.status >= 200 && log.status < 300 ? (
                        <div className="inline-flex items-center gap-1 text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md text-xs font-bold">
                          <CheckCircle size={12} /> Success
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md text-xs font-bold">
                          <AlertCircle size={12} /> Failed ({log.status})
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
