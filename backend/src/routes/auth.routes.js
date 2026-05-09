const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const router  = express.Router();

// ── REGISTER ──────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { full_name, email, phone, password, role, wilaya } = req.body;

    if (!full_name || !email || !password)
      return res.status(400).json({ message: 'Please fill all required fields' });

    const exists = await db.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length > 0)
      return res.status(400).json({ message: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    const validRole = ['customer','driver','store','admin'].includes(role) ? role : 'customer';

    const result = await db.query(`
      INSERT INTO users (full_name, email, phone, password_hash, role, wilaya, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,true)
      RETURNING id, full_name, email, phone, role, wilaya, wallet_balance, created_at
    `, [full_name, email, phone||'', password_hash, validRole, wilaya||'Tlemcen']);

    const user  = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'wasel_secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({ message: 'Account created! 🎉', user, token });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── LOGIN ─────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { email, password, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Email not found' });

    const user = result.rows[0];

    if (!user.is_active)
      return res.status(403).json({ message: 'Account suspended' });

    if (role && role !== user.role)
      return res.status(401).json({ message: `This account is not a ${role} account` });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'wasel_secret',
      { expiresIn: '30d' }
    );

    const { password_hash, ...userData } = user;
    res.json({ message: `Welcome back ${user.full_name}! 👋`, user: userData, token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET ME ────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const db    = req.app.locals.db;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wasel_secret');
    const result  = await db.query(
      'SELECT id,full_name,email,phone,role,wilaya,wallet_balance,is_active,created_at FROM users WHERE id=$1',
      [decoded.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ── RESET PASSWORDS (TEMP) ────────────────
router.get('/reset-passwords', async (req, res) => {
  try {
    const db   = req.app.locals.db;
    const hash = await bcrypt.hash('admin123', 10);
    await db.query('UPDATE users SET password_hash = $1', [hash]);
    res.json({ message: '✅ All passwords reset to: admin123' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;