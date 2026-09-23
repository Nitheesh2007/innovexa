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

  const additions = ['STOCK_IN', 'CUSTOMER_RETURN', 'Stock In', 'Return'];
  const subtractions = ['STOCK_OUT', 'SUPPLIER_RETURN', 'DAMAGE', 'LOSS', 'EXPIRY', 'Stock Out'];
  const adjustments = ['CORRECTION', 'ADJUSTMENT', 'Adjustment'];

  const qty = Number(quantity);

  if (additions.includes(transactionType)) {
    newStock += qty;
  } else if (subtractions.includes(transactionType)) {
    if (previousStock < qty) {
      return res.status(400).json({ success: false, message: 'Insufficient Stock' });
    }
    newStock -= qty;
  } else if (adjustments.includes(transactionType)) {
    // Adjustment quantity can be positive or negative
    newStock += qty;
    if (newStock < 0) {
      return res.status(400).json({ success: false, message: 'Transaction results in negative stock' });
    }
  } else if (transactionType === 'TRANSFER' || transactionType === 'Transfer') {
    // Transfer does not change overall stock quantity at source logic level, just logs it
    newStock = previousStock;
  } else {
    return res.status(400).json({ success: false, message: 'Invalid transaction type' });
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
    quantity: Math.abs(qty), // Store absolute quantity
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
    
    // In this schema, product has a single warehouse field, so we just move the entire product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    // Log Stock Out from source
    await InventoryTransaction.create({
      product: productId,
      warehouse: fromWarehouseId,
      transactionType: 'Transfer',
      quantity,
      previousStock: product.currentStock,
      newStock: product.currentStock,
      user: req.user.id,
      referenceNumber,
      notes: `Transferred OUT to warehouse ${toWarehouseId}. ` + notes
    });

    // Log Stock In to destination
    await InventoryTransaction.create({
      product: productId,
      warehouse: toWarehouseId,
      transactionType: 'Transfer',
      quantity,
      previousStock: product.currentStock,
      newStock: product.currentStock,
      user: req.user.id,
      referenceNumber,
      notes: `Transferred IN from warehouse ${fromWarehouseId}. ` + notes
    });
    
    product.warehouse = toWarehouseId;
    await product.save();

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

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await InventoryTransaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    
    // Reverse the stock change for this transaction if the product still exists
    const product = await Product.findById(transaction.product);
    if (product) {
      if (transaction.transactionType === 'Stock In' || transaction.transactionType === 'Return') {
        product.currentStock -= transaction.quantity;
      } else if (transaction.transactionType === 'Stock Out') {
        product.currentStock += transaction.quantity;
      } else if (transaction.transactionType === 'Adjustment') {
        product.currentStock -= transaction.quantity; 
      }
      
      // Fix potential negative stock
      if (product.currentStock < 0) product.currentStock = 0;
      
      // Update status
      if (product.currentStock === 0) {
        product.status = 'Out of Stock';
      } else if (product.currentStock <= product.minimumStock) {
        product.status = 'Low Stock';
      } else {
        product.status = 'In Stock';
      }
      await product.save();
    }
    
    await transaction.deleteOne();
    res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.recordTransaction = async (req, res, next) => {
  try {
    const { productId, warehouseId, transactionType, quantity, referenceNumber, notes } = req.body;
    
    if (transactionType === 'TRANSFER' || transactionType === 'Transfer') {
      // Special logic for transfers
      const { toWarehouseId } = req.body;
      if (!toWarehouseId) return res.status(400).json({ success: false, message: 'Destination warehouse required for transfer' });
      
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      
      if (product.currentStock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock to transfer' });
      }

      await InventoryTransaction.create([{
        product: productId,
        warehouse: warehouseId,
        transactionType: 'TRANSFER',
        quantity,
        previousStock: product.currentStock,
        newStock: product.currentStock,
        user: req.user.id,
        referenceNumber,
        notes: `Transferred OUT to warehouse ${toWarehouseId}. ` + notes
      }]);

      await InventoryTransaction.create([{
        product: productId,
        warehouse: toWarehouseId,
        transactionType: 'TRANSFER',
        quantity,
        previousStock: product.currentStock,
        newStock: product.currentStock,
        user: req.user.id,
        referenceNumber,
        notes: `Transferred IN from warehouse ${warehouseId}. ` + notes
      }]);
      
      product.warehouse = toWarehouseId;
      await product.save();
      return res.status(200).json({ success: true, message: 'Transfer successful' });
    }
    
    // Normal transaction types
    const result = await handleStockChange(productId, warehouseId, transactionType, quantity, req.user.id, referenceNumber, notes, res);
    if (result && result.transaction) {
      res.status(200).json({ success: true, message: 'Transaction recorded successfully', data: result.transaction });
    }
  } catch (error) {
    next(error);
  }
};
