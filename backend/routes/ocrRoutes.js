const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractProductData } = require('../controllers/ocrController');
const { protect, authorize } = require('../middleware/auth');
const path = require('path');

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'ocr-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/product', protect, authorize('admin', 'staff'), upload.single('image'), extractProductData);

module.exports = router;
