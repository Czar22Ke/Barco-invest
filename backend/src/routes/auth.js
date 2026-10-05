const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { email, password, tier } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasNumbers || !hasSpecial) {
      return res.status(400).json({ message: 'Password must include at least one number and one special character.' });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : '';

    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = `USER_${Math.floor(1000 + Math.random() * 9000)}`;
    const result = await db.query(
      'INSERT INTO users (user_id, email, password_hash, tier) VALUES ($1, $2, $3, $4) RETURNING user_id, email, tier, status',
      [userId, cleanEmail, passwordHash, tier || 'BRONZE']
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET || 'barco_secret', { expiresIn: '1d' });

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const result = await db.query(
      'SELECT user_id, email, password_hash, tier, main_balance FROM users WHERE email = $1',
      [cleanEmail]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.user_id }, 
      process.env.JWT_SECRET || 'barco_secret', 
      { expiresIn: '1d' }
    );

    delete user.password_hash;

    res.json({
      token,
      user: {
        id: user.user_id,
        user_id: user.user_id,
        email: user.email,
        tier: user.tier,
        balance: parseFloat(user.main_balance || 0),
        currentBalance: parseFloat(user.main_balance || 0)
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const result = await db.query('SELECT user_id, email, tier, main_balance, status FROM users WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const currentBalance = parseFloat(user.main_balance || 0);

    res.json({ 
      success: true, 
      user: {
        id: user.user_id,
        user_id: user.user_id,
        email: user.email,
        tier: user.tier,
        balance: currentBalance,
        currentBalance: currentBalance
      }, 
      balance: currentBalance, 
      currentBalance 
    });
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;