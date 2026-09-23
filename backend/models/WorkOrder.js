const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BOM',
    required: true
  },
  finishedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  targetQuantity: {
    type: Number,
    required: true,
    min: [1, 'Target quantity must be at least 1']
  },
  actualProduced: {
    type: Number,
    default: 0,
    min: 0
  },
  scrapQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'in_progress', 'quality_check', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTechnician: {
    type: String,
    default: 'Production Line 1'
  },
  scheduledStartDate: {
    type: Date,
    default: Date.now
  },
  targetCompletionDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
