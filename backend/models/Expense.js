const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Rent', 'Electricity', 'Salary', 'Transport', 'Internet', 'Maintenance', 'Marketing', 'Packaging', 'Other'],
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER'] },
  reference: { type: String },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
