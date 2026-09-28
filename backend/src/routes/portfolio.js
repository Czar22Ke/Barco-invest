const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const pool = db.pool || db;
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const balanceResult = await pool.query(
      `SELECT running_balance FROM ledger WHERE user_id = $1 OR user_id = (SELECT user_id FROM users WHERE id = $1) ORDER BY created_at DESC LIMIT 1`,
      [req.user.id || req.user.userId]
    );

    const currentBalance = balanceResult.rows.length > 0 ? parseFloat(balanceResult.rows[0].running_balance) : 0.00;

    res.status(200).json({ balance: currentBalance, currentBalance });
  } catch (error) {
    console.error('Portfolio Fetch Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
