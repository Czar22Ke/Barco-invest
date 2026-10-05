const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../services/mailer');

const pool = db.pool || db;
const router = express.Router();

// GET /api/user/profile
router.get('/profile', authenticateToken, async (req, res) => {
  const userId = req.user ? (req.user.user_id || req.user.userId) : null;
  
  try {
    // 1. Fetch user base attributes
    const userRes = await pool.query(
      'SELECT user_id, email, role, tier_name, tier, main_balance, invested_balance, profit_balance, hwm_balance FROM users WHERE user_id = $1 OR id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = userRes.rows[0];
    const canonicalUserId = user.user_id;

    // 2. Fetch the latest running balance from the ledger (Single Source of Truth)
    const ledgerRes = await pool.query(
      'SELECT main_balance FROM ledger_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [canonicalUserId]
    );

    const currentBalance = ledgerRes.rows.length > 0 ? parseFloat(ledgerRes.rows[0].main_balance) : parseFloat(user.main_balance || 0);

    // Calculate High-Water Mark (HWM) from explicit hwm_balance column
    const hwmPeak = user.hwm_balance > 0 ? parseFloat(user.hwm_balance) : currentBalance;

    // 3. Count rejected withdrawals for alert banners
    const rejectedRes = await pool.query(
      "SELECT COUNT(*) FROM transactions WHERE user_id = $1 AND status = 'REJECTED'",
      [canonicalUserId]
    );
    const rejectedCount = parseInt(rejectedRes.rows[0].count, 10);

    res.json({
      ...user,
      balance: currentBalance,
      currentBalance: currentBalance,
      hwmPeak: hwmPeak, // Inject HWM into response
      invested_balance: parseFloat(user.invested_balance || 0),
      profit_balance: parseFloat(user.profit_balance || 0),
      rejectedCount,
      hasRejectedWithdrawals: rejectedCount > 0
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// GET /api/user/transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user ? (req.user.user_id || req.user.userId) : null;

    const result = await pool.query(
      `SELECT 
        COALESCE(l.id::text, t.id::text) as id,
        COALESCE(l.created_at, t.created_at) as created_at,
        COALESCE(t.transaction_type, 'LEDGER ENTRY') AS transaction_type,
        COALESCE(l.amount, -t.amount) AS amount,
        l.main_balance,
        COALESCE(t.status, 'COMPLETED') AS status,
        t.tx_hash
      FROM ledger_transactions l
      FULL OUTER JOIN transactions t ON l.transaction_id = t.id
      WHERE (l.user_id = $1 OR l.user_id = (SELECT user_id FROM users WHERE user_id = $1 OR id = $1 LIMIT 1))
         OR (t.user_id = $1 OR t.user_id = (SELECT user_id FROM users WHERE user_id = $1 OR id = $1 LIMIT 1))
      ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch User Transactions Error:', error);
    res.status(500).json({ message: 'Internal server error fetching transactions.' });
  }
});

// POST /api/user/deposit
router.post('/deposit', authenticateToken, async (req, res) => {
  const userId = req.user ? (req.user.user_id || req.user.userId) : null;
  const { amount, method, txHash } = req.body;
  const depositAmount = parseFloat(amount);

  if (!depositAmount || depositAmount < 1) {
    return res.status(400).json({ message: 'Minimum deposit is $1.00.' });
  }
  if (!txHash || txHash.trim() === '') {
    return res.status(400).json({ message: 'Transaction hash (TxID) is required.' });
  }

  try {
    let canonicalUserId = userId;
    let recipientEmail = req.user ? req.user.email : null;
    const userCheck = await pool.query(
      'SELECT user_id, email FROM users WHERE user_id = $1 OR id = $1 LIMIT 1',
      [userId]
    );
    if (userCheck.rows.length > 0) {
      canonicalUserId = userCheck.rows[0].user_id;
      recipientEmail = recipientEmail || userCheck.rows[0].email;
    }

    await pool.query(
      "INSERT INTO transactions (user_id, transaction_type, amount, status, description, tx_hash) VALUES ($1, 'DEPOSIT', $2, 'PENDING', $3, $4)",
      [canonicalUserId, depositAmount, `Deposit via ${method || 'Crypto Wallet'}`, txHash.trim()]
    );

    // Trigger Deposit Notification Email
    const emailSubject = 'Deposit Request Received - Pending Verification';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Deposit Request Received</h2>
        <p>Hello,</p>
        <p>We have received your deposit claim of <strong>$${depositAmount.toFixed(2)}</strong> via ${method || 'Crypto Wallet'}.</p>
        <p><strong>Transaction Hash provided:</strong> <span style="font-family: monospace;">${txHash.trim()}</span></p>
        <p>Our compliance team is currently verifying this transaction on the blockchain. Once confirmed, the funds will be credited to your liquid main balance.</p>
        <p>Thank you for investing with us.</p>
      </div>
    `;

    // Fire and forget (don't await so it doesn't block the API response)
    if (recipientEmail) {
      sendEmail(recipientEmail, emailSubject, emailHtml);
    }

    res.status(201).json({ message: 'Deposit request submitted for verification.' });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Failed to initiate deposit.' });
  }
});

// POST /api/user/invest
router.post('/invest', authenticateToken, async (req, res) => {
  const userId = req.user ? (req.user.user_id || req.user.userId || req.user.user_id) : null;
  const { amount } = req.body;
  const investAmount = parseFloat(amount);

  if (isNaN(investAmount) || investAmount <= 0) {
    return res.status(400).json({ message: 'Invalid investment amount.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get canonical user_id and lock user row
    const userRes = await client.query('SELECT user_id, invested_balance FROM users WHERE user_id = $1 OR id = $1 FOR UPDATE', [userId]);
    if (userRes.rows.length === 0) throw new Error('User not found.');
    const user = userRes.rows[0];
    const canonicalUserId = user.user_id;

    // 2. Get true total balance from ledger
    const ledgerRes = await client.query('SELECT main_balance FROM ledger_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [canonicalUserId]);
    const totalBalance = ledgerRes.rows.length > 0 ? parseFloat(ledgerRes.rows[0].main_balance) : 0;
    
    // 3. Calculate Available Funds
    const currentInvested = parseFloat(user.invested_balance || 0);
    const availableFunds = totalBalance - currentInvested;

    // 4. Enforce constraint
    if (availableFunds < investAmount) {
      throw new Error('Insufficient liquid funds. Please deposit more capital.');
    }

    // 5. Update invested_balance
    const newInvested = currentInvested + investAmount;
    await client.query('UPDATE users SET invested_balance = $1 WHERE user_id = $2', [newInvested, canonicalUserId]);

    // 6. Record audit log
    await client.query(
      `INSERT INTO transactions (user_id, transaction_type, amount, status, description) 
       VALUES ($1, 'INVESTMENT', $2, 'COMPLETED', 'Capital allocated to investment plan')`,
      [canonicalUserId, investAmount]
    );

    await client.query('COMMIT');
    res.json({ message: 'Investment successful.', invested_balance: newInvested });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
});

// POST /api/user/investment/unlock
router.post('/investment/unlock', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Fetch current user state
    const userId = req.user ? (req.user.user_id || req.user.user_id || req.user.userId) : null;
    const userRes = await client.query('SELECT invested_balance, profit_balance, user_id FROM users WHERE user_id = $1 OR id = $1 FOR UPDATE', [userId]);
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found.' });
    }
    const user = userRes.rows[0];
    const investedAmount = parseFloat(user.invested_balance || 0);
    
    if (investedAmount <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'No active investment to unlock.' });
    }

    // 2. Determine investment age to check the 30-day vesting period
    const investTx = await client.query(
      "SELECT created_at FROM transactions WHERE user_id = $1 AND transaction_type = 'INVESTMENT' ORDER BY created_at DESC LIMIT 1",
      [user.user_id]
    );
    
    const investDate = investTx.rows.length > 0 ? new Date(investTx.rows[0].created_at) : new Date();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const isEarlyWithdrawal = (new Date() - investDate) < thirtyDaysInMs;

    let finalReturnAmount = investedAmount;
    let feeAmount = 0;

    // 3. Apply Early Withdrawal Penalties
    if (isEarlyWithdrawal) {
      feeAmount = investedAmount * 0.05; // 5% penalty fee
      finalReturnAmount = investedAmount - feeAmount;
      
      // Burn accrued profit
      await client.query('UPDATE users SET profit_balance = 0 WHERE user_id = $1', [user.user_id]);
      
      // Log the penalty fee transaction
      await client.query(
        "INSERT INTO transactions (user_id, transaction_type, amount, status, description) VALUES ($1, 'FEE', $2, 'COMPLETED', 'Early Withdrawal Penalty (5%)')",
        [user.user_id, -feeAmount]
      );
    }

    // 4. Calculate new liquid balance
    const ledgerRes = await client.query(
      'SELECT main_balance FROM ledger_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [user.user_id]
    );
    const currentLiquidBalance = ledgerRes.rows.length > 0 ? parseFloat(ledgerRes.rows[0].main_balance) : 0;
    const newLiquidBalance = currentLiquidBalance + finalReturnAmount;

    // 5. Log the principal return
    const txDesc = isEarlyWithdrawal ? 'Early Investment Liquidation (Principal post-fee)' : 'Matured Investment Liquidation';
    const txRes = await client.query(
      "INSERT INTO transactions (user_id, transaction_type, amount, status, description) VALUES ($1, 'INVESTMENT_UNLOCK', $2, 'COMPLETED', $3) RETURNING id",
      [user.user_id, finalReturnAmount, txDesc]
    );

    // 6. Update the ledger
    await client.query(
      'INSERT INTO ledger (user_id, transaction_id, amount, main_balance) VALUES ($1, $2, $3, $4)',
      [user.user_id, txRes.rows[0].id, finalReturnAmount, newLiquidBalance]
    );

    // 7. Reset user investment state (leaving any mature profit intact if it wasn't an early withdrawal)
    await client.query(
      "UPDATE users SET invested_balance = 0, tier_name = 'NONE' WHERE user_id = $1",
      [user.user_id]
    );

    await client.query('COMMIT');
    res.json({ 
      message: isEarlyWithdrawal ? 'Capital unlocked with early withdrawal penalties applied.' : 'Capital unlocked successfully.', 
      newBalance: newLiquidBalance,
      isEarlyWithdrawal
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Unlock error:', error);
    res.status(500).json({ message: 'Server error during investment unlock.' });
  } finally {
    client.release();
  }
});

// POST /api/user/withdraw
router.post('/withdraw', authenticateToken, async (req, res) => {
  const userId = req.user ? (req.user.user_id || req.user.user_id || req.user.userId) : null;
  const { amount, destination } = req.body;
  const withdrawAmount = parseFloat(amount);

  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    return res.status(400).json({ message: 'Invalid withdrawal amount.' });
  }

  if (!destination || destination.trim() === '') {
    return res.status(400).json({ message: 'Destination address (Wallet/IBAN) is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get user and invested balance
    const userRes = await client.query('SELECT user_id, invested_balance FROM users WHERE user_id = $1 OR id = $1 FOR UPDATE', [userId]);
    if (userRes.rows.length === 0) throw new Error('User not found.');
    const user = userRes.rows[0];
    const canonicalUserId = user.user_id;

    // Get ledger balance
    const ledgerRes = await client.query('SELECT main_balance FROM ledger_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [canonicalUserId]);
    const currentTotalBalance = ledgerRes.rows.length > 0 ? parseFloat(ledgerRes.rows[0].main_balance) : 0;
    
    const invested = parseFloat(user.invested_balance || 0);
    const availableFunds = currentTotalBalance - invested;

    if (availableFunds < withdrawAmount) {
      throw new Error('Insufficient liquid funds for this withdrawal.');
    }

    // Risk Logic (Auto-Approve vs Pending)
    const statsRes = await client.query(`
      SELECT COALESCE((
        SELECT SUM(amount) FROM transactions 
        WHERE user_id = $1 AND transaction_type = 'WITHDRAWAL' AND status = 'COMPLETED' AND amount <= 100
      ), 0) as total_auto_withdrawn
    `, [canonicalUserId]);
    const total_auto_withdrawn = statsRes.rows[0]?.total_auto_withdrawn || 0;
    const isAutoApprove = withdrawAmount <= 100 && (parseFloat(total_auto_withdrawn) + withdrawAmount <= 500);
    const status = isAutoApprove ? 'COMPLETED' : 'PENDING';

    // Record Transaction with destination_address
    const txRes = await client.query(
      "INSERT INTO transactions (user_id, transaction_type, amount, status, destination_address) VALUES ($1, 'WITHDRAWAL', $2, $3, $4) RETURNING id",
      [canonicalUserId, withdrawAmount, status, destination.trim()]
    );
    const txId = txRes.rows[0].id;

    // Update Ledger ONLY if Auto-Approved
    if (isAutoApprove) {
      const newLedgerBalance = currentTotalBalance - withdrawAmount;
      await client.query(
        "INSERT INTO ledger (user_id, transaction_id, amount, main_balance) VALUES ($1, $2, $3, $4)",
        [canonicalUserId, txId, -withdrawAmount, newLedgerBalance]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ 
      message: isAutoApprove ? 'Withdrawal processed automatically.' : 'Withdrawal pending moderator approval.', 
      status 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
});

// PUT /api/user/password
router.put('/password', authenticateToken, async (req, res) => {
  const userId = req.user ? (req.user.user_id || req.user.user_id || req.user.userId) : null;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required.' });
  }

  // Prevent reusing the exact same password
  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'New password must be different from your current password.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  }

  try {
    // Fetch current user hash
    const userRes = await pool.query(
      'SELECT user_id, email, password_hash FROM users WHERE user_id = $1 OR id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

    const user = userRes.rows[0];
    const canonicalUserId = user.user_id;
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password.' });
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2 OR id = $2',
      [hashedNewPassword, canonicalUserId]
    );

    // Security notification email
    const recipientEmail = (req.user && req.user.email) || user.email;
    if (recipientEmail) {
      const emailSubject = 'Security Alert: Password Changed';
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Security Alert: Password Changed</h2>
          <p>Hello,</p>
          <p>Your account password was recently updated. If you did not make this change, please contact platform security immediately.</p>
          <p>Thank you,</p>
          <p>Investment Platform Security Team</p>
        </div>
      `;
      sendEmail(recipientEmail, emailSubject, emailHtml);
    }

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Failed to update password.' });
  }
});

module.exports = router;
