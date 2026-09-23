const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { getMatchingProductImage } = require('../utils/productImageMatcher');

async function migrateImages() {
  try {
    console.log('Connecting via connectDB...');
    await connectDB();
    console.log('Connected to database.');

    const products = await Product.find({}).populate('category');
    console.log(`Found ${products.length} products to verify and update images.`);

    let updated = 0;
    for (const p of products) {
      const catName = p.category?.name || '';
      const matchedImage = getMatchingProductImage(p.productName, catName);
      
      p.productImage = matchedImage;
      await p.save();
      updated++;
    }

    console.log(`Successfully updated ${updated} products with exact matching high-resolution images!`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateImages();
