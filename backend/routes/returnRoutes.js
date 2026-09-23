const express = require('express');
const router = express.Router();
const { processReturn, getReturns } = require('../controllers/returnController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin', 'manager', 'staff'), processReturn);
router.get('/', protect, getReturns);

module.exports = router;
