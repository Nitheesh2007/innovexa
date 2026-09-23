const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stockflow', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Attempting to use in-memory database as fallback for testing...');
    
    try {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '../../.mongo-data');
      
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      // Remove stale lock files from previous unclean process exits to ensure persistence
      const lockFile = path.join(dbPath, 'mongod.lock');
      if (fs.existsSync(lockFile)) {
        try { fs.unlinkSync(lockFile); } catch (e) { /* ignore if in use */ }
      }

      const { MongoMemoryServer } = require('mongodb-memory-server');
      let mongoServer;
      try {
        mongoServer = await MongoMemoryServer.create({
          instance: {
            dbPath: dbPath,
            storageEngine: 'wiredTiger'
          }
        });
        console.log(`Using persistent local database storage at: ${dbPath}`);
      } catch (lockErr) {
        console.log('Persistent local db locked, cleaning and retrying:', lockErr.message);
        try {
          const wtLock = path.join(dbPath, 'WiredTiger.lock');
          if (fs.existsSync(wtLock)) { fs.unlinkSync(wtLock); }
          mongoServer = await MongoMemoryServer.create({
            instance: {
              dbPath: dbPath,
              storageEngine: 'wiredTiger'
            }
          });
        } catch (retryErr) {
          console.warn('Fallback to memory server:', retryErr.message);
          mongoServer = await MongoMemoryServer.create();
        }
      }

      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`Fallback MongoDB Connected: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`Fallback MongoDB Error: ${fallbackError.message}`);
      if (!process.env.VERCEL) {
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
