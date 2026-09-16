const mongoose = require('mongoose');

const aiChatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  response: { type: String, required: true },
  provider: { type: String, enum: ['openai', 'gemini', 'fallback'], required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('AIChat', aiChatSchema);
