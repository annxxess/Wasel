// ============================================
// WASEL | واصل - Auth Routes
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  registerDriver,
  loginDriver
} = require('../controllers/auth.controller');

// ─── Customer Auth ──────────────────────────
router.post('/register', registerUser);
router.post('/login', loginUser);

// ─── Driver Auth ────────────────────────────
router.post('/driver/register', registerDriver);
router.post('/driver/login', loginDriver);

module.exports = router;