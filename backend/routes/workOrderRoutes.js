const express = require('express');
const router = express.Router();
const WorkOrder = require('../models/WorkOrder');
const BOM = require('../models/BOM');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { protect } = require('../middleware/auth');

// GET all work orders
router.get('/', protect, async (req, res) => {
  try {
    const orders = await WorkOrder.find()
      .populate('finishedProduct', 'name sku price cost stock imageUrl category')
      .populate('bom', 'bomNumber name totalCalculatedCost components')
      .populate('warehouse', 'name code location')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single work order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await WorkOrder.findById(req.params.id)
      .populate('finishedProduct', 'name sku price cost stock imageUrl category')
      .populate({
        path: 'bom',
        populate: {
          path: 'components.product',
          select: 'name sku price cost stock'
        }
      })
      .populate('warehouse', 'name code location');
    if (!order) return res.status(404).json({ success: false, message: 'Work order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE work order
router.post('/', protect, async (req, res) => {
  try {
    const { bom, finishedProduct, targetQuantity, warehouse, priority, assignedTechnician, targetCompletionDate, notes } = req.body;
    const woCount = await WorkOrder.countDocuments();
    const orderNumber = req.body.orderNumber || `WO-${new Date().getFullYear()}-${String(woCount + 1).padStart(4, '0')}`;

    const newWO = new WorkOrder({
      orderNumber,
      bom,
      finishedProduct,
      targetQuantity: targetQuantity || 1,
      warehouse: warehouse || undefined,
      priority: priority || 'medium',
      assignedTechnician: assignedTechnician || 'Production Line 1',
      targetCompletionDate: targetCompletionDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes
    });

    await newWO.save();
    const populated = await WorkOrder.findById(newWO._id)
      .populate('finishedProduct', 'name sku price cost stock imageUrl')
      .populate('bom', 'bomNumber name totalCalculatedCost')
      .populate('warehouse', 'name code');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// UPDATE status of work order
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, actualProduced, scrapQuantity, notes } = req.body;
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });

    wo.status = status || wo.status;
    if (actualProduced !== undefined) wo.actualProduced = actualProduced;
    if (scrapQuantity !== undefined) wo.scrapQuantity = scrapQuantity;
    if (notes) wo.notes = notes;

    // If marked completed, run stock transaction
    if (status === 'completed' && wo.status !== 'completed') {
      wo.completedDate = new Date();
      
      const bom = await BOM.findById(wo.bom).populate('components.product');
      const finishedProd = await Product.findById(wo.finishedProduct);
      const unitsProduced = wo.actualProduced || wo.targetQuantity;

      // 1. Deduct component stocks
      if (bom && bom.components) {
        for (const item of bom.components) {
          const compProd = await Product.findById(item.product._id);
          if (compProd) {
            const requiredQty = item.quantity * unitsProduced;
            const prevStock = compProd.stock;
            compProd.stock = Math.max(0, compProd.stock - requiredQty);
            await compProd.save();

            await InventoryTransaction.create({
              product: compProd._id,
              warehouse: wo.warehouse,
              transactionType: 'STOCK_OUT',
              quantity: requiredQty,
              previousStock: prevStock,
              newStock: compProd.stock,
              user: req.user ? req.user._id : undefined,
              referenceNumber: wo.orderNumber,
              notes: `Component deducted for Work Order ${wo.orderNumber}`
            });
          }
        }
      }

      // 2. Add finished product stock
      if (finishedProd) {
        const prevStock = finishedProd.stock;
        finishedProd.stock += unitsProduced;
        await finishedProd.save();

        await InventoryTransaction.create({
          product: finishedProd._id,
          warehouse: wo.warehouse,
          transactionType: 'STOCK_IN',
          quantity: unitsProduced,
          previousStock: prevStock,
          newStock: finishedProd.stock,
          user: req.user ? req.user._id : undefined,
          referenceNumber: wo.orderNumber,
          notes: `Finished goods received from Work Order ${wo.orderNumber}`
        });
      }
    }

    await wo.save();

    const populated = await WorkOrder.findById(wo._id)
      .populate('finishedProduct', 'name sku price cost stock imageUrl')
      .populate('bom', 'bomNumber name totalCalculatedCost')
      .populate('warehouse', 'name code');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE work order
router.delete('/:id', protect, async (req, res) => {
  try {
    const wo = await WorkOrder.findByIdAndDelete(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    res.json({ success: true, message: 'Work order removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
