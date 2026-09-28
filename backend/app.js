const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const transactionRoutes = require('./src/routes/transactions');

const app = express();

// Enable CORS for the Vue frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your Vite/Vue ports
  credentials: true
}));

app.use(express.json()); // Parses incoming JSON payloads
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes.default || transactionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
