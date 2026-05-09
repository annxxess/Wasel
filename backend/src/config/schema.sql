-- ══════════════════════════════════════
-- WASEL Database Schema
-- Created by: Marref Mohammed Anas
-- ══════════════════════════════════════

-- Drop existing tables
DROP TABLE IF EXISTS reviews    CASCADE;
DROP TABLE IF EXISTS orders     CASCADE;
DROP TABLE IF EXISTS stores     CASCADE;
DROP TABLE IF EXISTS drivers    CASCADE;
DROP TABLE IF EXISTS users      CASCADE;
DROP TABLE IF EXISTS site_stats CASCADE;

-- ── Users ─────────────────────────────
CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  full_name      VARCHAR(100) NOT NULL,
  email          VARCHAR(100) UNIQUE NOT NULL,
  phone          VARCHAR(20)  DEFAULT '',
  password_hash  TEXT         NOT NULL,
  role           VARCHAR(20)  DEFAULT 'customer'
                 CHECK (role IN ('customer','driver','store','admin')),
  wilaya         VARCHAR(50)  DEFAULT 'Tlemcen',
  is_active      BOOLEAN      DEFAULT true,
  is_verified    BOOLEAN      DEFAULT false,
  wallet_balance DECIMAL(10,2) DEFAULT 0,
  avatar_url     TEXT,
  created_at     TIMESTAMP    DEFAULT NOW(),
  updated_at     TIMESTAMP    DEFAULT NOW()
);

-- ── Drivers ───────────────────────────
CREATE TABLE drivers (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type     VARCHAR(50)  DEFAULT 'motorcycle',
  vehicle_plate    VARCHAR(20),
  is_online        BOOLEAN      DEFAULT false,
  is_verified      BOOLEAN      DEFAULT false,
  rating           DECIMAL(3,2) DEFAULT 5.0,
  total_deliveries INTEGER      DEFAULT 0,
  wallet_balance   DECIMAL(10,2) DEFAULT 0,
  current_lat      DECIMAL(10,8),
  current_lng      DECIMAL(11,8),
  created_at       TIMESTAMP    DEFAULT NOW()
);

-- ── Stores ────────────────────────────
CREATE TABLE stores (
  id            SERIAL PRIMARY KEY,
  owner_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  category      VARCHAR(50)  DEFAULT 'other'
                CHECK (category IN ('food','pharmacy','market','document','other')),
  address       TEXT,
  phone         VARCHAR(20),
  logo_url      TEXT,
  description   TEXT,
  is_active     BOOLEAN      DEFAULT true,
  rating        DECIMAL(3,2) DEFAULT 5.0,
  total_orders  INTEGER      DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  wilaya        VARCHAR(50)  DEFAULT 'Tlemcen',
  created_at    TIMESTAMP    DEFAULT NOW()
);

-- ── Orders ────────────────────────────
CREATE TABLE orders (
  id               SERIAL PRIMARY KEY,
  customer_id      INTEGER REFERENCES users(id),
  driver_id        INTEGER REFERENCES users(id),
  store_id         INTEGER REFERENCES stores(id),
  order_type       VARCHAR(30) DEFAULT 'parcel'
                   CHECK (order_type IN ('food','parcel','pharmacy','document')),
  status           VARCHAR(30) DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','picking_up','on_the_way','delivered','cancelled')),
  pickup_address   TEXT,
  delivery_address TEXT,
  delivery_fee     DECIMAL(10,2) DEFAULT 200,
  payment_method   VARCHAR(20) DEFAULT 'cash'
                   CHECK (payment_method IN ('cash','wallet','card')),
  notes            TEXT,
  distance_km      DECIMAL(6,2),
  created_at       TIMESTAMP DEFAULT NOW(),
  confirmed_at     TIMESTAMP,
  picked_at        TIMESTAMP,
  delivered_at     TIMESTAMP,
  cancelled_at     TIMESTAMP
);

