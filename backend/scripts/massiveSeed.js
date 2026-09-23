const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Warehouse = require('../models/Warehouse');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const connectDB = require('../config/db');

dotenv.config();

const categoriesList = [
  { name: 'Groceries', description: 'Food and daily consumption', prefixes: ['Organic', 'Fresh', 'Premium', 'Local'], suffixes: ['Mix', 'Pack', 'Bundle', 'Special'] },
  { name: 'Apparel', description: 'Clothing and fashion', prefixes: ['Cotton', 'Slim Fit', 'Casual', 'Formal'], suffixes: ['Shirt', 'Pants', 'Jacket', 'Dress'] },
  { name: 'Home Goods', description: 'Furniture and decor', prefixes: ['Modern', 'Vintage', 'Minimalist', 'Wooden'], suffixes: ['Chair', 'Table', 'Lamp', 'Shelf'] },
  { name: 'Toys', description: 'Children toys and games', prefixes: ['Interactive', 'Educational', 'Plush', 'Action'], suffixes: ['Figure', 'Puzzle', 'Set', 'Game'] },
  { name: 'Books', description: 'Physical books and magazines', prefixes: ['The Great', 'Advanced', 'Intro to', 'Mastering'], suffixes: ['Novel', 'Guide', 'Anthology', 'Series'] },
  { name: 'Beauty', description: 'Cosmetics and skincare', prefixes: ['Hydrating', 'Anti-aging', 'Natural', 'Glow'], suffixes: ['Serum', 'Cream', 'Lotion', 'Mask'] },
  { name: 'Sports', description: 'Athletic equipment', prefixes: ['Pro', 'Elite', 'Training', 'Heavy Duty'], suffixes: ['Weights', 'Mat', 'Ball', 'Gear'] },
  { name: 'Automotive', description: 'Car parts and accessories', prefixes: ['High Performance', 'Universal', 'LED', 'Premium'], suffixes: ['Oil', 'Filter', 'Lights', 'Mats'] },
  { name: 'Office Supplies', description: 'Stationery and equipment', prefixes: ['Ergonomic', 'Professional', 'Executive', 'Compact'], suffixes: ['Desk', 'Chair', 'Pen Set', 'Paper'] },
  { name: 'Pet Supplies', description: 'Food and toys for pets', prefixes: ['Grain-Free', 'Durable', 'Squeaky', 'Organic'], suffixes: ['Food', 'Toy', 'Bed', 'Leash'] },
  { name: 'Tools', description: 'Hardware and power tools', prefixes: ['Cordless', 'Heavy Duty', 'Precision', 'Compact'], suffixes: ['Drill', 'Saw', 'Set', 'Wrench'] },
  { name: 'Health', description: 'Supplements and medical', prefixes: ['Vitamin', 'Pure', 'Essential', 'Advanced'], suffixes: ['C', 'Complex', 'Supplement', 'Drops'] },
  { name: 'Garden', description: 'Plants and outdoor equipment', prefixes: ['Indoor', 'Outdoor', 'Ceramic', 'Steel'], suffixes: ['Plant', 'Pot', 'Shears', 'Hose'] },
  { name: 'Baby', description: 'Diapers and baby care', prefixes: ['Soft', 'Gentle', 'Organic', 'Safe'], suffixes: ['Diapers', 'Wipes', 'Lotion', 'Monitor'] },
  { name: 'Jewelry', description: 'Watches and fine jewelry', prefixes: ['Sterling Silver', '14k Gold', 'Diamond', 'Elegant'], suffixes: ['Ring', 'Necklace', 'Bracelet', 'Watch'] },
  { name: 'Smartphones', description: 'Mobile devices', prefixes: ['Galaxy', 'iPhone', 'Pixel', 'Nova'], suffixes: ['Pro', 'Max', 'Ultra', 'Lite'] },
  { name: 'Laptops', description: 'Portable computers', prefixes: ['ThinkPad', 'MacBook', 'XPS', 'ZenBook'], suffixes: ['13"', '15"', 'Pro', 'Air'] },
  { name: 'Wearables', description: 'Smartwatches and fitness trackers', prefixes: ['Apple Watch', 'Galaxy Watch', 'Fitbit', 'Garmin'], suffixes: ['Series 9', 'Pro', 'Charge', 'Forerunner'] },
  { name: 'Audio', description: 'Headphones and speakers', prefixes: ['Sony', 'Bose', 'Sennheiser', 'JBL'], suffixes: ['Headphones', 'Earbuds', 'Speaker', 'Soundbar'] },
  { name: 'Components', description: 'PC components', prefixes: ['Intel Core', 'AMD Ryzen', 'NVIDIA', 'Corsair'], suffixes: ['CPU', 'GPU', 'RAM', 'Motherboard'] }
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateProducts = (category, supplierIds, warehouseIds) => {
  const products = [];
  for (let i = 1; i <= 55; i++) {
    const prefix = getRandomItem(category.prefixes);
    const suffix = getRandomItem(category.suffixes);
    const productName = `${prefix} ${category.name.substring(0, 4)} ${suffix} V${Math.floor(Math.random() * 10) + 1}`;
    
    const purchasePrice = Math.floor(Math.random() * 100) + 10;
    const sellingPrice = purchasePrice + Math.floor(Math.random() * 50) + 5;
    const currentStock = Math.floor(Math.random() * 200);
    const status = currentStock === 0 ? 'Out of Stock' : (currentStock < 20 ? 'Low Stock' : 'In Stock');

    products.push({
      productName,
      sku: `${category.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 100000)}`,
      barcode: `${Math.floor(Math.random() * 1000000000000)}`,
      category: category._id,
      supplier: getRandomItem(supplierIds),
      warehouse: getRandomItem(warehouseIds),
      purchasePrice,
      sellingPrice,
      currentStock,
      minimumStock: 20,
      status
    });
  }
  return products;
};

const massiveSeed = async () => {
  try {
    await connectDB();
    console.log('🌱 Connected to DB. Beginning massive seed...');

    console.log('🧹 Clearing old products and transactions...');
    await Product.deleteMany();
    await InventoryTransaction.deleteMany();
    
    // Ensure Warehouses exist
    let warehouses = await Warehouse.find();
    if (warehouses.length === 0) {
      await Warehouse.insertMany([
        { name: 'Main Distribution Center', address: '100 Logistics Blvd' },
        { name: 'Downtown Retail Store', address: '456 Market St' }
      ]);
      warehouses = await Warehouse.find();
    }
    const warehouseIds = warehouses.map(w => w._id);

    // Ensure Suppliers exist
    let suppliers = await Supplier.find();
    if (suppliers.length === 0) {
      await Supplier.insertMany([
        { name: 'TechData', companyName: 'TechData Corp', phone: '1-800-123-4567' },
        { name: 'Ingram Micro', companyName: 'Ingram Micro Inc', phone: '1-800-987-6543' }
      ]);
      suppliers = await Supplier.find();
    }
    const supplierIds = suppliers.map(s => s._id);

    // Categories
    console.log('📦 Setting up categories...');
    const catDocs = [];
    for (let catDef of categoriesList) {
      let cat = await Category.findOne({ name: catDef.name });
      if (!cat) {
        cat = await Category.create({ name: catDef.name, description: catDef.description });
      }
      catDef._id = cat._id;
      catDocs.push(catDef);
    }

    // Generate Products
    console.log(`🏭 Generating products for ${catDocs.length} categories...`);
    const allProducts = [];
    for (let catDef of catDocs) {
      allProducts.push(...generateProducts(catDef, supplierIds, warehouseIds));
    }

    // Insert Products in batches
    console.log(`🚀 Inserting ${allProducts.length} products...`);
    const insertedProducts = await Product.insertMany(allProducts);

    // Generate Transactions
    console.log(`📊 Generating inventory transactions...`);
    const adminUser = await User.findOne({ role: 'admin' });
    const txs = [];
    
    for (const p of insertedProducts) {
      if (p.currentStock > 0) {
        txs.push({
          product: p._id,
          warehouse: p.warehouse,
          transactionType: 'Stock In',
          quantity: p.currentStock,
          previousStock: 0,
          newStock: p.currentStock,
          user: adminUser ? adminUser._id : null,
          referenceNumber: `SEED-${Math.floor(Math.random() * 10000)}`
        });

        const numSales = Math.floor(Math.random() * 5);
        let cur = p.currentStock;
        for (let i = 0; i < numSales; i++) {
          const qty = Math.floor(Math.random() * 3) + 1;
          if (cur >= qty) {
            txs.push({
              product: p._id,
              warehouse: p.warehouse,
              transactionType: 'Stock Out',
              quantity: qty,
              previousStock: cur,
              newStock: cur - qty,
              user: adminUser ? adminUser._id : null,
              referenceNumber: `SALE-${Math.floor(Math.random() * 10000)}`
            });
            cur -= qty;
          }
        }
      }
    }

    console.log(`🚀 Inserting ${txs.length} transactions...`);
    const chunkSize = 1000;
    for (let i = 0; i < txs.length; i += chunkSize) {
      await InventoryTransaction.insertMany(txs.slice(i, i + chunkSize));
    }

    console.log('✅ Massive seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Massive seed failed:', error);
    process.exit(1);
  }
};

massiveSeed();
