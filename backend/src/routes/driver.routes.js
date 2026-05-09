// ============================================
// WASEL | واصل - Driver Routes
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProfile,
  toggleOnline,
  updateLocation,
  getEarnings,
  getDeliveryHistory
} = require('../controllers/driver.controller');

router.get('/profile', protect, authorize('driver'), getProfile);
router.patch('/toggle-online', protect, authorize('driver'), toggleOnline);
router.patch('/location', protect, authorize('driver'), updateLocation);
router.get('/earnings', protect, authorize('driver'), getEarnings);
router.get('/history', protect, authorize('driver'), getDeliveryHistory);

module.exports = router;