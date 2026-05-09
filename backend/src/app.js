// ============================================
// WASEL | واصل - Main Express App
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// ─── Security Middleware ───────────────────
app.use(helmet());

// ─── Rate Limiting ─────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ─── CORS ──────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// ─── Body Parser ───────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logger ────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ──────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 WASEL API is running!',
    version: '1.0.0',
    author: 'Marref Mohammed Anas'
  });
});

// ─── Routes (will be added step by step) ───
 app.use('/api/auth', require('./routes/auth.routes'));
 //app.use('/api/users', require('./routes/user.routes'));
 app.use('/api/orders', require('./routes/order.routes'));
 app.use('/api/drivers', require('./routes/driver.routes'));
// app.use('/api/stores', require('./routes/store.routes'));
 app.use('/api/admin', require('./routes/admin.routes'));

// ─── 404 Handler ───────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ──────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;