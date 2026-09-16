const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

async function run() {
  await connectDB();
  const users = await User.find();
  console.log('USERS:', users.map(u => u.email));
  process.exit(0);
}
run();
