const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const transactionRoutes = require('./src/routes/transactions');
const adminRoutes = require('./src/routes/admin');
const portfolioRoutes = require('./src/routes/portfolio');
const moderatorRoutes = require('./src/routes/moderator');
const userRoutes = require('./src/routes/user');
const marketRoutes = require('./src/routes/market');
require('./src/services/yieldDistributor');
require('./src/services/tickerService');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL // Your production Vercel URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed for this origin'));
  },
  credentials: true
}));

app.use(express.json()); // Parses incoming JSON payloads
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes.default || transactionRoutes);
app.use('/api/admin', adminRoutes.default || adminRoutes);
app.use('/api/moderator', moderatorRoutes.default || moderatorRoutes);
app.use('/api/portfolio', portfolioRoutes.default || portfolioRoutes);
app.use('/api/user', userRoutes.default || userRoutes);
app.use('/api/market', marketRoutes.default || marketRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
