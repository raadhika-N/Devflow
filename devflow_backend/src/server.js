const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const mongoose = require('mongoose');


console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
console.log("PORT:", process.env.PORT);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });