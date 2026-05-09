// ============================================
// WASEL | واصل - Driver Controller
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const { query } = require('../config/db');

// ─── Get Driver Profile ─────────────────────
const getProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, full_name, email, phone, avatar_url,
        is_verified, is_online, rating, total_deliveries, wallet_balance
       FROM drivers WHERE id=$1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    res.json({ driver: result.rows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Toggle Online Status ───────────────────
const toggleOnline = async (req, res) => {
  try {
    const result = await query(
      `UPDATE drivers 
       SET is_online = NOT is_online, updated_at=NOW()
       WHERE id=$1
       RETURNING id, full_name, is_online`,
      [req.user.id]
    );

    const driver = result.rows[0];
    res.json({
      message: driver.is_online ? '🟢 You are now Online!' : '🔴 You are now Offline.',
      is_online: driver.is_online
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Update Driver Location ─────────────────
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    await query(
      `UPDATE drivers 
       SET current_lat=$1, current_lng=$2, updated_at=NOW()
       WHERE id=$3`,
      [latitude, longitude, req.user.id]
    );

    res.json({ message: 'Location updated ✅' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Driver Earnings ────────────────────
const getEarnings = async (req, res) => {
  try {
    const driver_id = req.user.id;

    const today = await query(
      `SELECT COALESCE(SUM(delivery_fee), 0) as earnings, COUNT(*) as deliveries
       FROM orders
       WHERE driver_id=$1 AND status='delivered'
       AND DATE(created_at) = CURRENT_DATE`,
      [driver_id]
    );

    const weekly = await query(
      `SELECT COALESCE(SUM(delivery_fee), 0) as earnings, COUNT(*) as deliveries
       FROM orders
       WHERE driver_id=$1 AND status='delivered'
       AND created_at >= NOW() - INTERVAL '7 days'`,
      [driver_id]
    );

    const monthly = await query(
      `SELECT COALESCE(SUM(delivery_fee), 0) as earnings, COUNT(*) as deliveries
       FROM orders
       WHERE driver_id=$1 AND status='delivered'
       AND created_at >= NOW() - INTERVAL '30 days'`,
      [driver_id]
    );

    res.json({
      today: today.rows[0],
      weekly: weekly.rows[0],
      monthly: monthly.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Driver Delivery History ────────────
const getDeliveryHistory = async (req, res) => {
  try {
    const result = await query(
      `SELECT o.*, u.full_name as customer_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.driver_id=$1
       ORDER BY o.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ deliveries: result.rows });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProfile,
  toggleOnline,
  updateLocation,
  getEarnings,
  getDeliveryHistory
};