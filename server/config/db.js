const mongoose = require('mongoose');

// חיבור למסד הנתונים MongoDB
// connectDB פונקציה לחיבור למסד הנתונים

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB connection error: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;
