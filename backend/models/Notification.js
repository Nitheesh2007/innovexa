const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Low Stock', 'Out of Stock', 'Expired', 'Expiring Soon', 'Purchase Received', 'Stock Updated', 'Order Completed', 'System'],
    required: true
  },
  read: { type: Boolean, default: false },
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // Can be Product, Order, etc.
  referenceModel: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
