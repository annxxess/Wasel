// ============================================
// WASEL | واصل - Real-Time Tracking Socket
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

const { query } = require('../config/db');

const initTrackingSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New socket connected: ${socket.id}`);

    // ─── Driver joins their room ──────────────
    socket.on('driver:join', (driverId) => {
      socket.join(`driver:${driverId}`);
      console.log(`🚗 Driver ${driverId} joined room`);
    });

    // ─── Customer joins order tracking room ───
    socket.on('customer:track', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`📦 Customer tracking order: ${orderId}`);
    });

    // ─── Driver sends location update ─────────
    socket.on('driver:location', async (data) => {
      const { driverId, latitude, longitude, orderId } = data;

      try {
        // Update driver location in DB
        await query(
          'UPDATE drivers SET current_lat=$1, current_lng=$2 WHERE id=$3',
          [latitude, longitude, driverId]
        );

        // Broadcast to customer tracking this order
        if (orderId) {
          io.to(`order:${orderId}`).emit('driver:locationUpdate', {
            latitude,
            longitude,
            driverId
          });
        }
      } catch (err) {
        console.error('Location update error:', err.message);
      }
    });

    // ─── Order status update ──────────────────
    socket.on('order:statusUpdate', (data) => {
      const { orderId, status } = data;
      io.to(`order:${orderId}`).emit('order:statusChanged', { orderId, status });
      console.log(`📋 Order ${orderId} status: ${status}`);
    });

    // ─── Disconnect ───────────────────────────
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initTrackingSocket;