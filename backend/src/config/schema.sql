-- ============================================
-- WASEL | واصل - Complete Database Schema
-- Created by Marref Mohammed Anas
-- © 2026 WASEL. All Rights Reserved.
-- ============================================

-- ─── Extensions ─────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS TABLE ────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  phone         VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  language      VARCHAR(10) DEFAULT 'ar',
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ─── DRIVERS TABLE ──────────────────────────
CREATE TABLE IF NOT EXISTS drivers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(150) UNIQUE NOT NULL,
  phone           VARCHAR(20) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  avatar_url      TEXT,
  national_id     VARCHAR(50) UNIQUE,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  is_online       BOOLEAN DEFAULT FALSE,
  current_lat     DECIMAL(10,8),
  current_lng     DECIMAL(11,8),
  rating          DECIMAL(3,2) DEFAULT 5.00,
  total_deliveries INTEGER DEFAULT 0,
  wallet_balance  DECIMAL(10,2) DEFAULT 0.00,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── VEHICLES TABLE ─────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id    UUID REFERENCES drivers(id) ON DELETE CASCADE,
  type         VARCHAR(50) NOT NULL, -- motorcycle, car, bicycle
  brand        VARCHAR(50),
  model        VARCHAR(50),
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  color        VARCHAR(30),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ─── STORES TABLE ───────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_name   VARCHAR(100) NOT NULL,
  store_name   VARCHAR(150) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  phone        VARCHAR(20) NOT NULL,
  password_hash TEXT NOT NULL,
  category     VARCHAR(50), -- restaurant, pharmacy, shop
  logo_url     TEXT,
  address      TEXT,
  latitude     DECIMAL(10,8),
  longitude    DECIMAL(11,8),
  is_verified  BOOLEAN DEFAULT FALSE,
  is_active    BOOLEAN DEFAULT TRUE,
  is_open      BOOLEAN DEFAULT TRUE,
  rating       DECIMAL(3,2) DEFAULT 5.00,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ─── ORDERS TABLE ───────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES users(id),
  driver_id        UUID REFERENCES drivers(id),
  store_id         UUID REFERENCES stores(id),
  status           VARCHAR(30) DEFAULT 'pending',
  -- pending, confirmed, picking_up, on_the_way, delivered, cancelled
  order_type       VARCHAR(30), -- food, parcel, document, pharmacy
  pickup_address   TEXT NOT NULL,
  pickup_lat       DECIMAL(10,8),
  pickup_lng       DECIMAL(11,8),
  delivery_address TEXT NOT NULL,
  delivery_lat     DECIMAL(10,8),
  delivery_lng     DECIMAL(11,8),
  distance_km      DECIMAL(6,2),
  delivery_fee     DECIMAL(10,2),
  total_amount     DECIMAL(10,2),
  payment_method   VARCHAR(30) DEFAULT 'cash',
  payment_status   VARCHAR(20) DEFAULT 'pending',
  promo_code       VARCHAR(30),
  discount_amount  DECIMAL(10,2) DEFAULT 0.00,
  notes            TEXT,
  estimated_time   INTEGER, -- in minutes
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- ─── PAYMENTS TABLE ─────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID REFERENCES orders(id),
  user_id        UUID REFERENCES users(id),
  amount         DECIMAL(10,2) NOT NULL,
  method         VARCHAR(30), -- cash, baridimob, cib
  status         VARCHAR(20) DEFAULT 'pending',
  transaction_id VARCHAR(100),
  created_at     TIMESTAMP DEFAULT NOW()
);

-- ─── NOTIFICATIONS TABLE ────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID,
  user_type  VARCHAR(20), -- customer, driver, store, admin
  title      VARCHAR(200),
  body       TEXT,
  type       VARCHAR(50),
  is_read    BOOLEAN DEFAULT FALSE,
  data       JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── REVIEWS TABLE ──────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID REFERENCES orders(id),
  user_id    UUID REFERENCES users(id),
  driver_id  UUID REFERENCES drivers(id),
  store_id   UUID REFERENCES stores(id),
  rating     INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── PROMO CODES TABLE ──────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code           VARCHAR(30) UNIQUE NOT NULL,
  discount_type  VARCHAR(20), -- percentage, fixed
  discount_value DECIMAL(10,2),
  max_uses       INTEGER DEFAULT 100,
  used_count     INTEGER DEFAULT 0,
  expires_at     TIMESTAMP,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- ─── SUPPORT TICKETS TABLE ──────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID,
  user_type   VARCHAR(20),
  subject     VARCHAR(200),
  message     TEXT,
  status      VARCHAR(20) DEFAULT 'open', -- open, in_progress, closed
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ─── ADMINS TABLE ───────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(30) DEFAULT 'admin', -- superadmin, admin, support
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ─── Indexes for Performance ─────────────────
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_drivers_online ON drivers(is_online);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);