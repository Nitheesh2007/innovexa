import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingCart, Calendar, Package, CheckCircle, Clock, FileText, Ban, RotateCcw, Download, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import InvoiceModal from '../components/InvoiceModal';
import DetailsModal from '../components/DetailsModal';

const Orders = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const fetchSales = async () => {
    try {
      const res = await api.get('/invoices');
      // Filter only STOCK_OUT (Sales)
      const salesData = res.data.data.filter(inv => inv.invoiceType === 'STOCK_OUT');
      setSales(salesData);
    } catch (error) {
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleCancelSale = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this sale? This will permanently reverse stock and payment ledgers.")) return;
    
    try {
      const toastId = toast.loading('Cancelling sale...');
      await api.put(`/invoices/${id}/cancel`);
      toast.success('Sale cancelled successfully', { id: toastId });
      fetchSales();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel sale');
    }
  };

  // Filter Logic
  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      (sale.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesPayment = paymentStatusFilter ? sale.paymentStatus === paymentStatusFilter : true;
    const matchesStatus = statusFilter ? sale.status === statusFilter : true;
    
    let matchesDate = true;
    if (dateFilter) {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      matchesDate = saleDate === dateFilter;
    }

    return matchesSearch && matchesPayment && matchesStatus && matchesDate;
  });

  const exportCSV = () => {
    if (filteredSales.length === 0) return;
    const headers = ['Invoice Number', 'Date', 'Customer', 'Status', 'Payment Status', 'Grand Total', 'Paid Amount', 'Pending Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredSales.map(s => 
        `"${s.invoiceNumber}","${new Date(s.createdAt).toLocaleDateString()}","${s.customer?.name || 'Walk-in'}","${s.status}","${s.paymentStatus}","${s.grandTotal}","${s.paidAmount}","${s.pendingAmount}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sales CSV Exported');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
      case 'PARTIAL':
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
      case 'RETURNED': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 flex items-center gap-2">
            Sales & Orders
          </h1>
          <p className="text-gray-500 mt-1">Manage all outbound sales, payments, and returns.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-700 dark:text-gray-300" title="Export CSV">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="glass dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search (Invoice / Customer)</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white"
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
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment</label>
          <select 
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white"
          >
            <option value="">All</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white"
          >
            <option value="">All</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass dark:bg-gray-800/80 rounded-2xl shadow-sm border border-transparent dark:border-gray-700 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Invoice No.</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Customer</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Total</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Payment</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filteredSales.map(sale => (
                  <tr key={sale._id} onClick={() => setSelectedDetails(sale)} className="hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer group transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {sale.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(sale.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                      {sale.customer?.name || 'Walk-in Customer'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white font-mono">
                      ₹{sale.grandTotal?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(sale.paymentStatus)}`}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedInvoice(sale); }}
                        className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                        title="View Invoice"
                      >
                        <FileText size={18} />
                      </button>
                      {sale.status !== 'CANCELLED' && sale.status !== 'RETURNED' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCancelSale(sale._id); }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Cancel Sale"
                        >
                          <Ban size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      No sales found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal 
        isOpen={!!selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        invoice={selectedInvoice} 
      />

      {/* Details Modal */}
      {selectedDetails && (
        <DetailsModal
          isOpen={!!selectedDetails}
          onClose={() => setSelectedDetails(null)}
          title={`Sale Details - ${selectedDetails.invoiceNumber}`}
          icon={ShoppingCart}
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="font-bold text-gray-500 text-[10px] uppercase tracking-wider mb-1">Customer</p>
                      <p className="font-semibold text-base">{selectedDetails.customer?.name || 'Walk-in'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-500 text-[10px] uppercase tracking-wider mb-1">Date</p>
                      <p className="font-semibold text-base">{new Date(selectedDetails.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-500 text-[10px] uppercase tracking-wider mb-1">Payment Method</p>
                      <p className="font-semibold text-base">{selectedDetails.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-500 text-[10px] uppercase tracking-wider mb-1">Status</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(selectedDetails.status)}`}>
                        {selectedDetails.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-6">
                    <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 font-bold text-gray-700 dark:text-gray-300 flex justify-between">
                        <span>Items Purchased</span>
                        <span className="text-gray-500 font-normal">{selectedDetails.items?.length || 0} items</span>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500">
                          <tr>
                            <th className="px-4 py-2 font-bold">Product</th>
                            <th className="px-4 py-2 font-bold">Qty</th>
                            <th className="px-4 py-2 font-bold text-right">Price</th>
                            <th className="px-4 py-2 font-bold text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {selectedDetails.items?.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900 dark:text-gray-100">{item.productName}</div>
                                <div className="text-xs text-gray-500">{item.sku}</div>
                              </td>
                              <td className="px-4 py-3">{item.quantity}</td>
                              <td className="px-4 py-3 text-right font-mono">₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3 text-right font-medium font-mono">₹{item.total?.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="w-64 space-y-4">
                      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-xl">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-3 border-b border-indigo-200 dark:border-indigo-800/50 pb-2">Financials</h4>
                        <div className="space-y-2 text-sm font-mono">
                          <div className="flex justify-between text-indigo-700 dark:text-indigo-300">
                            <span>Subtotal</span>
                            <span>₹{selectedDetails.subtotal?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-indigo-700 dark:text-indigo-300">
                            <span>Discount</span>
                            <span>-₹{selectedDetails.discountTotal?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-indigo-700 dark:text-indigo-300">
                            <span>Tax</span>
                            <span>₹{selectedDetails.taxTotal?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between font-bold text-indigo-900 dark:text-indigo-100 text-lg pt-2 border-t border-indigo-200 dark:border-indigo-800/50 mt-2">
                            <span>Total</span>
                            <span>₹{selectedDetails.grandTotal?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-4 rounded-xl">
                        <div className="space-y-2 text-sm font-mono">
                          <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Paid</span>
                            <span className="font-medium text-green-600 dark:text-green-400">₹{selectedDetails.paidAmount?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Pending</span>
                            <span className="font-bold text-orange-500">₹{selectedDetails.pendingAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          ]}
        />
      )}
    </div>
  );
};

export default Orders;
