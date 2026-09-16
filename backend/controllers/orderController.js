const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// Get all orders
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('customer', 'name email').populate('products.product', 'productName sku').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    const { customer, products, totalAmount, paymentStatus, orderStatus } = req.body;
    
    // Generate order number
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    
    const order = await Order.create({
      orderNumber,
      customer,
      products,
      totalAmount,
      paymentStatus: paymentStatus || 'Pending',
      orderStatus: orderStatus || 'Pending'
    });

    // Deduct stock for each product and create transaction
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.currentStock -= item.quantity;
        
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
          type: 'OUT',
          quantity: item.quantity,
          reference: `Order ${orderNumber}`,
          performedBy: req.user ? req.user.id : null,
        });
      }
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Update order status
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Get single order
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer').populate('products.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
