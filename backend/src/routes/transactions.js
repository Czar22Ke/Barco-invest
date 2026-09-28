import express from 'express';
import { InvestmentEngine } from '../services/InvestmentEngine.js';
import db from '../config/db.js'; // Adjust path to your actual pg pool export
import { authenticateToken } from '../middleware/auth.js'; // Adjust path/name to your auth middleware

const pool = db.pool || db;
const router = express.Router();
const engine = new InvestmentEngine(null, pool);

// POST /api/transactions/deposit
router.post('/deposit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // Extract from auth token
    const { amount, idempotencyKey } = req.body;

    if (!amount || !idempotencyKey) {
      return res.status(400).json({ message: 'Amount and idempotencyKey are required.' });
    }

    const result = await engine.processDeposit(userId, amount, idempotencyKey);
    
    if (result.status === 'DUPLICATE') {
      return res.status(409).json({ message: 'Transaction already processed', transactionId: result.transactionId });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Deposit Error:', error);
    res.status(500).json({ message: 'Internal server error processing deposit.' });
  }
});

// POST /api/transactions/withdraw
router.post('/withdraw', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { amount, idempotencyKey } = req.body;

    if (!amount || !idempotencyKey) {
      return res.status(400).json({ message: 'Amount and idempotencyKey are required.' });
    }

    const result = await engine.processWithdrawal(userId, amount, idempotencyKey);
    
    if (result.status === 'DUPLICATE') {
      return res.status(409).json({ message: 'Transaction already processed', transactionId: result.transactionId });
    }
    
    if (result.status === 'REJECTED_WINDOW_CLOSED') {
      return res.status(403).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Withdrawal Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// POST /api/transactions/yield
router.post('/yield', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { yieldPct, idempotencyKey } = req.body;

    if (!yieldPct || !idempotencyKey) {
      return res.status(400).json({ message: 'yieldPct and idempotencyKey are required.' });
    }

    const result = await engine.processYield(userId, yieldPct, idempotencyKey);
    
    if (result.status === 'DUPLICATE') {
      return res.status(409).json({ message: 'Transaction already processed' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Yield Error:', error);
    res.status(500).json({ message: 'Internal server error processing yield.' });
  }
});

// POST /api/transactions/daily-yield
router.post('/daily-yield', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { idempotencyKey } = req.body;

    if (!idempotencyKey) return res.status(400).json({ message: 'idempotencyKey is required.' });

    const result = await engine.processDailyYield(userId, idempotencyKey);
    
    if (result.status === 'DUPLICATE') return res.status(409).json({ message: 'Transaction already processed' });

    res.status(200).json(result);
  } catch (error) {
    console.error('Yield Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/transactions/balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const balanceResult = await pool.query(
      `SELECT running_balance FROM ledger WHERE user_id = $1 OR user_id = (SELECT user_id FROM users WHERE id = $1) ORDER BY created_at DESC LIMIT 1`,
      [req.user.id || req.user.userId]
    );

    const currentBalance = balanceResult.rows.length > 0 ? parseFloat(balanceResult.rows[0].running_balance) : 0.00;

    res.status(200).json({ balance: currentBalance, currentBalance });
  } catch (error) {
    console.error('Balance Fetch Error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
