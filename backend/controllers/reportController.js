const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

// Helper to apply date filters
const buildDateMatch = (field, startDate, endDate) => {
  if (startDate && endDate) {
    return { [field]: { $gte: new Date(startDate), $lte: new Date(endDate) } };
  }
  return {};
};

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { invoiceType: 'STOCK_OUT', status: { $ne: 'CANCELLED' }, ...buildDateMatch('createdAt', startDate, endDate) };

    const sales = await Invoice.find(matchStage).populate('customer', 'name').populate('items.product', 'productName sku').sort({ createdAt: -1 });

    const flattened = sales.map(s => ({
      "Invoice #": s.invoiceNumber,
      "Date": new Date(s.createdAt).toLocaleDateString(),
      "Customer": s.customer ? s.customer.name : 'Walk-in',
      "Total Items": s.items.reduce((acc, i) => acc + i.quantity, 0),
      "Subtotal": `₹${s.subtotal.toFixed(2)}`,
      "Discount": `₹${s.discount.toFixed(2)}`,
      "Tax": `₹${s.tax.toFixed(2)}`,
      "Grand Total": `₹${s.grandTotal.toFixed(2)}`,
      "Status": s.status
    }));

    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getPurchaseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { invoiceType: 'STOCK_IN', status: { $ne: 'CANCELLED' }, ...buildDateMatch('createdAt', startDate, endDate) };

    const purchases = await Invoice.find(matchStage).populate('supplier', 'companyName name').populate('items.product', 'productName sku').sort({ createdAt: -1 });

    const flattened = purchases.map(p => ({
      "Invoice #": p.invoiceNumber,
      "Date": new Date(p.createdAt).toLocaleDateString(),
      "Supplier": p.supplier ? p.supplier.companyName : 'Unknown',
      "Total Items": p.items.reduce((acc, i) => acc + i.quantity, 0),
      "Grand Total": `₹${p.grandTotal.toFixed(2)}`,
      "Status": p.status
    }));

    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name').populate('supplier', 'companyName').sort({ currentStock: 1 });
    
    const flattened = products.map(p => ({
      "SKU": p.sku,
      "Product Name": p.productName,
      "Category": p.category ? p.category.name : 'None',
      "Supplier": p.supplier ? p.supplier.companyName : 'None',
      "Current Stock": p.currentStock,
      "Min Stock": p.minimumStock,
      "Purchase Price": `₹${p.purchasePrice.toFixed(2)}`,
      "Selling Price": `₹${p.sellingPrice.toFixed(2)}`,
      "Status": p.status
    }));

    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getStockMovementReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { ...buildDateMatch('createdAt', startDate, endDate) };

    const txns = await InventoryTransaction.find(matchStage).populate('product', 'productName sku').populate('performedBy', 'name').sort({ createdAt: -1 });

    const flattened = txns.map(t => ({
      "Date": new Date(t.createdAt).toLocaleString(),
      "Product": t.product ? t.product.productName : 'Unknown',
      "SKU": t.product ? t.product.sku : 'Unknown',
      "Type": t.type,
      "Quantity Change": t.type === 'IN' || t.type === 'CUSTOMER_RETURN' || t.type === 'ADJUSTMENT_UP' ? `+${t.quantity}` : `-${t.quantity}`,
      "Previous Stock": t.previousStock,
      "New Stock": t.newStock,
      "Reference": t.reference || 'N/A',
      "User": t.performedBy ? t.performedBy.name : 'System'
    }));

    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getProfitLossReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateMatch = buildDateMatch('createdAt', startDate, endDate);
    
    const salesAgg = await Invoice.aggregate([
      { $match: { invoiceType: 'STOCK_OUT', status: { $ne: 'CANCELLED' }, ...dateMatch } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$items.total" },
          cogs: { $sum: { $multiply: ["$items.quantity", { $ifNull: ["$items.purchasePrice", 0] }] } }
        }
      }
    ]);

    const expenseMatch = buildDateMatch('date', startDate, endDate);
    const expAgg = await Expense.aggregate([
      { $match: { ...expenseMatch } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          expenses: { $sum: "$amount" }
        }
      }
    ]);

    const timeMap = {};
    salesAgg.forEach(s => timeMap[s._id] = { date: s._id, revenue: s.revenue, cogs: s.cogs, expenses: 0 });
    expAgg.forEach(e => {
      if (!timeMap[e._id]) timeMap[e._id] = { date: e._id, revenue: 0, cogs: 0, expenses: 0 };
      timeMap[e._id].expenses += e.expenses;
    });

    const flattened = Object.values(timeMap).sort((a, b) => a.date.localeCompare(b.date)).map(t => ({
      "Date": t.date,
      "Revenue": `₹${t.revenue.toFixed(2)}`,
      "COGS": `₹${t.cogs.toFixed(2)}`,
      "Gross Profit": `₹${(t.revenue - t.cogs).toFixed(2)}`,
      "Expenses": `₹${t.expenses.toFixed(2)}`,
      "Net Profit": `₹${(t.revenue - t.cogs - t.expenses).toFixed(2)}`
    }));

    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getExpenseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { ...buildDateMatch('date', startDate, endDate) };

    const expenses = await Expense.find(matchStage).sort({ date: -1 });

    const flattened = expenses.map(e => ({
      "Date": new Date(e.date).toLocaleDateString(),
      "Category": e.category,
      "Amount": `₹${e.amount.toFixed(2)}`,
      "Reference": e.reference || 'N/A',
      "Description": e.description || 'N/A'
    }));

    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getReturnsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const ReturnModel = mongoose.models.Return || require('../models/Return');
    const matchStage = { ...buildDateMatch('createdAt', startDate, endDate) };

    const returns = await ReturnModel.find(matchStage)
      .populate('customer', 'name')
      .populate('supplier', 'companyName')
      .populate('originalInvoice', 'invoiceNumber')
      .sort({ createdAt: -1 });

    const flattened = returns.map(r => ({
      "Return #": r.returnNumber,
      "Date": new Date(r.createdAt).toLocaleDateString(),
      "Type": r.returnType,
      "Party": r.returnType === 'CUSTOMER_RETURN' ? (r.customer?.name || 'Walk-in') : (r.supplier?.companyName || 'Unknown'),
      "Original Invoice": r.originalInvoice?.invoiceNumber || 'N/A',
      "Refund Amount": `₹${r.grandTotal.toFixed(2)}`,
      "Status": r.status
    }));

    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getCustomerReport = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ outstandingAmount: -1 });
    const flattened = customers.map(c => ({
      "Name": c.name,
      "Email": c.email || 'N/A',
      "Phone": c.phone || 'N/A',
      "Points": c.loyaltyPoints || 0,
      "Outstanding Owed": `₹${(c.outstandingAmount || 0).toFixed(2)}`,
      "Status": c.status
    }));
    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getSupplierReport = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ outstandingAmount: -1 });
    const flattened = suppliers.map(s => ({
      "Company Name": s.companyName,
      "Contact Person": s.name || s.contactPerson || 'N/A',
      "Email": s.email || 'N/A',
      "Phone": s.phone || 'N/A',
      "We Owe": `₹${(s.outstandingAmount || 0).toFixed(2)}`,
      "Status": s.status
    }));
    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getLowStockReport = async (req, res) => {
  try {
    const products = await Product.find({ $expr: { $lte: ['$currentStock', '$minimumStock'] } })
      .populate('category', 'name').populate('supplier', 'companyName').sort({ currentStock: 1 });
      
    const flattened = products.map(p => ({
      "SKU": p.sku,
      "Product Name": p.productName,
      "Supplier": p.supplier ? p.supplier.companyName : 'None',
      "Current Stock": p.currentStock,
      "Min Stock Required": p.minimumStock,
      "Deficit": p.minimumStock - p.currentStock,
      "Status": p.status
    }));
    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getExpiryReport = async (req, res) => {
  try {
    // Products expiring in next 60 days
    const next60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const products = await Product.find({ expiryDate: { $lte: next60Days } })
      .populate('category', 'name').sort({ expiryDate: 1 });
      
    const flattened = products.map(p => ({
      "SKU": p.sku,
      "Product Name": p.productName,
      "Current Stock": p.currentStock,
      "Expiry Date": new Date(p.expiryDate).toLocaleDateString(),
      "Status": p.expiryDate < new Date() ? 'EXPIRED' : 'EXPIRING SOON'
    }));
    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getDeadStockReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Default to last 90 days if no date provided
    let start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    let end = endDate ? new Date(endDate) : new Date();

    // Find all products
    const products = await Product.find({ currentStock: { $gt: 0 } }).populate('category', 'name');
    
    // Find all stock out transactions in period
    const activeProducts = await InventoryTransaction.distinct('product', {
      type: 'STOCK_OUT',
      createdAt: { $gte: start, $lte: end }
    });

    const activeIds = activeProducts.map(id => id.toString());
    
    const deadStock = products.filter(p => !activeIds.includes(p._id.toString()));

    const flattened = deadStock.map(p => ({
      "SKU": p.sku,
      "Product Name": p.productName,
      "Category": p.category ? p.category.name : 'None',
      "Current Stock": p.currentStock,
      "Value Trapped": `₹${(p.currentStock * p.purchasePrice).toFixed(2)}`
    }));

    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getOverstockReport = async (req, res) => {
  try {
    const products = await Product.find({ $expr: { $gt: ['$currentStock', '$maximumStock'] } })
      .populate('category', 'name').populate('supplier', 'companyName').sort({ currentStock: -1 });
      
    const flattened = products.map(p => ({
      "SKU": p.sku,
      "Product Name": p.productName,
      "Supplier": p.supplier ? p.supplier.companyName : 'None',
      "Current Stock": p.currentStock,
      "Max Stock Allowed": p.maximumStock,
      "Excess": p.currentStock - p.maximumStock,
      "Capital Tied Up": `₹${((p.currentStock - p.maximumStock) * p.purchasePrice).toFixed(2)}`
    }));
    res.status(200).json({ success: true, data: flattened });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
