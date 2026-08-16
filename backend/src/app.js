const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const residentRoutes = require('./routes/resident.routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Prepare for secure authentication cookies later
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const workerRoutes = require('./routes/worker.routes');
const adminRoutes = require('./routes/admin.routes');

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/resident', residentRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
