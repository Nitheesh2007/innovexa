import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, FileText, Printer, FileDown, Eye } from 'lucide-react';
import DetailsModal from '../components/DetailsModal';
import InvoiceModal from '../components/InvoiceModal';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      if (res.data?.success) {
        setInvoices(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (error) {
      console.warn('Failed to load invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { 
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF Downloaded');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.supplier?.companyName || inv.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all your billing and invoices</p>
        </div>
        <Link 
          to="/invoices/new" 
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/30 font-medium"
        >
          <Plus size={20} />
          <span>Create Invoice</span>
        </Link>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 shadow-xl shadow-indigo-900/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400">Invoice No</th>
                  <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                  <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400">Type</th>
                  <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400">Party</th>
                  <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                  <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={invoice._id} 
                    onClick={() => setSelectedInvoice(invoice)}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-medium dark:text-white">{invoice.invoiceNumber}</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        invoice.invoiceType === 'STOCK_IN' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {invoice.invoiceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                      {invoice.invoiceType === 'STOCK_OUT' ? invoice.customer?.name : invoice.supplier?.companyName}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white font-mono">
                      ₹{invoice.grandTotal?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        invoice.paymentStatus === 'PAID' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : invoice.paymentStatus === 'PARTIAL'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownloadPDF(invoice._id, invoice.invoiceNumber); }}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                          title="Download PDF"
                        >
                          <FileDown size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedInvoice(invoice); }} 
                          className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                          title="Print / View Tax Invoice"
                        >
                          <Printer size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Tax Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          order={selectedInvoice}
        />
      )}
    </div>
  );
};

export default Invoices;
