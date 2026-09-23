import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { productService, categoryService } from '../services/apiServices';
import { 
  Plus, Edit, Trash2, Search, PackageSearch, LayoutGrid, List as ListIcon, 
  Filter, Download, ArrowUpDown, Barcode, RefreshCcw, Boxes, 
  AlertTriangle, CheckCircle, TrendingUp, X, ShoppingBag, Zap, ExternalLink, Globe
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getMatchingProductImage } from '../utils/productImageMatcher';

const Products = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Barcode Lookup Modal
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  // Quick Stock Adjust Modal
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [newStockInput, setNewStockInput] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Manual catalog audit');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // E-Commerce Market Benchmark Sync State
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingProductKey, setSyncingProductKey] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll().catch(() => ({ data: { data: [] } }))
      ]);
      setProducts(prodRes.data.data || []);
      
      // Combine categories from backend and from product objects
      const catMap = new Map();
      (catRes.data.data || []).forEach(c => {
        if (c && c._id) catMap.set(c._id, c);
      });
      (prodRes.data.data || []).forEach(p => {
        if (p.category && p.category._id && !catMap.has(p.category._id)) {
          catMap.set(p.category._id, p.category);
        }
      });
      setCategories(Array.from(catMap.values()));
    } catch {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        toast.success('Product deleted');
        setProducts(prev => prev.filter(p => p._id !== id));
        setSelectedProducts(prev => prev.filter(pId => pId !== id));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) {
      try {
        setLoading(true);
        if (productService.bulkDelete) {
          await productService.bulkDelete(selectedProducts);
        } else {
          await Promise.all(selectedProducts.map(id => productService.delete(id)));
        }
        toast.success(`Successfully deleted ${selectedProducts.length} products`);
        setSelectedProducts([]);
        fetchProducts();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete selected products');
        setLoading(false);
      }
    }
  };

  const handleBarcodeLookup = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    setBarcodeLoading(true);
    try {
      const res = await productService.getByBarcode(barcodeInput.trim());
      if (res.data.data) {
        setShowBarcodeModal(false);
        setBarcodeInput('');
        navigate(`/products/${res.data.data._id}`);
      } else {
        toast.error('No product found with this barcode');
      }
    } catch {
      toast.error('No product found with this barcode');
    } finally {
      setBarcodeLoading(false);
    }
  };

  const handleQuickAdjust = async (e) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    const count = parseInt(newStockInput, 10);
    if (isNaN(count) || count < 0) {
      toast.error('Please enter a valid non-negative stock count');
      return;
    }
    if (count === adjustingProduct.currentStock) {
      toast.error('New stock count is identical to current stock');
      return;
    }

    setIsAdjusting(true);
    try {
      const res = await productService.adjustStock(adjustingProduct._id, {
        newStockCount: count,
        reason: adjustReason.trim() || 'Manual catalog adjustment'
      });
      toast.success('Stock adjusted successfully');
      setProducts(prev => prev.map(p => p._id === adjustingProduct._id ? res.data.data : p));
      setAdjustingProduct(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleSyncAllMarket = async () => {
    if (!window.confirm('Synchronize all products with the lowest competitive benchmark prices from Amazon India and Flipkart?')) return;
    try {
      setIsSyncingAll(true);
      const res = await productService.syncAllMarketPrices();
      toast.success(res.data.message || 'All products synchronized with market benchmarks!');
      await fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to synchronize market prices');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleSyncSingleProductMarket = async (productId, platform) => {
    try {
      setSyncingProductKey(`${productId}-${platform}`);
      const res = await productService.syncMarketPrice(productId, platform);
      toast.success(res.data.message || 'Price synchronized with market benchmark!');
      await fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to synchronize market price');
    } finally {
      setSyncingProductKey(null);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValuation = 0;

    products.forEach(p => {
      const stock = Number(p.currentStock) || 0;
      const price = Number(p.sellingPrice) || 0;
      totalValuation += stock * price;

      if (p.status === 'In Stock') inStock++;
      else if (p.status === 'Low Stock') lowStock++;
      else if (p.status === 'Out of Stock') outOfStock++;
    });

    return { total, inStock, lowStock, outOfStock, totalValuation };
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return products
      .filter(p => {
        const matchesSearch = !term || 
          p.productName.toLowerCase().includes(term) || 
          (p.sku && p.sku.toLowerCase().includes(term)) ||
          (p.barcode && p.barcode.toLowerCase().includes(term)) ||
          (p.description && p.description.toLowerCase().includes(term));
        const matchesCategory = selectedCategory ? (p.category && p.category._id === selectedCategory) : true;
        const matchesStatus = statusFilter ? p.status === statusFilter : true;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name_asc': return a.productName.localeCompare(b.productName);
          case 'name_desc': return b.productName.localeCompare(a.productName);
          case 'price_asc': return (a.sellingPrice || 0) - (b.sellingPrice || 0);
          case 'price_desc': return (b.sellingPrice || 0) - (a.sellingPrice || 0);
          case 'stock_asc': return (a.currentStock || 0) - (b.currentStock || 0);
          case 'stock_desc': return (b.currentStock || 0) - (a.currentStock || 0);
          case 'oldest': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case 'newest':
          default:
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
      });
  }, [products, searchTerm, selectedCategory, statusFilter, sortBy]);

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  const exportCSV = () => {
    if (products.length === 0) {
      toast.error('No products to export');
      return;
    }
    const headers = ['SKU', 'Barcode', 'Product Name', 'Category', 'Purchase Price', 'Selling Price', 'Current Stock', 'Min Stock', 'Status'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => 
        `"${p.sku || ''}","${p.barcode || ''}","${p.productName.replace(/"/g, '""')}","${p.category?.name || 'Uncategorized'}","${p.purchasePrice || 0}","${p.sellingPrice || 0}","${p.currentStock || 0}","${p.minimumStock || 0}","${p.status || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `catalog_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded successfully');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Stock':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50';
      case 'Low Stock':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50';
      case 'Expired':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/50';
      case 'Expiring Soon':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/50';
      case 'Out of Stock':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 8 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary-700 to-indigo-600 dark:from-white dark:via-gray-100 dark:to-gray-400">
            Product Catalog
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Manage inventory items, SKUs, barcode tracking, and real-time stock levels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowMarketModal(true)}
            className="glass px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/30 text-amber-900 dark:text-amber-200 flex items-center gap-2 text-sm font-bold transition-all shadow-sm group"
            title="Amazon & Flipkart Market Price Comparison and Sync"
          >
            <ShoppingBag size={18} className="text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">E-Commerce Sync</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          <button
            onClick={() => setShowBarcodeModal(true)}
            className="glass px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            title="Scan or enter Barcode"
          >
            <Barcode size={18} className="text-primary" />
            <span className="hidden sm:inline">Barcode Lookup</span>
          </button>

          <button
            onClick={exportCSV}
            className="glass p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
            title="Export CSV"
          >
            <Download size={18} />
          </button>

          <AnimatePresence>
            {selectedProducts.length > 0 && currentUser?.role === 'admin' && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md text-sm font-medium"
              >
                <Trash2 size={16} />
                <span>Delete ({selectedProducts.length})</span>
              </motion.button>
            )}
          </AnimatePresence>

          <Link
            to="/products/new"
            className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-primary-500/20 text-sm font-semibold hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass dark:bg-gray-800/70 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
            <Boxes size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Total SKUs</p>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate">{stats.total}</h3>
          </div>
        </div>

        <div className="glass dark:bg-gray-800/70 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">In Stock</p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate">{stats.inStock}</h3>
          </div>
        </div>

        <div className="glass dark:bg-gray-800/70 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Low / Out</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 truncate">
              {stats.lowStock + stats.outOfStock}
            </h3>
          </div>
        </div>

        <div className="glass dark:bg-gray-800/70 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Valuation</p>
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white truncate">
              ₹{stats.totalValuation.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Search, Sort, Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, SKU, barcode, or description..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl text-sm">
            <ArrowUpDown size={14} className="text-gray-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none text-xs sm:text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              <option value="newest">Newest Added</option>
              <option value="name_asc">Name (A - Z)</option>
              <option value="name_desc">Name (Z - A)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="stock_asc">Stock (Low to High)</option>
              <option value="stock_desc">Stock (High to Low)</option>
            </select>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors flex items-center gap-2 ${
                selectedCategory || statusFilter 
                  ? 'bg-primary-50 text-primary-700 border-primary-300 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800' 
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Filter size={15} />
              <span>Filters</span>
              {(selectedCategory || statusFilter) && (
                <span className="w-2 h-2 rounded-full bg-primary-600"></span>
              )}
            </button>

            <AnimatePresence>
              {showFilterMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 z-50 origin-top-right"
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <Filter size={14} className="text-primary"/> Filter Products
                    </h3>
                    <button 
                      onClick={() => {
                        setSelectedCategory('');
                        setStatusFilter('');
                      }}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Category</label>
                      <select 
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 outline-none focus:border-primary text-xs sm:text-sm text-gray-900 dark:text-white"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Stock Status</label>
                      <select 
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 outline-none focus:border-primary text-xs sm:text-sm text-gray-900 dark:text-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">All Statuses</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Expiring Soon">Expiring Soon</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
              title="List View"
            >
              <ListIcon size={16} />
            </button>
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(selectedCategory || statusFilter || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 font-medium">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2.5 py-1 rounded-lg border border-primary-200">
              Query: "{searchTerm}"
              <button onClick={() => setSearchTerm('')}><X size={12} /></button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2.5 py-1 rounded-lg border border-primary-200">
              Category: {categories.find(c => c._id === selectedCategory)?.name || 'Selected'}
              <button onClick={() => setSelectedCategory('')}><X size={12} /></button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2.5 py-1 rounded-lg border border-primary-200">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('')}><X size={12} /></button>
            </span>
          )}
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory(''); setStatusFilter(''); }} 
            className="text-primary hover:underline font-semibold ml-1"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading catalog items...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <PackageSearch size={56} className="mb-3 opacity-40 text-primary" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No products found</h3>
          <p className="mt-1 text-center text-sm max-w-sm text-gray-500">
            {products.length === 0 
              ? "Your catalog is empty. Click 'Add Product' to get started."
              : "No items matched your current search or filter criteria. Try broadening your filters."}
          </p>
          {products.length === 0 && (
            <Link 
              to="/products/new" 
              className="mt-4 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl shadow hover:bg-primary-600 transition-colors"
            >
              Add First Product
            </Link>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div 
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-4 w-10">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-5 py-4">Product</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Price</th>
                      <th className="px-5 py-4">Stock Level</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="show" 
                    className="divide-y divide-gray-100 dark:divide-gray-700/60"
                  >
                    {filteredProducts.map(product => {
                      const isSelected = selectedProducts.includes(product._id);
                      const isLowStock = product.currentStock <= product.minimumStock;
                      const fallbackImg = getMatchingProductImage(product.productName, product.category?.name);

                      return (
                        <motion.tr 
                          variants={itemVariants}
                          key={product._id} 
                          className={`transition-colors group cursor-pointer ${
                            isSelected 
                              ? 'bg-primary-50/40 dark:bg-primary-950/20' 
                              : 'hover:bg-gray-50/80 dark:hover:bg-gray-750/50'
                          }`}
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                              checked={isSelected}
                              onChange={(e) => toggleSelect(product._id, e)}
                            />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                                <img 
                                  src={product.productImage || fallbackImg} 
                                  alt={product.productName} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }} 
                                />
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                                  {product.productName}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-0.5">
                                  <span>{product.sku}</span>
                                  {product.barcode && (
                                    <span className="text-[11px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                      {product.barcode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                            <span className="bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg text-xs font-medium">
                              {product.category?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            ₹{product.sellingPrice?.toLocaleString('en-IN')}
                            <p className="text-[11px] font-normal text-gray-400">Cost: ₹{product.purchasePrice?.toLocaleString('en-IN')}</p>
                            {product.marketData && (
                              <div className="flex flex-col gap-0.5 mt-1 text-[10px]">
                                {product.marketData.amazon && (
                                  <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-medium">
                                    <span className="font-bold text-[9px] px-1 rounded bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-850">Amz</span>
                                    ₹{product.marketData.amazon.price?.toLocaleString('en-IN')}
                                  </span>
                                )}
                                {product.marketData.flipkart && (
                                  <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-medium">
                                    <span className="font-bold text-[9px] px-1 rounded bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-850">FK</span>
                                    ₹{product.marketData.flipkart.price?.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                                  {product.currentStock}
                                </span>
                                <span className="text-xs text-gray-400">/ min {product.minimumStock}</span>
                              </div>
                              <div className="w-24 bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    product.currentStock <= 0 ? 'bg-rose-500' :
                                    isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`} 
                                  style={{ 
                                    width: `${Math.min(100, Math.max(8, (product.currentStock / ((product.maximumStock || product.minimumStock * 3) || 10)) * 100))}%` 
                                  }} 
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${getStatusBadgeClass(product.status)}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {product.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => {
                                  setAdjustingProduct(product);
                                  setNewStockInput(product.currentStock);
                                  setAdjustReason('Manual catalog adjustment');
                                }}
                                title="Quick Adjust Stock"
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                              >
                                <RefreshCcw size={15} />
                              </button>
                              <Link 
                                to={`/products/edit/${product._id}`} 
                                title="Edit Product"
                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              >
                                <Edit size={15} />
                              </Link>
                              {currentUser?.role === 'admin' && (
                                <button 
                                  onClick={() => handleDelete(product._id)} 
                                  title="Delete Product"
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="grid-view"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredProducts.map(product => {
                const isLowStock = product.currentStock <= product.minimumStock;
                const fallbackImg = getMatchingProductImage(product.productName, product.category?.name);

                return (
                  <motion.div 
                    key={product._id} 
                    variants={itemVariants}
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group border border-gray-200 dark:border-gray-700 relative overflow-hidden cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar with Thumbnail and Quick Actions */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                          <img 
                            src={product.productImage || fallbackImg} 
                            alt={product.productName} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }} 
                          />
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => {
                              setAdjustingProduct(product);
                              setNewStockInput(product.currentStock);
                              setAdjustReason('Manual catalog adjustment');
                            }}
                            title="Quick Adjust Stock"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                          >
                            <RefreshCcw size={14} />
                          </button>
                          <Link 
                            to={`/products/edit/${product._id}`} 
                            title="Edit"
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Edit size={14} />
                          </Link>
                          {currentUser?.role === 'admin' && (
                            <button 
                              onClick={() => handleDelete(product._id)} 
                              title="Delete"
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors" title={product.productName}>
                        {product.productName}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{product.sku}</p>

                      <div className="grid grid-cols-2 gap-2 my-3">
                        <div className="bg-gray-50 dark:bg-gray-900/60 p-2 rounded-xl border border-gray-100 dark:border-gray-700/60">
                          <p className="text-[10px] uppercase font-bold text-gray-400">Price</p>
                          <p className="font-bold text-gray-900 dark:text-white truncate">₹{product.sellingPrice?.toLocaleString('en-IN')}</p>
                          {product.marketData?.amazon && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate mt-0.5">
                              Amz: ₹{product.marketData.amazon.price?.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/60 p-2 rounded-xl border border-gray-100 dark:border-gray-700/60">
                          <p className="text-[10px] uppercase font-bold text-gray-400">Stock</p>
                          <p className={`font-bold truncate ${isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {product.currentStock} <span className="text-[10px] font-normal text-gray-400">units</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 text-xs">
                      <span className="text-gray-500 bg-gray-100 dark:bg-gray-700/80 px-2 py-0.5 rounded-md font-medium truncate max-w-[120px]">
                        {product.category?.name || 'Category'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${getStatusBadgeClass(product.status)}`}>
                        {product.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Barcode Lookup Modal */}
      <AnimatePresence>
        {showBarcodeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Barcode className="text-primary" /> Barcode Quick Lookup
                </h3>
                <button onClick={() => setShowBarcodeModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBarcodeLookup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase">
                    Scan or Enter Barcode
                  </label>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="e.g. 8901234567890" 
                    value={barcodeInput} 
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none font-mono text-base"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    USB barcode scanners enter the number and submit automatically.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowBarcodeModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={barcodeLoading || !barcodeInput.trim()}
                    className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2 shadow"
                  >
                    {barcodeLoading ? 'Searching...' : 'Find Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Stock Adjustment Modal */}
      <AnimatePresence>
        {adjustingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <RefreshCcw className="text-primary" /> Adjust Product Stock
                </h3>
                <button onClick={() => setAdjustingProduct(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{adjustingProduct.productName}</p>
                <p className="text-xs text-gray-400 font-mono">SKU: {adjustingProduct.sku}</p>
              </div>

              <div className="bg-primary-50 dark:bg-primary-950/30 p-3 rounded-xl border border-primary-100 dark:border-primary-900/50 text-xs text-primary-800 dark:text-primary-300">
                Current Registered Stock: <strong>{adjustingProduct.currentStock} units</strong>
              </div>

              <form onSubmit={handleQuickAdjust} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase">
                    New Actual Physical Count
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    value={newStockInput}
                    onChange={(e) => setNewStockInput(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-lg font-bold"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Difference: {parseInt(newStockInput || 0, 10) - adjustingProduct.currentStock >= 0 ? '+' : ''}
                    {parseInt(newStockInput || 0, 10) - adjustingProduct.currentStock} units
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase">
                    Reason for Adjustment
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Physical inventory audit"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setAdjustingProduct(null)}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isAdjusting}
                    className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 shadow"
                  >
                    {isAdjusting ? 'Updating...' : 'Save Adjustment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* E-Commerce Market Price Intelligence & Auto-Sync Modal */}
      <AnimatePresence>
        {showMarketModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-6 max-h-[90vh] flex flex-col my-auto"
            >
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">
                        E-Commerce Live Market Price Intelligence
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Amazon & Flipkart
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Benchmark catalog prices against real-time Indian e-commerce listings and sync with 1-click.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleSyncAllMarket}
                    disabled={isSyncingAll}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <Zap size={15} />
                    {isSyncingAll ? 'Syncing Catalog...' : 'Auto-Sync All to Lowest Market Price'}
                  </button>

                  <button 
                    onClick={() => setShowMarketModal(false)} 
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Products Table with Market Benchmarks */}
              <div className="overflow-x-auto overflow-y-auto flex-1 rounded-2xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3.5">Product</th>
                      <th className="px-4 py-3.5">StockFlow Price</th>
                      <th className="px-4 py-3.5">Amazon India</th>
                      <th className="px-4 py-3.5">Flipkart</th>
                      <th className="px-4 py-3.5 text-right">Market Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {products.map(p => {
                      const market = p.marketData;
                      const amz = market?.amazon;
                      const fk = market?.flipkart;
                      const lowestMarket = Math.min(amz?.price || Infinity, fk?.price || Infinity);
                      const isCompetitive = lowestMarket !== Infinity ? p.sellingPrice <= lowestMarket : true;
                      const fallbackImg = getMatchingProductImage(p.productName, p.category?.name);

                      return (
                        <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                                <img 
                                  src={p.productImage || fallbackImg} 
                                  alt={p.productName} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }} 
                                />
                              </div>
                              <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                                <p className="font-bold text-gray-900 dark:text-white truncate">{p.productName}</p>
                                <p className="text-[11px] font-mono text-gray-400">{p.sku}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-black text-gray-900 dark:text-white">
                              ₹{p.sellingPrice?.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px]">
                              {isCompetitive ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Competitive ✓</span>
                              ) : (
                                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                  +₹{(p.sellingPrice - lowestMarket).toLocaleString('en-IN')} above market
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            {amz ? (
                              <div>
                                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                                  <span>₹{amz.price?.toLocaleString('en-IN')}</span>
                                  <a href={amz.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-amber-500" title="Open on Amazon">
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                                <div className="text-[11px] text-gray-400">
                                  ⭐ {amz.rating} ({amz.reviewsCount?.toLocaleString('en-IN')})
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">N/A</span>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            {fk ? (
                              <div>
                                <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                                  <span>₹{fk.price?.toLocaleString('en-IN')}</span>
                                  <a href={fk.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500" title="Open on Flipkart">
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                                <div className="text-[11px] text-gray-400">
                                  ⭐ {fk.rating} ({fk.reviewsCount?.toLocaleString('en-IN')})
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">N/A</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {amz && p.sellingPrice !== amz.price && (
                                <button
                                  onClick={() => handleSyncSingleProductMarket(p._id, 'amazon')}
                                  disabled={syncingProductKey !== null}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                                  title="Match Amazon Price"
                                >
                                  {syncingProductKey === `${p._id}-amazon` ? '...' : 'Match Amz'}
                                </button>
                              )}
                              {fk && p.sellingPrice !== fk.price && (
                                <button
                                  onClick={() => handleSyncSingleProductMarket(p._id, 'flipkart')}
                                  disabled={syncingProductKey !== null}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                  title="Match Flipkart Price"
                                >
                                  {syncingProductKey === `${p._id}-flipkart` ? '...' : 'Match FK'}
                                </button>
                              )}
                              {lowestMarket !== Infinity && p.sellingPrice !== lowestMarket && (
                                <button
                                  onClick={() => handleSyncSingleProductMarket(p._id, 'lowest')}
                                  disabled={syncingProductKey !== null}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                                  title="Match Lowest Price"
                                >
                                  {syncingProductKey === `${p._id}-lowest` ? '...' : 'Match Lowest'}
                                </button>
                              )}
                              {lowestMarket !== Infinity && p.sellingPrice <= lowestMarket && (
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-1">
                                  ✓ Synced
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>All benchmarks strictly in Indian Rupee (₹). Data synchronized with Amazon.in and Flipkart.com.</span>
                <button
                  onClick={() => setShowMarketModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
