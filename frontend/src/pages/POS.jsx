import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Receipt, 
  Search, 
  Check, 
  PauseCircle, 
  PlayCircle, 
  Printer, 
  CheckCircle2, 
  Percent, 
  Sparkles,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMatchingProductImage } from '../utils/productImageMatcher';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [heldCarts, setHeldCarts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paidAmount, setPaidAmount] = useState('');
  const [completedOrderReceipt, setCompletedOrderReceipt] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, custRes] = await Promise.allSettled([
        api.get('/products'),
        api.get('/customers')
      ]);
      const prodData = (prodRes.status === 'fulfilled' && prodRes.value?.data?.data) ? prodRes.value.data.data : [];
      const custList = (custRes.status === 'fulfilled' && custRes.value?.data?.data) ? custRes.value.data.data : [];
      
      const available = prodData.filter(p => (p.currentStock || p.stock || 0) > 0);
      setProducts(available);
      setCustomers(custList);
      if (custList.length > 0 && !selectedCustomer) {
        setSelectedCustomer(custList[0]._id);
      }
    } catch (err) {
      console.warn('POS data load error:', err);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category?.name || p.category || 'General'))];

  const addToCart = (product) => {
    const stockAvailable = product.currentStock || product.stock || 0;
    const existing = cart.find(i => i._id === product._id);
    if (existing) {
      if (existing.cartQty >= stockAvailable) {
        return toast.error(`Only ${stockAvailable} units available in inventory`);
      }
      setCart(cart.map(i => i._id === product._id ? { ...i, cartQty: i.cartQty + 1 } : i));
    } else {
      setCart([...cart, { 
        ...product, 
        cartPrice: product.sellingPrice || product.price || 0,
        cartQty: 1 
      }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(i => i._id !== id));
  
  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    const product = products.find(p => p._id === id);
    const stockAvail = product ? (product.currentStock || product.stock || 0) : 999;
    if (qty > stockAvail) return toast.error(`Maximum stock reached (${stockAvail})`);
    setCart(cart.map(i => i._id === id ? { ...i, cartQty: qty } : i));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + ((item.cartPrice || item.sellingPrice || item.price || 0) * item.cartQty), 0);
  const discountAmount = (subtotal * (Number(discountPercent || 0) / 100));
  const taxRate = 8; // 8% sales tax standard
  const taxTotal = ((subtotal - discountAmount) * (taxRate / 100));
  const grandTotal = Math.max(0, subtotal - discountAmount + taxTotal);
  const changeDue = Math.max(0, (Number(paidAmount || grandTotal) - grandTotal));

  // Park / Hold Cart
  const handleHoldCart = () => {
    if (cart.length === 0) return toast.error('No active cart items to park');
    setHeldCarts([...heldCarts, { id: Date.now(), cart, customer: selectedCustomer, time: new Date().toLocaleTimeString() }]);
    setCart([]);
    toast.success('Cart parked on hold');
  };

  const handleResumeCart = (held) => {
    if (cart.length > 0) {
      if (!window.confirm('Replace current cart with held order?')) return;
    }
    setCart(held.cart);
    setSelectedCustomer(held.customer);
    setHeldCarts(heldCarts.filter(h => h.id !== held.id));
    toast.success('Held order resumed');
  };

  const handleCheckout = async () => {
    const customerId = selectedCustomer || (customers[0]?._id);
    if (!customerId) return toast.error('Please assign a customer');
    if (cart.length === 0) return toast.error('Register cart is empty');

    const items = cart.map(item => ({
      product: item._id,
      quantity: item.cartQty,
      unitPrice: item.cartPrice || item.sellingPrice || item.price || 0,
      taxRate: taxRate,
      discount: 0
    }));

    try {
      const toastId = toast.loading('Processing POS register transaction...');
      const tender = paidAmount === '' ? grandTotal : Number(paidAmount);
      
      await api.post('/invoices/stock-out', {
        customer: customerId,
        items,
        paymentMethod,
        discountTotal: Number(discountAmount.toFixed(2)),
        paidAmount: tender,
        notes: `POS Register Sale (${paymentMethod})`
      });
      
      const receiptData = {
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleString(),
        customer: customers.find(c => c._id === customerId)?.name || 'Walk-in Customer',
        items: [...cart],
        subtotal,
        discountAmount,
        taxTotal,
        grandTotal,
        tender,
        changeDue,
        paymentMethod
      };

      setCompletedOrderReceipt(receiptData);
      toast.success('Transaction approved and completed!', { id: toastId });
      setCart([]);
      setDiscountPercent(0);
      setPaidAmount('');
      fetchData(); // Refresh available stock
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    }
  };

  const filteredProducts = products.filter(p => {
    const name = p.name || p.productName || '';
    const sku = p.sku || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || (p.category?.name || p.category) === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 pb-6">
      {/* LEFT: Fast Instant Search & Product Catalog Grid */}
      <div className="flex-1 flex flex-col h-full bg-surface rounded-2xl border border-hairline overflow-hidden shadow-xs">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-hairline space-y-3 bg-surface-muted/50">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Instant Search by Product Name, SKU, or Keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-hairline bg-surface text-ink focus:outline-none focus:border-sky-600 shadow-xs"
                autoFocus
              />
            </div>
            
            {heldCarts.length > 0 && (
              <div className="flex items-center gap-1.5">
                {heldCarts.map(hc => (
                  <button
                    key={hc.id}
                    onClick={() => handleResumeCart(hc)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 hover:bg-amber-200"
                  >
                    <PlayCircle size={14} />
                    <span>Held ({hc.time})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Categories Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap font-medium transition-all ${selectedCategory === cat ? 'bg-sky-700 text-white font-semibold' : 'bg-surface text-slate-600 border border-hairline hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Package size={40} className="mb-2 text-slate-300" />
              <p className="text-sm font-medium">No active products match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((product) => {
                const stock = product.currentStock || product.stock || 0;
                const price = product.sellingPrice || product.price || 0;
                const name = product.productName || product.name;
                const inCart = cart.find(i => i._id === product._id);

                return (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between bg-surface relative overflow-hidden group hover:border-sky-500 hover:shadow-md ${inCart ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50/20' : 'border-hairline'}`}
                  >
                    <div>
                      <div className="aspect-square rounded-lg bg-surface-muted mb-2 overflow-hidden flex items-center justify-center relative">
                        <img 
                          src={product.productImage || product.imageUrl || getMatchingProductImage(name)} 
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-xs">
                          {stock} in stock
                        </span>
                        {inCart && (
                          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-sky-700 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                            {inCart.cartQty}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-xs text-ink line-clamp-2 leading-snug">{name}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{product.sku}</p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-hairline flex items-center justify-between">
                      <span className="text-sm font-bold font-mono text-sky-700 dark:text-sky-400">
                        ₹{Number(price).toLocaleString('en-IN')}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-sky-700 group-hover:text-white transition-colors">
                        <Plus size={14} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Register Cart & Instant Billing Terminal */}
      <div className="w-full lg:w-96 flex flex-col h-full bg-surface rounded-2xl border border-hairline overflow-hidden shadow-xs">
        {/* Customer Selector & Park Button */}
        <div className="p-4 border-b border-hairline bg-surface-muted/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <ShoppingCart size={15} />
              <span>Register Order</span>
            </div>
            <button
              onClick={handleHoldCart}
              title="Park cart for next customer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-ink px-2.5 py-1 rounded-md border border-hairline bg-surface hover:bg-slate-50"
            >
              <PauseCircle size={13} />
              <span>Hold Cart</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <User size={15} className="text-slate-400 shrink-0" />
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full text-xs font-medium py-1.5 px-2.5 rounded-lg border border-hairline bg-surface text-ink focus:outline-none"
            >
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Item Rows */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-hairline">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <ShoppingCart size={36} className="mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-ink">Cart is empty</p>
              <p className="text-xs text-slate-400 mt-1">Tap items on the left catalog or search SKU to ring up sales.</p>
            </div>
          ) : (
            cart.map((item) => {
              const itemPrice = item.cartPrice || item.sellingPrice || item.price || 0;
              const lineTotal = itemPrice * item.cartQty;

              return (
                <div key={item._id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{item.productName || item.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">₹{itemPrice.toLocaleString('en-IN')} each</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQty(item._id, item.cartQty - 1)}
                      className="w-6 h-6 rounded border border-hairline flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center font-mono font-bold text-xs text-ink">{item.cartQty}</span>
                    <button
                      onClick={() => updateQty(item._id, item.cartQty + 1)}
                      className="w-6 h-6 rounded border border-hairline flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="text-right w-20 font-mono font-bold text-xs text-ink">
                    ₹{lineTotal.toLocaleString('en-IN')}
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bill Summary & Payment Tender Controls */}
        <div className="p-4 border-t border-hairline bg-surface-muted/30 space-y-3">
          {/* Quick Discount & Tender */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg border border-hairline bg-surface">
              <Percent size={13} className="text-slate-400" />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Discount %"
                value={discountPercent || ''}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full bg-transparent text-xs font-mono font-semibold text-ink focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg border border-hairline bg-surface">
              <CreditCard size={13} className="text-slate-400" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-ink focus:outline-none"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Credit / Debit</option>
                <option value="TRANSFER">Digital Transfer</option>
                <option value="STORE_CREDIT">Store Credit</option>
              </select>
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount ({discountPercent}%)</span>
                <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Tax (8%)</span>
              <span className="font-mono font-medium">₹{taxTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-hairline flex justify-between text-base font-extrabold text-ink">
              <span>Total Due</span>
              <span className="font-mono text-sky-700 dark:text-sky-400">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Cash Tender & Change Helper */}
          {paymentMethod === 'CASH' && grandTotal > 0 && (
            <div className="pt-2 border-t border-hairline space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Cash tendered (₹)"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-hairline bg-surface text-ink"
                />
                <button
                  type="button"
                  onClick={() => setPaidAmount(grandTotal)}
                  className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-700 whitespace-nowrap"
                >
                  Exact
                </button>
              </div>
              {Number(paidAmount) >= grandTotal && (
                <div className="flex justify-between text-xs font-bold text-emerald-600 px-1">
                  <span>Change Due:</span>
                  <span className="font-mono">₹{changeDue.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 rounded-xl bg-sky-700 text-white font-bold text-sm hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>Complete Sale (₹{grandTotal.toLocaleString('en-IN')})</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* MODAL: Printable Receipt */}
      {completedOrderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200">
            {/* Header */}
            <div className="text-center border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Check size={20} />
              </div>
              <h3 className="text-lg font-bold font-display">STOCKFLOW REGISTER</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{completedOrderReceipt.receiptNumber}</p>
              <p className="text-[11px] text-slate-400">{completedOrderReceipt.date}</p>
            </div>

            {/* Customer */}
            <div className="text-xs border-b border-slate-200 pb-2 flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold">{completedOrderReceipt.customer}</span>
            </div>

            {/* Items */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs py-1 border-b border-slate-200">
              {completedOrderReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate max-w-[180px]">{it.cartQty}x {it.name || it.productName}</span>
                  <span className="font-mono font-semibold">₹{((it.cartPrice || it.sellingPrice) * it.cartQty).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono">₹{completedOrderReceipt.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {completedOrderReceipt.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-mono">-₹{completedOrderReceipt.discountAmount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span className="font-mono">₹{completedOrderReceipt.taxTotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Paid ({completedOrderReceipt.paymentMethod})</span>
                <span className="font-mono">₹{completedOrderReceipt.grandTotal?.toLocaleString('en-IN')}</span>
              </div>
              {completedOrderReceipt.changeDue > 0 && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Change Given</span>
                  <span className="font-mono font-bold text-emerald-600">₹{completedOrderReceipt.changeDue?.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                <Printer size={14} />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setCompletedOrderReceipt(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
