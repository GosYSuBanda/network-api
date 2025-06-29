const mongoose = require('mongoose');

const connectDB = async () => {
    console.log("MONGODB_URI: ", process.env.MONGODB_URI);
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Finsmart', {
      // Las opciones ya no son necesarias en mongoose 8.x
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
