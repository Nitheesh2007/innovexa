import React, { useState } from 'react';
import { dashboardService, productService, inventoryService } from '../services/apiServices';
import { FileText, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  
  const downloadCSV = (filename, rows) => {
    if (!rows || !rows.length) return toast.error('No data to export');
    
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => headers.map(h => {
        let val = r[h];
        if (typeof val === 'object' && val !== null) {
          val = val.name || val.productName || val._id || '';
        }
        // Escape quotes
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleExportProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      downloadCSV('products_report.csv', res.data.data);
      toast.success('Products exported successfully');
    } catch (error) {
      toast.error('Failed to export products');
    } finally {
      setLoading(false);
    }
  };

  const handleExportInventoryHistory = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getHistory();
      downloadCSV('inventory_history_report.csv', res.data.data);
      toast.success('Inventory history exported successfully');
    } catch (error) {
      toast.error('Failed to export inventory history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <FileText size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Reports & Exports</h1>
          <p className="text-gray-500 text-sm">Download your data in CSV format for Excel or Google Sheets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center space-y-4">
          <FileSpreadsheet size={48} className="text-gray-400" />
          <h2 className="text-lg font-semibold">Products Report</h2>
          <p className="text-gray-500 text-sm flex-1">Export a complete list of all products, including their current stock, prices, SKUs, and statuses.</p>
          <button 
            onClick={handleExportProducts}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Download CSV
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center space-y-4">
          <FileText size={48} className="text-gray-400" />
          <h2 className="text-lg font-semibold">Inventory Transactions</h2>
          <p className="text-gray-500 text-sm flex-1">Export a detailed log of all stock movements (Stock In, Stock Out, Adjustments) with timestamps.</p>
          <button 
            onClick={handleExportInventoryHistory}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
