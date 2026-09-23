import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/apiServices';
import { 
  Package, Activity, RefreshCcw, AlertTriangle, ArrowLeft, TrendingUp, 
  Hash, Edit3, CheckCircle, Minus, Plus, Info, Calendar, Warehouse, 
  Truck, Barcode, Clock, ExternalLink, ShoppingBag, Zap, Award, Star, ArrowUpRight, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getMatchingProductImage } from '../utils/productImageMatcher';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingPlatform, setSyncingPlatform] = useState(null);
  
  // Stock Adjustment State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustData, setAdjustData] = useState({ newStockCount: 0, reason: '' });
  const [adjusting, setAdjusting] = useState(false);

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, transRes] = await Promise.all([
        productService.getById(id),
        productService.getTransactions(id).catch(() => ({ data: { data: [] } }))
      ]);
      setProduct(prodRes.data.data);
      setTransactions(transRes.data.data || []);
      setAdjustData({ 
        newStockCount: prodRes.data.data?.currentStock ?? 0, 
        reason: 'Physical inventory count audit' 
      });
    } catch {
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (adjustData.newStockCount === product.currentStock) {
      toast.error('New stock count must be different from current stock');
      return;
    }
    
    setAdjusting(true);
    try {
      await productService.adjustStock(id, adjustData);
      toast.success('Stock adjusted successfully');
      setShowAdjustModal(false);
      fetchProductData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  const handleSyncPrice = async (platform) => {
    try {
      setSyncingPlatform(platform);
      const res = await productService.syncMarketPrice(id, platform);
      toast.success(res.data.message || 'Price synchronized with market benchmark!');
      await fetchProductData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to synchronize market price');
    } finally {
      setSyncingPlatform(null);
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20 text-gray-500">
      <p className="text-lg font-bold">Product not found</p>
      <Link to="/products" className="text-primary hover:underline text-sm mt-2 inline-block">
        Return to Catalog
      </Link>
    </div>
  );

  const totalValue = (product.currentStock || 0) * (product.sellingPrice || 0);
  const unitProfit = (product.sellingPrice || 0) - (product.purchasePrice || 0);
  const potentialProfit = unitProfit * (product.currentStock || 0);
  const margin = product.sellingPrice > 0 ? ((unitProfit / product.sellingPrice) * 100) : 0;
  const fallbackImg = getMatchingProductImage(product.productName, product.category?.name);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/products" className="text-gray-500 hover:text-primary flex items-center gap-1.5 text-sm font-medium mb-2 transition-colors">
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            {product.productName}
          </h1>
          <div className="text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <span className="flex items-center gap-1 font-mono"><Hash size={14} /> SKU: {product.sku}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Package size={14} /> {product.category?.name || 'Uncategorized'}</span>
            {product.barcode && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono"><Barcode size={14} /> {product.barcode}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to={`/products/edit/${product._id}`}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium text-sm"
          >
            <Edit3 size={15} /> Edit Details
          </Link>
          <button 
            onClick={() => setShowAdjustModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl hover:from-primary-700 hover:to-indigo-700 transition-all shadow-md shadow-primary-500/25 flex items-center gap-2 font-bold text-sm"
          >
            <RefreshCcw size={15} /> Quick Adjust Stock
          </button>
        </div>
      </div>

      {/* Expiry / Warning Banner if applicable */}
      {(product.status === 'Expired' || product.status === 'Expiring Soon') && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          product.status === 'Expired' 
            ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300'
            : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300'
        }`}>
          <AlertTriangle size={22} className="shrink-0" />
          <div>
            <p className="font-bold text-sm">Attention: Product {product.status}</p>
            <p className="text-xs mt-0.5">
              Expiration date: {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}. Take appropriate action for inventory clearance or stock replacement.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Stats Overview */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Stock</p>
              <h3 className={`text-4xl font-black ${product.currentStock <= product.minimumStock ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                {product.currentStock}
              </h3>
              <p className="text-xs text-gray-400 mt-2">Alert threshold: {product.minimumStock} units</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Inventory Status</p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm border">
                {product.status === 'In Stock' ? (
                  <span className="text-emerald-600 flex items-center gap-1.5"><CheckCircle size={16} /> In Stock</span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1.5"><AlertTriangle size={16} /> {product.status}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Auto-evaluated</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gross Margin</p>
              <h3 className="text-3xl font-black text-emerald-600 flex items-center gap-2">
                <TrendingUp size={24} /> {margin.toFixed(1)}%
              </h3>
              <p className="text-xs text-gray-400 mt-2">₹{unitProfit.toFixed(2)} profit / unit</p>
            </div>
          </div>
          
          {/* Product Image & Description */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-base">
              <Info className="text-primary" size={18} /> Product Presentation & Description
            </h3>
            <div className="flex flex-col sm:flex-row gap-6 flex-1">
              <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700 shadow-inner bg-gray-50 dark:bg-gray-900">
                <img 
                  src={product.productImage || fallbackImg} 
                  alt={product.productName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackImg;
                  }}
                />
              </div>
              <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex-1">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p className="italic text-gray-400">
                    No detailed description provided for this product yet. Click 'Edit Details' to specify features, dimensions, or technical specifications.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Logistics Info Card */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="text-primary" size={18} /> Financial Snapshot
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">Cost (Purchase Price)</span>
                <span className="font-bold">₹{product.purchasePrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">Retail (Selling Price)</span>
                <span className="font-bold">₹{product.sellingPrice?.toLocaleString()}</span>
              </div>
              {product.taxRate > 0 && (
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">Applicable Tax</span>
                  <span className="font-bold">{product.taxRate}%</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">Total Inventory Valuation</span>
                <span className="font-bold text-primary text-base">₹{totalValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500">Projected Gross Profit</span>
                <span className="font-bold text-emerald-600 text-base">₹{potentialProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Warehouse className="text-primary" size={18} /> Logistics & Supply
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 pb-2.5 border-b border-gray-100 dark:border-gray-700">
                <Warehouse size={15} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Warehouse</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {product.warehouse ? product.warehouse.name : 'Unassigned'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 pb-2.5 border-b border-gray-100 dark:border-gray-700">
                <Truck size={15} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Supplier</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {product.supplier ? product.supplier.name : 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={15} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Manufacturing / Expiry</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {product.manufacturingDate ? new Date(product.manufacturingDate).toLocaleDateString() : 'N/A'} — {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'No expiry'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* E-Commerce Market Price Intelligence (Amazon India & Flipkart) */}
        {product.marketData && (
          <div className="lg:col-span-3 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-800 relative overflow-hidden">
            {/* Background glowing ambient effects */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Section Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-blue-500/20 border border-white/10 text-amber-400">
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        E-Commerce Live Market Intelligence
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live Benchmarks
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                      Real-time competitive price tracking, catalog listings, and 1-click price match across Amazon India & Flipkart.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Best Price Sync Action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSyncPrice('lowest')}
                  disabled={syncingPlatform !== null}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Zap size={16} />
                  {syncingPlatform === 'lowest' ? 'Syncing...' : 'Sync to Lowest Market Benchmark'}
                </button>
              </div>
            </div>

            {/* Platforms Comparison Cards */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              
              {/* Amazon India Card */}
              {product.marketData.amazon && (
                <div className="bg-gray-800/80 hover:bg-gray-800/95 border border-amber-500/30 rounded-2xl p-6 transition-all shadow-lg flex flex-col justify-between relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-700/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#232F3E] border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-base shadow-sm">
                          a
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-base flex items-center gap-1.5">
                            Amazon India
                            <span className="text-[11px] font-mono font-normal text-gray-400 bg-gray-900/60 px-2 py-0.5 rounded border border-gray-700">
                              ASIN: {product.marketData.amazon.asin}
                            </span>
                          </h4>
                          <p className="text-xs text-amber-300/80 font-medium">
                            {product.marketData.amazon.seller}
                          </p>
                        </div>
                      </div>

                      <a 
                        href={product.marketData.amazon.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-gray-900/80 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 border border-gray-700 hover:border-amber-500/40 transition-colors"
                        title="View Live Listing on Amazon.in"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>

                    {/* Price & Rating Display */}
                    <div className="py-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl sm:text-4xl font-black text-amber-400">
                          ₹{product.marketData.amazon.price?.toLocaleString('en-IN')}
                        </span>
                        {product.marketData.amazon.mrp && product.marketData.amazon.mrp > product.marketData.amazon.price && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 line-through">
                              ₹{product.marketData.amazon.mrp?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              -{product.marketData.amazon.discountPercentage}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ratings & Status */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-300">
                        <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          {product.marketData.amazon.rating}
                        </span>
                        <span className="text-gray-400">
                          ({product.marketData.amazon.reviewsCount?.toLocaleString('en-IN')} reviews)
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check size={13} /> In Stock
                        </span>
                      </div>

                      {/* Comparison vs StockFlow Price */}
                      <div className="mt-4 p-3 rounded-xl bg-gray-900/70 border border-gray-700/60 text-xs">
                        {product.sellingPrice > product.marketData.amazon.price ? (
                          <div className="flex items-center justify-between text-amber-300">
                            <span>StockFlow Price Difference:</span>
                            <span className="font-bold">
                              ₹{(product.sellingPrice - product.marketData.amazon.price).toLocaleString('en-IN')} above Amazon
                            </span>
                          </div>
                        ) : product.sellingPrice < product.marketData.amazon.price ? (
                          <div className="flex items-center justify-between text-emerald-400">
                            <span>Competitive Advantage:</span>
                            <span className="font-bold">
                              ₹{(product.marketData.amazon.price - product.sellingPrice).toLocaleString('en-IN')} lower than Amazon
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-emerald-400">
                            <span>Price Status:</span>
                            <span className="font-bold">Exact Match with Amazon Price</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-700/60 flex items-center gap-3">
                    <button
                      onClick={() => handleSyncPrice('amazon')}
                      disabled={syncingPlatform !== null || product.sellingPrice === product.marketData.amazon.price}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                        product.sellingPrice === product.marketData.amazon.price
                          ? 'bg-gray-700 text-gray-400 cursor-default'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 active:scale-[0.98]'
                      }`}
                    >
                      <Zap size={15} />
                      {syncingPlatform === 'amazon'
                        ? 'Syncing...'
                        : product.sellingPrice === product.marketData.amazon.price
                        ? 'Price Matched with Amazon'
                        : `Match Amazon Price (₹${product.marketData.amazon.price?.toLocaleString('en-IN')})`}
                    </button>
                    <a
                      href={product.marketData.amazon.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open</span>
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              )}

              {/* Flipkart Card */}
              {product.marketData.flipkart && (
                <div className="bg-gray-800/80 hover:bg-gray-800/95 border border-blue-500/30 rounded-2xl p-6 transition-all shadow-lg flex flex-col justify-between relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-700/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#2874F0] border border-blue-400/40 flex items-center justify-center font-black text-yellow-300 text-base shadow-sm">
                          FK
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-base flex items-center gap-1.5">
                            Flipkart
                            <span className="text-[11px] font-mono font-normal text-gray-400 bg-gray-900/60 px-2 py-0.5 rounded border border-gray-700">
                              FSIN: {product.marketData.flipkart.fsin}
                            </span>
                          </h4>
                          <p className="text-xs text-blue-300/80 font-medium">
                            {product.marketData.flipkart.seller}
                          </p>
                        </div>
                      </div>

                      <a 
                        href={product.marketData.flipkart.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-gray-900/80 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 border border-gray-700 hover:border-blue-500/40 transition-colors"
                        title="View Live Listing on Flipkart.com"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>

                    {/* Price & Rating Display */}
                    <div className="py-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl sm:text-4xl font-black text-blue-400">
                          ₹{product.marketData.flipkart.price?.toLocaleString('en-IN')}
                        </span>
                        {product.marketData.flipkart.mrp && product.marketData.flipkart.mrp > product.marketData.flipkart.price && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 line-through">
                              ₹{product.marketData.flipkart.mrp?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              -{product.marketData.flipkart.discountPercentage}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ratings & Status */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-300">
                        <span className="flex items-center gap-1 text-blue-300 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          <Star size={13} className="fill-yellow-400 text-yellow-400" />
                          {product.marketData.flipkart.rating}
                        </span>
                        <span className="text-gray-400">
                          ({product.marketData.flipkart.reviewsCount?.toLocaleString('en-IN')} reviews)
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check size={13} /> In Stock
                        </span>
                      </div>

                      {/* Comparison vs StockFlow Price */}
                      <div className="mt-4 p-3 rounded-xl bg-gray-900/70 border border-gray-700/60 text-xs">
                        {product.sellingPrice > product.marketData.flipkart.price ? (
                          <div className="flex items-center justify-between text-blue-300">
                            <span>StockFlow Price Difference:</span>
                            <span className="font-bold">
                              ₹{(product.sellingPrice - product.marketData.flipkart.price).toLocaleString('en-IN')} above Flipkart
                            </span>
                          </div>
                        ) : product.sellingPrice < product.marketData.flipkart.price ? (
                          <div className="flex items-center justify-between text-emerald-400">
                            <span>Competitive Advantage:</span>
                            <span className="font-bold">
                              ₹{(product.marketData.flipkart.price - product.sellingPrice).toLocaleString('en-IN')} lower than Flipkart
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-emerald-400">
                            <span>Price Status:</span>
                            <span className="font-bold">Exact Match with Flipkart Price</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-700/60 flex items-center gap-3">
                    <button
                      onClick={() => handleSyncPrice('flipkart')}
                      disabled={syncingPlatform !== null || product.sellingPrice === product.marketData.flipkart.price}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                        product.sellingPrice === product.marketData.flipkart.price
                          ? 'bg-gray-700 text-gray-400 cursor-default'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 active:scale-[0.98]'
                      }`}
                    >
                      <Zap size={15} />
                      {syncingPlatform === 'flipkart'
                        ? 'Syncing...'
                        : product.sellingPrice === product.marketData.flipkart.price
                        ? 'Price Matched with Flipkart'
                        : `Match Flipkart Price (₹${product.marketData.flipkart.price?.toLocaleString('en-IN')})`}
                    </button>
                    <a
                      href={product.marketData.flipkart.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open</span>
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary Info */}
            <div className="mt-6 pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Award size={15} className="text-amber-400" />
                <span>Market intelligence benchmarks are cross-referenced with official Amazon India and Flipkart product listings in Indian Rupees (₹).</span>
              </div>
              <div className="font-mono">
                Official Catalog MRP: <span className="font-bold text-white">₹{(product.marketData.mrp || product.sellingPrice)?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History Timeline */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="text-primary" size={20} /> Stock Movement & Audit Timeline
            </h3>
            <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-gray-600 dark:text-gray-300">
              {transactions.length} record{transactions.length === 1 ? '' : 's'}
            </span>
          </div>
          
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-sm">
                No stock transaction history recorded yet for this product.
              </p>
            ) : (
              transactions.map((tx) => {
                const tType = (tx.transactionType || '').toUpperCase();
                const isStockIn = tType.includes('IN') || tType.includes('RECEIVED');
                const isAdjustment = tType.includes('ADJUST') || tType.includes('CORRECTION');
                const txUser = tx.user?.name || 'System';
                const txRef = tx.notes || tx.referenceNumber || 'Stock update';

                return (
                  <div key={tx._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700/80 bg-gray-50/60 dark:bg-gray-900/40 hover:bg-gray-100/60 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                        isStockIn ? 'bg-emerald-500' : isAdjustment ? 'bg-amber-500' : 'bg-blue-500'
                      }`}>
                        {isStockIn ? <Plus size={16} /> : isAdjustment ? <RefreshCcw size={15} /> : <Minus size={16} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {isStockIn ? 'Stock In' : isAdjustment ? 'Stock Adjustment' : 'Stock Out'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                            isStockIn ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            isAdjustment ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          }`}>
                            {isStockIn ? '+' : isAdjustment ? '±' : '-'}{tx.quantity} units
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{txRef}</p>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <time className="font-mono text-gray-500 block">{new Date(tx.createdAt).toLocaleDateString()}</time>
                      <span className="text-gray-400 mt-0.5 block">By {txUser}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {showAdjustModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <RefreshCcw className="text-primary" size={18} /> Quick Adjust Stock Count
                </h2>
                <button onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
              </div>

              <form onSubmit={handleAdjustStock} className="p-6 space-y-4">
                <div className="bg-primary-50 dark:bg-primary-950/30 p-3 rounded-xl border border-primary-100 dark:border-primary-900/50 text-xs text-primary-800 dark:text-primary-300">
                  Current System Stock: <strong>{product.currentStock} units</strong>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                    New Actual Verified Physical Count *
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-lg font-bold"
                    value={adjustData.newStockCount} 
                    onChange={e => setAdjustData({...adjustData, newStockCount: parseInt(e.target.value, 10) || 0})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Difference: {adjustData.newStockCount - product.currentStock > 0 ? '+' : ''}{adjustData.newStockCount - product.currentStock} units
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                    Reason for Adjustment *
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={adjustData.reason} 
                    onChange={e => setAdjustData({...adjustData, reason: e.target.value})}
                    placeholder="e.g. Physical inventory count reconciliation"
                  />
                </div>
                
                <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
                  <button 
                    type="button" 
                    onClick={() => setShowAdjustModal(false)} 
                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={adjusting} 
                    className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 shadow disabled:opacity-50"
                  >
                    {adjusting ? 'Saving...' : 'Confirm Stock Adjustment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;
