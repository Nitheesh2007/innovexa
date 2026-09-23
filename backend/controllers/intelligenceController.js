const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const axios = require('axios');

exports.getInventoryIntelligence = async (req, res, next) => {
  try {
    const products = await Product.find().lean();
    
    // Calculate last 6 months boundaries
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
    }
    const sixMonthsAgo = months[0];

    // Aggregate real sales data from Invoices
    const salesAgg = await Invoice.aggregate([
      { $match: { invoiceType: 'STOCK_OUT', status: { $ne: 'CANCELLED' }, createdAt: { $gte: sixMonthsAgo } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            product: "$items.product",
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalSold: { $sum: "$items.quantity" }
        }
      }
    ]);

    // Map sales back to a structured 6-month array per product
    const salesMap = {};
    salesAgg.forEach(s => {
      const pId = s._id.product.toString();
      if (!salesMap[pId]) salesMap[pId] = [0,0,0,0,0,0];
      
      // Find which of the 6 months this belongs to
      for (let i = 0; i < 6; i++) {
        const mDate = months[i];
        if (s._id.year === mDate.getFullYear() && s._id.month === (mDate.getMonth() + 1)) {
          salesMap[pId][i] += s.totalSold;
          break;
        }
      }
    });
    
    // Format products for ML service
    const mlPayload = {
      products: products.map(p => {
        const pId = p._id.toString();
        return {
          id: pId,
          productName: p.productName,
          currentStock: p.currentStock,
          minimumStock: p.minimumStock || 0,
          purchasePrice: p.purchasePrice || 0,
          sellingPrice: p.sellingPrice || 0,
          category: p.category ? p.category.toString() : null,
          salesHistory: salesMap[pId] || [0,0,0,0,0,0]
        };
      })
    };

    let mlData = [];
    let insufficientData = false;

    try {
      // Attempt to query the Python ML Service
      const response = await axios.post(process.env.ML_SERVICE_URL || 'http://localhost:8000/api/ml/analyze', mlPayload, { timeout: 3000 });
      if (response.data.success) {
        mlData = response.data.data;
        insufficientData = response.data.insufficientData || false;
      }
    } catch (error) {
      console.warn("Python ML Service unavailable. Falling back to rule-based intelligence.", error.message);
      
      // Fallback Engine
      mlData = products.map(p => {
        let stockStatus = 'Healthy';
        let healthScore = 100;
        
        if (p.currentStock <= 0) {
          stockStatus = 'Out of Stock';
          healthScore = 50;
        } else if (p.currentStock <= (p.minimumStock || 0)) {
          stockStatus = 'Low Stock';
          healthScore = 70;
        } else if (p.currentStock > (p.minimumStock || 0) * 3 && (p.minimumStock || 0) > 0) {
          stockStatus = 'Overstocked';
          healthScore = 80;
        }

        return {
          productId: p._id.toString(),
          productName: p.productName,
          healthScore,
          stockStatus,
          movementClassification: 'Unclassified (Fallback)',
          predictedDemand: 0,
          restockNeeded: p.currentStock <= (p.minimumStock || 0),
          recommendedRestockQuantity: p.currentStock <= (p.minimumStock || 0) ? ((p.minimumStock || 0) * 2) - p.currentStock : 0
        };
      });
    }

    res.status(200).json({
      success: true,
      data: mlData,
      insufficientData
    });
  } catch (error) {
    next(error);
  }
};
