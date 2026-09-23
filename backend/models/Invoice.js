const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceType: { type: String, enum: ['STOCK_IN', 'STOCK_OUT'], required: true },
  invoiceDate: { type: Date, default: Date.now, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    variant: { type: String },
    batchNumber: { type: String },
    serialNumber: { type: String }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  discountTotal: { type: Number, default: 0, min: 0 },
  taxTotal: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'OTHER'] },
  paymentStatus: { type: String, enum: ['PAID', 'PARTIAL', 'PENDING'], default: 'PENDING' },
  paidAmount: { type: Number, default: 0, min: 0 },
  pendingAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['ACTIVE', 'CANCELLED', 'RETURNED', 'PARTIALLY_RETURNED'], default: 'ACTIVE' },
  purchase: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  stockTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryTransaction' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: { type: Date },
  cancellationReason: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
