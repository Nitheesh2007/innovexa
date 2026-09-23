const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const { protect } = require('../middleware/auth');

// GET all assets
router.get('/', protect, async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    // Recalculate book values on retrieval
    const enriched = assets.map(a => {
      a.calculateBookValue();
      return a;
    });
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single asset
router.get('/:id', protect, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    asset.calculateBookValue();
    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE new asset
router.post('/', protect, async (req, res) => {
  try {
    const count = await Asset.countDocuments();
    const assetTag = req.body.assetTag || `AST-${String(count + 1).padStart(4, '0')}`;
    
    const asset = new Asset({
      ...req.body,
      assetTag
    });

    await asset.save();
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// CHECK OUT / CHECK IN custody workflow
router.post('/:id/custody', protect, async (req, res) => {
  try {
    const { action, custodian, custodianEmail, location, notes } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (action === 'check_out') {
      asset.status = 'checked_out';
      asset.custodian = custodian || 'Assigned Staff';
      asset.custodianEmail = custodianEmail;
      if (location) asset.location = location;
    } else if (action === 'check_in') {
      asset.status = 'active';
      asset.custodian = 'Facility Storage';
      asset.custodianEmail = undefined;
      if (location) asset.location = location;
    } else if (action === 'maintenance') {
      asset.status = 'in_maintenance';
      if (notes) asset.maintenanceNotes = notes;
    }

    await asset.save();
    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// RECORD Maintenance
router.post('/:id/maintenance', protect, async (req, res) => {
  try {
    const { notes, nextMaintenanceDate } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    asset.lastMaintenanceDate = new Date();
    if (nextMaintenanceDate) {
      asset.nextMaintenanceDate = new Date(nextMaintenanceDate);
    } else {
      asset.nextMaintenanceDate = new Date(Date.now() + (asset.maintenanceIntervalDays || 90) * 24 * 60 * 60 * 1000);
    }
    if (notes) asset.maintenanceNotes = notes;
    asset.status = 'active';

    await asset.save();
    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// UPDATE asset
router.put('/:id', protect, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    Object.assign(asset, req.body);
    await asset.save();
    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE asset
router.delete('/:id', protect, async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
