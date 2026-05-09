const express = require('express');
const router  = express.Router();

router.get('/my', async (req, res) => {
  try {
    const db    = req.app.locals.db;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const jwt     = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wasel_secret');

    const result = await db.query(`
      SELECT o.*, u.full_name AS driver_name
      FROM orders o
      LEFT JOIN users u ON u.id = o.driver_id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC
    `, [decoded.id]);

    res.json({ orders: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db  = req.app.locals.db;
    const { customer_id, order_type, pickup_address, delivery_address, delivery_fee, payment_method, notes } = req.body;

    const result = await db.query(`
      INSERT INTO orders (customer_id, order_type, pickup_address, delivery_address, delivery_fee, payment_method, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `, [customer_id, order_type||'parcel', pickup_address, delivery_address, delivery_fee||200, payment_method||'cash', notes||'']);

    res.status(201).json({ message: 'Order created!', order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status } = req.body;
    await db.query('UPDATE orders SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get available orders
router.get('/available', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(`
      SELECT o.*, u.full_name AS customer_name
      FROM orders o
      LEFT JOIN users u ON u.id = o.customer_id
      WHERE o.status = 'pending' AND o.driver_id IS NULL
      ORDER BY o.created_at DESC
    `);
    res.json({ orders: result.rows });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Accept order
router.patch('/:id/accept', async (req, res) => {
  try {
    const db    = req.app.locals.db;
    const jwt   = require('jsonwebtoken');
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wasel_secret');
    await db.query(
      `UPDATE orders SET driver_id=$1, status='confirmed' WHERE id=$2 AND status='pending'`,
      [decoded.id, req.params.id]
    );
    res.json({ message: 'Order accepted!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;