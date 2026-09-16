const express = require('express');
const router = express.Router();
const { chat, getHistory } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, chat);
router.get('/history', protect, getHistory);

module.exports = router;
