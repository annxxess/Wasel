const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'wasel_db',
  user:     process.env.DB_USER     || 'postgres',
  password: String(process.env.DB_PASS || 'postgres123'),
});

pool.connect()
  .then(client => { console.log('✅ Database connected'); client.release(); })
  .catch(err  => console.error('❌ Database connection failed:', err.message));

module.exports = pool;