const mongoose = require('mongoose');

const stockTransferSchema = new mongoose.Schema({
  transferNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  sourceWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  destinationWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Transfer quantity must be at least 1']
      }
    }
  ],
  status: {
    type: String,
    enum: ['draft', 'in_transit', 'received', 'cancelled'],
    default: 'draft'
  },
  carrier: {
    type: String,
    default: 'Internal Fleet'
  },
  trackingReference: String,
  dispatchedAt: Date,
  receivedAt: Date,
  notes: String,
  createdBy: {
    type: String,
    default: 'Operations'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockTransfer', stockTransferSchema);
