const express  = require('express');
const http     = require('http');
const cors     = require('cors');
const path     = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('./config/db');

const app    = express();
const server = http.createServer(app);

app.locals.db = db;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WASEL API Running' });
});

const authRoutes   = require('./routes/auth.routes');
const adminRoutes  = require('./routes/admin.routes');
const orderRoutes  = require('./routes/order.routes');
const storeRoutes  = require('./routes/store.routes');
const driverRoutes = require('./routes/driver.routes');

app.use('/api/auth',    authRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/orders',  orderRoutes);
app.use('/api/stores',  storeRoutes);
app.use('/api/drivers', driverRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

const PORT = process.env.PORT || 3500;
server.listen(PORT, () => {
  console.log('================================');
  console.log('🚀 WASEL Server on port ' + PORT);
  console.log('✅ Routes loaded successfully');
  console.log('================================');
});