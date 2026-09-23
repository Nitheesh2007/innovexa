const express = require('express');
const router = express.Router();
const { 
  createStockInInvoice, 
  createStockOutInvoice, 
  getInvoices, 
  getInvoice, 
  generatePDF,
  cancelInvoice
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/stock-in', protect, authorize('admin', 'staff'), createStockInInvoice);
router.post('/stock-out', protect, authorize('admin', 'staff'), createStockOutInvoice);
router.post('/', protect, authorize('admin', 'staff'), (req, res, next) => {
  if (req.body.invoiceType === 'STOCK_IN' || req.body.supplier) {
    return createStockInInvoice(req, res, next);
  }
  return createStockOutInvoice(req, res, next);
});
router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoice);
router.get('/:id/pdf', protect, generatePDF);
router.put('/:id/cancel', protect, authorize('admin', 'manager', 'staff', 'user'), cancelInvoice);

module.exports = router;
