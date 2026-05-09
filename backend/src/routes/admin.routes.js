const express = require('express');
const router  = express.Router();

// ── Public Stats ──────────────────────────
router.get('/public-stats', async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.query(`
      INSERT INTO site_stats (key, value) VALUES ('visitors', 1)
      ON CONFLICT (key) DO UPDATE SET value = site_stats.value + 1
    `);
    const [users, drivers, orders, stores, visitors, revenue] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users WHERE role='customer' AND is_active=true`),
      db.query(`SELECT COUNT(*) FROM users WHERE role='driver'   AND is_active=true`),
      db.query(`SELECT COUNT(*) FROM orders`),
      db.query(`SELECT COUNT(*) FROM stores WHERE is_active=true`),
      db.query(`SELECT value FROM site_stats WHERE key='visitors'`),
      db.query(`SELECT COALESCE(SUM(delivery_fee),0) AS total FROM orders WHERE status='delivered'`),
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
    res.json({ users: 0, drivers: 0, orders: 0, stores: 0, visitors: 0, revenue: 0 });
  }
});

// ── Public Reviews ────────────────────────
router.get('/public-reviews', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(`
      SELECT r.rating, r.comment, r.created_at, u.full_name, u.wilaya
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.rating >= 4
      ORDER BY r.created_at DESC LIMIT 6
    `);
    res.json({ reviews: result.rows });
  } catch { res.json({ reviews: [] }); }
});

// ── Submit Review ─────────────────────────
router.post('/reviews', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { user_id, rating, comment } = req.body;
    if (!user_id || !comment) return res.status(400).json({ message: 'Missing fields' });
    await db.query(
      `INSERT INTO reviews (user_id, rating, comment) VALUES ($1, $2, $3)`,
      [user_id, rating || 5, comment]
    );
    res.json({ message: 'Review submitted!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Admin Stats ───────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const [users, drivers, orders, stores, revenue] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users WHERE role='customer'`),
      db.query(`SELECT COUNT(*) FROM users WHERE role='driver'`),
      db.query(`SELECT COUNT(*) FROM orders`),
      db.query(`SELECT COUNT(*) FROM stores`),
      db.query(`SELECT COALESCE(SUM(delivery_fee),0) AS total FROM orders WHERE status='delivered'`),
    ]);
    const chart = await db.query(`
      SELECT TO_CHAR(created_at,'Dy') AS day,
             COUNT(*) AS orders,
             COALESCE(SUM(delivery_fee),0) AS revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day, DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at)
    `);
    res.json({
      users:   parseInt(users.rows[0].count),
      drivers: parseInt(drivers.rows[0].count),
      orders:  parseInt(orders.rows[0].count),
      stores:  parseInt(stores.rows[0].count),
      revenue: parseFloat(revenue.rows[0].total),
      chart:   chart.rows,
    });
  } catch (err) {
    res.json({ users: 0, drivers: 0, orders: 0, stores: 0, revenue: 0, chart: [] });
  }
});

// ── Get All Users ─────────────────────────
router.get('/users', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { search = '' } = req.query;
    const result = await db.query(`
      SELECT id, full_name, email, phone, wilaya, wallet_balance, is_active, created_at
      FROM users WHERE role='customer'
      AND (full_name ILIKE $1 OR email ILIKE $1)
      ORDER BY created_at DESC
    `, [`%${search}%`]);
    res.json({ users: result.rows });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Get All Drivers ───────────────────────
router.get('/drivers', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { search = '' } = req.query;
    const result = await db.query(`
      SELECT u.id, u.full_name, u.email, u.phone, u.is_active,
             d.is_online, d.is_verified, d.rating, d.total_deliveries, d.wallet_balance
      FROM users u
      LEFT JOIN drivers d ON d.user_id = u.id
      WHERE u.role='driver'
      AND (u.full_name ILIKE $1 OR u.email ILIKE $1)
      ORDER BY u.created_at DESC
    `, [`%${search}%`]);
    res.json({ drivers: result.rows });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Get All Orders ────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status = '' } = req.query;
    const query = status
      ? `SELECT o.*, u.full_name AS customer_name,
                d.full_name AS driver_name
         FROM orders o
         LEFT JOIN users u ON u.id = o.customer_id
         LEFT JOIN users d ON d.id = o.driver_id
         WHERE o.status = $1 ORDER BY o.created_at DESC`
      : `SELECT o.*, u.full_name AS customer_name,
                d.full_name AS driver_name
         FROM orders o
         LEFT JOIN users u ON u.id = o.customer_id
         LEFT JOIN users d ON d.id = o.driver_id
         ORDER BY o.created_at DESC`;
    const result = status
      ? await db.query(query, [status])
      : await db.query(query);
    res.json({ orders: result.rows });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Get All Stores ────────────────────────
router.get('/stores', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { search = '' } = req.query;
    const result = await db.query(`
      SELECT * FROM stores
      WHERE name ILIKE $1 OR category ILIKE $1
      ORDER BY created_at DESC
    `, [`%${search}%`]);
    res.json({ stores: result.rows });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Toggle User/Driver Status ─────────────
router.patch('/toggle/:type/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    if (req.params.type === 'store') {
      const result = await db.query(
        `UPDATE stores SET is_active = NOT is_active WHERE id=$1 RETURNING is_active`, [id]
      );
      return res.json({ message: result.rows[0].is_active ? 'Store activated' : 'Store suspended' });
    }
    const result = await db.query(
      `UPDATE users SET is_active = NOT is_active WHERE id=$1 RETURNING is_active`, [id]
    );
    res.json({ message: result.rows[0].is_active ? 'User activated' : 'User banned' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Verify Driver ─────────────────────────
router.patch('/drivers/:id/verify', async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.query(`UPDATE drivers SET is_verified=true WHERE user_id=$1`, [req.params.id]);
    res.json({ message: 'Driver verified!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;