import React, { useRef } from 'react';
import { Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  const invoiceRef = useRef(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const printContent = invoiceRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React state cleanly after DOM manipulation
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-gray-100 dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Order Invoice</h2>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
                <Printer size={18} /> Print
              </button>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 custom-scrollbar">
            <div 
              ref={invoiceRef} 
              className="bg-white dark:bg-gray-800 p-8 shadow-sm rounded-xl max-w-2xl mx-auto text-gray-800 dark:text-gray-100"
              style={{ minHeight: '800px' }} // Standard paper proportion
            >
              <style type="text/css" media="print">
                {`
                  @page { size: auto;  margin: 0mm; }
                  body { margin: 1.6cm; background: white; color: black; }
                  .dark\:text-gray-100 { color: black !important; }
                  .dark\:bg-gray-800 { background: white !important; }
                  .dark\:border-gray-700 { border-color: #e5e7eb !important; }
                `}
              </style>

              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tighter">StockFlow</h1>
                  <p className="text-sm text-gray-500">123 Business Avenue, Suite 100</p>
                  <p className="text-sm text-gray-500">New York, NY 10001</p>
                  <p className="text-sm text-gray-500">hello@stockflow.com</p>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-light text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Invoice</h2>
                  <p className="text-sm font-bold">INV-{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-8 flex justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To:</p>
                  <p className="font-bold text-lg">{order.customer?.name || 'Walk-in Customer'}</p>
                  {order.customer?.email && <p className="text-sm text-gray-500">{order.customer.email}</p>}
                  {order.customer?.phone && <p className="text-sm text-gray-500">{order.customer.phone}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Method:</p>
                  <p className="font-bold capitalize">{order.paymentMethod}</p>
                  <p className="text-sm text-gray-500">Status: <span className="text-green-500 font-bold">PAID</span></p>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-left mb-8">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="py-3 font-bold text-gray-700 dark:text-gray-300">Item Description</th>
                    <th className="py-3 font-bold text-gray-700 dark:text-gray-300 text-center">Qty</th>
                    <th className="py-3 font-bold text-gray-700 dark:text-gray-300 text-right">Price</th>
                    <th className="py-3 font-bold text-gray-700 dark:text-gray-300 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {order.products.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4">
                        <p className="font-bold">{item.product?.productName || 'Unknown Product'}</p>
                        <p className="text-xs text-gray-500 font-mono">SKU: {item.product?.sku || 'N/A'}</p>
                      </td>
                      <td className="py-4 text-center font-medium">{item.quantity}</td>
                      <td className="py-4 text-right">₹{item.priceAtSale.toLocaleString()}</td>
                      <td className="py-4 text-right font-bold">₹{(item.quantity * item.priceAtSale).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                <div className="w-64">
                  <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
                    <span>Tax (0%)</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between py-3 font-bold text-xl border-t border-gray-200 dark:border-gray-700 mt-2 text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span className="text-primary">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-16 text-center text-gray-400 text-sm italic border-t border-gray-100 dark:border-gray-700 pt-8">
                Thank you for your business. Please retain this invoice for your records.
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InvoiceModal;
