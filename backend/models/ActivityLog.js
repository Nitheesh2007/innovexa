const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Optional for system actions
  },
  action: { 
    type: String, 
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'OTHER']
  },
  entity: { 
    type: String, 
    required: true 
  }, // e.g., 'Product', 'Order', 'Customer', 'Auth'
  details: { 
    type: String, 
    required: true 
  }, // e.g., 'Created product iPhone 15'
  endpoint: { 
    type: String 
  },
  method: {
    type: String
  },
  ipAddress: { 
    type: String 
  },
  status: { 
    type: Number 
  }
}, {
  timestamps: true
});

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
