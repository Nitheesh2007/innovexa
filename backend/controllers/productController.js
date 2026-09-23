const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { getMatchingProductImage } = require('../utils/productImageMatcher');
const { getMarketData, ECOMMERCE_MARKET_DATA } = require('../services/eCommerceMarketService');

// @desc    Get all products (with optional filtering & search)
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.warehouse) {
      filter.warehouse = req.query.warehouse;
    }
    if (req.query.supplier) {
      filter.supplier = req.query.supplier;
    }
    if (req.query.search && req.query.search.trim() !== '') {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { productName: searchRegex },
        { sku: searchRegex },
        { barcode: searchRegex },
        { description: searchRegex }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'name_asc': sortOption = { productName: 1 }; break;
        case 'name_desc': sortOption = { productName: -1 }; break;
        case 'price_asc': sortOption = { sellingPrice: 1 }; break;
        case 'price_desc': sortOption = { sellingPrice: -1 }; break;
        case 'stock_asc': sortOption = { currentStock: 1 }; break;
        case 'stock_desc': sortOption = { currentStock: -1 }; break;
        case 'newest': sortOption = { createdAt: -1 }; break;
        case 'oldest': sortOption = { createdAt: 1 }; break;
        default: sortOption = { createdAt: -1 };
      }
    }

    const products = await Product.find(filter)
      .populate('category supplier warehouse')
      .sort(sortOption);

    const mapped = products.map(p => {
      const obj = p.toObject();
      const matched = getMatchingProductImage(obj.productName, obj.category?.name);
      if (matched && (!obj.productImage || obj.productImage.includes('unsplash') || obj.productImage.trim() === '' || obj.productImage.includes('photo-1586769852044-692d6e3703f0'))) {
        obj.productImage = matched;
      }
      obj.marketData = getMarketData(obj.sku, obj.productName);
      return obj;
    });

    res.status(200).json({ success: true, count: mapped.length, data: mapped });
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
    const obj = product.toObject();
    const matched = getMatchingProductImage(obj.productName, obj.category?.name);
    if (matched && (!obj.productImage || obj.productImage.includes('unsplash') || obj.productImage.trim() === '' || obj.productImage.includes('photo-1586769852044-692d6e3703f0'))) {
      obj.productImage = matched;
    }
    obj.marketData = getMarketData(obj.sku, obj.productName);
    res.status(200).json({ success: true, data: obj });
  } catch (error) {
    next(error);
  }
};

// Helper to sanitize payload for ObjectId and Date fields
const sanitizeProductPayload = (body) => {
  const payload = { ...body };
  if (payload.supplier === '' || payload.supplier === 'none') delete payload.supplier;
  if (payload.warehouse === '' || payload.warehouse === 'none') delete payload.warehouse;
  if (payload.category === '') delete payload.category;
  if (payload.manufacturingDate === '') delete payload.manufacturingDate;
  if (payload.expiryDate === '') delete payload.expiryDate;
  if (payload.maximumStock === '' || payload.maximumStock === null) delete payload.maximumStock;
  return payload;
};

