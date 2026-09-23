const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Suggestion', 'Bug Report', 'Feature Request', 'Complaint', 'Other'],
    default: 'Suggestion'
  },
  status: {
    type: String,
    enum: ['NEW', 'REVIEWING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
    default: 'NEW'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminResponse: {
    type: String,
    default: ''
  },
  attachment: {
    type: String,
    default: null
  },
  upvotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
