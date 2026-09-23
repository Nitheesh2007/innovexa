const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Category = require('../models/Category');
const connectDB = require('../config/db');

dotenv.config();

const priceRanges = {
  'Smartphones': { min: 10000, max: 120000 },
  'Laptops': { min: 30000, max: 250000 },
  'Wearables': { min: 2000, max: 45000 },
  'Audio': { min: 1000, max: 30000 },
  'Components': { min: 5000, max: 150000 },
  'Groceries': { min: 50, max: 1500 },
  'Apparel': { min: 500, max: 5000 },
  'Home Goods': { min: 1000, max: 50000 },
  'Toys': { min: 200, max: 5000 },
  'Books': { min: 150, max: 2000 },
  'Beauty': { min: 200, max: 4000 },
  'Sports': { min: 500, max: 25000 },
  'Automotive': { min: 500, max: 35000 },
  'Office Supplies': { min: 50, max: 15000 },
  'Pet Supplies': { min: 100, max: 4000 },
  'Tools': { min: 500, max: 20000 },
  'Health': { min: 200, max: 5000 },
  'Garden': { min: 150, max: 10000 },
  'Baby': { min: 100, max: 8000 },
  'Jewelry': { min: 5000, max: 500000 },
  'default': { min: 500, max: 5000 }
};

const templates = [
  "Experience premium quality with this top-of-the-line {name}. Designed for maximum durability and performance, it perfectly fits into your lifestyle. Features advanced materials and industry-leading reliability.",
  "The {name} offers incredible value and exceptional performance. Whether you're a professional or a casual user, this product delivers consistent results you can count on.",
  "Upgrade your setup with the {name}. Built to last and engineered for excellence, it provides an unparalleled experience. Comes with a manufacturer warranty and dedicated support.",
  "Discover the power of the {name}. Meticulously crafted for those who demand the best, featuring an elegant design and state-of-the-art functionality.",
  "A must-have for everyday use, the {name} combines convenience with cutting-edge technology. Highly rated by customers and expertly manufactured for longevity."
];

const fixPricesAndDetails = async () => {
  try {
    await connectDB();
    console.log('🔄 Connecting to DB to fix product prices and descriptions...');

    const products = await Product.find().populate('category');
    console.log(`📦 Found ${products.length} products to process.`);

    let updatedCount = 0;

    for (let product of products) {
      const catName = product.category ? product.category.name : 'default';
      const range = priceRanges[catName] || priceRanges['default'];

      const purchasePrice = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      const markupPercent = (Math.floor(Math.random() * 31) + 15) / 100;
      const sellingPrice = Math.floor(purchasePrice + (purchasePrice * markupPercent));

      const template = templates[Math.floor(Math.random() * templates.length)];
      const description = template.replace(/{name}/g, product.productName) + 
                          `\n\nSpecifications:\n- SKU: ${product.sku}\n- Category: ${catName}\n- Genuine Authenticated Product\n- Ready for immediate dispatch.`;

      product.purchasePrice = purchasePrice;
      product.sellingPrice = sellingPrice;
      product.description = description;

      await product.save();
      updatedCount++;

      if (updatedCount % 100 === 0) {
        console.log(`✅ Processed ${updatedCount} products...`);
      }
    }

    console.log(`🎉 Successfully updated prices and descriptions for all ${updatedCount} products!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing products:', error);
    process.exit(1);
  }
};

fixPricesAndDetails();
