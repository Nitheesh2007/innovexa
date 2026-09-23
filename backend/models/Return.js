const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  returnNumber: { type: String, required: true, unique: true },
  originalInvoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  returnType: { type: String, enum: ['CUSTOMER_RETURN', 'SUPPLIER_RETURN'], required: true },
  returnDate: { type: Date, default: Date.now },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    returnQuantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    reason: { type: String }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  taxTotal: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  refundStatus: { type: String, enum: ['PENDING', 'COMPLETED', 'CREDITED'], default: 'PENDING' },
  stockTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryTransaction' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Return', returnSchema);
