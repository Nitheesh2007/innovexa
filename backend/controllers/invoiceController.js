const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const Purchase = require('../models/Purchase');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');
const { withTransaction } = require('../utils/transactionRunner');

// Helper to generate invoice number
const generateInvoiceNumber = async (type) => {
  const prefix = type === 'STOCK_IN' ? 'SI' : 'SO';
  const year = new Date().getFullYear();
  const lastInvoice = await Invoice.findOne({ invoiceType: type }).sort({ createdAt: -1 });
  let nextNum = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split('-');
    if (parts.length === 3) {
      nextNum = parseInt(parts[2], 10) + 1;
    }
  }
  let candidate = `${prefix}-${year}-${nextNum.toString().padStart(6, '0')}`;
  let exists = await Invoice.findOne({ invoiceNumber: candidate });
  while (exists) {
    nextNum++;
    candidate = `${prefix}-${year}-${nextNum.toString().padStart(6, '0')}`;
    exists = await Invoice.findOne({ invoiceNumber: candidate });
  }
  return candidate;
};

exports.createStockInInvoice = async (req, res) => {
  try {
    const invoice = await withTransaction(async (session) => {
      const { supplier, store, items, discountTotal = 0, paymentMethod, paidAmount = 0, notes } = req.body;
      
      if (!items || items.length === 0) throw new Error("No items provided");
      if (!supplier) throw new Error("Supplier is required");

      let subtotal = 0;
      let taxTotal = 0;
      const processedItems = [];

      for (const item of items) {
        const product = session 
          ? await Product.findById(item.product).session(session)
          : await Product.findById(item.product);
        if (!product) throw new Error(`Product not found: ${item.product}`);
        
        const qty = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount) || 0;
        const taxRate = Number(item.taxRate) || 0;

        if (qty <= 0) throw new Error("Quantity must be greater than 0");
        if (unitPrice < 0) throw new Error("Price cannot be negative");

        const itemSubtotal = (qty * unitPrice) - discount;
        const taxAmount = (itemSubtotal * taxRate) / 100;
        const itemTotal = itemSubtotal + taxAmount;

        subtotal += itemSubtotal;
        taxTotal += taxAmount;

        processedItems.push({
          product: product._id,
          productName: product.productName,
          sku: product.sku,
          quantity: qty,
          unitPrice,
          discount,
          taxRate,
          taxAmount,
          subtotal: itemSubtotal,
          total: itemTotal
        });

        const prevStock = product.currentStock;
        product.currentStock += qty;
        product.purchasePrice = unitPrice;
        
        if (product.currentStock > 0) product.status = 'In Stock';
        if (product.currentStock <= product.minimumStock) product.status = 'Low Stock';
        if (product.currentStock > (product.maximumStock || Infinity)) product.status = 'Overstock';

        if (session) await product.save({ session });
        else await product.save();

        const txPayload = {
          product: product._id,
          warehouse: store || product.warehouse,
          transactionType: 'Stock In',
          quantity: qty,
          previousStock: prevStock,
          newStock: product.currentStock,
          user: req.user.id,
          notes: `Stock in via Invoice`
        };
        if (session) await InventoryTransaction.create([txPayload], { session });
        else await InventoryTransaction.create([txPayload]);
      }

      const grandTotal = subtotal - discountTotal + taxTotal;
      const pendingAmount = grandTotal - paidAmount;
      let paymentStatus = 'PENDING';
      if (pendingAmount <= 0) paymentStatus = 'PAID';
      else if (paidAmount > 0) paymentStatus = 'PARTIAL';

      const invoiceNumber = await generateInvoiceNumber('STOCK_IN');

      const purchaseData = {
        purchaseNumber: `PO-${invoiceNumber}`,
        supplier,
        products: processedItems.map(i => ({ product: i.product, quantity: i.quantity, price: i.unitPrice, total: i.total })),
        totalAmount: grandTotal,
        status: 'Received'
      };
      const purchase = session 
        ? await Purchase.create([purchaseData], { session })
        : await Purchase.create([purchaseData]);

      const invoice = new Invoice({
        invoiceNumber,
        invoiceType: 'STOCK_IN',
        supplier,
        store,
        items: processedItems,
        subtotal,
        discountTotal,
        taxTotal,
        grandTotal,
        paymentMethod,
        paymentStatus,
        paidAmount,
        pendingAmount,
        purchase: purchase[0]._id,
        notes,
        createdBy: req.user.id
      });

      if (session) await invoice.save({ session });
      else await invoice.save();

      const supplierDoc = session 
        ? await Supplier.findById(supplier).session(session)
        : await Supplier.findById(supplier);
      if (supplierDoc && pendingAmount > 0) {
        supplierDoc.outstandingAmount = (supplierDoc.outstandingAmount || 0) + pendingAmount;
        if (session) await supplierDoc.save({ session });
        else await supplierDoc.save();
      }

      if (paidAmount > 0) {
        const paymentData = {
          invoice: invoice._id,
          supplier: supplierDoc?._id,
          amount: paidAmount,
          paymentMethod: paymentMethod || 'CASH',
          createdBy: req.user.id
        };
        if (session) await Payment.create([paymentData], { session });
        else await Payment.create([paymentData]);
      }

      return invoice;
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.createStockOutInvoice = async (req, res) => {
  try {
    const invoice = await withTransaction(async (session) => {
      const { customer, store, items, discountTotal = 0, paymentMethod, paidAmount = 0, notes } = req.body;
      
      if (!items || items.length === 0) throw new Error("No items provided");
      if (!customer) throw new Error("Customer is required");

      let subtotal = 0;
      let taxTotal = 0;
      const processedItems = [];

      for (const item of items) {
        const product = session 
          ? await Product.findById(item.product).session(session)
          : await Product.findById(item.product);
        if (!product) throw new Error(`Product not found: ${item.product}`);
        
        const qty = Number(item.quantity);
        const unitPrice = Number(item.unitPrice); 
        const discount = Number(item.discount) || 0;
        const taxRate = Number(item.taxRate) || 0;

        if (qty <= 0) throw new Error("Quantity must be greater than 0");
        if (unitPrice < 0) throw new Error("Price cannot be negative");

        if (product.currentStock < qty) {
          throw new Error(`Insufficient stock for ${product.productName}. Available: ${product.currentStock}`);
        }

        const itemSubtotal = (qty * unitPrice) - discount;
        const taxAmount = (itemSubtotal * taxRate) / 100;
        const itemTotal = itemSubtotal + taxAmount;

        subtotal += itemSubtotal;
        taxTotal += taxAmount;

        processedItems.push({
          product: product._id,
          productName: product.productName,
          sku: product.sku,
          quantity: qty,
          unitPrice,
          purchasePrice: product.purchasePrice,
          discount,
          taxRate,
          taxAmount,
          subtotal: itemSubtotal,
          total: itemTotal
        });

        const prevStock = product.currentStock;
        product.currentStock -= qty;
        
        if (product.currentStock === 0) product.status = 'Out of Stock';
        else if (product.currentStock <= product.minimumStock) product.status = 'Low Stock';
        
        if (session) await product.save({ session });
        else await product.save();

        const txPayload = {
          product: product._id,
          warehouse: store || product.warehouse, 
          transactionType: 'Stock Out',
          quantity: qty,
          previousStock: prevStock,
          newStock: product.currentStock,
          user: req.user.id,
          notes: `Sale via Invoice`
        };
        if (session) await InventoryTransaction.create([txPayload], { session });
        else await InventoryTransaction.create([txPayload]);
      }

      const grandTotal = subtotal - discountTotal + taxTotal;
      const pendingAmount = grandTotal - paidAmount;
      let paymentStatus = 'PENDING';
      if (pendingAmount <= 0) paymentStatus = 'PAID';
      else if (paidAmount > 0) paymentStatus = 'PARTIAL';

      const invoiceNumber = await generateInvoiceNumber('STOCK_OUT');

      let orderCandidate = `ORD-${invoiceNumber}`;
      let orderExists = await Order.findOne({ orderNumber: orderCandidate });
      let orderSuffix = 1;
      while (orderExists) {
        orderCandidate = `ORD-${invoiceNumber}-${orderSuffix}`;
        orderExists = await Order.findOne({ orderNumber: orderCandidate });
        orderSuffix++;
      }

      const orderData = {
        orderNumber: orderCandidate,
        customer,
        products: processedItems.map(i => ({ product: i.product, quantity: i.quantity, price: i.unitPrice, total: i.total })),
        totalAmount: grandTotal,
        paymentStatus: paymentStatus === 'PAID' ? 'Paid' : 'Pending',
        orderStatus: 'Completed'
      };
      const order = session 
        ? await Order.create([orderData], { session })
        : await Order.create([orderData]);

      const invoice = new Invoice({
        invoiceNumber,
        invoiceType: 'STOCK_OUT',
        customer,
        store,
        items: processedItems,
        subtotal,
        discountTotal,
        taxTotal,
        grandTotal,
        paymentMethod,
        paymentStatus,
        paidAmount,
        pendingAmount,
        order: order[0]._id,
        notes,
        createdBy: req.user.id
      });

      if (session) await invoice.save({ session });
      else await invoice.save();

      const customerDoc = session 
        ? await Customer.findById(customer).session(session)
        : await Customer.findById(customer);
      if (customerDoc && pendingAmount > 0) {
        customerDoc.outstandingAmount = (customerDoc.outstandingAmount || 0) + pendingAmount;
        if (session) await customerDoc.save({ session });
        else await customerDoc.save();
      }

      if (paidAmount > 0) {
        const paymentData = {
          invoice: invoice._id,
          customer: customerDoc?._id,
          amount: paidAmount,
          paymentMethod: paymentMethod || 'CASH',
          createdBy: req.user.id
        };
        if (session) await Payment.create([paymentData], { session });
        else await Payment.create([paymentData]);
      }

      return invoice;
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer', 'name')
      .populate('supplier', 'name companyName')
      .populate('items.product', 'productName sku')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name address phone email gstNumber')
      .populate('supplier', 'name companyName address phone email gstNumber');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    let PDFDocument;
    try {
      PDFDocument = require('pdfkit');
    } catch (err) {
      return res.status(500).json({ success: false, message: 'PDF generation module not installed. Please run npm install in the backend folder.' });
    }

    const invoice = await Invoice.findById(req.params.id)
      .populate('customer')
      .populate('supplier');

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    
    doc.pipe(res);

    // Number to Indian words helper for PDF
    const numberToWords = (num) => {
      const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const inWords = (n) => {
        let str = '';
        if (n >= 100) { str += a[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
        if (n >= 20) { str += b[Math.floor(n / 10)] + ' '; n %= 10; }
        if (n > 0) { str += a[n] + ' '; }
        return str.trim();
      };
      const roundNum = Math.round(Number(num) || 0);
      if (roundNum === 0) return 'Zero Only /-';
      let cr = Math.floor(roundNum / 10000000);
      let rem = roundNum % 10000000;
      let lk = Math.floor(rem / 100000);
      rem = rem % 100000;
      let th = Math.floor(rem / 1000);
      let hd = rem % 1000;
      let resStr = '';
      if (cr > 0) resStr += inWords(cr) + ' Crore ';
      if (lk > 0) resStr += inWords(lk) + ' Lakh ';
      if (th > 0) resStr += inWords(th) + ' Thousand ';
      if (hd > 0) resStr += inWords(hd) + ' ';
      return resStr.trim() + ' Only /-';
    };

    // Header Title
    doc.fontSize(22).font('Helvetica-Bold').text('Tax Invoice', { align: 'center' });
    doc.moveDown(0.8);
    
    // Seller Info
    doc.fontSize(14).font('Helvetica-Bold').text('Ravi kumar', 50, doc.y);
    doc.fontSize(9).font('Helvetica').text('Email: ravikumar124dubey@gmail.com');
    doc.text('Phone: 9508399874');
    doc.text('Address: Noida sector 44');
    doc.moveDown();

    // Box: Bill To & Invoice Details
    const boxTop = doc.y;
    doc.rect(50, boxTop, 500, 60).strokeColor('#6d5d55').stroke();
    doc.rect(50, boxTop, 250, 18).fillAndStroke('#6d5d55', '#6d5d55');
    doc.rect(300, boxTop, 250, 18).fillAndStroke('#6d5d55', '#6d5d55');

    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
    doc.text('BILL TO', 60, boxTop + 4);
    doc.text('INVOICE DETAILS', 310, boxTop + 4);

    doc.fillColor('#1a1a1a').fontSize(9).font('Helvetica');
    const partyName = invoice.invoiceType === 'STOCK_OUT' 
      ? (invoice.customer?.name || 'raman') 
      : (invoice.supplier?.companyName || 'Supplier');
    const partyPhone = invoice.invoiceType === 'STOCK_OUT' 
      ? (invoice.customer?.phone || '0000000000') 
      : (invoice.supplier?.phone || '0000000000');

    doc.text(partyName, 60, boxTop + 24);
    doc.text(`Phone: ${partyPhone}`, 60, boxTop + 38);

    doc.font('Helvetica-Bold').text('Invoice No: ', 310, boxTop + 24);
    doc.font('Helvetica').text(invoice.invoiceNumber, 380, boxTop + 24);
    doc.font('Helvetica-Bold').text('Invoice Date: ', 310, boxTop + 38);
    doc.font('Helvetica').text(new Date(invoice.invoiceDate).toLocaleDateString('en-GB') + ' ' + new Date(invoice.invoiceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 380, boxTop + 38);

    doc.y = boxTop + 75;

    // Items Table Header
    const tableTop = doc.y;
    doc.rect(50, tableTop, 500, 20).fillAndStroke('#6d5d55', '#6d5d55');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text('#', 55, tableTop + 5);
    doc.text('ITEMS', 80, tableTop + 5);
    doc.text('QTY', 260, tableTop + 5);
    doc.text('MRP (Rs.)', 310, tableTop + 5);
    doc.text('RATE (Rs.)', 380, tableTop + 5);
    doc.text('AMOUNT (Rs.)', 460, tableTop + 5);

    let y = tableTop + 20;
    doc.fillColor('#1a1a1a').font('Helvetica').fontSize(9);

    invoice.items.forEach((item, idx) => {
      doc.rect(50, y, 500, 20).strokeColor('#d1d5db').stroke();
      doc.text((idx + 1).toString(), 55, y + 5);
      doc.text(item.productName.substring(0, 32), 80, y + 5);
      doc.text(`${item.quantity} Unit`, 260, y + 5);
      doc.text(`Rs. ${Math.round(item.unitPrice).toLocaleString('en-IN')}`, 310, y + 5);
      doc.text(`Rs. ${item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 380, y + 5);
      doc.text(`Rs. ${item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 460, y + 5);
      y += 20;
    });

    // Total Row
    doc.rect(50, y, 500, 20).strokeColor('#6d5d55').stroke();
    doc.font('Helvetica-Bold');
    doc.text('Total', 80, y + 5);
    doc.text(`Rs. ${invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 460, y + 5);

    // Summary Box
    y += 30;
    doc.font('Helvetica').fontSize(9);
    doc.text(`Sub Total :  Rs. ${invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 320, y);
    y += 15;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text(`Total :  Rs. ${invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 320, y);
    y += 18;
    doc.font('Helvetica').fontSize(8);
    doc.text(`Invoice Amount In Words : ${numberToWords(invoice.grandTotal)}`, 50, y, { width: 500 });
    y += 20;
    doc.font('Helvetica').fontSize(9);
    doc.text(`Received :  Rs. ${(invoice.paidAmount || invoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 320, y);
    y += 15;
    doc.text(`Balance :  Rs. ${(invoice.pendingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 320, y);

    // Terms and Conditions
    y += 30;
    doc.rect(50, y, 500, 16).fillAndStroke('#6d5d55', '#6d5d55');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
    doc.text('TERMS AND CONDITIONS:', 55, y + 4);
    doc.rect(50, y + 16, 500, 30).strokeColor('#d1d5db').stroke();
    doc.fillColor('#444444').font('Helvetica').fontSize(8);
    doc.text('1. Goods once sold will not be taken back or exchanged.', 55, y + 22);
    doc.text('2. Subject to local jurisdiction. Interest @ 18% p.a. will be charged if bill is not paid on presentation.', 55, y + 32);

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelInvoice = async (req, res) => {
  try {
    const invoice = await withTransaction(async (session) => {
      const invoice = session 
        ? await Invoice.findById(req.params.id).session(session)
        : await Invoice.findById(req.params.id);
      if (!invoice) throw new Error('Invoice not found');
      
      if (invoice.status === 'CANCELLED') throw new Error('Invoice is already cancelled');

      for (const item of invoice.items) {
        const product = session 
          ? await Product.findById(item.product).session(session)
          : await Product.findById(item.product);
        if (product) {
          const prevStock = product.currentStock;
          if (invoice.invoiceType === 'STOCK_OUT') {
            product.currentStock += item.quantity;
          } else if (invoice.invoiceType === 'STOCK_IN') {
            if (product.currentStock < item.quantity) {
              throw new Error(`Cannot cancel Stock In. Insufficient stock remaining for ${product.productName}`);
            }
            product.currentStock -= item.quantity;
          }
          
          if (product.currentStock <= 0) product.status = 'Out of Stock';
          else if (product.currentStock <= product.minimumStock) product.status = 'Low Stock';
          else product.status = 'In Stock';

          if (session) await product.save({ session });
          else await product.save();

          const txPayload = {
            product: product._id,
            warehouse: invoice.store || product.warehouse,
            transactionType: 'Adjustment',
            quantity: item.quantity,
            previousStock: prevStock,
            newStock: product.currentStock,
            user: req.user.id,
            notes: `Invoice Cancellation: ${invoice.invoiceNumber}`
          };
          if (session) await InventoryTransaction.create([txPayload], { session });
          else await InventoryTransaction.create([txPayload]);
        }
      }

      if (invoice.invoiceType === 'STOCK_OUT' && invoice.customer && invoice.pendingAmount > 0) {
        const customer = session 
          ? await Customer.findById(invoice.customer).session(session)
          : await Customer.findById(invoice.customer);
        if (customer) {
          customer.outstandingAmount = Math.max(0, (customer.outstandingAmount || 0) - invoice.pendingAmount);
          if (session) await customer.save({ session });
          else await customer.save();
        }
      } else if (invoice.invoiceType === 'STOCK_IN' && invoice.supplier && invoice.pendingAmount > 0) {
        const supplier = session 
          ? await Supplier.findById(invoice.supplier).session(session)
          : await Supplier.findById(invoice.supplier);
        if (supplier) {
          supplier.outstandingAmount = Math.max(0, (supplier.outstandingAmount || 0) - invoice.pendingAmount);
          if (session) await supplier.save({ session });
          else await supplier.save();
        }
      }

      invoice.status = 'CANCELLED';
      invoice.paymentStatus = 'CANCELLED';
      
      if (invoice.order) {
        if (session) {
          await Order.findByIdAndUpdate(invoice.order, { orderStatus: 'Cancelled', paymentStatus: 'Cancelled' }, { session });
        } else {
          await Order.findByIdAndUpdate(invoice.order, { orderStatus: 'Cancelled', paymentStatus: 'Cancelled' });
        }
      }
      if (invoice.purchase) {
        if (session) {
          await Purchase.findByIdAndUpdate(invoice.purchase, { status: 'Cancelled' }, { session });
        } else {
          await Purchase.findByIdAndUpdate(invoice.purchase, { status: 'Cancelled' });
        }
      }

      if (session) await invoice.save({ session });
      else await invoice.save();

      return invoice;
    });

    res.status(200).json({ success: true, message: 'Invoice cancelled successfully', data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
