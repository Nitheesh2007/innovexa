const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetTag: {
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
  category: {
    type: String,
    enum: ['machinery', 'it_hardware', 'tooling', 'vehicle', 'facility_fixture'],
    required: true
  },
  modelNumber: String,
  serialNumber: String,
  manufacturer: String,
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  purchaseCost: {
    type: Number,
    required: true,
    min: 0
  },
  salvageValue: {
    type: Number,
    default: 0,
    min: 0
  },
  usefulLifeMonths: {
    type: Number,
    default: 36,
    min: 1
  },
  currentBookValue: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'checked_out', 'in_maintenance', 'retired'],
    default: 'active'
  },
  custodian: {
    type: String,
    default: 'Main Facility'
  },
  custodianEmail: String,
  location: {
    type: String,
    default: 'Main Logistics Hub'
  },
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  maintenanceIntervalDays: {
    type: Number,
    default: 90
  },
  maintenanceNotes: String
}, {
  timestamps: true
});

// Calculate straight-line depreciation
assetSchema.methods.calculateBookValue = function() {
  const now = new Date();
  const purchase = new Date(this.purchaseDate);
  const diffMonths = Math.max(0, (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth()));
  
  if (diffMonths >= this.usefulLifeMonths) {
    this.currentBookValue = this.salvageValue;
  } else {
    const monthlyDepreciation = (this.purchaseCost - this.salvageValue) / this.usefulLifeMonths;
    this.currentBookValue = Math.max(this.salvageValue, Number((this.purchaseCost - (monthlyDepreciation * diffMonths)).toFixed(2)));
  }
  return this.currentBookValue;
};

assetSchema.pre('save', function(next) {
  this.calculateBookValue();
  next();
});

module.exports = mongoose.model('Asset', assetSchema);
