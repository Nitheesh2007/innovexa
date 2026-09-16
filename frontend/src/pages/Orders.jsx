import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingCart, Plus, Calendar, DollarSign, Package, CheckCircle, Clock, MoreVertical, CreditCard, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import InvoiceModal from '../components/InvoiceModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' or 'list'
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await api.put(`/orders/${id}`, { orderStatus: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Group orders for Kanban
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending');
  const processingOrders = orders.filter(o => o.orderStatus === 'Processing');
  const completedOrders = orders.filter(o => o.orderStatus === 'Completed');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const OrderCard = ({ order }) => (
    <motion.div 
      variants={itemVariants}
      layout
      className="glass dark:bg-gray-800/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-l-4 group"
      style={{ borderLeftColor: order.orderStatus === 'Completed' ? '#22c55e' : order.orderStatus === 'Processing' ? '#3b82f6' : '#eab308' }}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">#{order.orderNumber}</span>
        <button className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={16} />
        </button>
      </div>
      <h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
        <UserIcon size={14} className="text-gray-400" />
        {order.customer?.name || 'Walk-in Customer'}
      </h4>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
      </div>
      <div className="flex justify-between items-end border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Value</p>
          <p className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
            <span className="text-green-500 mr-1">₹</span>{order.totalAmount?.toLocaleString()}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {order.orderStatus === 'Pending' && (
            <button onClick={() => updateOrderStatus(order._id, 'Processing')} className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors">
              Process
            </button>
          )}
          {order.orderStatus === 'Processing' && (
            <button onClick={() => updateOrderStatus(order._id, 'Completed')} className="bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors">
              Complete
            </button>
          )}
          {order.orderStatus === 'Completed' && (
            <button 
              onClick={() => setSelectedInvoiceOrder(order)} 
              className="bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              Invoice
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 flex items-center gap-2">
            Order Pipeline
          </h1>
          <p className="text-gray-500 mt-1">Track and fulfill customer sales orders in real-time</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('kanban')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'kanban' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Kanban Board
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Data Table
            </button>
          </div>
          
          <Link 
            to="/orders/new"
            className="bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} /> <span className="font-medium">New Order</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : activeTab === 'kanban' ? (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max h-full">
            {/* Pending Column */}
            <div className="w-80 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl p-4 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span> Pending
                </h3>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2.5 py-1 rounded-full">{pendingOrders.length}</span>
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 space-y-4 overflow-y-auto pr-2">
                {pendingOrders.map(order => <OrderCard key={order._id} order={order} />)}
                {pendingOrders.length === 0 && <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 text-sm font-medium">No pending orders</div>}
              </motion.div>
            </div>

            {/* Processing Column */}
            <div className="w-80 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl p-4 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span> Processing
                </h3>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2.5 py-1 rounded-full">{processingOrders.length}</span>
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 space-y-4 overflow-y-auto pr-2">
                {processingOrders.map(order => <OrderCard key={order._id} order={order} />)}
                {processingOrders.length === 0 && <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 text-sm font-medium">No orders in processing</div>}
              </motion.div>
            </div>

            {/* Completed Column */}
            <div className="w-80 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl p-4 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span> Completed
                </h3>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2.5 py-1 rounded-full">{completedOrders.length}</span>
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 space-y-4 overflow-y-auto pr-2">
                {completedOrders.map(order => <OrderCard key={order._id} order={order} />)}
                {completedOrders.length === 0 && <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 text-sm font-medium">No completed orders</div>}
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        /* List View Fallback */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass dark:bg-gray-800/80 rounded-2xl shadow-sm border border-transparent dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Order ID</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Customer</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Total Amount</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer group transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                      {order.customer?.name || 'Walk-in Customer'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      ₹{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        order.orderStatus === 'Completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' :
                        order.orderStatus === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30'
                      }`}>
                        {order.orderStatus === 'Completed' ? <CheckCircle size={14} /> : order.orderStatus === 'Processing' ? <Package size={14} /> : <Clock size={14} />}
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal 
        isOpen={!!selectedInvoiceOrder} 
        onClose={() => setSelectedInvoiceOrder(null)} 
        order={selectedInvoiceOrder} 
      />
    </div>
  );
};

export default Orders;
