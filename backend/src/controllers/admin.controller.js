// ============================================
// WASEL | واصل - Admin Controller
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const { query } = require('../config/db');
const { hashPassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const { comparePassword } = require('../utils/hash');

// ─── Admin Login ────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT * FROM admins WHERE email=$1 AND is_active=true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const admin = result.rows[0];
    const isMatch = await comparePassword(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken({ id: admin.id, role: admin.role });

    res.json({
      message: '👑 Welcome Admin!',
      token,
      admin: {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Dashboard Statistics ───────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [users, drivers, stores, orders, revenue, pending] = await Promise.all([
      query('SELECT COUNT(*) as total FROM users WHERE is_active=true'),
      query('SELECT COUNT(*) as total FROM drivers WHERE is_active=true'),
      query('SELECT COUNT(*) as total FROM stores WHERE is_active=true'),
      query('SELECT COUNT(*) as total FROM orders'),
      query(`SELECT COALESCE(SUM(delivery_fee), 0) as total
             FROM orders WHERE status='delivered'`),
      query(`SELECT COUNT(*) as total FROM orders WHERE status='pending'`)
    ]);

    res.json({
      stats: {
        total_users:    parseInt(users.rows[0].total),
        total_drivers:  parseInt(drivers.rows[0].total),
        total_stores:   parseInt(stores.rows[0].total),
        total_orders:   parseInt(orders.rows[0].total),
        total_revenue:  parseFloat(revenue.rows[0].total),
        pending_orders: parseInt(pending.rows[0].total)
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get All Users ──────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, full_name, email, phone, is_verified,
        is_active, wallet_balance, created_at
       FROM users
       WHERE full_name ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    const count = await query(
      'SELECT COUNT(*) as total FROM users WHERE full_name ILIKE $1 OR email ILIKE $1',
      [`%${search}%`]
    );

    res.json({
      users: result.rows,
      total: parseInt(count.rows[0].total),
      page: parseInt(page),
      pages: Math.ceil(count.rows[0].total / limit)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get All Drivers ────────────────────────
const getAllDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, full_name, email, phone, is_verified,
        is_active, is_online, rating, total_deliveries, wallet_balance, created_at
       FROM drivers
       WHERE full_name ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    res.json({ drivers: result.rows });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get All Orders ─────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = status ? `WHERE o.status = '${status}'` : '';

    const result = await query(
      `SELECT o.*,
        u.full_name as customer_name,
        d.full_name as driver_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN drivers d ON o.driver_id = d.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ orders: result.rows });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Ban / Unban User ───────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'user' or 'driver'

    const table = type === 'driver' ? 'drivers' : 'users';

    const result = await query(
      `UPDATE ${table}
       SET is_active = NOT is_active, updated_at=NOW()
       WHERE id=$1
       RETURNING id, full_name, is_active`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = result.rows[0];
    res.json({
      message: user.is_active
        ? `✅ ${user.full_name} has been activated.`
        : `🚫 ${user.full_name} has been banned.`,
      is_active: user.is_active
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Verify Driver ──────────────────────────
const verifyDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE drivers SET is_verified=true, updated_at=NOW()
       WHERE id=$1 RETURNING id, full_name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    res.json({
      message: `✅ Driver ${result.rows[0].full_name} has been verified.`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Revenue Analytics ───────────────────────
const getRevenueAnalytics = async (req, res) => {
  try {
    const daily = await query(
      `SELECT DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(delivery_fee), 0) as revenue
       FROM orders
       WHERE status='delivered'
       AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    const byType = await query(
      `SELECT order_type,
        COUNT(*) as total,
        COALESCE(SUM(delivery_fee), 0) as revenue
       FROM orders
       WHERE status='delivered'
       GROUP BY order_type`
    );

    res.json({
      daily_revenue: daily.rows,
      by_type: byType.rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Support Tickets ─────────────────────
const getSupportTickets = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM support_tickets
       ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ tickets: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getAllDrivers,
  getAllOrders,
  toggleUserStatus,
  verifyDriver,
  getRevenueAnalytics,
  getSupportTickets
};