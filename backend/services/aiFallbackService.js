const Product = require('../models/Product');
const Order = require('../models/Order');

exports.fallbackChat = async (message) => {
  const lowerMessage = message.toLowerCase();

  try {
    // Advanced matching for Low Stock
    if (lowerMessage.includes('low stock') || lowerMessage.includes('low in stock') || lowerMessage.includes('running out')) {
      const products = await Product.find({ $or: [{ status: 'Low Stock' }, { status: 'Out of Stock' }] });
      if (products.length === 0) return "Great news! You currently have **0 products** running low on stock.";
      
      const list = products.map(p => `- **${p.productName}**: ${p.currentStock} remaining (Min: ${p.minimumStock})`).join('\n');
      return `⚠️ **Attention Required:** You have **${products.length} products** critically low or out of stock.\n\n${list}\n\nI recommend generating Purchase Orders for these items immediately.`;
    }
    
    // Inventory Value / Summary
    if (lowerMessage.includes('value') || lowerMessage.includes('worth') || lowerMessage.includes('summary')) {
      const products = await Product.find();
      const totalValue = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);
      const retailValue = products.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0);
      const potentialProfit = retailValue - totalValue;
      
      return `💰 **Inventory Financial Summary:**\n\n- **Total Products:** ${products.length}\n- **Current Inventory Cost:** ₹${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}\n- **Projected Retail Value:** ₹${retailValue.toLocaleString(undefined, {minimumFractionDigits: 2})}\n- **Potential Gross Profit:** ₹${potentialProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}\n\nYour inventory is currently very healthy.`;
    }

    // Orders / Sales query
    if (lowerMessage.includes('order') || lowerMessage.includes('sale') || lowerMessage.includes('processing')) {
      const pending = await Order.countDocuments({ orderStatus: 'Pending' });
      const processing = await Order.countDocuments({ orderStatus: 'Processing' });
      
      return `📦 **Order Pipeline Status:**\n\n- **Pending Orders:** ${pending}\n- **Processing:** ${processing}\n\nYou have a total of **${pending + processing} active orders** that require fulfillment. Head over to the Sales & Orders Kanban board to manage them.`;
    }

    // Default Smart Response
    return "🧠 **StockFlow AI Local Mode Active**\n\nI am currently operating using the local rule-based intelligence engine. I can provide instant analytics regarding:\n\n- Low stock alerts\n- Inventory valuation\n- Order pipeline status\n\nTry asking: *'What is my inventory value?'*";
  } catch (error) {
    return "Error executing AI analytical query. Please check your database connection.";
  }
};
