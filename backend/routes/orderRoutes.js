const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrder, getOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Note: Using protect on these routes assuming auth is required.
// The crudRouter did not use protect by default on some routes, but it's best practice.
// If it breaks, we can remove protect for development.
router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.route('/:id')
  .get(protect, getOrder)
  .put(protect, updateOrder);

module.exports = router;
