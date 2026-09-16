const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'StockFlow' },
  currency: { type: String, default: 'USD' },
  lowStockThreshold: { type: Number, default: 10 },
  emailNotifications: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
