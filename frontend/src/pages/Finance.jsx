import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { PieChart, TrendingUp, TrendingDown, DollarSign, CreditCard, Activity, Users, Truck, History } from 'lucide-react';
import toast from 'react-hot-toast';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  
  // Dashboard
  const [timeseriesPeriod, setTimeseriesPeriod] = useState('monthly');
  const [timeseriesData, setTimeseriesData] = useState([]);
  
  // Ledgers
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [customerLedger, setCustomerLedger] = useState({ data: [], currentBalance: 0 });
  const [supplierLedger, setSupplierLedger] = useState({ data: [], currentBalance: 0 });

  // Payments
  const [payments, setPayments] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBaseData();
  }, []);

  useEffect(() => {
    fetchTimeseries();
  }, [timeseriesPeriod]);

  useEffect(() => {
    if (selectedCustomer) fetchCustomerLedger(selectedCustomer);
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedSupplier) fetchSupplierLedger(selectedSupplier);
  }, [selectedSupplier]);

  const fetchBaseData = async () => {
    try {
      const [statsRes, custRes, suppRes, payRes] = await Promise.allSettled([
        api.get('/finance/profit-loss'),
        api.get('/customers'),
        api.get('/suppliers'),
        api.get('/finance/payment-history')
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.data) {
        setStats(statsRes.value.data.data);
      } else {
        setStats({
          revenue: 0,
          cogs: 0,
          grossProfit: 0,
          totalExpenses: 0,
          netProfit: 0,
          receivables: 0,
          payables: 0
        });
      }

      if (custRes.status === 'fulfilled' && custRes.value?.data?.data) {
        setCustomers(Array.isArray(custRes.value.data.data) ? custRes.value.data.data : []);
      }
      if (suppRes.status === 'fulfilled' && suppRes.value?.data?.data) {
        setSuppliers(Array.isArray(suppRes.value.data.data) ? suppRes.value.data.data : []);
      }
      if (payRes.status === 'fulfilled' && payRes.value?.data?.data) {
        setPayments(Array.isArray(payRes.value.data.data) ? payRes.value.data.data : []);
      }
    } catch (err) {
      console.warn('Base finance data load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeseries = async () => {
    try {
      const res = await api.get(`/finance/timeseries?timeframe=${timeseriesPeriod}`);
      setTimeseriesData(res.data?.data || []);
    } catch (error) {
      console.warn('Timeseries warning:', error);
      setTimeseriesData([]);
    }
  };

  const fetchCustomerLedger = async (id) => {
    try {
      const res = await api.get(`/finance/customer-ledger/${id}`);
      setCustomerLedger(res.data?.data || res.data || { data: [], currentBalance: 0 });
    } catch (error) {
      console.warn('Customer ledger warning:', error);
      setCustomerLedger({ data: [], currentBalance: 0 });
    }
  };

  const fetchSupplierLedger = async (id) => {
    try {
      const res = await api.get(`/finance/supplier-ledger/${id}`);
      setSupplierLedger(res.data?.data || res.data || { data: [], currentBalance: 0 });
    } catch (error) {
      console.warn('Supplier ledger warning:', error);
      setSupplierLedger({ data: [], currentBalance: 0 });
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, positive }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden shadow-sm"
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${colorClass}`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">
            ${value?.toFixed(2) || '0.00'}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-current`}>
          <Icon size={22} />
        </div>
      </div>
      {positive !== undefined && (
        <div className="mt-3 flex items-center text-xs font-medium">
          {positive ? (
            <span className="text-emerald-500 flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md"><TrendingUp size={14} className="mr-1"/> Profitable</span>
          ) : (
            <span className="text-red-500 flex items-center bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md"><TrendingDown size={14} className="mr-1"/> Loss</span>
          )}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex flex-col h-full">
      <div>
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 flex items-center gap-2">
          <Activity className="text-indigo-600" /> Finance & Ledger
        </h1>
        <p className="text-gray-500 mt-1">Real-time profitability, expenses, and comprehensive ledgers.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { id: 'dashboard', label: 'Profit & Loss', icon: Activity },
          { id: 'customer', label: 'Customer Ledger', icon: Users },
          { id: 'supplier', label: 'Supplier Ledger', icon: Truck },
          { id: 'payments', label: 'Payment History', icon: History }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="flex-1">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Revenue" value={stats?.revenue} icon={DollarSign} colorClass="bg-blue-500 text-blue-600" />
                <StatCard title="Total COGS" value={stats?.cogs} icon={TrendingDown} colorClass="bg-orange-500 text-orange-600" />
                <StatCard title="Gross Profit" value={stats?.grossProfit} icon={PieChart} colorClass="bg-indigo-500 text-indigo-600" />
                <StatCard title="Total Expenses" value={stats?.totalExpenses} icon={CreditCard} colorClass="bg-red-500 text-red-600" />
                <StatCard title="Net Profit" value={stats?.netProfit} icon={TrendingUp} colorClass="bg-emerald-500 text-emerald-600" positive={stats?.netProfit >= 0} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Outstanding Balances</h2>
                    <div className="space-y-3">
                      <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-green-800 dark:text-green-400 text-sm">Receivables</h4>
                          <p className="text-[10px] uppercase text-green-600 dark:text-green-500">Owed by Customers</p>
                        </div>
                        <span className="text-xl font-bold text-green-700 dark:text-green-400 font-mono">₹{Number(stats?.receivables || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm">Payables</h4>
                          <p className="text-[10px] uppercase text-amber-600 dark:text-amber-500">Owed to Suppliers</p>
                        </div>
                        <span className="text-xl font-bold text-amber-700 dark:text-amber-400 font-mono">₹{Number(stats?.payables || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[500px]">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-lg font-bold">Profitability Timeseries</h2>
                    <select 
                      className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-sm font-medium"
                      value={timeseriesPeriod}
                      onChange={e => setTimeseriesPeriod(e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase sticky top-0 shadow-sm z-10 border-b dark:border-gray-700">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Period</th>
                          <th className="px-4 py-3 font-semibold text-right text-blue-600">Revenue</th>
                          <th className="px-4 py-3 font-semibold text-right text-orange-600">COGS</th>
                          <th className="px-4 py-3 font-semibold text-right text-indigo-600">Gross Profit</th>
                          <th className="px-4 py-3 font-semibold text-right text-red-600">Expenses</th>
                          <th className="px-4 py-3 font-semibold text-right text-emerald-600">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {timeseriesData.map((t, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-mono">
                            <td className="px-4 py-3 font-medium font-sans">{t.period}</td>
                            <td className="px-4 py-3 text-right text-blue-600 font-medium">₹{Number(t.revenue || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-right text-orange-600">₹{Number(t.cogs || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-right text-indigo-600 font-semibold">₹{Number(t.grossProfit || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-right text-red-600">₹{Number(t.expenses || 0).toLocaleString('en-IN')}</td>
                            <td className={`px-4 py-3 text-right font-bold ${t.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              ₹{Number(t.netProfit || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                        {timeseriesData.length === 0 && (
                          <tr><td colSpan="6" className="text-center py-8 text-gray-500">No data available for this timeframe</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMER LEDGER */}
          {activeTab === 'customer' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[70vh]">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2"><Users className="text-indigo-500" size={20}/> Customer Ledger</h2>
                <div className="flex items-center gap-4">
                  <select 
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-sm font-medium w-64"
                    value={selectedCustomer}
                    onChange={e => setSelectedCustomer(e.target.value)}
                  >
                    <option value="">Select a Customer...</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  {selectedCustomer && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 font-mono">
                      Balance: <span className="font-bold">₹{Number(customerLedger.currentBalance || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase sticky top-0 shadow-sm z-10 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Reference</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="px-4 py-3 font-semibold text-right">Debit (Invoice)</th>
                      <th className="px-4 py-3 font-semibold text-right">Credit (Payment)</th>
                      <th className="px-4 py-3 font-semibold text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-mono text-xs">
                    {!selectedCustomer ? (
                      <tr><td colSpan="6" className="text-center py-12 text-gray-500 font-sans">Please select a customer to view their ledger</td></tr>
                    ) : customerLedger.data.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-12 text-gray-500 font-sans">No transactions found for this customer</td></tr>
                    ) : (
                      customerLedger.data.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 font-sans">{new Date(entry.date).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300 font-sans">{entry.reference}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-sans">{entry.description}</td>
                          <td className="px-4 py-3 text-right text-red-600">{entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}</td>
                          <td className="px-4 py-3 text-right text-emerald-600">{entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}</td>
                          <td className="px-4 py-3 text-right font-bold">₹{entry.balance?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SUPPLIER LEDGER */}
          {activeTab === 'supplier' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[70vh]">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2"><Truck className="text-indigo-500" size={20}/> Supplier Ledger</h2>
                <div className="flex items-center gap-4">
                  <select 
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-sm font-medium w-64"
                    value={selectedSupplier}
                    onChange={e => setSelectedSupplier(e.target.value)}
                  >
                    <option value="">Select a Supplier...</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName}</option>)}
                  </select>
                  {selectedSupplier && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 font-mono">
                      Balance: <span className="font-bold">₹{Number(supplierLedger.currentBalance || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase sticky top-0 shadow-sm z-10 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Reference</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="px-4 py-3 font-semibold text-right">Debit (Invoice)</th>
                      <th className="px-4 py-3 font-semibold text-right">Credit (Payment)</th>
                      <th className="px-4 py-3 font-semibold text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-mono text-xs">
                    {!selectedSupplier ? (
                      <tr><td colSpan="6" className="text-center py-12 text-gray-500 font-sans">Please select a supplier to view their ledger</td></tr>
                    ) : supplierLedger.data.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-12 text-gray-500 font-sans">No transactions found for this supplier</td></tr>
                    ) : (
                      supplierLedger.data.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 font-sans">{new Date(entry.date).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300 font-sans">{entry.reference}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-sans">{entry.description}</td>
                          <td className="px-4 py-3 text-right text-red-600">{entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}</td>
                          <td className="px-4 py-3 text-right text-emerald-600">{entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}</td>
                          <td className="px-4 py-3 text-right font-bold">₹{entry.balance?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PAYMENTS HISTORY */}
          {activeTab === 'payments' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[70vh]">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-lg font-bold flex items-center gap-2"><History className="text-indigo-500" size={20}/> Payment History</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase sticky top-0 shadow-sm z-10 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Reference</th>
                      <th className="px-4 py-3 font-semibold">Party</th>
                      <th className="px-4 py-3 font-semibold">Invoice Ref</th>
                      <th className="px-4 py-3 font-semibold">Method</th>
                      <th className="px-4 py-3 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {payments.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-12 text-gray-500">No payments recorded</td></tr>
                    ) : (
                      payments.map((pay) => (
                        <tr key={pay._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3">{new Date(pay.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300">{pay.reference || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {pay.customer ? pay.customer.name : pay.supplier ? pay.supplier.companyName : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-indigo-600">{pay.invoice?.invoiceNumber || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold">{pay.paymentMethod}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600">${pay.amount.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Finance;
