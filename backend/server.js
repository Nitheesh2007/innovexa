const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async () => {
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ email: 'admin@stockflow.com' });
    
    if (!adminExists) {
      console.log('🌱 No admin found. Auto-seeding database...');
      const seedData = require('./seed');
      await seedData();
      console.log('✅ Auto-seeding complete.');
    } else {
      console.log('🔄 Forcing test accounts to expected credentials...');
      adminExists.password = 'Admin@12345';
      await adminExists.save();
      
      let user = await User.findOne({ email: 'user@stockflow.com' });
      if (!user) {
        user = new User({ name: 'Test User', email: 'user@stockflow.com', password: 'User@12345', role: 'user' });
      } else {
        user.password = 'User@12345';
        user.role = 'user';
      }
      await user.save();
      console.log('✅ Test credentials synced.');
    }
  } catch (err) {
    console.error("Auto-seed error:", err);
  }
});

// Environment validation
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoints
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date() }));
app.get('/api/system/status', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    success: true,
    data: {
      dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      aiConfigured: !!(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY),
      aiProvider: process.env.AI_PROVIDER || 'none',
      mlServiceConfigured: !!process.env.PYTHON_ML_URL
    }
  });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api', limiter);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Use Routes
app.use('/api/auth', require('./routes/authRoutes'));
// Entity routes using CRUD factory
const createCrudRouter = require('./utils/crudRouter');
app.use('/api/categories', createCrudRouter(require('./models/Category')));
app.use('/api/suppliers', createCrudRouter(require('./models/Supplier')));
app.use('/api/customers', createCrudRouter(require('./models/Customer')));
app.use('/api/warehouses', createCrudRouter(require('./models/Warehouse')));
app.use('/api/users', createCrudRouter(require('./models/User')));

// API Routes
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/ocr', require('./routes/ocrRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/intelligence', require('./routes/intelligenceRoutes'));

// Serve React Frontend (Single Localhost)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
}

module.exports = app;
