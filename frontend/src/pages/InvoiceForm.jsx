import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const InvoiceForm = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('STOCK_OUT');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [formData, setFormData] = useState({
    partyId: '',
    paymentMethod: 'CASH',
    paidAmount: 0,
    notes: '',
    discountTotal: 0
  });

  const [items, setItems] = useState([
    { product: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, custRes, supRes] = await Promise.allSettled([
        api.get('/products'),
        api.get('/customers'),
        api.get('/suppliers')
      ]);
      if (prodRes.status === 'fulfilled' && prodRes.value?.data?.data) {
        setProducts(prodRes.value.data.data);
      }
      if (custRes.status === 'fulfilled' && custRes.value?.data?.data) {
        setCustomers(custRes.value.data.data);
      }
      if (supRes.status === 'fulfilled' && supRes.value?.data?.data) {
        setSuppliers(supRes.value.data.data);
      }
    } catch (err) {
      console.warn('Failed to load form data:', err);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        newItems[index].unitPrice = type === 'STOCK_OUT' ? selectedProduct.sellingPrice : selectedProduct.purchasePrice;
        newItems[index].taxRate = selectedProduct.taxRate || 0;
      }
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { product: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    
    items.forEach(item => {
      const itemSub = (item.quantity * item.unitPrice) - item.discount;
      const itemTax = (itemSub * item.taxRate) / 100;
      subtotal += itemSub;
      taxTotal += itemTax;
    });

    const grandTotal = subtotal - formData.discountTotal + taxTotal;
    return { subtotal, taxTotal, grandTotal };
  };

  const { subtotal, taxTotal, grandTotal } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.partyId) return toast.error('Please select a customer/supplier');
    if (items.some(i => !i.product || i.quantity <= 0)) return toast.error('Invalid items');

    const endpoint = type === 'STOCK_OUT' ? '/invoices/stock-out' : '/invoices/stock-in';
    const payload = {
      items,
      discountTotal: formData.discountTotal,
      paymentMethod: formData.paymentMethod,
      paidAmount: formData.paidAmount,
      notes: formData.notes,
      [type === 'STOCK_OUT' ? 'customer' : 'supplier']: formData.partyId
    };

    try {
      const toastId = toast.loading('Saving invoice...');
      await api.post(endpoint, payload);
      toast.success('Invoice Created Successfully', { id: toastId });
      navigate('/invoices');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 shadow-xl shadow-indigo-900/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invoice Type</label>
              <select 
                value={type} 
                onChange={(e) => { setType(e.target.value); setFormData({...formData, partyId: ''}); }}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white"
              >
                <option value="STOCK_OUT">Sales Invoice (Stock Out)</option>
                <option value="STOCK_IN">Purchase Invoice (Stock In)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {type === 'STOCK_OUT' ? 'Customer' : 'Supplier'}
              </label>
              <select 
                required
                value={formData.partyId}
                onChange={(e) => setFormData({...formData, partyId: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white"
              >
                <option value="">Select...</option>
                {type === 'STOCK_OUT' 
                  ? customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)
                  : suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName}</option>)
                }
              </select>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 shadow-xl shadow-indigo-900/5">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Items</h2>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                  <select 
                    required
                    value={item.product}
                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.productName} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                  <input 
                    type="number" min="1" required
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                  <input 
                    type="number" min="0" step="0.01" required
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tax %</label>
                  <input 
                    type="number" min="0" max="100"
                    value={item.taxRate}
                    onChange={(e) => handleItemChange(index, 'taxRate', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Discount</label>
                  <input 
                    type="number" min="0" step="0.01"
                    value={item.discount}
                    onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                  />
                </div>
                <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={addItem} className="mt-4 flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-sm">
            <Plus size={16} /> <span>Add Item</span>
          </button>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 shadow-xl shadow-indigo-900/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Discount</label>
                <input 
                  type="number" min="0" step="0.01"
                  value={formData.discountTotal}
                  onChange={(e) => setFormData({...formData, discountTotal: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <select 
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white"
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">CARD</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paid Amount Now</label>
                <input 
                  type="number" min="0" max={grandTotal} step="0.01"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({...formData, paidAmount: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/80 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col justify-center">
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Total Tax</span>
                  <span>₹{taxTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Additional Discount</span>
                  <span className="text-red-500">-₹{Number(formData.discountTotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white font-sans">Grand Total</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium text-gray-900 dark:text-white font-sans">Pending Balance</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">₹{Math.max(0, grandTotal - formData.paidAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/invoices')} className="px-6 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 font-medium">
            <Save size={20} />
            <span>Generate Invoice</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
