const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../backend/.env') });
dotenv.config();

const connectDB = require('../backend/config/db');
const Product = require('../backend/models/Product');

async function inspect() {
  await connectDB();
  const products = await Product.find({}, 'productName category productImage price');
  console.log(`Total Products: ${products.length}`);
  products.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.category}] "${p.productName}" -> Image: ${p.productImage || 'NONE'}`);
  });
  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
