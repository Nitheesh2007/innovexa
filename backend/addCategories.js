const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const connectDB = require('./config/db');

dotenv.config();

const addMoreCategories = async () => {
  try {
    await connectDB();
    
    const newCategories = [
      { name: 'Groceries', description: 'Food and daily consumption' },
      { name: 'Apparel', description: 'Clothing and fashion' },
      { name: 'Home Goods', description: 'Furniture and decor' },
      { name: 'Toys', description: 'Children toys and games' },
      { name: 'Books', description: 'Physical books and magazines' },
      { name: 'Beauty', description: 'Cosmetics and skincare' },
      { name: 'Sports', description: 'Athletic equipment' },
      { name: 'Automotive', description: 'Car parts and accessories' },
      { name: 'Office Supplies', description: 'Stationery and equipment' },
      { name: 'Pet Supplies', description: 'Food and toys for pets' },
      { name: 'Tools', description: 'Hardware and power tools' },
      { name: 'Health', description: 'Supplements and medical' },
      { name: 'Garden', description: 'Plants and outdoor equipment' },
      { name: 'Baby', description: 'Diapers and baby care' },
      { name: 'Jewelry', description: 'Watches and fine jewelry' }
    ];

    for (let cat of newCategories) {
      await Category.updateOne({ name: cat.name }, { $set: cat }, { upsert: true });
    }

    console.log('Categories added successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error adding categories:', error);
    process.exit(1);
  }
};

addMoreCategories();
