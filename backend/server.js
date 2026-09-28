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

// Enable CORS for the Vue frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your Vite/Vue ports
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
