const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  storeCode: { type: String, required: true, unique: true },
  address: { type: String },
  contact: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Store', storeSchema);
