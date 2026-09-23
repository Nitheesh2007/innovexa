import React, { useRef } from 'react';
import { Printer, X, Download, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { numberToIndianWords, formatINR } from '../utils/numberToWords';

export const InvoiceModal = ({ isOpen, onClose, order }) => {
  const printAreaRef = useRef(null);

  if (!isOpen || !order) return null;

  // Normalize order/invoice data whether passed from Orders or Invoices page
  const invoiceNumber = order.invoiceNumber || order.orderNumber || (order._id ? order._id.slice(-6).toUpperCase() : 'INV-1001');
  
  const invoiceDateRaw = order.invoiceDate || order.createdAt || new Date();
  const invoiceDateFormatted = new Date(invoiceDateRaw).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const invoiceTimeFormatted = new Date(invoiceDateRaw).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const customerName = order.customer?.name || order.partyName || order.customerName || 'Walk-in Customer';
  const customerPhone = order.customer?.phone || order.phone || '+91 98765 43210';
  const customerEmail = order.customer?.email || order.email || 'customer@client.com';
  const customerAddress = order.customer?.address || order.billingAddress || 'Commercial Complex, Sector 18, Noida, UP';
  const customerGstin = order.customer?.gstin || order.gstin || '09AAAAA0000A1Z5';

  // Extract line items
  const rawItems = order.items || order.products || [];
  const items = rawItems.map((item, idx) => {
    const prod = item.product || {};
    const name = item.productName || prod.productName || item.name || 'Catalog Item ' + (idx + 1);
    const sku = item.sku || prod.sku || '';
    const quantity = Number(item.quantity || item.cartQty || 1);
    const unitPrice = Number(item.unitPrice || item.priceAtSale || item.price || item.rate || 0);
    const taxRate = Number(item.taxRate !== undefined ? item.taxRate : 18);
    const taxAmount = Number(item.taxAmount || (unitPrice * quantity * (taxRate / 100)));
    const total = Number(item.total || item.subtotal || (quantity * unitPrice) + taxAmount);
    const hsn = item.hsn || prod.hsn || '8471';
    const unit = item.unit || prod.unit || 'Units';

    return {
      index: idx + 1,
      name,
      sku,
      quantity,
      unit,
      unitPrice,
      taxPerUnit: taxAmount / (quantity || 1),
      taxRate,
      amount: total,
      hsn
    };
  });

  const grandTotal = Number(order.grandTotal || order.totalAmount || items.reduce((acc, it) => acc + it.amount, 0));
  const totalTax = Number(order.taxTotal !== undefined ? order.taxTotal : items.reduce((acc, it) => acc + (it.taxPerUnit * it.quantity), 0));
  const subtotal = Number(order.subtotal !== undefined ? order.subtotal : (grandTotal - totalTax));
  const paidAmount = Number(order.paidAmount !== undefined ? order.paidAmount : (order.paymentStatus === 'PAID' ? grandTotal : grandTotal));
  const balanceDue = Number(order.pendingAmount !== undefined ? order.pendingAmount : Math.max(0, grandTotal - paidAmount));
  const wordsAmount = numberToIndianWords(grandTotal);

  const handlePrint = () => {
    if (!printAreaRef.current) return;
    const printContent = printAreaRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice - ${invoiceNumber}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
              color: #0f172a;
              background: #ffffff;
              padding: 20px;
              font-size: 13px;
              line-height: 1.5;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .font-mono {
              font-family: 'JetBrains Mono', monospace !important;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th {
              background-color: #f1f5f9 !important;
              color: #334155;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 700;
              border-bottom: 2px solid #cbd5e1;
              padding: 8px 10px;
            }
            td {
              border-bottom: 1px solid #e2e8f0;
              padding: 8px 10px;
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 600);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top Modal Controls */}
          <div className="flex justify-between items-center px-6 py-3.5 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Official Document
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                TAX INVOICE #{invoiceNumber}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle size={11} />
                <span>PAID</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrint} 
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all font-semibold text-xs shadow-sm hover:shadow"
              >
                <Printer size={14} /> 
                <span>Print Document</span>
              </button>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors"
                aria-label="Close invoice preview"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70 custom-scrollbar flex justify-center">
            <div 
              ref={printAreaRef}
              className="bg-white p-8 sm:p-10 w-full max-w-[840px] shadow-sm rounded-xl border border-slate-200 text-slate-800 space-y-6"
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
              }}
            >
              {/* 1. Header Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-md">
                    SF
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                      StockFlow Technologies Pvt Ltd
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Enterprise Supply Chain & Inventory Suite</p>
                    <p className="text-[11px] text-slate-400 font-mono">GSTIN: 07AABCS1429B1Z8 · CIN: U72900DL2024PTC10984</p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-md">
                    TAX INVOICE
                  </div>
                  <div className="mt-2 text-xs font-mono space-y-0.5">
                    <p><span className="text-slate-400 font-sans">Invoice No:</span> <strong className="text-slate-900">{invoiceNumber}</strong></p>
                    <p><span className="text-slate-400 font-sans">Date:</span> <strong className="text-slate-900">{invoiceDateFormatted}</strong></p>
                    <p><span className="text-slate-400 font-sans">Time:</span> <span className="text-slate-600">{invoiceTimeFormatted}</span></p>
                  </div>
                </div>
              </div>

              {/* 2. Billed From & Billed To Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Billed From */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    ISSUED BY (SUPPLIER)
                  </span>
                  <p className="font-bold text-sm text-slate-900">StockFlow Fulfillment Center 01</p>
                  <p className="text-slate-600 leading-relaxed">Plot 42, Tech Logistics Zone, Sector 62</p>
                  <p className="text-slate-600">Noida, Uttar Pradesh - 201301</p>
                  <p className="text-slate-600 pt-1">
                    <span className="text-slate-400">Email:</span> billing@stockflow.com · <span className="text-slate-400">Phone:</span> +91 120 488 9900
                  </p>
                </div>

                {/* Billed To */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    BILLED TO (BUYER)
                  </span>
                  <p className="font-bold text-sm text-slate-900">{customerName}</p>
                  <p className="text-slate-600 leading-relaxed">{customerAddress}</p>
                  <p className="text-slate-600 pt-1">
                    <span className="text-slate-400">Phone:</span> {customerPhone} · <span className="text-slate-400">Email:</span> {customerEmail}
                  </p>
                  <p className="font-mono text-[11px] text-slate-500 pt-0.5">
                    GSTIN / UID: {customerGstin}
                  </p>
                </div>
              </div>

              {/* 3. Items Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 text-center w-10">#</th>
                      <th className="py-2.5 px-4 text-left">Item Description</th>
                      <th className="py-2.5 px-2 text-center w-16">HSN</th>
                      <th className="py-2.5 px-3 text-center w-20">Qty</th>
                      <th className="py-2.5 px-3 text-right w-24">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right w-24">Tax (GST)</th>
                      <th className="py-2.5 px-4 text-right w-28">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr key={it.index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {it.index}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{it.name}</p>
                          {it.sku && (
                            <p className="text-[11px] text-slate-400 font-mono">SKU: {it.sku}</p>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center text-slate-500 font-mono text-[11px]">
                          {it.hsn}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-800">
                          {it.quantity} <span className="text-[10px] text-slate-400 font-normal">{it.unit}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          ₹{Number(it.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          <div>₹{Number(it.taxPerUnit * it.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          <span className="text-[10px] text-slate-400">({it.taxRate}%)</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ₹{Number(it.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Financial Calculations & Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                {/* Left Side: Amount in Words & QR Code */}
                <div className="md:col-span-7 space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      TOTAL AMOUNT IN WORDS
                    </span>
                    <p className="text-xs font-bold text-slate-800 capitalize leading-relaxed">
                      {wordsAmount}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-lg flex items-center justify-center shrink-0">
                      <QrCode size={36} />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">UPI Instant Digital Verification</p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Scan with PhonePe, Google Pay, or Paytm to verify authenticity or settle balance.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Totals Calculation Table */}
                <div className="md:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      ₹{Number(subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Total GST Output Tax:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      ₹{Number(totalTax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-bold">
                    <span className="text-sm text-slate-900">Grand Total:</span>
                    <span className="font-mono text-base font-extrabold text-sky-700">
                      ₹{Number(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-2 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-emerald-700">
                      <span>Amount Received:</span>
                      <span>₹{Number(paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Balance Outstanding:</span>
                      <span>₹{Number(balanceDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Terms & Signatures */}
              <div className="border-t border-slate-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-slate-500">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Terms & Conditions</h4>
                  <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
                    <li>Goods once sold are covered under corporate manufacturer warranty.</li>
                    <li>Subject to local jurisdiction. Computer generated invoice; no physical signature required.</li>
                    <li>For questions or claims, contact support@stockflow.com.</li>
                  </ul>
                </div>

                <div className="flex flex-col items-start sm:items-end justify-between">
                  <div className="text-left sm:text-right">
                    <p className="font-semibold text-slate-800">For StockFlow Technologies Pvt Ltd</p>
                    <p className="text-[10px] text-slate-400">Authorized Digital Signatory</p>
                  </div>
                  <div className="mt-8 pt-1 border-t border-slate-300 w-44 text-center sm:text-right font-mono text-[10px] text-slate-400">
                    Digitally Signed & Validated
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InvoiceModal;
