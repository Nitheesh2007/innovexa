const { askAI } = require('../services/aiProvider');
const AIChat = require('../models/AIChat');
const Product = require('../models/Product');

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    // Build context
    const products = await Product.find().select('productName currentStock status purchasePrice sellingPrice');
    const context = { products };

    const aiResult = await askAI(message, context);

    // Save chat
    const chat = await AIChat.create({
      user: req.user.id,
      message,
      response: aiResult.response,
      provider: aiResult.provider
    });

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const history = await AIChat.find({ user: req.user.id }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
