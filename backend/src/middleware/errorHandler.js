// ============================================
// WASEL | واصل - Global Error Handler
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(400).json({
      error: 'This email or phone number already exists.'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired.' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;