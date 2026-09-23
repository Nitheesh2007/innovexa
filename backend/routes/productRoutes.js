const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  bulkDeleteProducts,
  getProductByBarcode, 
  adjustStock, 
  getProductTransactions,
  getMarketComparison,
  syncMarketPrice,
  syncAllMarketPrices,
  getAllMarketComparisons
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('admin', 'staff'), createProduct);

// Specific named routes MUST precede generic :id parameter to avoid route matching collision
router.get('/barcode/:barcode', protect, getProductByBarcode);
router.post('/bulk-delete', protect, authorize('admin'), bulkDeleteProducts);

// E-commerce market intelligence (Amazon India & Flipkart) routes
router.get('/market/compare', protect, getAllMarketComparisons);
router.post('/market/sync-all', protect, authorize('admin', 'staff'), syncAllMarketPrices);

router.route('/:id')
  .get(protect, getProduct)
  .put(protect, authorize('admin', 'staff'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.post('/:id/adjust-stock', protect, authorize('admin', 'staff'), adjustStock);
router.get('/:id/transactions', protect, getProductTransactions);

// Product specific e-commerce market routes
router.get('/:id/market-compare', protect, getMarketComparison);
router.post('/:id/sync-market-price', protect, authorize('admin', 'staff'), syncMarketPrice);

module.exports = router;
