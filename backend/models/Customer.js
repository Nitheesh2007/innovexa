const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  gstNumber: { type: String },
  creditLimit: { type: Number, default: 0 },
  outstandingAmount: { type: Number, default: 0 },
  notes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
