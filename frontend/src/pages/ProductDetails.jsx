import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Package, Activity, RefreshCcw, AlertTriangle, ArrowLeft, TrendingUp, Hash, Edit3, CheckCircle, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stock Adjustment State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustData, setAdjustData] = useState({ newStockCount: 0, reason: '' });
  const [adjusting, setAdjusting] = useState(false);

  const fetchProductData = async () => {
    try {
      const [prodRes, transRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products/${id}/transactions`)
      ]);
      setProduct(prodRes.data.data);
      setTransactions(transRes.data.data);
      setAdjustData({ newStockCount: prodRes.data.data.currentStock, reason: 'Audit count update' });
    } catch (error) {
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (adjustData.newStockCount === product.currentStock) {
      toast.error('New stock count must be different from current stock');
      return;
    }
    
    setAdjusting(true);
    try {
      await api.post(`/products/${id}/adjust-stock`, adjustData);
      toast.success('Stock adjusted successfully');
      setShowAdjustModal(false);
      fetchProductData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!product) return <div className="text-center p-12 text-gray-500">Product not found</div>;

  const totalValue = product.currentStock * product.sellingPrice;
  const potentialProfit = (product.sellingPrice - product.purchasePrice) * product.currentStock;
  const margin = ((product.sellingPrice - product.purchasePrice) / product.sellingPrice) * 100;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/products" className="text-gray-500 hover:text-primary flex items-center gap-1 text-sm font-medium mb-2 transition-colors">
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            {product.productName}
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Hash size={14} /> SKU: {product.sku} | <Package size={14} /> {product.category?.name || 'Uncategorized'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to={`/products/edit/${product._id}`}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Edit3 size={16} /> Edit Details
          </Link>
          <button 
            onClick={() => setShowAdjustModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white rounded-xl hover:from-primary-600 hover:to-indigo-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2 font-bold"
          >
            <RefreshCcw size={16} /> Quick Adjust Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Stats Overview */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass dark:bg-gray-800/80 p-6 rounded-2xl shadow-sm border border-transparent dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Current Stock</p>
            <h3 className={`text-4xl font-black ${product.currentStock <= product.minimumStock ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {product.currentStock}
            </h3>
            <p className="text-sm text-gray-500 mt-2">Min threshold: {product.minimumStock}</p>
          </div>
          
          <div className="glass dark:bg-gray-800/80 p-6 rounded-2xl shadow-sm border border-transparent dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold border ${
              product.status === 'In Stock' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' :
              product.status === 'Low Stock' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50' :
              'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
            }`}>
              {product.status === 'In Stock' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              {product.status}
            </div>
          </div>

          <div className="glass dark:bg-gray-800/80 p-6 rounded-2xl shadow-sm border border-transparent dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Gross Margin</p>
            <h3 className="text-3xl font-black text-green-500 flex items-center gap-2">
              <TrendingUp size={24} /> {margin.toFixed(1)}%
            </h3>
          </div>
        </div>

        {/* Financial Analytics */}
        <div className="lg:col-span-1 glass dark:bg-gray-800/80 p-6 rounded-2xl shadow-sm border border-transparent dark:border-gray-700 bg-gradient-to-br from-indigo-50/50 to-white dark:from-gray-800 dark:to-gray-900">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="text-indigo-500" /> Financial Snapshot
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">Purchase Price</span>
              <span className="font-bold">₹{product.purchasePrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">Selling Price</span>
              <span className="font-bold">₹{product.sellingPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">Total Inventory Value</span>
              <span className="font-bold text-lg text-primary">₹{totalValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500">Potential Profit</span>
              <span className="font-bold text-green-500 text-lg">₹{potentialProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Transaction History Timeline */}
        <div className="lg:col-span-3 glass dark:bg-gray-800/80 p-6 rounded-2xl shadow-sm border border-transparent dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="text-primary" /> Stock History Timeline
          </h3>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8 relative z-10">No stock history available for this product.</p>
            ) : (
              transactions.map((tx, idx) => (
                <div key={tx._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                    tx.type === 'IN' ? 'bg-green-500 text-white' : 
                    tx.type === 'ADJUSTMENT' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {tx.type === 'IN' ? <Plus size={16} /> : tx.type === 'ADJUSTMENT' ? <RefreshCcw size={16} /> : <Minus size={16} />}
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {tx.type === 'IN' ? 'Stock Received' : tx.type === 'ADJUSTMENT' ? 'Manual Adjustment' : 'Stock Deducted'}
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          tx.type === 'IN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 
                          tx.type === 'ADJUSTMENT' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                        }`}>
                          {tx.type === 'IN' ? '+' : tx.type === 'ADJUSTMENT' ? '±' : '-'}{tx.quantity}
                        </span>
                      </div>
                      <time className="font-mono text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</time>
                    </div>
                    <p className="text-sm text-gray-500">{tx.reference || 'No reference provided'}</p>
                    {tx.performedBy && (
                      <p className="text-xs text-gray-400 mt-2">by {tx.performedBy.name}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {showAdjustModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-xl font-bold flex items-center gap-2"><RefreshCcw className="text-primary" /> Adjust Stock Count</h2>
                <button onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">✕</button>
              </div>
              <form onSubmit={handleAdjustStock} className="p-6 space-y-5">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Current System Stock:</strong> {product.currentStock} units
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Actual Stock Count (After Audit)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-lg font-bold"
                    value={adjustData.newStockCount} 
                    onChange={e => setAdjustData({...adjustData, newStockCount: parseInt(e.target.value) || 0})}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Difference: {adjustData.newStockCount - product.currentStock > 0 ? '+' : ''}{adjustData.newStockCount - product.currentStock} units
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Reason for Adjustment</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={adjustData.reason} 
                    onChange={e => setAdjustData({...adjustData, reason: e.target.value})}
                    placeholder="e.g., Found extra box during audit"
                  />
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                  <button type="button" onClick={() => setShowAdjustModal(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors">Cancel</button>
                  <button type="submit" disabled={adjusting} className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-600 font-bold shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2">
                    {adjusting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Confirm Adjustment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// CheckCircle icon is missing from import, let's add it manually in JSX if needed, oh wait I imported it from lucide-react. Let me double check imports.
// I didn't import CheckCircle. Ah, let me fix the import list above.
// Wait, I will use replace_file_content to fix the import if I notice any issues.

export default ProductDetails;
