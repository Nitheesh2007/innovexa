import React, { useEffect, useState } from 'react';
import { productService } from '../services/apiServices';
import { Plus, Edit, Trash2, Search, PackageSearch, LayoutGrid, List as ListIcon, Filter, Download, CheckSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedProducts, setSelectedProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      setProducts(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pId => pId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        setLoading(true);
        // Assuming your API supports individual delete in a loop for now, 
        // ideally there's a bulk delete endpoint.
        await Promise.all(selectedProducts.map(id => productService.delete(id)));
        toast.success(`Successfully deleted ${selectedProducts.length} products`);
        setSelectedProducts([]);
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete some products');
        setLoading(false);
      }
    }
  };

  const exportCSV = () => {
    if (products.length === 0) return;
    const headers = ['SKU', 'Product Name', 'Category', 'Selling Price', 'Current Stock', 'Status'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => 
        `"${p.sku}","${p.productName}","${p.category?.name || 'Uncategorized'}","${p.sellingPrice}","${p.currentStock}","${p.status}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded successfully');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Products Catalog</h1>
          <p className="text-gray-500 mt-1">Manage your inventory catalog efficiently.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 glass dark:bg-gray-800/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <ListIcon size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <button className="glass p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-700 dark:text-gray-300">
            <Filter size={18} />
          </button>
          <button onClick={exportCSV} className="glass p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-700 dark:text-gray-300" title="Export CSV">
            <Download size={18} />
          </button>

          <AnimatePresence>
            {selectedProducts.length > 0 && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:-translate-y-0.5"
              >
                <Trash2 size={18} />
                <span className="font-medium">Delete ({selectedProducts.length})</span>
              </motion.button>
            )}
          </AnimatePresence>

          <Link to="/products/new" className="bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 whitespace-nowrap">
            <Plus size={18} />
            <span className="font-medium">Add Product</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-gray-500 glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <PackageSearch size={64} className="mb-4 opacity-50 text-primary-400" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No products found</h3>
          <p className="mt-2 text-center max-w-sm">We couldn't find any products matching your search criteria. Try adjusting your filters or add a new product.</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div 
              key="list-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass dark:bg-gray-800/80 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 w-10">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Product Info</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Category</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Price</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Stock</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Status</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="show" 
                    className="divide-y divide-gray-100 dark:divide-gray-700/50"
                  >
                    {filteredProducts.map(product => (
                      <motion.tr 
                        variants={itemVariants}
                        key={product._id} 
                        className={`transition-colors group cursor-pointer ${selectedProducts.includes(product._id) ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            checked={selectedProducts.includes(product._id)}
                            onChange={(e) => toggleSelect(product._id, e)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold shadow-inner">
                              {product.productName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{product.productName}</p>
                              <p className="text-xs text-gray-500 font-mono mt-0.5">{product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
                          {product.category?.name || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                          ₹{product.sellingPrice?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{product.currentStock}</span>
                            <span className="text-xs text-gray-500">/ {product.minimumStock} min</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            product.status === 'In Stock' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' :
                            product.status === 'Low Stock' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30' :
                            'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/products/edit/${product._id}`} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                              <Edit size={16} />
                            </Link>
                            {currentUser?.role === 'admin' && (
                              <button onClick={() => handleDelete(product._id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
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
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map(product => (
                <motion.div 
                  key={product._id} 
                  variants={itemVariants}
                  onClick={() => navigate(`/products/${product._id}`)}
                  className="glass dark:bg-gray-800/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-transparent hover:border-primary/20 relative overflow-hidden cursor-pointer"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 ${
                    product.status === 'In Stock' ? 'bg-green-500' :
                    product.status === 'Low Stock' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-4 mt-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xl shadow-inner">
                      📦
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/products/edit/${product._id}`} className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Edit size={14} />
                      </Link>
                      {currentUser?.role === 'admin' && (
                        <button onClick={() => handleDelete(product._id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate" title={product.productName}>
                    {product.productName}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mb-4">{product.sku}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Price</p>
                      <p className="font-bold text-gray-900 dark:text-white truncate">₹{product.sellingPrice?.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Stock</p>
                      <p className={`font-bold truncate ${product.currentStock <= product.minimumStock ? 'text-red-500' : 'text-green-500'}`}>
                        {product.currentStock} <span className="text-xs font-normal text-gray-500">units</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                      {product.category?.name || 'Category'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      product.status === 'In Stock' ? 'text-green-600 dark:text-green-400' :
                      product.status === 'Low Stock' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Products;
