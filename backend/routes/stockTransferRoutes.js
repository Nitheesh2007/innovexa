const express = require('express');
const router = express.Router();
const StockTransfer = require('../models/StockTransfer');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { protect } = require('../middleware/auth');

// GET all transfers
router.get('/', protect, async (req, res) => {
  try {
    const transfers = await StockTransfer.find()
      .populate('sourceWarehouse', 'name code location')
      .populate('destinationWarehouse', 'name code location')
      .populate('items.product', 'name sku price cost stock')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE transfer
router.post('/', protect, async (req, res) => {
  try {
    const { sourceWarehouse, destinationWarehouse, items, carrier, notes } = req.body;
    if (sourceWarehouse === destinationWarehouse) {
      return res.status(400).json({ success: false, message: 'Source and destination warehouses cannot be the same' });
    }

    const count = await StockTransfer.countDocuments();
    const transferNumber = `TRF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const transfer = new StockTransfer({
      transferNumber,
      sourceWarehouse,
      destinationWarehouse,
      items,
      carrier: carrier || 'Internal Fleet Logistics',
      notes,
      status: 'draft',
      createdBy: req.user ? req.user.name : 'Operations'
    });

    await transfer.save();
    const populated = await StockTransfer.findById(transfer._id)
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('items.product', 'name sku stock');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DISPATCH transfer (Draft -> In Transit)
router.post('/:id/dispatch', protect, async (req, res) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id).populate('items.product');
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    if (transfer.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft transfers can be dispatched' });
    }

    // Deduct stock from source
    for (const item of transfer.items) {
      const prod = await Product.findById(item.product._id);
      if (prod) {
        const prevStock = prod.stock;
        prod.stock = Math.max(0, prod.stock - item.quantity);
        await prod.save();

        await InventoryTransaction.create({
          product: prod._id,
          warehouse: transfer.sourceWarehouse,
          transactionType: 'TRANSFER',
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: prod.stock,
          user: req.user ? req.user._id : undefined,
          referenceNumber: transfer.transferNumber,
          notes: `Dispatched in transfer ${transfer.transferNumber}`
        });
      }
    }

    transfer.status = 'in_transit';
    transfer.dispatchedAt = new Date();
    await transfer.save();

    res.json({ success: true, data: transfer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// RECEIVE transfer (In Transit -> Received)
router.post('/:id/receive', protect, async (req, res) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id).populate('items.product');
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    if (transfer.status !== 'in_transit') {
      return res.status(400).json({ success: false, message: 'Only in-transit transfers can be marked received' });
    }

    // Add stock to destination
    for (const item of transfer.items) {
      const prod = await Product.findById(item.product._id);
      if (prod) {
        const prevStock = prod.stock;
        prod.stock += item.quantity;
        await prod.save();

        await InventoryTransaction.create({
          product: prod._id,
          warehouse: transfer.destinationWarehouse,
          transactionType: 'TRANSFER',
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: prod.stock,
          user: req.user ? req.user._id : undefined,
          referenceNumber: transfer.transferNumber,
          notes: `Received from transfer ${transfer.transferNumber}`
        });
      }
    }

    transfer.status = 'received';
    transfer.receivedAt = new Date();
    await transfer.save();

    res.json({ success: true, data: transfer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
