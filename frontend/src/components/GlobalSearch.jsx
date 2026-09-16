import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Users, ShoppingCart, Truck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], users: [], suppliers: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // It's handled in DashboardLayout if it wants to toggle, 
          // but we might need to export a context or just let DashboardLayout do the listening.
        }
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults({ products: [], users: [], suppliers: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ products: [], users: [], suppliers: [] });
      return;
    }
    
    const searchTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const [prodRes, userRes, supRes] = await Promise.all([
          api.get(`/products?search=${query}`),
          api.get(`/users`),
          api.get(`/suppliers`)
        ]);
        
        // Products usually have built-in search from backend if configured, else manual filter
        const matchedProducts = prodRes.data.data.filter(p => p.productName.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
        const matchedUsers = userRes.data.data.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
        const matchedSuppliers = supRes.data.data.filter(s => s.companyName.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
        
        setResults({ products: matchedProducts, users: matchedUsers, suppliers: matchedSuppliers });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <Search className="text-gray-400" size={20} />
              <input 
                ref={inputRef}
                type="text"
                placeholder="Search products, users, or suppliers..."
                className="w-full px-4 py-2 bg-transparent text-lg outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {loading && <div className="p-4 text-center text-gray-500">Searching...</div>}
              
              {!loading && query.length >= 2 && Object.values(results).every(arr => arr.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  <p>No results found for "{query}"</p>
                </div>
              )}

              {!loading && results.products.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</h3>
                  <div className="space-y-1">
                    {results.products.map(product => (
                      <button 
                        key={product._id}
                        onClick={() => handleSelect(`/products/${product._id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 text-left group transition-colors"
                      >
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-primary"><Package size={18} /></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{product.productName}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku} • Stock: {product.currentStock}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && results.users.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Users</h3>
                  <div className="space-y-1">
                    {results.users.map(user => (
                      <button 
                        key={user._id}
                        onClick={() => handleSelect(`/users`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 text-left group transition-colors"
                      >
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-green-500"><Users size={18} /></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email} • {user.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && results.suppliers.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Suppliers</h3>
                  <div className="space-y-1">
                    {results.suppliers.map(supplier => (
                      <button 
                        key={supplier._id}
                        onClick={() => handleSelect(`/suppliers`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 text-left group transition-colors"
                      >
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-purple-500"><Truck size={18} /></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{supplier.companyName}</p>
                          <p className="text-xs text-gray-500">{supplier.name} • {supplier.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 flex justify-between">
              <span>Use <kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">↑</kbd> <kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">↓</kbd> to navigate</span>
              <span><kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">ESC</kbd> to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
