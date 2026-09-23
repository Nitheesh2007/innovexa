const express = require('express');
const router = express.Router();
const { 
  getSalesReport, 
  getPurchaseReport, 
  getInventoryReport,
  getStockMovementReport,
  getProfitLossReport,
  getExpenseReport,
  getReturnsReport,
  getCustomerReport,
  getSupplierReport,
  getLowStockReport,
  getExpiryReport,
  getDeadStockReport,
  getOverstockReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/sales', protect, authorize('admin', 'manager', 'staff', 'user'), getSalesReport);
router.get('/purchases', protect, authorize('admin', 'manager', 'staff', 'user'), getPurchaseReport);
router.get('/inventory', protect, authorize('admin', 'manager', 'staff', 'user'), getInventoryReport);
router.get('/stock-movement', protect, authorize('admin', 'manager', 'staff', 'user'), getStockMovementReport);
router.get('/profit-loss', protect, authorize('admin', 'manager', 'staff', 'user'), getProfitLossReport);
router.get('/expenses', protect, authorize('admin', 'manager', 'staff', 'user'), getExpenseReport);
router.get('/returns', protect, authorize('admin', 'manager', 'staff', 'user'), getReturnsReport);
router.get('/customers', protect, authorize('admin', 'manager', 'staff', 'user'), getCustomerReport);
router.get('/suppliers', protect, authorize('admin', 'manager', 'staff', 'user'), getSupplierReport);
router.get('/low-stock', protect, authorize('admin', 'manager', 'staff', 'user'), getLowStockReport);
router.get('/expiry', protect, authorize('admin', 'manager', 'staff', 'user'), getExpiryReport);
router.get('/dead-stock', protect, authorize('admin', 'manager', 'staff', 'user'), getDeadStockReport);
router.get('/overstock', protect, authorize('admin', 'manager', 'staff', 'user'), getOverstockReport);

module.exports = router;
