const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getProductByBarcode, adjustStock, getProductTransactions } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('admin', 'staff'), createProduct);

router.route('/:id')
  .get(protect, getProduct)
  .put(protect, authorize('admin', 'staff'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.post('/:id/adjust-stock', protect, authorize('admin', 'staff'), adjustStock);
router.get('/:id/transactions', protect, getProductTransactions);

router.get('/barcode/:barcode', protect, getProductByBarcode);

module.exports = router;
