import express from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { InvestmentEngine } from '../services/InvestmentEngine.js';
import db from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import mailerPkg from '../services/mailer.js';

const sendEmail = mailerPkg.sendEmail || mailerPkg;
const pool = db.pool || db;
const router = express.Router();
const engine = new InvestmentEngine(null, pool);

// POST /api/admin/trigger-yield
router.post('/trigger-yield', async (req, res) => {
  try {
    const result = await engine.distributeDailyYieldToAll();
    res.status(200).json(result);
  } catch (error) {
    console.error('Admin Yield Trigger Error:', error);
    res.status(500).json({ message: 'Failed to execute global yield distribution.' });
  }
});

// POST /api/admin/provision
router.post('/provision', async (req, res) => {
  const { email, password, role } = req.body;
  
  if (!['ADMIN', 'MODERATOR'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new privileged user. Tiers are explicitly NULL for staff.
    await pool.query(
      `INSERT INTO users (email, password, role, tier_name, tier) 
       VALUES ($1, $2, $3, NULL, NULL)`,
      [email, hashedPassword, role]
    );
    res.status(201).json({ message: `${role} account provisioned successfully.` });
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({ message: 'Email already exists.' });
    }
    console.error('Provisioning error:', error);
    res.status(500).json({ message: 'Failed to provision account.' });
  }
});

