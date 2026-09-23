const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');
const { withTransaction } = require('../utils/transactionRunner');

exports.addExpense = async (req, res) => {
  try {
    const { title, category, amount, paymentMethod, reference, notes } = req.body;
    
    if (!title || !category || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const expense = await Expense.create({
      title,
      category,
      amount,
      paymentMethod,
      reference,
      notes,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const payment = await withTransaction(async (session) => {
      const { invoiceId, amount, paymentMethod, reference, notes } = req.body;
      
      if (!invoiceId || !amount) {
        throw new Error('Invoice ID and amount are required');
      }

      const invoice = session 
        ? await Invoice.findById(invoiceId).session(session)
        : await Invoice.findById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');

      if (amount > invoice.pendingAmount) {
        throw new Error(`Amount exceeds pending amount of ${invoice.pendingAmount}`);
      }

      const payment = new Payment({
        invoice: invoice._id,
        amount,
        paymentMethod: paymentMethod || 'CASH',
        reference,
        notes,
        createdBy: req.user.id
      });

      if (invoice.invoiceType === 'STOCK_OUT') {
        payment.customer = invoice.customer;
        const customer = session 
          ? await Customer.findById(invoice.customer).session(session)
          : await Customer.findById(invoice.customer);
        if (customer) {
          customer.outstandingAmount = Math.max(0, (customer.outstandingAmount || 0) - amount);
          if (session) await customer.save({ session });
          else await customer.save();
        }
      } else {
        payment.supplier = invoice.supplier;
        const supplier = session 
          ? await Supplier.findById(invoice.supplier).session(session)
          : await Supplier.findById(invoice.supplier);
        if (supplier) {
          supplier.outstandingAmount = Math.max(0, (supplier.outstandingAmount || 0) - amount);
          if (session) await supplier.save({ session });
          else await supplier.save();
        }
      }

      if (session) await payment.save({ session });
      else await payment.save();

      invoice.paidAmount += amount;
      invoice.pendingAmount -= amount;
      invoice.paymentStatus = invoice.pendingAmount <= 0 ? 'PAID' : 'PARTIAL';

      if (session) await invoice.save({ session });
      else await invoice.save();

      return payment;
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProfitAndLoss = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchStage = {};
    if (startDate && endDate) {
      matchStage.invoiceDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    // Calculate Sales (Revenue) and COGS
    const salesAggregation = await Invoice.aggregate([
      { $match: { invoiceType: 'STOCK_OUT', status: { $ne: 'CANCELLED' }, ...matchStage } },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$items.total" },
          cogs: { $sum: { $multiply: ["$items.quantity", { $ifNull: ["$items.purchasePrice", 0] }] } },
          totalDiscount: { $sum: "$items.discount" }
        }
      }
    ]);

    const salesStats = salesAggregation[0] || { revenue: 0, cogs: 0, totalDiscount: 0 };
    
    const grossProfit = salesStats.revenue - salesStats.cogs;

    // Calculate Expenses
    let expenseMatch = {};
    if (startDate && endDate) {
      expenseMatch.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const expenseAggregation = await Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" }
        }
      }
    ]);

    const totalExpenses = expenseAggregation[0]?.totalExpenses || 0;
    const netProfit = grossProfit - totalExpenses;

    // Calculate Receivables and Payables
    const receivablesAggregation = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: "$outstandingAmount" } } }
    ]);
    const payablesAggregation = await Supplier.aggregate([
      { $group: { _id: null, total: { $sum: "$outstandingAmount" } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenue: salesStats.revenue,
        cogs: salesStats.cogs,
        grossProfit,
        totalExpenses,
        netProfit,
        receivables: receivablesAggregation[0]?.total || 0,
        payables: payablesAggregation[0]?.total || 0
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomerLedger = async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId) return res.status(400).json({ success: false, message: 'Customer ID required' });

    const invoices = await Invoice.find({ customer: customerId, status: { $ne: 'CANCELLED' } }).select('invoiceNumber invoiceDate grandTotal createdAt');
    const payments = await Payment.find({ customer: customerId }).select('reference amount createdAt paymentMethod');
    const ReturnModel = mongoose.models.Return || require('../models/Return');
    const returns = await ReturnModel.find({ customer: customerId, returnType: 'CUSTOMER_RETURN' }).select('returnNumber grandTotal createdAt');

    // Combine and sort chronologically
    const ledger = [];
    invoices.forEach(inv => ledger.push({ date: inv.invoiceDate || inv.createdAt, reference: inv.invoiceNumber, description: 'Sales Invoice', debit: inv.grandTotal, credit: 0 }));
    payments.forEach(pay => ledger.push({ date: pay.createdAt, reference: pay.reference || 'PAYMENT', description: `Payment via ${pay.paymentMethod}`, debit: 0, credit: pay.amount }));
    returns.forEach(ret => ledger.push({ date: ret.createdAt, reference: ret.returnNumber, description: 'Customer Return', debit: 0, credit: ret.grandTotal }));

    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;
    const finalLedger = ledger.map(entry => {
      balance += (entry.debit - entry.credit);
      return { ...entry, balance };
    });

    res.status(200).json({ success: true, data: finalLedger, currentBalance: balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSupplierLedger = async (req, res) => {
  try {
    const { supplierId } = req.params;
    if (!supplierId) return res.status(400).json({ success: false, message: 'Supplier ID required' });

    const invoices = await Invoice.find({ supplier: supplierId, status: { $ne: 'CANCELLED' } }).select('invoiceNumber invoiceDate grandTotal createdAt');
    const payments = await Payment.find({ supplier: supplierId }).select('reference amount createdAt paymentMethod');
    const ReturnModel = mongoose.models.Return || require('../models/Return');
    const returns = await ReturnModel.find({ supplier: supplierId, returnType: 'SUPPLIER_RETURN' }).select('returnNumber grandTotal createdAt');

    const ledger = [];
    invoices.forEach(inv => ledger.push({ date: inv.invoiceDate || inv.createdAt, reference: inv.invoiceNumber, description: 'Purchase Invoice', debit: inv.grandTotal, credit: 0 }));
    payments.forEach(pay => ledger.push({ date: pay.createdAt, reference: pay.reference || 'PAYMENT', description: `Payment via ${pay.paymentMethod}`, debit: 0, credit: pay.amount }));
    returns.forEach(ret => ledger.push({ date: ret.createdAt, reference: ret.returnNumber, description: 'Supplier Return', debit: 0, credit: ret.grandTotal }));

    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;
    const finalLedger = ledger.map(entry => {
      balance += (entry.debit - entry.credit); // For suppliers, debit is what we owe them (invoice), credit is our payment to them
      return { ...entry, balance };
    });

    res.status(200).json({ success: true, data: finalLedger, currentBalance: balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find().populate('customer', 'name').populate('supplier', 'companyName name').populate('invoice', 'invoiceNumber').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfitTimeseries = async (req, res) => {
  try {
    const { timeframe } = req.query; // 'daily', 'weekly', 'monthly', 'yearly'
    
    let formatString = "%Y-%m-%d"; // daily
    if (timeframe === 'monthly') formatString = "%Y-%m";
    if (timeframe === 'yearly') formatString = "%Y";
    if (timeframe === 'weekly') formatString = "%Y-W%V"; // iso week

    const salesAggregation = await Invoice.aggregate([
      { $match: { invoiceType: 'STOCK_OUT', status: { $ne: 'CANCELLED' } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { $dateToString: { format: formatString, date: "$createdAt" } },
          revenue: { $sum: "$items.total" },
          cogs: { $sum: { $multiply: ["$items.quantity", { $ifNull: ["$items.purchasePrice", 0] }] } }
        }
      }
    ]);

    const expenseAggregation = await Expense.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: formatString, date: "$date" } },
          expenses: { $sum: "$amount" }
        }
      }
    ]);

    // Map results together by date string
    const timeMap = {};
    
    salesAggregation.forEach(s => {
      timeMap[s._id] = { period: s._id, revenue: s.revenue, cogs: s.cogs, grossProfit: s.revenue - s.cogs, expenses: 0, netProfit: s.revenue - s.cogs };
    });

    expenseAggregation.forEach(e => {
      if (!timeMap[e._id]) {
        timeMap[e._id] = { period: e._id, revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 };
      }
      timeMap[e._id].expenses += e.expenses;
      timeMap[e._id].netProfit -= e.expenses;
    });

    const timeseries = Object.values(timeMap).sort((a, b) => a.period.localeCompare(b.period));

    res.status(200).json({ success: true, data: timeseries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
