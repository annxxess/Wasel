const express = require('express');
const router  = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('SELECT * FROM stores WHERE is_active=true ORDER BY created_at DESC');
    res.json({ stores: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine', async (req, res) => {
  try {
    const db      = req.app.locals.db;
    const jwt     = require('jsonwebtoken');
    const token   = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wasel_secret');
    const result  = await db.query('SELECT * FROM stores WHERE owner_id=$1', [decoded.id]);
    res.json({ store: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine/stats', async (req, res) => {
  try {
    const db      = req.app.locals.db;
    const jwt     = require('jsonwebtoken');
    const token   = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wasel_secret');

    const store = await db.query('SELECT * FROM stores WHERE owner_id=$1', [decoded.id]);
    if (!store.rows[0]) return res.json({ total_orders: 0, delivered: 0, pending: 0, revenue: 0, chart: [] });

    const storeId = store.rows[0].id;
    const [total, delivered, pending, revenue] = await Promise.all([
      db.query('SELECT COUNT(*) FROM orders WHERE store_id=$1', [storeId]),
      db.query("SELECT COUNT(*) FROM orders WHERE store_id=$1 AND status='delivered'", [storeId]),
      db.query("SELECT COUNT(*) FROM orders WHERE store_id=$1 AND status='pending'", [storeId]),
      db.query("SELECT COALESCE(SUM(delivery_fee),0) AS total FROM orders WHERE store_id=$1 AND status='delivered'", [storeId]),
    ]);

    res.json({
      total_orders: parseInt(total.rows[0].count),
      delivered:    parseInt(delivered.rows[0].count),
      pending:      parseInt(pending.rows[0].count),
      revenue:      parseFloat(revenue.rows[0].total),
      chart:        [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine/orders', async (req, res) => {
  try {
    const db      = req.app.locals.db;
    const jwt     = require('jsonwebtoken');
    const token   = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wasel_secret');

    const store = await db.query('SELECT id FROM stores WHERE owner_id=$1', [decoded.id]);
    if (!store.rows[0]) return res.json({ orders: [] });

    const { status } = req.query;
    const query = status
      ? `SELECT o.*, u.full_name AS customer_name FROM orders o LEFT JOIN users u ON u.id=o.customer_id WHERE o.store_id=$1 AND o.status=$2 ORDER BY o.created_at DESC`
      : `SELECT o.*, u.full_name AS customer_name FROM orders o LEFT JOIN users u ON u.id=o.customer_id WHERE o.store_id=$1 ORDER BY o.created_at DESC`;

    const result = status
      ? await db.query(query, [store.rows[0].id, status])
      : await db.query(query, [store.rows[0].id]);

    res.json({ orders: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/mine/orders/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status } = req.body;
    await db.query('UPDATE orders SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;