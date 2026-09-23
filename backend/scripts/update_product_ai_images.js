const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('../models/Product');
const connectDB = require('../config/db');
const { getMatchingProductImage } = require('../utils/productImageMatcher');

async function updateProductImages() {
  await connectDB();
  console.log('Connected to MongoDB for product image synchronization...');

  const products = await Product.find();
  console.log(`Found ${products.length} products to check and update.`);

  let updatedCount = 0;
  for (const product of products) {
    const matched = getMatchingProductImage(product.productName);
    console.log(`Product: "${product.productName}" -> New Image: ${matched}`);
    product.productImage = matched;
    await product.save();
    updatedCount++;
  }

  console.log(`✅ Successfully updated ${updatedCount} products with suitable AI product images!`);
  process.exit(0);
}

updateProductImages().catch(err => {
  console.error('Error updating product images:', err);
  process.exit(1);
});
