const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stockflow?serverSelectionTimeoutMS=2000');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Attempting to use in-memory database as fallback for testing...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`Fallback MongoDB (In-Memory) Connected: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`Fallback MongoDB Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
