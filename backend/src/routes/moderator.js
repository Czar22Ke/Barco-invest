import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireModerator } from '../middleware/auth.js';
import mailerPkg from '../services/mailer.js';

const sendEmail = mailerPkg.sendEmail || mailerPkg;
const pool = db.pool || db;
const router = express.Router();

// GET /api/moderator/users
router.get('/users', authenticateToken, requireModerator, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        u.user_id, u.email, u.tier_name, u.account_status, u.last_login, u.created_at,
        COALESCE((SELECT running_balance FROM ledger WHERE user_id = u.user_id ORDER BY created_at DESC LIMIT 1), 0) as current_balance
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

// PATCH /api/moderator/users/:id/flag
router.patch('/users/:id/flag', authenticateToken, requireModerator, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE users SET account_status = $1 WHERE user_id = $2', [status, id]);
    res.status(200).json({ message: `User status updated to ${status}` });
  } catch (error) {
    console.error('Update User Status Error:', error);
    res.status(500).json({ message: 'Failed to update user status.' });
  }
});

// GET /api/moderator/withdrawals/pending
router.get('/withdrawals/pending', authenticateToken, requireModerator, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.amount, t.created_at, t.tx_hash, t.destination_address, t.transaction_type, u.email, u.user_id,
      COALESCE((SELECT running_balance FROM ledger WHERE user_id = u.user_id ORDER BY created_at DESC LIMIT 1), 0) as current_balance
      FROM transactions t
      JOIN users u ON t.user_id = u.user_id OR t.user_id = u.id
      WHERE t.status = 'PENDING'
      ORDER BY t.created_at ASC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch Pending Withdrawals Error:', error);
    res.status(500).json({ message: 'Failed to fetch pending transactions.' });
  }
});

// POST /api/moderator/withdrawals/:id/approve
router.post('/withdrawals/:id/approve', authenticateToken, requireModerator, async (req, res) => {
  const txId = req.params.id;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Lock transaction
    const txRes = await client.query('SELECT * FROM transactions WHERE id = $1 FOR UPDATE', [txId]);
    const tx = txRes.rows[0];
    if (!tx || tx.status !== 'PENDING') throw new Error('Invalid or already processed transaction.');

    // Lock user and get invested balance and HWM
    const userRes = await client.query('SELECT user_id, email, invested_balance, hwm_balance FROM users WHERE user_id = $1 OR id = $1 FOR UPDATE', [tx.user_id]);
    const user = userRes.rows[0];
    if (!user) throw new Error('User not found.');
    
    // Get true total balance from ledger
    const ledgerRes = await client.query('SELECT running_balance FROM ledger WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user.user_id]);
    const currentTotalBalance = ledgerRes.rows.length > 0 ? parseFloat(ledgerRes.rows[0].running_balance) : 0;
    
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
      'INSERT INTO ledger (user_id, transaction_id, amount, running_balance) VALUES ($1, $2, $3, $4)',
      [user.user_id, tx.id, tx.transaction_type === 'WITHDRAWAL' ? -amount : amount, newLedgerBalance]
    );

    // Update transaction status
    await client.query("UPDATE transactions SET status = 'COMPLETED' WHERE id = $1", [txId]);

    await client.query('COMMIT');

    // Non-blocking email notification
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

// POST /api/moderator/withdrawals/:id/reject
router.post('/withdrawals/:id/reject', authenticateToken, requireModerator, async (req, res) => {
  const { id } = req.params;
  try {
    const txRes = await pool.query(
      "SELECT t.*, u.email FROM transactions t JOIN users u ON t.user_id = u.user_id WHERE t.id = $1",
      [id]
    );

    await pool.query("UPDATE transactions SET status = 'REJECTED' WHERE id = $1", [id]);

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

export default router;
