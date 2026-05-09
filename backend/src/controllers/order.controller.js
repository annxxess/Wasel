// ============================================
// WASEL | واصل - Orders Controller
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const { query } = require('../config/db');

// ─── Create New Order ───────────────────────
const createOrder = async (req, res) => {
  try {
    const {
      order_type,
      pickup_address, pickup_lat, pickup_lng,
      delivery_address, delivery_lat, delivery_lng,
      payment_method, notes, store_id, promo_code
    } = req.body;

    const user_id = req.user.id;

    if (!pickup_address || !delivery_address || !order_type) {
      return res.status(400).json({ error: 'Missing required order fields.' });
    }

    // Calculate basic delivery fee (can be improved with Google Maps distance)
    const delivery_fee = 200; // 200 DZD base fee
    const total_amount = delivery_fee;
    const estimated_time = 30; // 30 minutes default

    const result = await query(
      `INSERT INTO orders (
        user_id, store_id, order_type,
        pickup_address, pickup_lat, pickup_lng,
        delivery_address, delivery_lat, delivery_lng,
        delivery_fee, total_amount, payment_method,
        notes, estimated_time, promo_code
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        user_id, store_id || null, order_type,
        pickup_address, pickup_lat, pickup_lng,
        delivery_address, delivery_lat, delivery_lng,
        delivery_fee, total_amount, payment_method || 'cash',
        notes, estimated_time, promo_code || null
      ]
    );

    res.status(201).json({
      message: 'Order created successfully! 📦',
      order: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get My Orders (Customer) ───────────────
const getMyOrders = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await query(
      `SELECT o.*, 
        d.full_name as driver_name, 
        d.phone as driver_phone,
        d.current_lat as driver_lat,
        d.current_lng as driver_lng,
        d.rating as driver_rating
       FROM orders o
       LEFT JOIN drivers d ON o.driver_id = d.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [user_id]
    );

    res.json({ orders: result.rows });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Single Order ───────────────────────
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await query(
      `SELECT o.*,
        d.full_name as driver_name,
        d.phone as driver_phone,
        d.current_lat as driver_lat,
        d.current_lng as driver_lng,
        d.avatar_url as driver_avatar,
        d.rating as driver_rating
       FROM orders o
       LEFT JOIN drivers d ON o.driver_id = d.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({ order: result.rows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Cancel Order ───────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const orderCheck = await query(
      'SELECT status FROM orders WHERE id=$1 AND user_id=$2',
      [id, user_id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const { status } = orderCheck.rows[0];

    if (['delivered', 'cancelled', 'on_the_way'].includes(status)) {
      return res.status(400).json({ error: `Cannot cancel order with status: ${status}` });
    }

    await query(
      `UPDATE orders SET status='cancelled', updated_at=NOW() WHERE id=$1`,
      [id]
    );

    res.json({ message: 'Order cancelled successfully.' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Available Orders (Driver) ──────────
const getAvailableOrders = async (req, res) => {
  try {
    const result = await query(
      `SELECT o.*, 
        u.full_name as customer_name,
        u.phone as customer_phone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.status = 'pending' AND o.driver_id IS NULL
       ORDER BY o.created_at ASC
       LIMIT 20`
    );

    res.json({ orders: result.rows });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Accept Order (Driver) ──────────────────
const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const driver_id = req.user.id;

    const orderCheck = await query(
      'SELECT status, driver_id FROM orders WHERE id=$1',
      [id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (orderCheck.rows[0].driver_id) {
      return res.status(400).json({ error: 'Order already taken by another driver.' });
    }

    const result = await query(
      `UPDATE orders 
       SET driver_id=$1, status='confirmed', updated_at=NOW()
       WHERE id=$2 AND status='pending'
       RETURNING *`,
      [driver_id, id]
    );

    res.json({
      message: 'Order accepted! 🏍️ Head to pickup location.',
      order: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Update Order Status (Driver) ───────────
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const driver_id = req.user.id;

    const validStatuses = ['picking_up', 'on_the_way', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const result = await query(
      `UPDATE orders SET status=$1, updated_at=NOW()
       WHERE id=$2 AND driver_id=$3
       RETURNING *`,
      [status, id, driver_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or not assigned to you.' });
    }

    // If delivered, update driver total deliveries
    if (status === 'delivered') {
      await query(
        'UPDATE drivers SET total_deliveries = total_deliveries + 1 WHERE id=$1',
        [driver_id]
      );
    }

    res.json({
      message: `Order status updated to: ${status} ✅`,
      order: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus
};