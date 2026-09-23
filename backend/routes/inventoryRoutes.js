const express = require('express');
const router = express.Router();
const { stockIn, stockOut, adjustment, transfer, getHistory, deleteTransaction, recordTransaction } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.post('/stock-in', protect, authorize('admin', 'staff'), stockIn);
router.post('/stock-out', protect, authorize('admin', 'staff'), stockOut);
router.post('/adjustment', protect, authorize('admin', 'staff'), adjustment);
router.post('/transfer', protect, authorize('admin', 'staff'), transfer);
router.post('/record', protect, authorize('admin', 'staff'), recordTransaction);
router.get('/history', protect, getHistory);
router.delete('/history/:id', protect, authorize('admin'), deleteTransaction);

module.exports = router;
