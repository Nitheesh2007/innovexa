const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String, required: true },
  address: { type: String },
  gstNumber: { type: String },
  outstandingAmount: { type: Number, default: 0 },
  notes: { type: String },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);
