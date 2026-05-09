// ============================================
// WASEL | واصل - Order Routes
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus
} = require('../controllers/order.controller');

// ─── Customer Routes ────────────────────────
router.post('/', protect, authorize('customer'), createOrder);
router.get('/my-orders', protect, authorize('customer'), getMyOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/cancel', protect, authorize('customer'), cancelOrder);

// ─── Driver Routes ──────────────────────────
router.get('/driver/available', protect, authorize('driver'), getAvailableOrders);
router.patch('/:id/accept', protect, authorize('driver'), acceptOrder);
router.patch('/:id/status', protect, authorize('driver'), updateOrderStatus);

module.exports = router;