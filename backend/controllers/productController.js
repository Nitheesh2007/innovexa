const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('category supplier warehouse');
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category supplier warehouse');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    // Basic sku auto generation if not provided
    if (!req.body.sku) {
      req.body.sku = 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Search product by barcode
// @route   GET /api/products/barcode/:barcode
exports.getProductByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode }).populate('category supplier warehouse');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust product stock manually
// @route   POST /api/products/:id/adjust-stock
exports.adjustStock = async (req, res, next) => {
  try {
    const { newStockCount, reason } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const difference = newStockCount - product.currentStock;
    if (difference === 0) {
      return res.status(400).json({ success: false, message: 'New stock count is identical to current stock' });
    }

    product.currentStock = newStockCount;
    
    // Update product status based on new stock
    if (product.currentStock <= 0) {
      product.status = 'Out of Stock';
    } else if (product.currentStock <= product.minimumStock) {
      product.status = 'Low Stock';
    } else {
      product.status = 'In Stock';
    }
    
    await product.save();

    // Create transaction record
    await InventoryTransaction.create({
      product: product._id,
      type: difference > 0 ? 'ADJUSTMENT' : 'OUT', // Keeping it simple, can use ADJUSTMENT
      quantity: Math.abs(difference),
      reference: `Manual Adjustment: ${reason}`,
      performedBy: req.user ? req.user.id : null,
    });

    res.status(200).json({ success: true, data: product, message: 'Stock adjusted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product transaction history
// @route   GET /api/products/:id/transactions
exports.getProductTransactions = async (req, res, next) => {
  try {
    const transactions = await InventoryTransaction.find({ product: req.params.id })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};
