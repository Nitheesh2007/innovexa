const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  transactionType: { 
    type: String, 
    enum: [
      'STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'TRANSFER', 'CUSTOMER_RETURN', 'SUPPLIER_RETURN', 'DAMAGE', 'LOSS', 'EXPIRY', 'CORRECTION',
      'Stock In', 'Stock Out', 'Return' // Legacy support
    ], 
    required: true 
  },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referenceNumber: { type: String },
  notes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
