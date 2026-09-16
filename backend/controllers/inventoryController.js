const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const Notification = require('../models/Notification');

// Helper to create transaction and update stock
const handleStockChange = async (productId, warehouseId, transactionType, quantity, userId, referenceNumber, notes, res) => {
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const previousStock = product.currentStock;
  let newStock = previousStock;

  if (transactionType === 'Stock In' || transactionType === 'Return') {
    newStock += quantity;
  } else if (transactionType === 'Stock Out') {
    if (previousStock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient Stock' });
    }
    newStock -= quantity;
  } else if (transactionType === 'Adjustment') {
    // Adjustment quantity can be positive or negative
    newStock += quantity;
    if (newStock < 0) {
      return res.status(400).json({ success: false, message: 'Adjustment results in negative stock' });
    }
  }

  // Update product stock and status
  product.currentStock = newStock;
  
  if (newStock === 0) {
    product.status = 'Out of Stock';
  } else if (newStock <= product.minimumStock) {
    product.status = 'Low Stock';
  } else {
    product.status = 'In Stock';
  }

  await product.save();

  // Create Transaction
  const transaction = await InventoryTransaction.create({
    product: productId,
    warehouse: warehouseId,
    transactionType,
    quantity: Math.abs(quantity), // Store absolute quantity
    previousStock,
    newStock,
    user: userId,
    referenceNumber,
    notes
  });

  // Create notification if low or out of stock
  if (product.status === 'Out of Stock' || product.status === 'Low Stock') {
    await Notification.create({
      title: product.status,
      message: `${product.productName} is currently ${product.status}. Current stock: ${newStock}`,
      type: product.status,
      referenceId: product._id,
      referenceModel: 'Product'
    });
  }

  return { product, transaction };
};

exports.stockIn = async (req, res, next) => {
  try {
    const { productId, warehouseId, quantity, referenceNumber, notes } = req.body;
    const result = await handleStockChange(productId, warehouseId, 'Stock In', quantity, req.user.id, referenceNumber, notes, res);
    if (result && result.transaction) {
      res.status(200).json({ success: true, message: 'Stock In successful', data: result.transaction });
    }
  } catch (error) {
    next(error);
  }
};

exports.stockOut = async (req, res, next) => {
  try {
    const { productId, warehouseId, quantity, referenceNumber, notes } = req.body;
    const result = await handleStockChange(productId, warehouseId, 'Stock Out', quantity, req.user.id, referenceNumber, notes, res);
    if (result && result.transaction) {
      res.status(200).json({ success: true, message: 'Stock Out successful', data: result.transaction });
    }
  } catch (error) {
    next(error);
  }
};

exports.adjustment = async (req, res, next) => {
  try {
    const { productId, warehouseId, quantity, referenceNumber, notes } = req.body; // quantity can be negative
    const result = await handleStockChange(productId, warehouseId, 'Adjustment', quantity, req.user.id, referenceNumber, notes, res);
    if (result && result.transaction) {
      res.status(200).json({ success: true, message: 'Stock Adjusted successfully', data: result.transaction });
    }
  } catch (error) {
    next(error);
  }
};

exports.transfer = async (req, res, next) => {
  try {
    const { productId, fromWarehouseId, toWarehouseId, quantity, referenceNumber, notes } = req.body;
    
    // Stock Out from source
    const outResult = await handleStockChange(productId, fromWarehouseId, 'Transfer', quantity * -1, req.user.id, referenceNumber, `Transfer to warehouse ${toWarehouseId}. ` + notes, res);
    if (!outResult || !outResult.transaction) return; // Response already sent if error

    // Stock In to destination (Note: real-world might require tracking transit, but simple here)
    const inResult = await handleStockChange(productId, toWarehouseId, 'Transfer', quantity, req.user.id, referenceNumber, `Transfer from warehouse ${fromWarehouseId}. ` + notes, res);
    if (!inResult || !inResult.transaction) return;

    res.status(200).json({ success: true, message: 'Stock Transfer successful' });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const history = await InventoryTransaction.find().populate('product warehouse user').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
