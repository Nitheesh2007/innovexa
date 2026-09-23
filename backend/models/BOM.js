const mongoose = require('mongoose');

const bomSchema = new mongoose.Schema({
  bomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  finishedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  version: {
    type: String,
    default: '1.0'
  },
  description: {
    type: String,
    trim: true
  },
  components: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [0.001, 'Quantity must be greater than 0']
      },
      unitCost: {
        type: Number,
        default: 0
      },
      scrapAllowancePct: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      notes: String
    }
  ],
  laborCost: {
    type: Number,
    default: 0,
    min: 0
  },
  overheadCost: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCalculatedCost: {
    type: Number,
    default: 0
  },
  yieldPercentage: {
    type: Number,
    default: 100,
    min: 1,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Auto-calculate total cost before saving
bomSchema.pre('save', function(next) {
  let materialCost = 0;
  if (this.components && this.components.length > 0) {
    materialCost = this.components.reduce((sum, item) => {
      const scrapFactor = 1 + (item.scrapAllowancePct || 0) / 100;
      return sum + (item.quantity * (item.unitCost || 0) * scrapFactor);
    }, 0);
  }
  this.totalCalculatedCost = Number((materialCost + (this.laborCost || 0) + (this.overheadCost || 0)).toFixed(2));
  next();
});

module.exports = mongoose.model('BOM', bomSchema);
