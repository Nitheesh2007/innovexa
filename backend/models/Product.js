const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  purchasePrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  currentStock: { type: Number, required: true, min: 0, default: 0 },
  minimumStock: { type: Number, required: true, min: 0, default: 5 },
  maximumStock: { type: Number, min: 0 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  productImage: { type: String },
  manufacturingDate: { type: Date },
  expiryDate: { type: Date },
  status: { 
    type: String, 
    enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Expired', 'Expiring Soon'],
    default: 'Out of Stock'
  },
  variants: [{
    name: { type: String },
    options: [{ type: String }]
  }],
  taxRate: { type: Number, default: 0 }
}, {
  timestamps: true
});

productSchema.index({ sku: 1, barcode: 1, productName: 1 });

productSchema.methods.calculateStatus = function() {
  const now = new Date();
  if (this.expiryDate && new Date(this.expiryDate) < now) {
    return 'Expired';
  }
  if (this.expiryDate && (new Date(this.expiryDate) - now) <= 30 * 24 * 60 * 60 * 1000 && (new Date(this.expiryDate) - now) > 0) {
    return 'Expiring Soon';
  }
  if (this.currentStock <= 0) {
    return 'Out of Stock';
  }
  if (this.currentStock <= this.minimumStock) {
    return 'Low Stock';
  }
  return 'In Stock';
};

productSchema.pre('save', function() {
  this.status = this.calculateStatus();
});

module.exports = mongoose.model('Product', productSchema);
