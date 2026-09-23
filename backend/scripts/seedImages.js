require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stockflow';

const getImageForProduct = (name) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('iphone') || lowerName.includes('galaxy s') || lowerName.includes('pixel') || lowerName.includes('smartphone')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop';
  }
  if (lowerName.includes('macbook') || lowerName.includes('laptop') || lowerName.includes('xps') || lowerName.includes('thinkpad') || lowerName.includes('zephyrus')) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop';
  }
  if (lowerName.includes('watch') || lowerName.includes('garmin') || lowerName.includes('fitbit')) {
    return 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=400&auto=format&fit=crop';
  }
  if (lowerName.includes('airpods') || lowerName.includes('headphone') || lowerName.includes('earbuds') || lowerName.includes('buds') || lowerName.includes('sony wh') || lowerName.includes('bose') || lowerName.includes('sennheiser')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop';
  }
  if (lowerName.includes('rtx') || lowerName.includes('radeon') || lowerName.includes('gpu') || lowerName.includes('geforce')) {
    return 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=400&auto=format&fit=crop';
  }
  if (lowerName.includes('ryzen') || lowerName.includes('intel core') || lowerName.includes('processor')) {
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=400&auto=format&fit=crop';
  }
  if (lowerName.includes('tv') || lowerName.includes('oled') || lowerName.includes('bravia')) {
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=400&auto=format&fit=crop';
  }
  if (lowerName.includes('ipad') || lowerName.includes('tab') || lowerName.includes('tablet')) {
    return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop';
  }
  if (lowerName.includes('playstation') || lowerName.includes('xbox') || lowerName.includes('switch') || lowerName.includes('steam deck') || lowerName.includes('console')) {
    return 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?q=80&w=400&auto=format&fit=crop';
  }
  
  return 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?q=80&w=400&auto=format&fit=crop';
};

const run = async () => {
  try {
    await mongoose.connect(URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;
    for (const p of products) {
      const newImage = getImageForProduct(p.productName);
      p.productImage = newImage;
      await p.save();
      updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} products with real images.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

run();
