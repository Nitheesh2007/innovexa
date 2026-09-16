const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Warehouse = require('./models/Warehouse');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const InventoryTransaction = require('./models/InventoryTransaction');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Category.deleteMany();
    await Warehouse.deleteMany();
    await Supplier.deleteMany();
    await Product.deleteMany();
    await InventoryTransaction.deleteMany();

    console.log('Previous data cleared');

    // Admin & Staff (User)
    const admin = await User.create({ name: 'Admin User', email: 'admin@stockflow.com', password: 'Admin@12345', role: 'admin' });
    const staff1 = await User.create({ name: 'Test User', email: 'user@stockflow.com', password: 'User@12345', role: 'user' });
    console.log('Users created');

    // Categories
    const categories = await Category.insertMany([
      { name: 'Smartphones', description: 'Mobile devices' },
      { name: 'Laptops', description: 'Portable computers' },
      { name: 'Wearables', description: 'Smartwatches and fitness trackers' },
      { name: 'Audio', description: 'Headphones and speakers' },
      { name: 'Components', description: 'PC components' }
    ]);

    // Warehouses
    const warehouses = await Warehouse.insertMany([
      { name: 'Main Distribution Center', address: '100 Logistics Blvd' },
      { name: 'Downtown Retail Store', address: '456 Market St' }
    ]);

    // Suppliers
    const suppliers = await Supplier.insertMany([
      { name: 'TechData', companyName: 'TechData Corp', phone: '1-800-123-4567' },
      { name: 'Ingram Micro', companyName: 'Ingram Micro Inc', phone: '1-800-987-6543' }
    ]);

    // Products (Realistic Mobile/Electrical)
    const productData = [
      { productName: 'iPhone 15 Pro Max', sku: 'IP15PM-256-BLK', barcode: '190198000001', category: categories[0]._id, supplier: suppliers[0]._id, warehouse: warehouses[0]._id, purchasePrice: 999, sellingPrice: 1199, currentStock: 45, minimumStock: 10, status: 'In Stock' },
      { productName: 'Samsung Galaxy S24 Ultra', sku: 'SGS24U-512-TI', barcode: '880609000001', category: categories[0]._id, supplier: suppliers[1]._id, warehouse: warehouses[0]._id, purchasePrice: 1050, sellingPrice: 1299, currentStock: 30, minimumStock: 5, status: 'In Stock' },
      { productName: 'MacBook Pro 16" M3 Max', sku: 'MBP16-M3M-1TB', barcode: '190198000002', category: categories[1]._id, supplier: suppliers[0]._id, warehouse: warehouses[1]._id, purchasePrice: 3000, sellingPrice: 3499, currentStock: 8, minimumStock: 10, status: 'Low Stock' },
      { productName: 'Dell XPS 15', sku: 'DXPS15-I7-512', barcode: '884116000001', category: categories[1]._id, supplier: suppliers[1]._id, warehouse: warehouses[0]._id, purchasePrice: 1500, sellingPrice: 1899, currentStock: 0, minimumStock: 5, status: 'Out of Stock' },
      { productName: 'Apple Watch Series 9', sku: 'AWS9-45-MID', barcode: '190198000003', category: categories[2]._id, supplier: suppliers[0]._id, warehouse: warehouses[1]._id, purchasePrice: 350, sellingPrice: 429, currentStock: 120, minimumStock: 20, status: 'In Stock' },
      { productName: 'Sony WH-1000XM5', sku: 'SONY-WHXM5-BLK', barcode: '027242000001', category: categories[3]._id, supplier: suppliers[1]._id, warehouse: warehouses[0]._id, purchasePrice: 280, sellingPrice: 398, currentStock: 25, minimumStock: 10, status: 'In Stock' },
      { productName: 'NVIDIA RTX 4090', sku: 'NV-RTX4090-FE', barcode: '812674000001', category: categories[4]._id, supplier: suppliers[0]._id, warehouse: warehouses[0]._id, purchasePrice: 1599, sellingPrice: 1899, currentStock: 2, minimumStock: 5, status: 'Low Stock' },
      { productName: 'AMD Ryzen 9 7950X3D', sku: 'AMD-R9-7950X3D', barcode: '730143000001', category: categories[4]._id, supplier: suppliers[1]._id, warehouse: warehouses[1]._id, purchasePrice: 550, sellingPrice: 699, currentStock: 15, minimumStock: 10, status: 'In Stock' },
      { productName: 'AirPods Pro (2nd Gen)', sku: 'AP-PRO-2G', barcode: '190198000004', category: categories[3]._id, supplier: suppliers[0]._id, warehouse: warehouses[1]._id, purchasePrice: 180, sellingPrice: 249, currentStock: 200, minimumStock: 50, status: 'In Stock' },
      { productName: 'Logitech MX Master 3S', sku: 'LOGI-MX3S', barcode: '097855000001', category: categories[1]._id, supplier: suppliers[1]._id, warehouse: warehouses[0]._id, purchasePrice: 70, sellingPrice: 99, currentStock: 0, minimumStock: 15, status: 'Out of Stock' }
    ];

    const products = await Product.insertMany(productData);
    console.log('10 Realistic Products seeded');

    // Create realistic inventory transactions to feed ML engine
    const txs = [];
    for (const p of products) {
      if (p.currentStock > 0) {
        txs.push({
          product: p._id,
          warehouse: p.warehouse,
          transactionType: 'Stock In',
          quantity: p.currentStock,
          previousStock: 0,
          newStock: p.currentStock,
          user: admin._id,
          referenceNumber: 'INITIAL-SEED'
        });
        
        // Random historical sales for Fast/Slow moving
        const numSales = Math.floor(Math.random() * 10);
        let cur = p.currentStock;
        for(let i=0; i<numSales; i++) {
          const qty = Math.floor(Math.random() * 3) + 1;
          if (cur >= qty) {
            txs.push({
              product: p._id,
              warehouse: p.warehouse,
              transactionType: 'Stock Out',
              quantity: qty,
              previousStock: cur,
              newStock: cur - qty,
              user: staff1._id,
              referenceNumber: 'SALE-MOCK'
            });
            cur -= qty;
          }
        }
      }
    }

    await InventoryTransaction.insertMany(txs);
    console.log('Inventory Transactions seeded');

    console.log('Seed completed successfully');
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error;
  }
};

if (require.main === module) {
  seedData().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
  module.exports = seedData;
}