-- ── Reviews ───────────────────────────
CREATE TABLE reviews (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  order_id   INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  rating     INTEGER DEFAULT 5
             CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── Site Stats ────────────────────────
CREATE TABLE site_stats (
  key        VARCHAR(50) PRIMARY KEY,
  value      BIGINT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ── Notifications ─────────────────────
CREATE TABLE notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(100),
  message    TEXT,
  is_read    BOOLEAN DEFAULT false,
  type       VARCHAR(30) DEFAULT 'info',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════
-- Initial Data
-- ══════════════════════════════════════

INSERT INTO site_stats (key, value) VALUES
  ('visitors', 0),
  ('total_orders', 0),
  ('total_revenue', 0);

-- Admin user (password: admin123)
INSERT INTO users (full_name, email, phone, password_hash, role, wilaya, is_active) VALUES
('Admin WASEL',   'admin@wasel.com',    '0550000000',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p5cLH5BVi3BtHKRvkVi5v2',
 'admin', 'Tlemcen', true);

-- Test users (password: admin123)
INSERT INTO users (full_name, email, phone, password_hash, role, wilaya, is_active) VALUES
('أنس العميل',  'customer@wasel.com', '0550000001',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p5cLH5BVi3BtHKRvkVi5v2',
 'customer', 'Tlemcen', true),
('محمد السائق', 'driver@wasel.com',   '0550000002',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p5cLH5BVi3BtHKRvkVi5v2',
 'driver', 'Tlemcen', true),
('متجر واصل',   'store@wasel.com',    '0550000003',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p5cLH5BVi3BtHKRvkVi5v2',
 'store', 'Tlemcen', true);

-- Driver profile
INSERT INTO drivers (user_id, vehicle_type, is_online, is_verified, rating)
VALUES (3, 'motorcycle', false, true, 5.0);

-- Sample stores
INSERT INTO stores (owner_id, name, category, address, phone, is_active, rating, total_orders, total_revenue) VALUES
(4, 'بيتزا روما',       'food',     'شارع العربي بن مهيدي، تلمسان', '0550100001', true, 4.8, 145, 58000),
(4, 'صيدلية الصحة',    'pharmacy', 'ش. الكولونيل لطفي، تلمسان',     '0550100002', true, 4.9,  89, 22250),
(4, 'ماركت إكسبريس',   'market',   'وسط المدينة، تلمسان',           '0550100003', true, 4.7, 203, 81200),
(4, 'برجر هاوس',       'food',     'حي بوهني، تلمسان',              '0550100004', true, 4.6,  67, 26800),
(4, 'مكتبة المعرفة',   'document', 'شارع الاستقلال، تلمسان',        '0550100005', true, 4.9,  34,  6800);

-- Sample orders
INSERT INTO orders (customer_id, order_type, status, pickup_address, delivery_address, delivery_fee, payment_method) VALUES
(2, 'food',     'delivered',  'بيتزا روما، تلمسان',        '12 شارع باستور',    350, 'cash'),
(2, 'parcel',   'delivered',  'وسط المدينة، تلمسان',       '45 ش. خميستي',      200, 'cash'),
(2, 'pharmacy', 'delivered',  'صيدلية الصحة، تلمسان',      '8 شارع ابن خلدون',  250, 'cash'),
(2, 'food',     'on_the_way', 'برجر هاوس، تلمسان',         '33 حي بوهني',       300, 'cash'),
(2, 'parcel',   'pending',    'ماركت إكسبريس، تلمسان',     '17 شارع السلام',    180, 'cash');

-- Sample reviews
INSERT INTO reviews (user_id, rating, comment) VALUES
(2, 5, 'واصل رائع! وصل الطلب في أقل من 20 دقيقة 🔥'),
(2, 5, 'أفضل تطبيق توصيل في الجزائر. سريع جداً!'),
(2, 5, 'التتبع المباشر رائع جداً. أحب هذا التطبيق!');

UPDATE site_stats SET value = 1247 WHERE key = 'visitors';

-- ══════════════════════════════════════
-- Indexes for performance
-- ══════════════════════════════════════
CREATE INDEX idx_orders_customer  ON orders(customer_id);
CREATE INDEX idx_orders_driver    ON orders(driver_id);
CREATE INDEX idx_orders_status    ON orders(status);
CREATE INDEX idx_users_email      ON users(email);
CREATE INDEX idx_users_role       ON users(role);
CREATE INDEX idx_drivers_user     ON drivers(user_id);
CREATE INDEX idx_reviews_user     ON reviews(user_id);