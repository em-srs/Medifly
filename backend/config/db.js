const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    console.warn('Server will continue running without database connection.');
    // Don't exit — allow the server to stay alive for non-DB features
  }
};

module.exports = connectDB;
