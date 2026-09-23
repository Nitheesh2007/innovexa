const Return = require('../models/Return');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const InventoryTransaction = require('../models/InventoryTransaction');
const mongoose = require('mongoose');
const { withTransaction } = require('../utils/transactionRunner');

const generateReturnNumber = async () => {
  const year = new Date().getFullYear();
  const lastReturn = await Return.findOne().sort({ createdAt: -1 });
  let nextNum = 1;
  if (lastReturn && lastReturn.returnNumber) {
    const parts = lastReturn.returnNumber.split('-');
    if (parts.length === 3) {
      nextNum = parseInt(parts[2], 10) + 1;
    }
  }
  return `RET-${year}-${nextNum.toString().padStart(6, '0')}`;
};

exports.processReturn = async (req, res) => {
  try {
    const returnDoc = await withTransaction(async (session) => {
      const { originalInvoiceId, returnType, items, reason, notes } = req.body;

      if (!originalInvoiceId || !returnType || !items || items.length === 0) {
        throw new Error('Missing required return details');
      }

      const invoice = session 
        ? await Invoice.findById(originalInvoiceId).session(session)
        : await Invoice.findById(originalInvoiceId);
      if (!invoice) throw new Error('Original invoice not found');

      if (returnType === 'CUSTOMER_RETURN' && invoice.invoiceType !== 'STOCK_OUT') {
        throw new Error('Invalid invoice type for customer return');
      }
      if (returnType === 'SUPPLIER_RETURN' && invoice.invoiceType !== 'STOCK_IN') {
        throw new Error('Invalid invoice type for supplier return');
      }

      let subtotal = 0;
      let taxTotal = 0;
      const processedItems = [];

      for (const item of items) {
        const originalItem = invoice.items.find(i => (i.product?._id || i.product).toString() === (item.product?._id || item.product).toString());
        if (!originalItem) throw new Error(`Product not found in original invoice`);

        const returnQty = Number(item.returnQuantity);
        if (returnQty <= 0) throw new Error('Return quantity must be greater than 0');
        if (returnQty > originalItem.quantity) {
          throw new Error(`Cannot return more than purchased for product ${originalItem.productName}`);
        }

        const unitPrice = originalItem.unitPrice;
        const taxRate = originalItem.taxRate || 0;
        
        const itemSubtotal = returnQty * unitPrice;
        const itemTax = (itemSubtotal * taxRate) / 100;
        const itemTotal = itemSubtotal + itemTax;

        subtotal += itemSubtotal;
        taxTotal += itemTax;

        processedItems.push({
          product: originalItem.product,
          productName: originalItem.productName,
          sku: originalItem.sku,
          returnQuantity: returnQty,
          unitPrice,
          taxAmount: itemTax,
          total: itemTotal,
          reason: item.reason || reason
        });

        const product = session 
          ? await Product.findById(originalItem.product).session(session)
          : await Product.findById(originalItem.product);
        const prevStock = product.currentStock;

        if (returnType === 'CUSTOMER_RETURN') {
          product.currentStock += returnQty;
          if (product.currentStock > 0 && product.status === 'Out of Stock') product.status = 'In Stock';
        } else {
          if (product.currentStock < returnQty) throw new Error(`Insufficient stock to return to supplier for ${product.productName}`);
          product.currentStock -= returnQty;
          if (product.currentStock === 0) product.status = 'Out of Stock';
        }
        
        if (session) await product.save({ session });
        else await product.save();

        const txPayload = {
          product: product._id,
          warehouse: invoice.store || product.warehouse,
          transactionType: 'Return',
          quantity: returnQty,
          previousStock: prevStock,
          newStock: product.currentStock,
          user: req.user.id,
          notes: `Return for invoice ${invoice.invoiceNumber}`
        };
        if (session) await InventoryTransaction.create([txPayload], { session });
        else await InventoryTransaction.create([txPayload]);
      }

      const grandTotal = subtotal + taxTotal;
      const returnNumber = await generateReturnNumber();

      const newReturn = new Return({
        returnNumber,
        originalInvoice: invoice._id,
        returnType,
        customer: invoice.customer,
        supplier: invoice.supplier,
        store: invoice.store,
        items: processedItems,
        subtotal,
        taxTotal,
        grandTotal,
        notes,
        createdBy: req.user.id
      });

      if (session) await newReturn.save({ session });
      else await newReturn.save();

      if (returnType === 'CUSTOMER_RETURN' && invoice.customer) {
        const customer = session 
          ? await Customer.findById(invoice.customer).session(session)
          : await Customer.findById(invoice.customer);
        if (customer) {
          customer.outstandingAmount = Math.max(0, (customer.outstandingAmount || 0) - grandTotal);
          if (session) await customer.save({ session });
          else await customer.save();
        }
      } else if (returnType === 'SUPPLIER_RETURN' && invoice.supplier) {
        const supplier = session 
          ? await Supplier.findById(invoice.supplier).session(session)
          : await Supplier.findById(invoice.supplier);
        if (supplier) {
          supplier.outstandingAmount = Math.max(0, (supplier.outstandingAmount || 0) - grandTotal);
          if (session) await supplier.save({ session });
          else await supplier.save();
        }
      }

      invoice.status = 'RETURNED';
      if (session) await invoice.save({ session });
      else await invoice.save();

      return newReturn;
    });

    res.status(201).json({ success: true, data: returnDoc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('customer', 'name')
      .populate('supplier', 'companyName name')
      .populate('originalInvoice', 'invoiceNumber')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: returns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
