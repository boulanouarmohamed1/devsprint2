const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

const PORT = 3001;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const requnotRoutes = require('./routes/requnotRoutes');

// Mount routes
app.use('/requnot', requnotRoutes);
app.use('/notification', notificationRoutes); // corrected spelling from "notefication"
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/requests', requestRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
    await mongoose.connect(uri); // 🔥 Updated - removed deprecated options
    console.log(' MongoDB connected!');
  } catch (err) {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}/`);
  });
});