// Backward compatibility alias for /create-admin
router.post('/create-admin', async (req, res) => {
  req.body.role = req.body.role || 'ADMIN';
  const { email, password, role } = req.body;
  
  if (!['ADMIN', 'MODERATOR'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (email, password, role, tier_name, tier) 
       VALUES ($1, $2, $3, NULL, NULL)`,
      [email, hashedPassword, role]
    );
    res.status(201).json({ message: `${role} account provisioned successfully.` });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    console.error('Provisioning error:', error);
    res.status(500).json({ message: 'Failed to provision account.' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        u.user_id, u.email, u.tier_name, u.account_status, u.last_login, u.created_at,
        COALESCE((SELECT main_balance FROM ledger_transactions WHERE user_id = u.user_id ORDER BY created_at DESC LIMIT 1), 0) as current_balance
      FROM users u
      WHERE u.role = 'USER'
      ORDER BY u.created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch Users Error:', error);
    res.status(500).json({ message: 'Failed to fetch user directory.' });
  } finally {
    client.release();
  }
});

// PATCH /api/admin/users/:id/flag
router.patch('/users/:id/flag', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., 'FLAGGED' or 'ACTIVE'
  try {
    await pool.query('UPDATE users SET account_status = $1 WHERE user_id = $2', [status, id]);
    res.status(200).json({ message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status.' });
  }
});

// GET /api/admin/withdrawals/pending
router.get('/withdrawals/pending', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.amount, t.created_at, t.tx_hash, t.destination_address, t.transaction_type, u.email, u.user_id,
      COALESCE((SELECT main_balance FROM ledger_transactions WHERE user_id = u.user_id ORDER BY created_at DESC LIMIT 1), 0) as current_balance
      FROM transactions t
      JOIN users u ON t.user_id = u.user_id OR t.user_id = u.id
      WHERE t.status = 'PENDING'
      ORDER BY t.created_at ASC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch Pending Transactions Error:', error);
    res.status(500).json({ message: 'Failed to fetch pending transactions.' });
  }
});

// POST /api/admin/withdrawals/:id/approve
router.post('/withdrawals/:id/approve', async (req, res) => {
  const txId = req.params.id;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Lock transaction
    const txRes = await client.query('SELECT * FROM transactions WHERE user_id = $1 FOR UPDATE', [txId]);
    const tx = txRes.rows[0];
    if (!tx || tx.status !== 'PENDING') throw new Error('Invalid or already processed transaction.');

    // Lock user and get invested balance and HWM
    const userRes = await client.query('SELECT user_id, email, invested_balance, hwm_balance FROM users WHERE user_id = $1 OR id = $1 FOR UPDATE', [tx.user_id]);
    const user = userRes.rows[0];
    if (!user) throw new Error('User not found.');
    
    // Get true total balance from ledger
    const ledgerRes = await client.query('SELECT main_balance FROM ledger_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user.user_id]);
    const currentTotalBalance = ledgerRes.rows.length > 0 ? parseFloat(ledgerRes.rows[0].main_balance) : 0;
    
    const amount = parseFloat(tx.amount);
    let newLedgerBalance = currentTotalBalance;

    if (tx.transaction_type === 'WITHDRAWAL') {
      const invested = parseFloat(user.invested_balance || 0);
      const availableFunds = currentTotalBalance - invested;
      
      if (availableFunds < amount) throw new Error('User has insufficient liquid balance.');
      newLedgerBalance -= amount;

      // Adjust HWM downward
      const currentHwm = parseFloat(user.hwm_balance || currentTotalBalance);
      const newHwm = Math.max(0, currentHwm - amount);
      await client.query('UPDATE users SET hwm_balance = $1 WHERE user_id = $2', [newHwm, user.user_id]);
    } else if (tx.transaction_type === 'DEPOSIT') {
      newLedgerBalance += amount;

      // Adjust HWM upward
      const currentHwm = parseFloat(user.hwm_balance || currentTotalBalance);
      const newHwm = currentHwm + amount;
      await client.query('UPDATE users SET hwm_balance = $1 WHERE user_id = $2', [newHwm, user.user_id]);
    }

    // Write the new transaction to the ledger to finalize the balance change
    await client.query(
      'INSERT INTO ledger (user_id, transaction_id, amount, main_balance) VALUES ($1, $2, $3, $4)',
      [user.user_id, tx.id, tx.transaction_type === 'WITHDRAWAL' ? -amount : amount, newLedgerBalance]
    );

    // Update transaction status
    await client.query("UPDATE transactions SET status = 'COMPLETED' WHERE user_id = $1", [txId]);

    await client.query('COMMIT');

    // Trigger non-blocking email notification
    if (user.email && typeof sendEmail === 'function') {
      const isDeposit = tx.transaction_type === 'DEPOSIT';
      const emailSubject = isDeposit ? 'Deposit Approved - Capital Credited' : 'Withdrawal Request Approved';
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${emailSubject}</h2>
          <p>Hello,</p>
          <p>Your ${isDeposit ? 'deposit' : 'withdrawal'} of <strong>$${amount.toFixed(2)}</strong> has been approved by our operations team.</p>
          <p>${isDeposit ? 'The funds have been credited to your liquid main balance and are ready for investment allocation.' : 'The funds have been debited from your portfolio balance and dispatched.'}</p>
          <p>Thank you for investing with us.</p>
        </div>
      `;
      sendEmail(user.email, emailSubject, emailHtml).catch(e => console.error('Approve email error:', e));
    }

    res.json({ message: `${tx.transaction_type} approved.` });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
});

// POST /api/admin/withdrawals/:id/reject
router.post('/withdrawals/:id/reject', async (req, res) => {
  const { id } = req.params;
  try {
    const txRes = await pool.query(
      "SELECT t.*, u.email FROM transactions t JOIN users u ON t.user_id = u.user_id WHERE t.id = $1",
      [id]
    );

    await pool.query("UPDATE transactions SET status = 'REJECTED' WHERE user_id = $1", [id]);

    if (txRes.rows.length > 0 && txRes.rows[0].email && typeof sendEmail === 'function') {
      const userEmail = txRes.rows[0].email;
      const txType = txRes.rows[0].transaction_type || 'Transaction';
      const emailSubject = `${txType} Request Declined`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${txType} Request Declined</h2>
          <p>Hello,</p>
          <p>Your recent ${txType.toLowerCase()} request for <strong>$${parseFloat(txRes.rows[0].amount || 0).toFixed(2)}</strong> has been declined following compliance review.</p>
          <p>If you have any questions or require assistance, please reach out to our team using the support widget on your dashboard.</p>
        </div>
      `;
      sendEmail(userEmail, emailSubject, emailHtml).catch(e => console.error('Reject email error:', e));
    }

    res.json({ message: 'Transaction rejected successfully.' });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ message: 'Failed to reject transaction.' });
  }
});

// POST /api/admin/bonus/distribute
router.post('/bonus/distribute', async (req, res) => {
  const { percentage, targetMode, targetValue } = req.body;
  const bonusRate = parseFloat(percentage);

  if (isNaN(bonusRate) || bonusRate <= 0) {
    return res.status(400).json({ message: 'Invalid bonus percentage.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Build the targeting query
    let queryText = 'SELECT user_id, email, tier_name FROM users';
    let queryParams = [];

    if (targetMode === 'TIER') {
      if (!targetValue) throw new Error('Tier name is required for TIER mode.');
      queryText += ' WHERE tier_name = $1 OR tier = $1';
      queryParams.push(targetValue.toUpperCase());
    } else if (targetMode === 'USER') {
      if (!targetValue) throw new Error('User email is required for USER mode.');
      queryText += ' WHERE email = $1';
      queryParams.push(targetValue);
    }
    
    queryText += ' FOR UPDATE'; // Lock rows

    const usersRes = await client.query(queryText, queryParams);
    const users = usersRes.rows;

    if (users.length === 0) {
      throw new Error('No users found matching this target criteria.');
    }

    let totalBonusesIssued = 0;

    for (const user of users) {
      // 2. Get true total balance from the ledger
      const ledgerRes = await client.query(
        'SELECT main_balance FROM ledger_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', 
        [user.user_id]
      );
      
      const currentTotalBalance = ledgerRes.rows.length > 0 ? parseFloat(ledgerRes.rows[0].main_balance) : 0;
      
      // Only issue bonus if they have capital
      if (currentTotalBalance > 0) {
        const bonusAmount = currentTotalBalance * (bonusRate / 100);
        const newLedgerBalance = currentTotalBalance + bonusAmount;

        // 3. Record the Transaction Audit
        const txRes = await client.query(
          `INSERT INTO transactions (user_id, transaction_type, amount, status, description) 
           VALUES ($1, 'BONUS', $2, 'COMPLETED', $3) RETURNING id`,
          [user.user_id, bonusAmount, `Platform Bonus (${bonusRate}%)`]
        );

        // 4. Write credit to the Ledger
        await client.query(
          'INSERT INTO ledger (user_id, transaction_id, amount, main_balance) VALUES ($1, $2, $3, $4)',
          [user.user_id, txRes.rows[0].id, bonusAmount, newLedgerBalance]
        );
        
        totalBonusesIssued++;
      }
    }

    await client.query('COMMIT');
    res.json({ message: `Successfully issued a ${bonusRate}% bonus to ${totalBonusesIssued} funded account(s).` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bonus distribution error:', error);
    res.status(400).json({ message: error.message || 'Failed to distribute bonuses.' });
  } finally {
    client.release();
  }
});

export default router;
