import React, { useState, useEffect } from 'react';
import { reportService } from '../services/apiServices';
import { FileText, Download, Printer, Loader2, Calendar, FileSpreadsheet, Box, TrendingUp, DollarSign, Users, Truck, AlertTriangle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const REPORTS_LIST = [
  { id: 'sales', name: 'Sales Report', icon: TrendingUp, category: 'Sales & Purchases', endpoint: 'sales', hasDates: true },
  { id: 'purchases', name: 'Purchase Report', icon: FileSpreadsheet, category: 'Sales & Purchases', endpoint: 'purchases', hasDates: true },
  
  { id: 'inventory', name: 'Inventory Report', icon: Box, category: 'Inventory Health', endpoint: 'inventory', hasDates: false },
  { id: 'stock-movement', name: 'Stock Movement', icon: FileText, category: 'Inventory Health', endpoint: 'stock-movement', hasDates: true },
  { id: 'low-stock', name: 'Low Stock Report', icon: AlertTriangle, category: 'Inventory Health', endpoint: 'low-stock', hasDates: false },
  { id: 'expiry', name: 'Expiry Report', icon: Calendar, category: 'Inventory Health', endpoint: 'expiry', hasDates: false },
  { id: 'dead-stock', name: 'Dead Stock', icon: FileText, category: 'Inventory Health', endpoint: 'dead-stock', hasDates: true },
  { id: 'overstock', name: 'Overstock', icon: Box, category: 'Inventory Health', endpoint: 'overstock', hasDates: false },
  
  { id: 'profit-loss', name: 'Profit & Loss', icon: DollarSign, category: 'Finance', endpoint: 'profit-loss', hasDates: true },
  { id: 'expenses', name: 'Expense Report', icon: FileText, category: 'Finance', endpoint: 'expenses', hasDates: true },
  { id: 'returns', name: 'Returns Report', icon: FileText, category: 'Finance', endpoint: 'returns', hasDates: true },
  
  { id: 'customers', name: 'Customer Report', icon: Users, category: 'Directory', endpoint: 'customers', hasDates: false },
  { id: 'suppliers', name: 'Supplier Report', icon: Truck, category: 'Directory', endpoint: 'suppliers', hasDates: false },
];

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

const Reports = () => {
  const [activeReport, setActiveReport] = useState(REPORTS_LIST[0]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);

  // Filters
  const [dateRangeType, setDateRangeType] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Group reports by category
  const categories = [...new Set(REPORTS_LIST.map(r => r.category))];

  useEffect(() => {
    generateReport();
  }, [activeReport, dateRangeType]);

  const getDatesFromType = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let start, end;
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch(dateRangeType) {
      case 'today':
        start = today; end = tomorrow; break;
      case 'yesterday':
        start = new Date(today); start.setDate(start.getDate() - 1);
        end = today; break;
      case 'week':
        start = new Date(today); start.setDate(start.getDate() - start.getDay());
        end = tomorrow; break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = tomorrow; break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = tomorrow; break;
      case 'custom':
        if (!customStart || !customEnd) return null;
        start = new Date(customStart);
        end = new Date(customEnd);
        end.setDate(end.getDate() + 1);
        break;
      default: return null;
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      let params = {};
      if (activeReport.hasDates) {
        const dates = getDatesFromType();
        if (dates) params = dates;
        else if (dateRangeType === 'custom' && (!customStart || !customEnd)) {
          setLoading(false);
          return; // Wait for both dates
        }
      }

      const res = await reportService.getReport(activeReport.endpoint, params);
      const data = res.data.data;
      setReportData(data);
      if (data && data.length > 0) {
        setColumns(Object.keys(data[0]));
      } else {
        setColumns([]);
      }
    } catch (error) {
      toast.error('Failed to generate report');
      setReportData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData || !reportData.length) return toast.error('No data to export');
    
    const csvContent = [
      columns.join(','),
      ...reportData.map(row => columns.map(col => {
        let val = row[col] === null || row[col] === undefined ? '' : String(row[col]);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeReport.id}_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Report exported to CSV successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 report-container">
      {/* Sidebar: Report Selection (Hidden on Print) */}
      <div className="w-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden hide-on-print shrink-0">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="text-indigo-600" size={20} /> Report Types
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">{cat}</h3>
              <div className="space-y-1">
                {REPORTS_LIST.filter(r => r.category === cat).map(report => (
                  <button
                    key={report.id}
                    onClick={() => { setActiveReport(report); setReportData([]); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                      activeReport.id === report.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <report.icon size={16} className={activeReport.id === report.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} />
                    {report.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main View: Report Config & Table */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden printable-area">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full">
          
          {/* Top Bar: Filters & Actions */}
          <div className="p-4 lg:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-900/30 hide-on-print">
            <div className="flex-1">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{activeReport.name}</h1>
              <p className="text-sm text-gray-500">Auto-generated via live database aggregation</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {activeReport.hasDates && (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Filter size={16} className="text-gray-400 ml-2" />
                  <select
                    className="bg-transparent border-none outline-none text-sm font-medium py-1.5 px-2 cursor-pointer"
                    value={dateRangeType}
                    onChange={(e) => setDateRangeType(e.target.value)}
                  >
                    {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                  {dateRangeType === 'custom' && (
                    <div className="flex items-center gap-1 border-l dark:border-gray-700 pl-2 ml-1">
                      <input type="date" className="bg-transparent text-sm outline-none" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                      <span className="text-gray-400">-</span>
                      <input type="date" className="bg-transparent text-sm outline-none mr-2" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                      <button onClick={generateReport} className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded text-xs font-bold hover:bg-indigo-200 transition">Go</button>
                    </div>
                  )}
                </div>
              )}
              
              <button 
                onClick={downloadCSV}
                disabled={loading || reportData.length === 0}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} /> <span className="hidden lg:inline">Export CSV / Excel</span>
              </button>
              
              <button 
                onClick={handlePrint}
                disabled={loading || reportData.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer size={18} /> <span className="hidden lg:inline">Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 p-0 m-0">
            {/* Print Header */}
            <div className="print-only hidden pb-6 border-b border-gray-200 mb-6 text-center">
              <h1 className="text-3xl font-black text-gray-900">{activeReport.name}</h1>
              <p className="text-gray-600 mt-2">Generated on {new Date().toLocaleString()}</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center text-indigo-600">
                  <Loader2 size={40} className="animate-spin mb-4" />
                  <span className="font-medium animate-pulse">Aggregating database records...</span>
                </div>
              </div>
            ) : reportData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <FileSpreadsheet size={64} className="mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-gray-500">No data available</h3>
                <p className="text-sm mt-1">Try expanding your date filters or check another report.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-600 dark:text-gray-300 uppercase text-xs sticky top-0 shadow-sm z-10 border-b dark:border-gray-700">
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx} className="px-6 py-4 font-bold tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {reportData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      {columns.map((col, colIdx) => {
                        const val = row[col];
                        const isFinancial = typeof val === 'string' && (val.startsWith('₹') || val.startsWith('$'));
                        const isNegative = typeof val === 'number' && val < 0;
                        const isStockOut = val === 'STOCK_OUT' || val === 'Out of Stock' || val === 'EXPIRED';
                        return (
                          <td key={colIdx} className={`px-6 py-3 ${isFinancial ? 'font-mono font-medium text-emerald-700 dark:text-emerald-400' : ''} ${isNegative || isStockOut ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      
      {/* Global Print Styles embedded in component for convenience without modifying index.css */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .hide-on-print { display: none !important; }
          .print-only { display: block !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f2f2f2; -webkit-print-color-adjust: exact; }
          .report-container { height: auto !important; }
        }
      `}} />
    </div>
  );
};

export default Reports;
