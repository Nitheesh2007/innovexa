const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Warehouse = require('./models/Warehouse');
const Supplier = require('./models/Supplier');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const InventoryTransaction = require('./models/InventoryTransaction');
const Invoice = require('./models/Invoice');
const ActivityLog = require('./models/ActivityLog');
const BOM = require('./models/BOM');
const WorkOrder = require('./models/WorkOrder');
const Asset = require('./models/Asset');
const StockTransfer = require('./models/StockTransfer');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('🔍 Checking database collections for persistent data preservation...');

    // 1. Ensure Admin & Staff (User)
    let admin = await User.findOne({ email: 'admin@stockflow.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@stockflow.com',
        password: 'Admin@12345',
        role: 'admin',
        lastLogin: new Date(),
        loginCount: 1
      });
      console.log('✅ Admin user created');
    }

    let staff1 = await User.findOne({ email: 'user@stockflow.com' });
    if (!staff1) {
      staff1 = await User.create({
        name: 'Staff Specialist',
        email: 'user@stockflow.com',
        password: 'User@12345',
        role: 'user',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        loginCount: 5
      });
      console.log('✅ Staff user created');
    }

    // 2. Categories
    let categories = await Category.find();
    if (categories.length === 0) {
      categories = await Category.insertMany([
        { name: 'Smartphones', description: 'Flagship mobile devices and smartphones' },
        { name: 'Laptops', description: 'High performance portable workstations' },
        { name: 'Wearables', description: 'Smartwatches and fitness tracking devices' },
        { name: 'Audio', description: 'Studio monitors, headphones and true wireless earbuds' },
        { name: 'Components', description: 'High-end PC processors and graphic units' }
      ]);
      console.log('✅ 5 Categories initialized');
    }

    // 3. Warehouses
    let warehouses = await Warehouse.find();
    if (warehouses.length === 0) {
      warehouses = await Warehouse.insertMany([
        { name: 'Bengaluru Central Distribution Hub', address: 'Plot 42, Electronic City Phase 1, Bengaluru, Karnataka 560100' },
        { name: 'Mumbai Logistics Center', address: 'Bandra-Kurla Complex, Bandra East, Mumbai, Maharashtra 400051' },
        { name: 'Delhi NCR Fulfillment Facility', address: 'Udyog Vihar Phase 4, Gurugram, Haryana 122016' }
      ]);
      console.log('✅ 3 Enterprise Warehouses initialized');
    }

    // 4. Suppliers
    let suppliers = await Supplier.find();
    if (suppliers.length === 0) {
      suppliers = await Supplier.insertMany([
        { name: 'Redington India Ltd', companyName: 'Redington India Distribution Ltd', phone: '+91 44 4224 3353', outstandingAmount: 185000 },
        { name: 'Ingram Micro India', companyName: 'Ingram Micro India Pvt Ltd', phone: '+91 22 6856 1000', outstandingAmount: 240000 },
        { name: 'Savex Technologies', companyName: 'Savex Technologies Pvt Ltd', phone: '+91 22 2279 9999', outstandingAmount: 95000 }
      ]);
      console.log('✅ 3 Suppliers initialized');
    }

    // 5. Customers
    let customers = await Customer.find();
    if (customers.length === 0) {
      customers = await Customer.insertMany([
        { name: 'Rajesh Sharma', email: 'rajesh.sharma@example.in', phone: '+91 98201 12345', address: 'Indiranagar 100ft Rd, Bengaluru', outstandingAmount: 15400 },
        { name: 'Priya Patel', email: 'priya.patel@example.in', phone: '+91 98450 67890', address: 'Juhu Tara Rd, Mumbai', outstandingAmount: 0 },
        { name: 'Tata Consultancy Services - IT Procurement', email: 'procurement@tcs.com', phone: '+91 22 6778 9999', address: 'TCS House, Fort, Mumbai', outstandingAmount: 349900 },
        { name: 'Infosys Enterprise Devices', email: 'hardware@infosys.com', phone: '+91 80 2852 0261', address: 'Electronics City, Hosur Road, Bengaluru', outstandingAmount: 189990 },
        { name: 'Ananya Deshmukh', email: 'ananya.d@example.in', phone: '+91 99302 44556', address: 'Koregaon Park, Pune', outstandingAmount: 24900 }
      ]);
      console.log('✅ 5 Indian Customers initialized');
    }

    // 6. Products with REALISTIC INDIAN RUPEE MARKET PRICES
    const realProductsData = [
      { 
        productName: 'iPhone 15 Pro Max (256GB, Black Titanium)', 
        sku: 'IP15PM-256-BLK', 
        barcode: '190198000001', 
        category: categories[0]._id, 
        supplier: suppliers[0]._id, 
        warehouse: warehouses[0]._id, 
        purchasePrice: 134900, 
        sellingPrice: 154900, 
        currentStock: 45, 
        minimumStock: 10, 
        status: 'In Stock', 
        description: 'Titanium design with textured matte glass back, A17 Pro chip, 48MP main camera, and 5x optical telephoto lens.', 
        productImage: '/images/products/iphone_15_pro_max.jpg' 
      },
      { 
        productName: 'Samsung Galaxy S24 Ultra (512GB, Titanium Gray)', 
        sku: 'SGS24U-512-TI', 
        barcode: '880609000001', 
        category: categories[0]._id, 
        supplier: suppliers[1]._id, 
        warehouse: warehouses[0]._id, 
        purchasePrice: 114999, 
        sellingPrice: 129999, 
        currentStock: 30, 
        minimumStock: 8, 
        status: 'In Stock', 
        description: 'Galaxy AI with Circle to Search, live translate, titanium frame, built-in S Pen, and Quad Telephoto 200MP camera system.', 
        productImage: '/images/products/galaxy_s24_ultra.jpg' 
      },
      { 
        productName: 'MacBook Pro 16" M3 Max (36GB Unified Memory, 1TB SSD)', 
        sku: 'MBP16-M3M-1TB', 
        barcode: '190198000002', 
        category: categories[1]._id, 
        supplier: suppliers[0]._id, 
        warehouse: warehouses[1]._id, 
        purchasePrice: 309900, 
        sellingPrice: 349900, 
        currentStock: 12, 
        minimumStock: 5, 
        status: 'In Stock', 
        description: 'Liquid Retina XDR display, extreme dynamic range, 14-core CPU, 30-core GPU, hardware-accelerated ray tracing, 22-hour battery.', 
        productImage: '/images/products/macbook_pro_16.jpg' 
      },
      { 
        productName: 'Dell XPS 15 9530 (Intel Core i9-13900H, 32GB RAM, 1TB SSD, RTX 4070)', 
        sku: 'DXPS15-I9-1TB', 
        barcode: '884116000001', 
        category: categories[1]._id, 
        supplier: suppliers[1]._id, 
        warehouse: warehouses[0]._id, 
        purchasePrice: 169990, 
        sellingPrice: 199990, 
        currentStock: 4, 
        minimumStock: 6, 
        status: 'Low Stock', 
        description: '3.5K OLED touchscreen display with CNC machined aluminum chassis and carbon fiber palm rest.', 
        productImage: '/images/products/dell_xps_15.jpg' 
      },
      { 
        productName: 'Apple Watch Series 9 GPS + Cellular (45mm Midnight Aluminum)', 
        sku: 'AWS9-45-MID', 
        barcode: '190198000003', 
        category: categories[2]._id, 
        supplier: suppliers[0]._id, 
        warehouse: warehouses[1]._id, 
        purchasePrice: 34900, 
        sellingPrice: 41900, 
        currentStock: 85, 
        minimumStock: 15, 
        status: 'In Stock', 
        description: 'S9 SiP chip, double tap gesture control, 2000-nit edge-to-edge Retina display, and ECG health tracking.', 
        productImage: '/images/products/apple_watch_series_9.jpg' 
      },
      { 
        productName: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', 
        sku: 'SONY-WHXM5-BLK', 
        barcode: '027242000001', 
        category: categories[3]._id, 
        supplier: suppliers[1]._id, 
        warehouse: warehouses[0]._id, 
        purchasePrice: 23990, 
        sellingPrice: 29990, 
        currentStock: 40, 
        minimumStock: 10, 
        status: 'In Stock', 
        description: 'Two processors and 8 microphones for flagship noise cancellation, LDAC Hi-Res Audio, and Speak-to-Chat.', 
        productImage: '/images/products/sony_wh_1000xm5.jpg' 
      },
      { 
        productName: 'NVIDIA GeForce RTX 4090 (24GB GDDR6X Founders Edition)', 
        sku: 'NV-RTX4090-FE', 
        barcode: '812674000001', 
        category: categories[4]._id, 
        supplier: suppliers[0]._id, 
        warehouse: warehouses[0]._id, 
        purchasePrice: 155000, 
        sellingPrice: 179900, 
        currentStock: 3, 
        minimumStock: 5, 
        status: 'Low Stock', 
        description: 'Ada Lovelace architecture with 3rd gen RT cores, 4th gen Tensor cores, DLSS 3, and unmatched AI compute performance.', 
        productImage: '/images/products/rtx_4090.jpg' 
      },
      { 
        productName: 'AMD Ryzen 9 7950X3D (16-Core, 32-Thread with 3D V-Cache)', 
        sku: 'AMD-R9-7950X3D', 
        barcode: '730143000001', 
        category: categories[4]._id, 
        supplier: suppliers[1]._id, 
        warehouse: warehouses[1]._id, 
        purchasePrice: 49500, 
        sellingPrice: 58999, 
        currentStock: 18, 
        minimumStock: 8, 
        status: 'In Stock', 
        description: 'Flagship AM5 socket gaming and creator CPU with 144MB total cache and 5.7GHz boost frequency.', 
        productImage: '/images/products/ryzen_7950x3d.jpg' 
      },
      { 
        productName: 'AirPods Pro (2nd Generation with MagSafe Case USB-C)', 
        sku: 'AP-PRO-2G', 
        barcode: '190198000004', 
        category: categories[3]._id, 
        supplier: suppliers[0]._id, 
        warehouse: warehouses[1]._id, 
        purchasePrice: 19900, 
        sellingPrice: 24900, 
        currentStock: 140, 
        minimumStock: 25, 
        status: 'In Stock', 
        description: 'H2 chip, active noise cancellation, adaptive audio, transparency mode, and personalized spatial audio with head tracking.', 
        productImage: '/images/products/airpods_pro.jpg' 
      },
      { 
        productName: 'Logitech MX Master 3S Wireless Performance Mouse', 
        sku: 'LOGI-MX3S', 
        barcode: '097855000001', 
        category: categories[1]._id, 
        supplier: suppliers[1]._id, 
        warehouse: warehouses[0]._id, 
        purchasePrice: 7495, 
        sellingPrice: 9995, 
        currentStock: 0, 
        minimumStock: 15, 
        status: 'Out of Stock', 
        description: '8000 DPI track-on-glass sensor, MagSpeed electromagnetic scroll wheel, quiet clicks, and multi-device flow.', 
        productImage: '/images/products/mx_master_3s.jpg' 
      }
    ];

    let products = await Product.find();
    if (products.length === 0) {
      products = await Product.insertMany(realProductsData);
      console.log('✅ 10 Realistic Indian Market Products seeded in INR (₹)');
    } else {
      // Update existing products with realistic INR prices and verified product photography
      for (const p of products) {
        const match = realProductsData.find(rp => rp.sku === p.sku || p.productName.toLowerCase().includes(rp.productName.substring(0, 10).toLowerCase()));
        if (match) {
          p.purchasePrice = match.purchasePrice;
          p.sellingPrice = match.sellingPrice;
          p.productName = match.productName;
          p.productImage = match.productImage;
          await p.save();
        } else if (p.productName.includes('Dell') || p.sku.includes('DXPS')) {
          p.purchasePrice = 169990;
          p.sellingPrice = 199990;
          p.productName = 'Dell XPS 15 9530 (Intel Core i9, 32GB RAM, 1TB SSD, RTX 4070)';
          p.productImage = '/images/products/dell_xps_15.jpg';
          await p.save();
        } else if (p.productName.includes('Logitech') || p.sku.includes('LOGI')) {
          p.purchasePrice = 7495;
          p.sellingPrice = 9995;
          p.productName = 'Logitech MX Master 3S Wireless Performance Mouse';
          p.productImage = '/images/products/mx_master_3s.jpg';
          await p.save();
        }
      }
      console.log('✅ Existing product catalog price alignment verified');
    }

    // 7. Inventory Transactions (Non-destructive)
    const existingTxCount = await InventoryTransaction.countDocuments();
    if (existingTxCount === 0) {
      const txs = [];
      for (const p of products) {
        if (p.currentStock > 0) {
          txs.push({
            product: p._id,
            warehouse: p.warehouse,
            transactionType: 'STOCK_IN',
            quantity: p.currentStock,
            previousStock: 0,
            newStock: p.currentStock,
            user: admin._id,
            referenceNumber: 'INITIAL-STOCK-IN',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          });
          
          // Seed realistic sales
          const numSales = Math.floor(Math.random() * 4) + 1;
          let cur = p.currentStock;
          for(let i = 0; i < numSales; i++) {
            const qty = Math.floor(Math.random() * 2) + 1;
            if (cur >= qty) {
              txs.push({
                product: p._id,
                warehouse: p.warehouse,
                transactionType: 'STOCK_OUT',
                quantity: qty,
                previousStock: cur,
                newStock: cur - qty,
                user: staff1._id,
                referenceNumber: `INV-SALE-2026-${1000 + i}`,
                createdAt: new Date(Date.now() - (i + 1) * 6 * 60 * 60 * 1000)
              });
              cur -= qty;
            }
          }
        }
      }
      await InventoryTransaction.insertMany(txs);
      console.log(`✅ ${txs.length} Historical Inventory Transactions initialized in persistent storage`);
    }

    // 8. Invoices (Sales & Purchases in INR)
    const existingInvoices = await Invoice.countDocuments();
    if (existingInvoices === 0) {
      await Invoice.insertMany([
        {
          invoiceNumber: 'INV-2026-001',
          invoiceType: 'STOCK_OUT',
          customer: customers[0]._id,
          invoiceDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'PAID',
          items: [
            {
              product: products[0]._id,
              productName: products[0].productName,
              sku: products[0].sku,
              quantity: 1,
              unitPrice: products[0].sellingPrice,
              total: products[0].sellingPrice
            }
          ],
          subtotal: products[0].sellingPrice,
          taxRate: 18,
          taxTotal: Math.round(products[0].sellingPrice * 0.18),
          grandTotal: Math.round(products[0].sellingPrice * 1.18),
          paidAmount: Math.round(products[0].sellingPrice * 1.18),
          paymentMethod: 'UPI / Online'
        },
        {
          invoiceNumber: 'INV-2026-002',
          invoiceType: 'STOCK_OUT',
          customer: customers[2]._id,
          invoiceDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'PARTIALLY_PAID',
          items: [
            {
              product: products[2]._id,
              productName: products[2].productName,
              sku: products[2].sku,
              quantity: 2,
              unitPrice: products[2].sellingPrice,
              total: products[2].sellingPrice * 2
            }
          ],
          subtotal: products[2].sellingPrice * 2,
          taxRate: 18,
          taxTotal: Math.round(products[2].sellingPrice * 2 * 0.18),
          grandTotal: Math.round(products[2].sellingPrice * 2 * 1.18),
          paidAmount: 350000,
          paymentMethod: 'Bank Transfer NEFT/RTGS'
        },
        {
          invoiceNumber: 'INV-2026-003',
          invoiceType: 'STOCK_OUT',
          customer: customers[4]._id,
          invoiceDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'PAID',
          items: [
            {
              product: products[8]._id,
              productName: products[8].productName,
              sku: products[8].sku,
              quantity: 1,
              unitPrice: products[8].sellingPrice,
              total: products[8].sellingPrice
            }
          ],
          subtotal: products[8].sellingPrice,
          taxRate: 18,
          taxTotal: Math.round(products[8].sellingPrice * 0.18),
          grandTotal: Math.round(products[8].sellingPrice * 1.18),
          paidAmount: Math.round(products[8].sellingPrice * 1.18),
          paymentMethod: 'Credit Card'
        }
      ]);
      console.log('✅ 3 Customer Sales Invoices seeded in INR (₹)');
    }

    // 9. Bill of Materials (BOM) in INR
    const existingBOMCount = await BOM.countDocuments();
    let bom1, bom2;
    if (existingBOMCount === 0) {
      bom1 = await BOM.create({
        bomNumber: 'BOM-2026-0001',
        name: 'Titanium Mobile Flagship Assembly Spec',
        finishedProduct: products[0]._id,
        version: '1.2',
        description: 'Multi-stage specification assembly for high-volume flagship units.',
        components: [
          { product: products[6]._id, quantity: 1, unitCost: 28500, scrapAllowancePct: 1, notes: 'Main Logic Board Subsystem' },
          { product: products[7]._id, quantity: 1, unitCost: 16500, scrapAllowancePct: 0.5, notes: 'Super Retina XDR Display Sub-assembly' },
          { product: products[8]._id, quantity: 2, unitCost: 4200, scrapAllowancePct: 2, notes: 'Acoustic Driver & Haptic Taptic Engine' }
        ],
        laborCost: 3500,
        overheadCost: 1800,
        yieldPercentage: 98,
        status: 'active'
      });

      bom2 = await BOM.create({
        bomNumber: 'BOM-2026-0002',
        name: 'Workstation Pro Build Specification',
        finishedProduct: products[2]._id,
        version: '2.0',
        description: 'Precision workstation build with certified thermal tolerances.',
        components: [
          { product: products[6]._id, quantity: 1, unitCost: 155000, scrapAllowancePct: 0.5, notes: 'High Performance Discrete Compute Module' },
          { product: products[7]._id, quantity: 1, unitCost: 49500, scrapAllowancePct: 0.5, notes: 'Processor Socket Module' }
        ],
        laborCost: 6500,
        overheadCost: 3200,
        yieldPercentage: 99,
        status: 'active'
      });
      console.log('✅ 2 Enterprise BOMs created with realistic INR costs');
    } else {
      bom1 = await BOM.findOne({ bomNumber: 'BOM-2026-0001' }) || await BOM.findOne();
      bom2 = await BOM.findOne({ bomNumber: 'BOM-2026-0002' }) || await BOM.findOne();
    }

    // 10. Work Orders
    const existingWorkOrderCount = await WorkOrder.countDocuments();
    if (existingWorkOrderCount === 0 && bom1) {
      await WorkOrder.insertMany([
        {
          orderNumber: 'WO-2026-0101',
          bom: bom1._id,
          finishedProduct: products[0]._id,
          targetQuantity: 25,
          actualProduced: 25,
          scrapQuantity: 1,
          warehouse: warehouses[0]._id,
          status: 'completed',
          priority: 'high',
          assignedTechnician: 'Precision Automation Line A',
          scheduledStartDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          targetCompletionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          notes: 'Batch #1 completed. 100% QA inspection certified.'
        },
        {
          orderNumber: 'WO-2026-0102',
          bom: bom2 ? bom2._id : bom1._id,
          finishedProduct: products[2]._id,
          targetQuantity: 10,
          actualProduced: 4,
          scrapQuantity: 0,
          warehouse: warehouses[0]._id,
          status: 'in_progress',
          priority: 'urgent',
          assignedTechnician: 'Bengaluru Assembly Cell 3',
          scheduledStartDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          targetCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          notes: 'Stage 3 calibration in progress for TCS enterprise order.'
        },
        {
          orderNumber: 'WO-2026-0103',
          bom: bom1._id,
          finishedProduct: products[0]._id,
          targetQuantity: 50,
          actualProduced: 0,
          warehouse: warehouses[1]._id,
          status: 'scheduled',
          priority: 'medium',
          assignedTechnician: 'Mumbai Automation Line B',
          scheduledStartDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          targetCompletionDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          notes: 'Q3 planned replenishment run.'
        }
      ]);
      console.log('✅ 3 Manufacturing Work Orders initialized');
    }

    // 11. Assets with REALISTIC INR PURCHASE COSTS
    const existingAssetCount = await Asset.countDocuments();
    if (existingAssetCount === 0) {
      await Asset.insertMany([
        {
          assetTag: 'AST-FL-001',
          name: 'Toyota 8FBE15U Electric Forklift (3,000 lbs)',
          category: 'machinery',
          modelNumber: '8FBE15U',
          serialNumber: 'TYT-99824-IND',
          manufacturer: 'Toyota Material Handling India',
          purchaseDate: new Date('2024-03-15'),
          purchaseCost: 1850000,
          salvageValue: 350000,
          usefulLifeMonths: 84,
          status: 'active',
          custodian: 'Bengaluru Logistics Ops',
          location: 'Bengaluru Central Distribution Hub - Bay 4',
          lastMaintenanceDate: new Date('2026-01-10'),
          nextMaintenanceDate: new Date('2026-10-15'),
          maintenanceIntervalDays: 90,
          maintenanceNotes: 'Hydraulic seal inspection and battery pack health certified at 96%.'
        },
        {
          assetTag: 'AST-CNC-002',
          name: 'Haas Mini Mill 3-Axis CNC Production Station',
          category: 'machinery',
          modelNumber: 'MINI-MILL-HE',
          serialNumber: 'HAA-55410-IND',
          manufacturer: 'Haas Automation India',
          purchaseDate: new Date('2023-08-20'),
          purchaseCost: 4800000,
          salvageValue: 900000,
          usefulLifeMonths: 120,
          status: 'active',
          custodian: 'Production Engineering Cell',
          location: 'Bengaluru Central - Machine Shop',
          lastMaintenanceDate: new Date('2026-02-18'),
          nextMaintenanceDate: new Date('2026-08-20'),
          maintenanceIntervalDays: 180,
          maintenanceNotes: 'High-speed spindle runout within 0.002mm tolerance limit.'
        },
        {
          assetTag: 'AST-IT-003',
          name: 'MacBook Pro 16" M3 Max Field Engineering Station',
          category: 'it_hardware',
          modelNumber: 'A2991',
          serialNumber: 'C02W9941MD6T',
          manufacturer: 'Apple India',
          purchaseDate: new Date('2025-01-10'),
          purchaseCost: 349900,
          salvageValue: 60000,
          usefulLifeMonths: 36,
          status: 'checked_out',
          custodian: 'Aakash Verma (Chief Hardware Architect)',
          custodianEmail: 'aakash.v@stockflow.com',
          location: 'Bengaluru Central Distribution Hub',
          lastMaintenanceDate: new Date('2025-01-10'),
          nextMaintenanceDate: new Date('2026-01-10'),
          maintenanceIntervalDays: 365,
          maintenanceNotes: 'Enterprise MDM profile enrolled and hardware diagnostics passed.'
        },
        {
          assetTag: 'AST-VHL-004',
          name: 'Tata Intra V50 High-Payload Electric Logistics Fleet Van',
          category: 'vehicle',
          modelNumber: 'TATA-INTRA-V50',
          serialNumber: 'MAT612089PKA99124',
          manufacturer: 'Tata Motors Commercial',
          purchaseDate: new Date('2024-11-01'),
          purchaseCost: 980000,
          salvageValue: 200000,
          usefulLifeMonths: 60,
          status: 'active',
          custodian: 'Inter-Warehouse Transport Team',
          location: 'Mumbai Logistics Center - Fleet Depot',
          lastMaintenanceDate: new Date('2026-04-12'),
          nextMaintenanceDate: new Date('2026-10-12'),
          maintenanceIntervalDays: 180,
          maintenanceNotes: 'Quarterly wheel alignment, battery calibration, and brake inspection.'
        }
      ]);
      console.log('✅ 4 Enterprise Assets seeded in INR (₹)');
    }

    // 12. Stock Transfers
    const existingTransferCount = await StockTransfer.countDocuments();
    if (existingTransferCount === 0) {
      await StockTransfer.create({
        transferNumber: 'TRF-2026-0001',
        sourceWarehouse: warehouses[0]._id,
        destinationWarehouse: warehouses[1]._id,
        items: [
          { product: products[0]._id, quantity: 5 },
          { product: products[4]._id, quantity: 15 }
        ],
        status: 'in_transit',
        carrier: 'Tata Intra Logistics Fleet Van #1',
        trackingReference: 'TRK-IN-88391',
        dispatchedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        notes: 'Inter-hub replenishment from Bengaluru to Mumbai center.',
        createdBy: 'Logistics Operations Lead'
      });
      console.log('✅ Stock Transfer initialized');
    }

    // 13. Seed Initial ActivityLog Logins if empty
    const existingLoginLogs = await ActivityLog.countDocuments({ action: 'LOGIN' });
    if (existingLoginLogs === 0) {
      await ActivityLog.insertMany([
        {
          user: admin._id,
          action: 'LOGIN',
          entity: 'Auth',
          details: `User ${admin.name} (${admin.email}) logged in successfully as ${admin.role}`,
          endpoint: '/api/auth/login',
          method: 'POST',
          ipAddress: '127.0.0.1',
          status: 200,
          createdAt: new Date(Date.now() - 10 * 60 * 1000)
        },
        {
          user: staff1._id,
          action: 'LOGIN',
          entity: 'Auth',
          details: `User ${staff1.name} (${staff1.email}) logged in successfully as ${staff1.role}`,
          endpoint: '/api/auth/login',
          method: 'POST',
          ipAddress: '192.168.1.14',
          status: 200,
          createdAt: new Date(Date.now() - 75 * 60 * 1000)
        }
      ]);
      console.log('✅ Previous login audit trails recorded in persistent database');
    }

    console.log('✨ Complete persistent database verification and seed completed successfully.');
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    throw error;
  }
};

if (require.main === module) {
  seedData().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
  module.exports = seedData;
}
