// ============================================
// WASEL | واصل - Admin Routes
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getAllDrivers,
  getAllOrders,
  toggleUserStatus,
  verifyDriver,
  getRevenueAnalytics,
  getSupportTickets
} = require('../controllers/admin.controller');

// ─── Public ─────────────────────────────────
router.post('/login', adminLogin);

// ─── Protected Admin Routes ──────────────────
router.get('/stats', protect, authorize('admin', 'superadmin'), getDashboardStats);
router.get('/users', protect, authorize('admin', 'superadmin'), getAllUsers);
router.get('/drivers', protect, authorize('admin', 'superadmin'), getAllDrivers);
router.get('/orders', protect, authorize('admin', 'superadmin'), getAllOrders);
router.patch('/toggle-status/:id', protect, authorize('admin', 'superadmin'), toggleUserStatus);
router.patch('/verify-driver/:id', protect, authorize('superadmin'), verifyDriver);
router.get('/revenue', protect, authorize('admin', 'superadmin'), getRevenueAnalytics);
router.get('/tickets', protect, authorize('admin', 'superadmin'), getSupportTickets);
// Public Stats — Real data from DB
router.get('/public-stats', async (req, res) => {
  try {
    const db = req.app.locals.db || require('../config/db');

    // Increment visitors
    await db.query(`
      INSERT INTO site_stats (key, value) VALUES ('visitors', 1)
      ON CONFLICT (key) DO UPDATE SET value = site_stats.value + 1
    `);

    const [users, drivers, orders, stores, visitors, revenue] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users WHERE role = 'customer' AND is_active = true`),
      db.query(`SELECT COUNT(*) FROM users WHERE role = 'driver' AND is_active = true`),
      db.query(`SELECT COUNT(*) FROM orders`),
      db.query(`SELECT COUNT(*) FROM stores WHERE is_active = true`),
      db.query(`SELECT value FROM site_stats WHERE key = 'visitors'`),
      db.query(`SELECT COALESCE(SUM(delivery_fee),0) AS total FROM orders WHERE status = 'delivered'`),
    ]);

    res.json({
      users:    parseInt(users.rows[0].count),
      drivers:  parseInt(drivers.rows[0].count),
      orders:   parseInt(orders.rows[0].count),
      stores:   parseInt(stores.rows[0].count),
      visitors: parseInt(visitors.rows[0]?.value || 0),
      revenue:  parseFloat(revenue.rows[0].total),
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.json({ users: 0, drivers: 0, orders: 0, stores: 0, visitors: 0, revenue: 0 });
  }
});
// Public Reviews
router.get('/public-reviews', async (req, res) => {
  try {
    const db = req.app.locals.db || require('../config/db');
    const result = await db.query(`
      SELECT r.rating, r.comment, r.created_at,
             u.full_name, u.wilaya
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.rating >= 4
      ORDER BY r.created_at DESC
      LIMIT 6
    `);
    res.json({ reviews: result.rows });
  } catch (err) {
    res.json({ reviews: [] });
  }
});

// Submit Review (authenticated)
router.post('/reviews', async (req, res) => {
  try {
    const db = req.app.locals.db || require('../config/db');
    const { user_id, rating, comment } = req.body;
    if (!user_id || !comment) return res.status(400).json({ message: 'Missing fields' });
    await db.query(
      `INSERT INTO reviews (user_id, rating, comment) VALUES ($1, $2, $3)`,
      [user_id, rating || 5, comment]
    );
    res.json({ message: 'Review submitted!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;