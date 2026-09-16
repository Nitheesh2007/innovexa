const express = require('express');
const router = express.Router();
const { getInventoryIntelligence } = require('../controllers/intelligenceController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getInventoryIntelligence);

module.exports = router;
