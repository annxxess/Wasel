// ============================================
// WASEL | واصل - Database Configuration
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'wasel_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,                  // maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ─── Test Connection ────────────────────────
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully!');
    release();
  }
});

// ─── Query Helper ───────────────────────────
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };