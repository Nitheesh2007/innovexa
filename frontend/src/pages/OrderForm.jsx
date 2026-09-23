import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingCart, Plus, Minus, Search, PackageSearch, Trash2, CheckCircle, ArrowLeft, UserPlus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const OrderForm = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    // Fetch products and customers
    const fetchData = async () => {
      try {
        const [prodRes, custRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers')
        ]);
        setProducts(prodRes.data.data.filter(p => p.currentStock > 0)); // Only show in-stock items
        setCustomers(custRes.data.data);
        
        // Auto-select first customer if available
        if (custRes.data.data.length > 0) {
          setSelectedCustomer(custRes.data.data[0]._id);
        }
      } catch (error) {
        toast.error('Failed to load products or customers');
      }
    };
    fetchData();
  }, []);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        toast.error('Cannot exceed available stock');
        return;
      }
      setCart(cart.map(item => 
        item.product._id === product._id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, { 
        product: product, 
        quantity: 1, 
        price: product.sellingPrice,
        total: product.sellingPrice
      }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product._id === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.product.currentStock) {
          toast.error('Cannot exceed available stock');
          return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const handleSubmitOrder = async () => {
    if (!selectedCustomer) {
      return toast.error('Please select a customer');
    }
    if (cart.length === 0) {
      return toast.error('Cart is empty');
    }

    setLoading(true);
    try {
      const payload = {
        customer: selectedCustomer,
        products: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        totalAmount: cartTotal,
        paymentStatus: 'Pending',
        orderStatus: 'Pending'
      };

      await api.post('/orders', payload);
      toast.success('Order created successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) {
      return toast.error('Name and Phone are required');
    }
    setLoading(true);
    try {
      const res = await api.post('/customers', newCustomer);
      const created = res.data.data;
      setCustomers([...customers, created]);
      setSelectedCustomer(created._id);
      setShowCustomerModal(false);
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
      toast.success('Customer created successfully');
    } catch (error) {
      toast.error('Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <Link to="/orders" className="text-gray-500 hover:text-primary flex items-center gap-1 text-sm font-medium mb-2 transition-colors">
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Create Point of Sale Order
          </h1>
          <p className="text-gray-500 mt-1">Select items to generate a new order.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Product Catalog Side */}
        <div className="lg:col-span-2 glass dark:bg-gray-800/80 rounded-2xl shadow-sm p-6 flex flex-col h-full border border-gray-100 dark:border-gray-700">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <PackageSearch size={48} className="mb-4 opacity-50" />
                <p>No products found or in stock.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div key={product._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all group flex flex-col">
                    {product.productImage && (
                      <div className="w-full h-32 mb-3 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <img src={product.productImage} alt={product.productName} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?q=80&w=400&auto=format&fit=crop'; }} />
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1" title={product.productName}>{product.productName}</h3>
                    <p className="text-xs text-gray-500 font-mono mb-2">{product.sku}</p>
                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="font-bold text-lg text-primary">₹{product.sellingPrice?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{product.currentStock} in stock</p>
                      </div>
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-primary-100 text-primary-700 hover:bg-primary-600 hover:text-white dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary dark:hover:text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Side */}
        <div className="glass dark:bg-gray-800/80 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none p-6 flex flex-col h-full border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white pb-4 border-b border-gray-200 dark:border-gray-700">
            <ShoppingCart size={24} className="text-primary" />
            <h2 className="text-xl font-bold">Current Cart</h2>
            <span className="ml-auto bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">{cart.length} items</span>
          </div>

          <div className="mb-6 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Customer</label>
              <button 
                onClick={() => setShowCustomerModal(true)}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:text-primary-600 transition-colors"
              >
                <UserPlus size={14} /> Add New
              </button>
            </div>
            <select 
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-primary text-sm transition-colors"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">-- Choose Customer --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <ShoppingCart size={48} className="mb-4 opacity-30" />
                <p>Your cart is empty.</p>
                <p>Add items from the catalog.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product._id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[180px]">{item.product.productName}</h4>
                      <p className="text-xs text-primary font-bold">₹{item.price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                      <button onClick={() => updateQuantity(item.product._id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">₹{item.total.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-medium">Grand Total</span>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center">
                <span className="text-primary mr-1">₹</span>
                {cartTotal.toLocaleString()}
              </span>
            </div>
            
            <button 
              onClick={handleSubmitOrder}
              disabled={cart.length === 0 || loading || !selectedCustomer}
              className="w-full bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-primary-500/30 hover:-translate-y-1"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle size={20} /> Submit Complete Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Create Customer Modal */}
      <AnimatePresence>
        {showCustomerModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="font-bold text-lg flex items-center gap-2"><UserPlus size={20} className="text-primary"/> New Customer</h3>
                <button onClick={() => setShowCustomerModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input type="text" required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary transition-colors"
                    value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input type="text" required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary transition-colors"
                    value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input type="email" className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary transition-colors"
                    value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Address</label>
                  <textarea rows="2" className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary transition-colors resize-none"
                    value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}></textarea>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowCustomerModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white transition-colors font-medium shadow-lg shadow-primary/30 flex items-center justify-center">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Create Customer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderForm;
