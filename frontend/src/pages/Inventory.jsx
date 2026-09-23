import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { productService, warehouseService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PackageOpen, Trash2, Search, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const TRANSACTION_TYPES = [
  'STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'TRANSFER', 
  'CUSTOMER_RETURN', 'SUPPLIER_RETURN', 'DAMAGE', 'LOSS', 'EXPIRY', 'CORRECTION'
];

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    toWarehouseId: '',
    transactionType: 'STOCK_IN',
    quantity: '',
    referenceNumber: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, wRes, hRes] = await Promise.all([
        productService.getAll(),
        warehouseService.getAll(),
        api.get('/inventory/history')
      ]);
      setProducts(pRes.data.data);
      setWarehouses(wRes.data.data);
      setHistory(hRes.data.data);
    } catch (error) {
      toast.error('Failed to load inventory data');
    }
  };

  const handleRecordTransaction = async () => {
    if (!formData.productId || !formData.warehouseId || !formData.quantity || !formData.transactionType) {
      return toast.error('Please fill required fields');
    }
    
    if (formData.transactionType === 'TRANSFER' && !formData.toWarehouseId) {
      return toast.error('Please select destination warehouse for transfer');
    }
    
    if (formData.transactionType === 'TRANSFER' && formData.warehouseId === formData.toWarehouseId) {
      return toast.error('Source and Destination warehouse cannot be the same');
    }
    
    try {
      setLoading(true);
      await api.post('/inventory/record', formData);
      toast.success('Transaction recorded successfully');
      
      setFormData({ 
        productId: '', warehouseId: '', toWarehouseId: '', 
        transactionType: 'STOCK_IN', quantity: '', referenceNumber: '', notes: '' 
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction? This will reverse the stock changes.')) return;
    try {
      setLoading(true);
      await api.delete(`/inventory/history/${id}`);
      toast.success('Transaction deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(t => {
    const matchesSearch = 
      (t.referenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = typeFilter ? t.transactionType === typeFilter : true;
    const matchesProduct = productFilter ? t.product?._id === productFilter : true;
    
    let matchesDate = true;
    if (dateFilter) {
      const tDate = new Date(t.createdAt).toISOString().split('T')[0];
      matchesDate = tDate === dateFilter;
    }

    return matchesSearch && matchesType && matchesProduct && matchesDate;
  });

  const exportCSV = () => {
    if (filteredHistory.length === 0) return;
    const headers = ['Date', 'Type', 'Product', 'Qty', 'Prev Stock', 'New Stock', 'User', 'Reference', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(t => 
        `"${new Date(t.createdAt).toLocaleString()}","${t.transactionType}","${t.product?.productName}","${t.quantity}","${t.previousStock}","${t.newStock}","${t.user?.name}","${t.referenceNumber || ''}","${t.notes || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Ledger Exported');
  };

  const getTransactionColor = (type) => {
    const adds = ['STOCK_IN', 'CUSTOMER_RETURN', 'Stock In', 'Return'];
    const subs = ['STOCK_OUT', 'SUPPLIER_RETURN', 'DAMAGE', 'LOSS', 'EXPIRY', 'Stock Out'];
    
    if (adds.includes(type)) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800/30 dark:text-green-400';
    if (subs.includes(type)) return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800/30 dark:text-red-400';
    return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/30 dark:text-blue-400';
  };

  const getQtyPrefix = (type) => {
    const adds = ['STOCK_IN', 'CUSTOMER_RETURN', 'Stock In', 'Return'];
    const subs = ['STOCK_OUT', 'SUPPLIER_RETURN', 'DAMAGE', 'LOSS', 'EXPIRY', 'Stock Out'];
    if (adds.includes(type)) return '+';
    if (subs.includes(type)) return '-';
    return '';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 flex items-center gap-2">
            <PackageOpen className="text-indigo-600" /> Inventory Ledger
          </h1>
          <p className="text-gray-500 mt-1">Track and manage complete inventory lifecycles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Record Transaction Form */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4 h-fit">
          <h2 className="text-lg font-bold border-b border-gray-100 dark:border-gray-700 pb-2">Record Transaction</h2>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Transaction Type *</label>
            <select 
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 outline-none text-sm font-medium"
              value={formData.transactionType}
              onChange={e => setFormData({...formData, transactionType: e.target.value})}
            >
              {TRANSACTION_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product *</label>
            <select 
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 outline-none text-sm"
              value={formData.productId}
              onChange={e => setFormData({...formData, productId: e.target.value})}
            >
              <option value="">Select Product</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.productName} (Stock: {p.currentStock})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Source Warehouse *</label>
            <select 
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 outline-none text-sm"
              value={formData.warehouseId}
              onChange={e => setFormData({...formData, warehouseId: e.target.value})}
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>

          {formData.transactionType === 'TRANSFER' && (
            <div>
              <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Destination Warehouse *</label>
              <select 
                className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 outline-none text-sm"
                value={formData.toWarehouseId}
                onChange={e => setFormData({...formData, toWarehouseId: e.target.value})}
              >
                <option value="">Select Destination</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity *</label>
              <input 
                type="number" min="1" 
                placeholder="Qty"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 outline-none text-sm"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reference</label>
              <input 
                type="text" 
                placeholder="Ref No."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 outline-none text-sm"
                value={formData.referenceNumber}
                onChange={e => setFormData({...formData, referenceNumber: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes / Reason</label>
            <input 
              type="text" 
              placeholder="Reason for adjustment..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 outline-none text-sm"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            onClick={handleRecordTransaction}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition-all shadow-md mt-2"
          >
            {loading ? 'Recording...' : 'Record Transaction'}
          </button>
        </div>

        {/* Ledger Table */}
        <div className="lg:col-span-3 flex flex-col h-full space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search Ref / Notes</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-sm"
                  placeholder="Search..."
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product</label>
              <select 
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-sm max-w-[150px]"
              >
                <option value="">All Products</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.productName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-sm"
              >
                <option value="">All Types</option>
                {TRANSACTION_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <button onClick={exportCSV} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" title="Export CSV">
              <Download size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex-1">
            <div className="overflow-x-auto h-[600px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date & User</th>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Transaction Type</th>
                    <th className="px-4 py-3 font-semibold">Qty</th>
                    <th className="px-4 py-3 font-semibold">Ref & Notes</th>
                    {user?.role === 'admin' && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredHistory.map((t, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 > 0.5 ? 0 : idx * 0.02 }}
                      key={t._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{new Date(t.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {t.user?.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900 dark:text-white">{t.product?.productName || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">Warehouse: {t.warehouse?.name || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider ${getTransactionColor(t.transactionType)}`}>
                          {t.transactionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${
                            getQtyPrefix(t.transactionType) === '+' ? 'text-green-600' : 
                            getQtyPrefix(t.transactionType) === '-' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {getQtyPrefix(t.transactionType)}{t.quantity}
                          </span>
                          <span className="text-xs text-gray-400">({t.previousStock} → {t.newStock})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-xs text-gray-600 dark:text-gray-300">
                        {t.referenceNumber && <div className="font-mono text-[10px] text-gray-400">Ref: {t.referenceNumber}</div>}
                        {t.notes && <div title={t.notes}>{t.notes}</div>}
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteTransaction(t._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete & Reverse">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-500">
                        No transactions found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
