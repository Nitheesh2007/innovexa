const express = require('express');
const router = express.Router();
const { 
  addExpense, 
  getExpenses, 
  recordPayment, 
  getProfitAndLoss,
  getCustomerLedger,
  getSupplierLedger,
  getPaymentHistory,
  getProfitTimeseries
} = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/auth');

router.post('/expenses', protect, authorize('admin', 'manager', 'staff', 'user'), addExpense);
router.get('/expenses', protect, getExpenses);
router.post('/payments', protect, authorize('admin', 'manager', 'staff', 'user'), recordPayment);
router.get('/profit-loss', protect, authorize('admin', 'manager', 'staff', 'user'), getProfitAndLoss);
router.get('/timeseries', protect, authorize('admin', 'manager', 'staff', 'user'), getProfitTimeseries);
router.get('/customer-ledger/:customerId', protect, authorize('admin', 'manager', 'staff', 'user'), getCustomerLedger);
router.get('/supplier-ledger/:supplierId', protect, authorize('admin', 'manager', 'staff', 'user'), getSupplierLedger);
router.get('/payment-history', protect, authorize('admin', 'manager', 'staff', 'user'), getPaymentHistory);

module.exports = router;
