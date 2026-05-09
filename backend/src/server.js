// ============================================
// WASEL | واصل - Server Entry Point
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const initTrackingSocket = require('./sockets/tracking.socket');

const PORT = process.env.PORT || 3500;

const server = http.createServer(app);

// ─── Socket.io Setup ────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

initTrackingSocket(io);

// ─── Start Server ────────────────────────────
server.listen(PORT, () => {
  console.log(`
  ================================
  🚀 WASEL Server is running!
  📡 Port: ${PORT}
  🔌 Socket.io: Active
  🌍 Mode: ${process.env.NODE_ENV || 'development'}
  👤 Created by: Marref Mohammed Anas
  ================================
  `);
});

module.exports = server;