const db = require('./src/config/db');

async function test() {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('✅ DB works:', res.rows[0]);

    const users = await db.query('SELECT COUNT(*) FROM users');
    console.log('✅ Users table:', users.rows[0]);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  process.exit();
}

test();