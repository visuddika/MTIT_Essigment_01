require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`✅ Signup:   POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`✅ Signin:   POST http://localhost:${PORT}/api/auth/signin`);
});

// Connect to MongoDB in background (non-blocking)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.warn('⚠️  MongoDB connection failed:', err.message));
} else {
  console.warn('⚠️  MONGO_URI not set — skipping DB connection');
}