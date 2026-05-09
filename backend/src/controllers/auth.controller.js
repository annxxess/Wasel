// ============================================
// WASEL | واصل - Auth Controller
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const { query } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

// ─── Register Customer ──────────────────────
const registerUser = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if user exists
    const existing = await query(
      'SELECT id FROM users WHERE email=$1 OR phone=$2',
      [email, phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email or phone already registered.' });
    }

    const password_hash = await hashPassword(password);

    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, phone`,
      [full_name, email, phone, password_hash]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, role: 'customer' });

    res.status(201).json({
      message: 'Registration successful! Welcome to WASEL 🚀',
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Login Customer ─────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is suspended.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user.id, role: 'customer' });

    res.json({
      message: 'Login successful! 👋',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        wallet_balance: user.wallet_balance
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Register Driver ────────────────────────
const registerDriver = async (req, res) => {
  try {
    const { full_name, email, phone, password, national_id } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existing = await query(
      'SELECT id FROM drivers WHERE email=$1 OR phone=$2',
      [email, phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email or phone already registered.' });
    }

    const password_hash = await hashPassword(password);

    const result = await query(
      `INSERT INTO drivers (full_name, email, phone, password_hash, national_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, phone`,
      [full_name, email, phone, password_hash, national_id]
    );

    const driver = result.rows[0];
    const token = generateToken({ id: driver.id, role: 'driver' });

    res.status(201).json({
      message: 'Driver registration successful! 🚗',
      token,
      driver
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Login Driver ────────────────────────────
const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT * FROM drivers WHERE email=$1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const driver = result.rows[0];
    const isMatch = await comparePassword(password, driver.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({ id: driver.id, role: 'driver' });

    res.json({
      message: 'Welcome back driver! 🏍️',
      token,
      driver: {
        id: driver.id,
        full_name: driver.full_name,
        email: driver.email,
        phone: driver.phone,
        is_online: driver.is_online,
        rating: driver.rating,
        wallet_balance: driver.wallet_balance
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser, registerDriver, loginDriver };