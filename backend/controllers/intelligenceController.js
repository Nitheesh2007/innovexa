const Product = require('../models/Product');
const axios = require('axios');

exports.getInventoryIntelligence = async (req, res, next) => {
  try {
    const products = await Product.find().lean();
    
    // Format products for ML service
    const mlPayload = {
      products: products.map(p => ({
        id: p._id.toString(),
        productName: p.productName,
        currentStock: p.currentStock,
        minimumStock: p.minimumStock || 0,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        category: p.category ? p.category.toString() : null,
        salesHistory: Array.from({length: 6}, () => Math.floor(Math.random() * 100)) // Mocked historical sales for now
      }))
    };

    let mlData = [];

    try {
      // Attempt to query the Python ML Service
      const response = await axios.post(process.env.ML_SERVICE_URL || 'http://localhost:8000/api/ml/analyze', mlPayload, { timeout: 3000 });
      if (response.data.success) {
        mlData = response.data.data;
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
        } else if (p.currentStock <= p.minimumStock) {
          stockStatus = 'Low Stock';
          healthScore = 70;
        } else if (p.currentStock > p.minimumStock * 3 && p.minimumStock > 0) {
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
          restockNeeded: p.currentStock <= p.minimumStock,
          recommendedRestockQuantity: p.currentStock <= p.minimumStock ? (p.minimumStock * 2) - p.currentStock : 0
        };
      });
    }

    res.status(200).json({
      success: true,
      data: mlData
    });
  } catch (error) {
    next(error);
  }
};
