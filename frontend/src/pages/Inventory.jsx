import React, { useState, useEffect } from 'react';
import { inventoryService, productService, warehouseService } from '../services/apiServices';
import toast from 'react-hot-toast';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
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
        inventoryService.getHistory()
      ]);
      setProducts(pRes.data.data);
      setWarehouses(wRes.data.data);
      setHistory(hRes.data.data);
    } catch (error) {
      toast.error('Failed to load inventory data');
    }
  };

  const handleStockAction = async (action) => {
    if (!formData.productId || !formData.warehouseId || !formData.quantity) {
      return toast.error('Please fill required fields');
    }
    
    try {
      setLoading(true);
      if (action === 'in') {
        await inventoryService.stockIn(formData);
        toast.success('Stock In successful');
      } else {
        await inventoryService.stockOut(formData);
        toast.success('Stock Out successful');
      }
      setFormData({ productId: '', warehouseId: '', quantity: '', referenceNumber: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Stock ${action} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Inventory Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stock In / Out Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Quick Stock Action</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Product *</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none"
              value={formData.productId}
              onChange={e => setFormData({...formData, productId: e.target.value})}
            >
              <option value="">Select Product</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.productName} (Stock: {p.currentStock})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Warehouse *</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none"
              value={formData.warehouseId}
              onChange={e => setFormData({...formData, warehouseId: e.target.value})}
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantity *</label>
            <input 
              type="number" min="1" 
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none"
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reference Number</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none"
              value={formData.referenceNumber}
              onChange={e => setFormData({...formData, referenceNumber: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              disabled={loading}
              onClick={() => handleStockAction('in')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowUpCircle size={18} /> Stock In
            </button>
            <button 
              disabled={loading}
              onClick={() => handleStockAction('out')}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowDownCircle size={18} /> Stock Out
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
          <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-700 mb-4">Recent Transactions</h2>
          <div className="flex-1 overflow-y-auto max-h-96 pr-2 space-y-3">
            {history.slice(0, 10).map(t => (
              <div key={t._id} className="p-3 border rounded-lg dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <p className="font-medium text-sm">{t.product?.productName || 'Unknown Product'}</p>
                  <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()} | {t.user?.name}</p>
                </div>
                <div className={`font-bold flex items-center gap-1 ${t.transactionType.includes('In') ? 'text-green-500' : t.transactionType.includes('Out') ? 'text-red-500' : 'text-blue-500'}`}>
                  {t.transactionType.includes('In') ? '+' : t.transactionType.includes('Out') ? '-' : ''}{t.quantity}
                </div>
              </div>
            ))}
            {history.length === 0 && <p className="text-center text-gray-500 mt-8">No transactions yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
