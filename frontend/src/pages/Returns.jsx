import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Plus, X, AlertCircle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [returnType, setReturnType] = useState('CUSTOMER_RETURN');
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState('Defective product');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await api.get('/returns');
      if (res.data.success) {
        setReturns(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (error) {
      console.warn('Failed to load returns:', error);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const openProcessModal = async () => {
    try {
      const res = await api.get('/invoices');
      if (res.data.success) {
        setInvoices(Array.isArray(res.data.data) ? res.data.data : []);
      }
      setSelectedInvoiceId('');
      setSelectedInvoice(null);
      setReturnItems([]);
      setNotes('');
      setShowModal(true);
    } catch (err) {
      toast.error('Failed to fetch invoices for return');
    }
  };

  const handleInvoiceChange = (invId) => {
    setSelectedInvoiceId(invId);
    const inv = invoices.find(i => i._id === invId);
    setSelectedInvoice(inv || null);

    if (inv) {
      setReturnType(inv.invoiceType === 'STOCK_OUT' ? 'CUSTOMER_RETURN' : 'SUPPLIER_RETURN');
      // Initialize return items
      setReturnItems(inv.items.map(item => ({
        product: item.product?._id || item.product,
        productName: item.productName || item.product?.productName || 'Product',
        sku: item.sku || item.product?.sku || '',
        maxQty: item.quantity,
        returnQuantity: 1,
        unitPrice: item.unitPrice,
        selected: true,
        reason: 'Defective product'
      })));
    } else {
      setReturnItems([]);
    }
  };

  const handleItemQtyChange = (idx, qty) => {
    const updated = [...returnItems];
    const val = Math.max(1, Math.min(updated[idx].maxQty, Number(qty) || 1));
    updated[idx].returnQuantity = val;
    setReturnItems(updated);
  };

  const handleItemToggle = (idx) => {
    const updated = [...returnItems];
    updated[idx].selected = !updated[idx].selected;
    setReturnItems(updated);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceId) return toast.error('Please select an invoice');

    const activeItems = returnItems.filter(i => i.selected && i.returnQuantity > 0);
    if (activeItems.length === 0) return toast.error('Select at least one item to return');

    setSubmitting(true);
    try {
      const payload = {
        originalInvoiceId: selectedInvoiceId,
        returnType,
        items: activeItems.map(i => ({
          product: i.product,
          returnQuantity: i.returnQuantity,
          reason: i.reason || reason
        })),
        reason,
        notes: notes || 'Processed via StockFlow Returns Center'
      };

      const res = await api.post('/returns', payload);
      if (res.data.success) {
        toast.success(`Return ${res.data.data.returnNumber} processed successfully!`);
        setShowModal(false);
        fetchReturns();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <RotateCcw className="text-sky-700" /> Returns Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Automated reverse logistics, customer return refunds, and supplier RMA dispatch
          </p>
        </div>

        <button 
          onClick={openProcessModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold shadow-md shadow-sky-700/20 transition-all cursor-pointer"
        >
          <Plus size={18} />
          Process New Return
        </button>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 shadow-xl shadow-sky-900/5">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-700"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="py-4 px-4 font-semibold">Return No</th>
                  <th className="py-4 px-4 font-semibold">Date</th>
                  <th className="py-4 px-4 font-semibold">Type</th>
                  <th className="py-4 px-4 font-semibold">Original Invoice</th>
                  <th className="py-4 px-4 font-semibold">Party / Stakeholder</th>
                  <th className="py-4 px-4 font-semibold">Items</th>
                  <th className="py-4 px-4 font-semibold">Refund Total</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
                {returns.map((ret, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    key={ret._id} 
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-sky-800 dark:text-sky-400">
                      {ret.returnNumber}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                      {new Date(ret.returnDate || ret.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        ret.returnType === 'CUSTOMER_RETURN' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {ret.returnType === 'CUSTOMER_RETURN' ? 'Customer Return' : 'Supplier RMA'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-600 dark:text-gray-300 text-xs">
                      {ret.originalInvoice?.invoiceNumber || 'Direct Return'}
                    </td>
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-medium">
                      {ret.returnType === 'CUSTOMER_RETURN' 
                        ? (ret.customer?.name || 'Walk-in Customer') 
                        : (ret.supplier?.companyName || ret.supplier?.name || 'Supplier')}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                      {ret.items?.length || 1} item(s)
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-gray-900 dark:text-white">
                      ₹{Number(ret.grandTotal || 0).toLocaleString('en-IN')}
                    </td>
                  </motion.tr>
                ))}
                {returns.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400 dark:text-gray-500">
                      <RotateCcw className="mx-auto mb-2 opacity-40" size={32} />
                      No return transactions on file yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Process Return Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <RotateCcw size={18} className="text-sky-700" /> Process Stock Return
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Restock inventory and process balance adjustments</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitReturn} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Select Originating Invoice
                  </label>
                  <select 
                    value={selectedInvoiceId}
                    onChange={(e) => handleInvoiceChange(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-sky-700"
                  >
                    <option value="">-- Choose Invoice to Return Against --</option>
                    {invoices.map(inv => (
                      <option key={inv._id} value={inv._id}>
                        {inv.invoiceNumber} | {inv.invoiceType === 'STOCK_OUT' ? 'Customer Sale' : 'Supplier Purchase'} | ₹{Number(inv.grandTotal || 0).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedInvoice && (
                  <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-xs space-y-1">
                    <div className="font-bold text-sky-900 dark:text-sky-200 flex justify-between">
                      <span>Type: {returnType === 'CUSTOMER_RETURN' ? 'Customer Return (Restock & Refund)' : 'Supplier RMA (Return to Vendor)'}</span>
                      <span>Invoice Total: ₹{Number(selectedInvoice.grandTotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-sky-700 dark:text-sky-300">
                      Party: {selectedInvoice.customer?.name || selectedInvoice.supplier?.companyName || 'General Account'}
                    </div>
                  </div>
                )}

                {returnItems.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Items in Invoice
                    </label>
                    <div className="space-y-2 border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-gray-50/50 dark:bg-slate-800/50 max-h-48 overflow-y-auto">
                      {returnItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={item.selected}
                              onChange={() => handleItemToggle(idx)}
                              className="rounded border-gray-300 text-sky-700 focus:ring-sky-600"
                            />
                            <div>
                              <div className="text-xs font-bold text-gray-900 dark:text-white">{item.productName}</div>
                              <div className="text-[10px] text-gray-500 font-mono">SKU: {item.sku} | Unit Price: ₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Qty:</span>
                            <input 
                              type="number" 
                              min="1" 
                              max={item.maxQty}
                              disabled={!item.selected}
                              value={item.returnQuantity}
                              onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                              className="w-16 px-2 py-1 text-center font-mono text-xs font-bold rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                            <span className="text-[10px] text-gray-400">/ {item.maxQty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Return Reason
                  </label>
                  <select 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-sky-700"
                  >
                    <option value="Defective product">Defective product / Hardware failure</option>
                    <option value="Damaged in transit">Damaged in transit / Unsealed package</option>
                    <option value="Customer remorse">Customer remorse / Wrong item ordered</option>
                    <option value="Incorrect specification">Incorrect specification / Color mismatch</option>
                    <option value="Warranty exchange">Warranty exchange / RMA return</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Inspector Notes (Optional)
                  </label>
                  <textarea 
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Inspection remarks, serial verification, or return approval comments..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white outline-none focus:border-sky-700"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-semibold rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting || !selectedInvoiceId}
                    className="px-5 py-2 text-sm font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-xl shadow-md shadow-sky-700/20 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Processing...' : 'Confirm Return'}
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

export default Returns;
