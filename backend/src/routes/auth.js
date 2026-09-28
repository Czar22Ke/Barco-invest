const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // The connection pool we created earlier
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { email, password, tier } = req.body;

    // Password strength validation
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasNumbers || !hasSpecial) {
      return res.status(400).json({ message: 'Password must include at least one number and one special character.' });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : '';

    // Check if user already exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into PostgreSQL (Bypassing payment logic)
    const userId = `USER_${Math.floor(1000 + Math.random() * 9000)}`;
    const result = await db.query(
      'INSERT INTO users (user_id, email, password_hash, tier) VALUES ($1, $2, $3, $4) RETURNING user_id, email, tier, status',
      [userId, cleanEmail, passwordHash, tier || 'BRONZE']
    );

    const user = result.rows[0];
    user.role = 'user'; // Provide default role for the frontend Pinia store

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

    // Find the user
    const result = await db.query(
      'SELECT id, user_id, email, password, password_hash, role, tier_name, tier FROM users WHERE email = $1',
      [cleanEmail]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    // Compare submitted password with the database hash
    const isMatch = await bcrypt.compare(password, user.password_hash || user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login timestamp
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = $1',
      [email]
    );

    const token = jwt.sign(
      { id: user.user_id || user.id, role: user.role }, 
      process.env.JWT_SECRET || 'barco_secret', 
      { expiresIn: '1d' }
    );

    // Remove the password hash before sending the user object back to the Vue frontend
    delete user.password_hash;
    delete user.password;

    // Fetch the latest running balance from the ledger, defaulting to 0
    const balanceResult = await db.query(
      `SELECT running_balance FROM ledger WHERE user_id = $1 OR user_id = (SELECT user_id FROM users WHERE id = $1) ORDER BY created_at DESC LIMIT 1`,
      [user.id || user.user_id]
    );

    const currentBalance = balanceResult.rows.length > 0 ? parseFloat(balanceResult.rows[0].running_balance) : 0.00;

    res.json({
      token,
      user: {
        id: user.user_id || user.id,
        email: user.email,
        role: user.role || 'USER',
        tier: user.tier_name || user.tier || 'BRONZE',
        tier_name: user.tier_name || user.tier || 'BRONZE',
        balance: currentBalance,
        currentBalance: currentBalance
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me (or /profile)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const result = await db.query('SELECT * FROM users WHERE user_id = $1 OR id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    delete user.password_hash;
    user.role = 'user';

    // Fetch the latest running balance from the ledger, defaulting to 0
    const balanceResult = await db.query(
      `SELECT running_balance FROM ledger WHERE user_id = $1 OR user_id = (SELECT user_id FROM users WHERE id = $1) ORDER BY created_at DESC LIMIT 1`,
      [req.user.id || req.user.userId]
    );

    const currentBalance = balanceResult.rows.length > 0 ? parseFloat(balanceResult.rows[0].running_balance) : 0.00;
    user.balance = currentBalance;
    user.currentBalance = currentBalance;

    res.json({ success: true, user, balance: currentBalance, currentBalance });
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
