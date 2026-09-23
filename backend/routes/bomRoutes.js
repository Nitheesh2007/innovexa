const express = require('express');
const router = express.Router();
const BOM = require('../models/BOM');
const Product = require('../models/Product');
const WorkOrder = require('../models/WorkOrder');
const { protect } = require('../middleware/auth');

// GET all BOMs with populated product names
router.get('/', protect, async (req, res) => {
  try {
    const boms = await BOM.find()
      .populate('finishedProduct', 'name sku price cost stock imageUrl')
      .populate('components.product', 'name sku price cost stock')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: boms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single BOM by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id)
      .populate('finishedProduct', 'name sku price cost stock imageUrl')
      .populate('components.product', 'name sku price cost stock');
    if (!bom) return res.status(404).json({ success: false, message: 'BOM not found' });
    res.json({ success: true, data: bom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET production availability check for a BOM
router.get('/:id/availability', protect, async (req, res) => {
  try {
    const targetQty = Number(req.query.quantity) || 1;
    const bom = await BOM.findById(req.params.id).populate('components.product', 'name sku stock cost');
    if (!bom) return res.status(404).json({ success: false, message: 'BOM not found' });

    let maxPossibleUnits = Infinity;
    const componentReadiness = bom.components.map(item => {
      const comp = item.product;
      const totalNeeded = item.quantity * targetQty;
      const currentStock = comp ? comp.stock : 0;
      const maxUnitsForThis = comp ? Math.floor(currentStock / item.quantity) : 0;
      if (maxUnitsForThis < maxPossibleUnits) {
        maxPossibleUnits = maxUnitsForThis;
      }

      return {
        productId: comp ? comp._id : null,
        productName: comp ? comp.name : 'Unknown',
        sku: comp ? comp.sku : 'N/A',
        qtyPerUnit: item.quantity,
        totalRequired: totalNeeded,
        availableStock: currentStock,
        isSufficient: currentStock >= totalNeeded,
        shortage: Math.max(0, totalNeeded - currentStock)
      };
    });

    res.json({
      success: true,
      data: {
        bomNumber: bom.bomNumber,
        targetQuantity: targetQty,
        canProduceTarget: maxPossibleUnits >= targetQty,
        maximumProduceable: maxPossibleUnits === Infinity ? 0 : maxPossibleUnits,
        components: componentReadiness
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE new BOM
router.post('/', protect, async (req, res) => {
  try {
    const { name, finishedProduct, components, laborCost, overheadCost, description, version, yieldPercentage } = req.body;
    
    // Auto-generate BOM number if not provided
    const count = await BOM.countDocuments();
    const bomNumber = req.body.bomNumber || `BOM-${String(count + 1).padStart(4, '0')}`;

    // Enrich component unitCost from product if 0
    const enrichedComponents = await Promise.all(
      (components || []).map(async (c) => {
        let cost = c.unitCost;
        if (!cost || cost === 0) {
          const prod = await Product.findById(c.product);
          if (prod) cost = prod.cost || prod.price * 0.6;
        }
        return {
          product: c.product,
          quantity: c.quantity,
          unitCost: cost || 0,
          scrapAllowancePct: c.scrapAllowancePct || 0,
          notes: c.notes || ''
        };
      })
    );

    const newBOM = new BOM({
      bomNumber,
      name,
      finishedProduct,
      components: enrichedComponents,
      laborCost: laborCost || 0,
      overheadCost: overheadCost || 0,
      description,
      version: version || '1.0',
      yieldPercentage: yieldPercentage || 100
    });

    await newBOM.save();
    const populated = await BOM.findById(newBOM._id)
      .populate('finishedProduct', 'name sku price cost stock imageUrl')
      .populate('components.product', 'name sku price cost stock');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// CREATE Work Order directly from BOM
router.post('/:id/create-work-order', protect, async (req, res) => {
  try {
    const { targetQuantity, warehouse, priority, notes } = req.body;
    const bom = await BOM.findById(req.params.id);
    if (!bom) return res.status(404).json({ success: false, message: 'BOM not found' });

    const woCount = await WorkOrder.countDocuments();
    const orderNumber = `WO-${new Date().getFullYear()}-${String(woCount + 1).padStart(4, '0')}`;

    const workOrder = new WorkOrder({
      orderNumber,
      bom: bom._id,
      finishedProduct: bom.finishedProduct,
      targetQuantity: targetQuantity || 1,
      warehouse: warehouse || undefined,
      priority: priority || 'medium',
      status: 'scheduled',
      notes: notes || `Created from ${bom.bomNumber} (${bom.name})`
    });

    await workOrder.save();
    const populated = await WorkOrder.findById(workOrder._id)
      .populate('finishedProduct', 'name sku price cost stock imageUrl')
      .populate('bom', 'bomNumber name totalCalculatedCost');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// UPDATE BOM
router.put('/:id', protect, async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);
    if (!bom) return res.status(404).json({ success: false, message: 'BOM not found' });

    Object.assign(bom, req.body);
    await bom.save();

    const populated = await BOM.findById(bom._id)
      .populate('finishedProduct', 'name sku price cost stock imageUrl')
      .populate('components.product', 'name sku price cost stock');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE BOM
router.delete('/:id', protect, async (req, res) => {
  try {
    const bom = await BOM.findByIdAndDelete(req.params.id);
    if (!bom) return res.status(404).json({ success: false, message: 'BOM not found' });
    res.json({ success: true, message: 'BOM deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
