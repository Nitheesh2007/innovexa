const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const InventoryTransaction = require('../models/InventoryTransaction');


exports.buildDynamicContext = async (message) => {
  const lowerMsg = message.toLowerCase();
  const context = { timestamp: new Date().toISOString() };

  try {
    // 1. Inventory Summary & Value
    if (lowerMsg.includes('value') || lowerMsg.includes('worth') || lowerMsg.includes('summary') || lowerMsg.includes('inventory')) {
      const products = await Product.find();
      const totalCost = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);
      const retailValue = products.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0);
      context.inventorySummary = {
        totalProductsCount: products.length,
        totalInventoryCost: `₹${totalCost.toFixed(2)}`,
        projectedRetailValue: `₹${retailValue.toFixed(2)}`,
        potentialGrossProfit: `₹${(retailValue - totalCost).toFixed(2)}`
      };
    }

    // 2. Low Stock / Out of Stock / Restock
    if (lowerMsg.includes('low stock') || lowerMsg.includes('out of stock') || lowerMsg.includes('restock')) {
      const lowStock = await Product.find({ $expr: { $lte: ['$currentStock', '$minimumStock'] } }).select('productName currentStock minimumStock supplier').populate('supplier', 'companyName');
      context.lowStockAlerts = lowStock.map(p => ({
        product: p.productName,
        currentStock: p.currentStock,
        minimumStock: p.minimumStock,
        suggestedSupplier: p.supplier ? p.supplier.companyName : 'None'
      }));
    }

    // 3. Expiry
    if (lowerMsg.includes('expir')) {
      const now = new Date();
      const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const expiring = await Product.find({ expiryDate: { $lte: next30Days } }).select('productName currentStock expiryDate');
      context.expiringProducts = expiring.map(p => ({
        product: p.productName,
        stock: p.currentStock,
        date: new Date(p.expiryDate).toLocaleDateString(),
        status: new Date(p.expiryDate) < now ? 'EXPIRED' : 'EXPIRING SOON'
      }));
    }

    // 4. Dead Stock & Overstock
    if (lowerMsg.includes('dead') || lowerMsg.includes('overstock')) {
      const overstock = await Product.find({ $expr: { $gt: ['$currentStock', '$maximumStock'] } }).select('productName currentStock maximumStock purchasePrice');
      context.overstockProducts = overstock.map(p => ({
        product: p.productName,
        excess: p.currentStock - p.maximumStock,
        capitalTiedUp: `₹${((p.currentStock - p.maximumStock) * p.purchasePrice).toFixed(2)}`
      }));
      
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const activeIds = await InventoryTransaction.distinct('product', { type: 'STOCK_OUT', createdAt: { $gte: last30Days } });
      const deadStock = await Product.find({ _id: { $nin: activeIds }, currentStock: { $gt: 0 } }).select('productName currentStock purchasePrice');
      context.deadStockProducts = deadStock.map(p => ({
        product: p.productName,
        stock: p.currentStock,
        valueTrapped: `₹${(p.currentStock * p.purchasePrice).toFixed(2)}`
      }));
    }

    // 5. Sales, Profit & Monthly Sales
    if (lowerMsg.includes('sale') || lowerMsg.includes('profit') || lowerMsg.includes('margin') || lowerMsg.includes('business')) {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);
      
      const salesAgg = await Invoice.aggregate([
        { $match: { invoiceType: 'STOCK_OUT', status: { $ne: 'CANCELLED' }, createdAt: { $gte: startOfMonth } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: null,
            monthlyRevenue: { $sum: "$items.total" },
            monthlyCOGS: { $sum: { $multiply: ["$items.quantity", { $ifNull: ["$items.purchasePrice", 0] }] } }
          }
        }
      ]);

      const todayAgg = await Invoice.aggregate([
        { $match: { invoiceType: 'STOCK_OUT', status: { $ne: 'CANCELLED' }, createdAt: { $gte: startOfToday } } },
        { $unwind: "$items" },
        { $group: { _id: null, todayRevenue: { $sum: "$items.total" } } }
      ]);

      const expAgg = await Expense.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $group: { _id: null, monthlyExpenses: { $sum: "$amount" } } }
      ]);

      const monthlyRev = salesAgg[0]?.monthlyRevenue || 0;
      const monthlyCOGS = salesAgg[0]?.monthlyCOGS || 0;
      const todayRev = todayAgg[0]?.todayRevenue || 0;
      const monthlyExp = expAgg[0]?.monthlyExpenses || 0;

      context.financials = {
        todaysSalesRevenue: `₹${todayRev.toFixed(2)}`,
        thisMonthsRevenue: `₹${monthlyRev.toFixed(2)}`,
        thisMonthsGrossProfit: `₹${(monthlyRev - monthlyCOGS).toFixed(2)}`,
        thisMonthsExpenses: `₹${monthlyExp.toFixed(2)}`,
        thisMonthsNetProfit: `₹${(monthlyRev - monthlyCOGS - monthlyExp).toFixed(2)}`
      };
    }

    // 6. Top Selling & Low Margin
    if (lowerMsg.includes('top') || lowerMsg.includes('margin')) {
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const topSales = await Invoice.aggregate([
        { $match: { invoiceType: 'STOCK_OUT', status: { $ne: 'CANCELLED' }, createdAt: { $gte: last30Days } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.product", sold: { $sum: "$items.quantity" } } },
        { $sort: { sold: -1 } },
        { $limit: 5 }
      ]);

      const populatedTop = await Product.populate(topSales, { path: '_id', select: 'productName sellingPrice purchasePrice' });
      context.topSellingProductsLast30Days = populatedTop.map(t => ({
        product: t._id?.productName || 'Unknown',
        quantitySold: t.sold
      }));

      // Low Margin
      const lowMargin = await Product.find({ $expr: { $lt: [ { $subtract: ['$sellingPrice', '$purchasePrice'] }, { $multiply: ['$purchasePrice', 0.1] } ] } }).select('productName purchasePrice sellingPrice');
      context.lowMarginProducts = lowMargin.map(p => ({
        product: p.productName,
        margin: `₹${(p.sellingPrice - p.purchasePrice).toFixed(2)}`
      }));
    }

    // 7. Pending Payments & Outstanding
    if (lowerMsg.includes('payment') || lowerMsg.includes('pending') || lowerMsg.includes('owe') || lowerMsg.includes('outstanding')) {
      const customers = await Customer.find({ outstandingAmount: { $gt: 0 } }).select('name outstandingAmount');
      const suppliers = await Supplier.find({ outstandingAmount: { $gt: 0 } }).select('companyName outstandingAmount');
      
      context.pendingPayments = {
        totalAccountsReceivable: `₹${customers.reduce((a,c) => a + c.outstandingAmount, 0).toFixed(2)}`,
        totalAccountsPayable: `₹${suppliers.reduce((a,s) => a + s.outstandingAmount, 0).toFixed(2)}`,
        topCustomersOweUs: customers.sort((a,b)=>b.outstandingAmount - a.outstandingAmount).slice(0,3).map(c => `${c.name}: ₹${c.outstandingAmount}`),
        topSuppliersWeOwe: suppliers.sort((a,b)=>b.outstandingAmount - a.outstandingAmount).slice(0,3).map(s => `${s.companyName}: ₹${s.outstandingAmount}`)
      };
    }

    // 8. Recent Transactions
    if (lowerMsg.includes('recent') || lowerMsg.includes('transaction')) {
      const txns = await InventoryTransaction.find().populate('product', 'productName').sort({ createdAt: -1 }).limit(5);
      context.recentInventoryMovements = txns.map(t => `${new Date(t.createdAt).toLocaleDateString()}: ${t.type} ${t.quantity}x ${t.product?.productName}`);
    }

  } catch (error) {
    console.error("Context Builder Error:", error);
    context.error = "Partial context loaded due to database aggregation error.";
  }

  return context;
};
