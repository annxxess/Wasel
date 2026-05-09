const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');

const getUser = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET || 'wasel_secret');
};

router.get('/profile', async (req, res) => {
  try {
    const db      = req.app.locals.db;
    const decoded = getUser(req);
    const result  = await db.query(
      'SELECT u.*, d.is_online, d.rating, d.total_deliveries, d.wallet_balance AS driver_wallet FROM users u LEFT JOIN drivers d ON d.user_id=u.id WHERE u.id=$1',
      [decoded.id]
    );
    res.json({ driver: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const db      = req.app.locals.db;
    const decoded = getUser(req);
    const result  = await db.query(
      `SELECT o.*, u.full_name AS customer_name FROM orders o LEFT JOIN users u ON u.id=o.customer_id WHERE o.driver_id=$1 ORDER BY o.created_at DESC`,
      [decoded.id]
    );
    res.json({ orders: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/earnings', async (req, res) => {
  try {
    const db      = req.app.locals.db;
    const decoded = getUser(req);
    const result  = await db.query(
      `SELECT COALESCE(SUM(delivery_fee),0) AS total, COUNT(*) AS count FROM orders WHERE driver_id=$1 AND status='delivered'`,
      [decoded.id]
    );
    res.json({ total: result.rows[0].total, count: result.rows[0].count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/toggle-online', async (req, res) => {
  try {
    const db      = req.app.locals.db;
    const decoded = getUser(req);
    const result  = await db.query(
      'UPDATE drivers SET is_online=NOT is_online WHERE user_id=$1 RETURNING is_online',
      [decoded.id]
    );
    res.json({ is_online: result.rows[0]?.is_online });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;