// @desc    Create product
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const payload = sanitizeProductPayload(req.body);

    // Auto-generate SKU if not provided
    if (!payload.sku || payload.sku.trim() === '') {
      payload.sku = 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
    }
    // Auto-match realistic verified product image if not provided
    if (!payload.productImage || payload.productImage.trim() === '') {
      payload.productImage = getMatchingProductImage(payload.productName);
    }

    const product = new Product(payload);
    await product.save();

    // If opening stock is greater than 0, create an initial inventory transaction
    if (product.currentStock > 0) {
      await InventoryTransaction.create({
        product: product._id,
        warehouse: product.warehouse || null,
        transactionType: 'STOCK_IN',
        quantity: product.currentStock,
        previousStock: 0,
        newStock: product.currentStock,
        notes: 'Initial opening stock registered',
        user: req.user ? req.user.id : null,
        referenceNumber: `INIT-${Date.now()}`
      });
    }

    const populated = await Product.findById(product._id).populate('category supplier warehouse');
    res.status(201).json({ success: true, data: populated, message: 'Product created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const payload = { ...req.body };
    if (!payload.productImage || payload.productImage.trim() === '') {
      payload.productImage = getMatchingProductImage(payload.productName || existing.productName);
    }

    // Clean empty optional fields
    if (payload.supplier === '' || payload.supplier === 'none') payload.supplier = null;
    if (payload.warehouse === '' || payload.warehouse === 'none') payload.warehouse = null;
    if (payload.manufacturingDate === '') payload.manufacturingDate = null;
    if (payload.expiryDate === '') payload.expiryDate = null;
    if (payload.maximumStock === '') payload.maximumStock = null;

    // Check if currentStock is directly modified in edit form
    if (payload.currentStock !== undefined && Number(payload.currentStock) !== existing.currentStock) {
      const newStock = Number(payload.currentStock);
      const diff = newStock - existing.currentStock;
      await InventoryTransaction.create({
        product: existing._id,
        warehouse: payload.warehouse || existing.warehouse || null,
        transactionType: diff > 0 ? 'ADJUSTMENT' : 'STOCK_OUT',
        quantity: Math.abs(diff),
        previousStock: existing.currentStock,
        newStock: newStock,
        notes: 'Stock updated via product edit form',
        user: req.user ? req.user.id : null,
        referenceNumber: `UPD-${Date.now()}`
      });
    }

    Object.assign(existing, payload);
    await existing.save();

    const updated = await Product.findById(existing._id).populate('category supplier warehouse');
    res.status(200).json({ success: true, data: updated, message: 'Product updated successfully' });
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
    // Delete associated inventory transactions
    await InventoryTransaction.deleteMany({ product: req.params.id });
    res.status(200).json({ success: true, data: {}, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete products
// @route   POST /api/products/bulk-delete
exports.bulkDeleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No product IDs provided for deletion' });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });
    await InventoryTransaction.deleteMany({ product: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} products`,
      deletedCount: result.deletedCount
    });
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
      return res.status(404).json({ success: false, message: 'Product not found with this barcode' });
    }
    const obj = product.toObject();
    const matched = getMatchingProductImage(obj.productName, obj.category?.name);
    if (matched && (!obj.productImage || obj.productImage.includes('unsplash') || obj.productImage.trim() === '' || obj.productImage.includes('photo-1586769852044-692d6e3703f0'))) {
      obj.productImage = matched;
    }
    res.status(200).json({ success: true, data: obj });
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

    const newStock = Number(newStockCount);
    const difference = newStock - product.currentStock;
    if (difference === 0) {
      return res.status(400).json({ success: false, message: 'New stock count is identical to current stock' });
    }

    const prevStock = product.currentStock;
    product.currentStock = newStock;
    await product.save();

    // Create transaction record
    await InventoryTransaction.create({
      product: product._id,
      warehouse: product.warehouse || null,
      transactionType: difference > 0 ? 'ADJUSTMENT' : 'STOCK_OUT',
      quantity: Math.abs(difference),
      previousStock: prevStock,
      newStock: product.currentStock,
      notes: reason ? `Manual Adjustment: ${reason}` : 'Manual inventory audit/reconciliation',
      user: req.user ? req.user.id : null,
      referenceNumber: `ADJ-${Date.now()}`
    });

    const populated = await Product.findById(product._id).populate('category supplier warehouse');
    res.status(200).json({ success: true, data: populated, message: 'Stock adjusted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product transaction history
// @route   GET /api/products/:id/transactions
exports.getProductTransactions = async (req, res, next) => {
  try {
    const transactions = await InventoryTransaction.find({ product: req.params.id })
      .populate('user', 'name email')
      .populate('warehouse', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get e-commerce market comparison for a product (Amazon & Flipkart)
// @route   GET /api/products/:id/market-compare
exports.getMarketComparison = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const market = getMarketData(product.sku, product.productName);
    const stockflowPrice = product.sellingPrice;
    const amazonPrice = market.amazon?.price || null;
    const flipkartPrice = market.flipkart?.price || null;
    const mrp = market.mrp || product.sellingPrice;

    const lowestMarketPrice = Math.min(
      amazonPrice || Infinity,
      flipkartPrice || Infinity
    );

    const priceDifferenceAmazon = amazonPrice ? (stockflowPrice - amazonPrice) : 0;
    const priceDifferenceFlipkart = flipkartPrice ? (stockflowPrice - flipkartPrice) : 0;

    res.status(200).json({
      success: true,
      data: {
        product: {
          _id: product._id,
          productName: product.productName,
          sku: product.sku,
          sellingPrice: product.sellingPrice,
          purchasePrice: product.purchasePrice,
          margin: product.sellingPrice > 0 ? (((product.sellingPrice - product.purchasePrice) / product.sellingPrice) * 100).toFixed(1) : 0
        },
        mrp,
        amazon: market.amazon,
        flipkart: market.flipkart,
        comparison: {
          stockflowPrice,
          amazonPrice,
          flipkartPrice,
          lowestMarketPrice: lowestMarketPrice !== Infinity ? lowestMarketPrice : stockflowPrice,
          bestPlatform: amazonPrice && flipkartPrice ? (amazonPrice <= flipkartPrice ? 'Amazon India' : 'Flipkart') : (amazonPrice ? 'Amazon India' : 'Flipkart'),
          priceDifferenceAmazon,
          priceDifferenceFlipkart,
          isStockFlowCompetitive: lowestMarketPrice !== Infinity ? stockflowPrice <= lowestMarketPrice : true
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync product selling price with E-Commerce platform (Amazon/Flipkart)
// @route   POST /api/products/:id/sync-market-price
exports.syncMarketPrice = async (req, res, next) => {
  try {
    const { platform = 'lowest' } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const market = getMarketData(product.sku, product.productName);
    let targetPrice = product.sellingPrice;

    if (platform === 'amazon' && market.amazon?.price) {
      targetPrice = market.amazon.price;
    } else if (platform === 'flipkart' && market.flipkart?.price) {
      targetPrice = market.flipkart.price;
    } else {
      // Lowest or automatic
      const prices = [market.amazon?.price, market.flipkart?.price].filter(Boolean);
      if (prices.length > 0) {
        targetPrice = Math.min(...prices);
      }
    }

    const oldPrice = product.sellingPrice;
    product.sellingPrice = targetPrice;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product price synchronized with ${platform.toUpperCase()} market benchmark from ₹${oldPrice.toLocaleString('en-IN')} to ₹${targetPrice.toLocaleString('en-IN')}`,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync all products with lowest competitive market price
// @route   POST /api/products/market/sync-all
exports.syncAllMarketPrices = async (req, res, next) => {
  try {
    const products = await Product.find({});
    let updatedCount = 0;

    for (const p of products) {
      const market = getMarketData(p.sku, p.productName);
      const prices = [market.amazon?.price, market.flipkart?.price].filter(Boolean);
      if (prices.length > 0) {
        const lowest = Math.min(...prices);
        if (p.sellingPrice !== lowest) {
          p.sellingPrice = lowest;
          await p.save();
          updatedCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully synchronized ${updatedCount} products with live Amazon India and Flipkart benchmark prices.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all market comparisons across catalog
// @route   GET /api/products/market/compare
exports.getAllMarketComparisons = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate('category');
    const comparisons = products.map(p => {
      const market = getMarketData(p.sku, p.productName);
      return {
        _id: p._id,
        productName: p.productName,
        sku: p.sku,
        category: p.category?.name,
        stockflowPrice: p.sellingPrice,
        purchasePrice: p.purchasePrice,
        currentStock: p.currentStock,
        mrp: market.mrp || p.sellingPrice,
        amazon: market.amazon,
        flipkart: market.flipkart,
        lowestMarketPrice: Math.min(market.amazon?.price || Infinity, market.flipkart?.price || Infinity)
      };
    });

    res.status(200).json({
      success: true,
      count: comparisons.length,
      data: comparisons
    });
  } catch (error) {
    next(error);
  }
};
