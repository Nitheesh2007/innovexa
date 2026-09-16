const express = require('express');
const router = express.Router();
const { stockIn, stockOut, adjustment, transfer, getHistory } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.post('/stock-in', protect, authorize('admin', 'staff'), stockIn);
router.post('/stock-out', protect, authorize('admin', 'staff'), stockOut);
router.post('/adjustment', protect, authorize('admin', 'staff'), adjustment);
router.post('/transfer', protect, authorize('admin', 'staff'), transfer);
router.get('/history', protect, getHistory);

module.exports = router;
