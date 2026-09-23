const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/auth');

// Only allow admin and staff to view activity logs
router.get('/', protect, authorize('admin', 'staff'), getLogs);

module.exports = router;
