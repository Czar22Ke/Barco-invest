// backend/src/routes/market.js
const express = require('express');
const router = express.Router();
const { getTickerData } = require('../services/tickerService');

// GET /api/market/ticker (Public route, no auth required)
router.get('/ticker', (req, res) => {
  const data = getTickerData();
  res.json(data);
});

module.exports = router;
