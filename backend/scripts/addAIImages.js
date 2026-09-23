const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

const addAIImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stockflow');
    console.log('MongoDB Connected');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to process for AI images.`);

    let count = 0;
    for (const product of products) {
      const prompt = `High quality product photography of ${product.productName}, clean white background, professional lighting, photorealistic`;
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=400&nologo=true`;
      
      product.productImage = imageUrl;
      await product.save();
      count++;
      console.log(`Updated [${count}/${products.length}] ${product.productName}`);
    }

    console.log('✅ Successfully added AI images to all products!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addAIImages();
