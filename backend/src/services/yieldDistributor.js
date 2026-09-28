const cron = require('node-cron');
const db = require('../config/db');
const pool = db.pool || db;

// Define the APY for each tier (e.g., 0.08 = 8% APY)
const TIER_APY = {
  'BRONZE': 0.08,
  'SILVER': 0.12,
  'GOLD': 0.18,
  'INSTITUTIONAL': 0.25
};

// Function that performs the yield calculation and distribution
async function executeYieldDistribution() {
  console.log('Starting daily yield distribution...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Ensure hwm_balance is included in the initial SELECT
    const usersRes = await client.query('SELECT user_id, tier_name, tier, invested_balance, profit_balance, hwm_balance FROM users WHERE invested_balance > 0 FOR UPDATE');
    const users = usersRes.rows;

    for (const user of users) {
      const tier = user.tier_name || user.tier || 'BRONZE';
      const apy = TIER_APY[tier.toUpperCase()] || TIER_APY['BRONZE'];
      
      // Calculate daily yield: (Principal * APY) / 365 days
      const principal = parseFloat(user.invested_balance);
      const yieldAmount = (principal * apy) / 365;

      const newProfitBalance = parseFloat(user.profit_balance || 0) + yieldAmount;

      // Update the user's profit balance
      await client.query(
        'UPDATE users SET profit_balance = $1 WHERE user_id = $2',
        [newProfitBalance, user.user_id]
      );

      // 2. Fetch current total balance from ledger
      const ledgerRes = await client.query(
        'SELECT running_balance FROM ledger WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [user.user_id]
      );
      const currentTotalBalance = ledgerRes.rows.length > 0 ? parseFloat(ledgerRes.rows[0].running_balance) : 0;
      
      const newLedgerBalance = currentTotalBalance + yieldAmount;

      // Log the yield generation in transactions and ledger
      const txRes = await client.query(
        "INSERT INTO transactions (user_id, transaction_type, amount, status, description) VALUES ($1, 'YIELD', $2, 'COMPLETED', $3) RETURNING id",
        [user.user_id, yieldAmount, `Daily Yield Payout (${tier} Tier)`]
      );

      await client.query(
        'INSERT INTO ledger (user_id, transaction_id, amount, running_balance) VALUES ($1, $2, $3, $4)',
        [user.user_id, txRes.rows[0].id, yieldAmount, newLedgerBalance]
      );

      // 3. Ratchet HWM on Yield/Profit
      const currentHwm = parseFloat(user.hwm_balance || currentTotalBalance);
      if (newLedgerBalance > currentHwm) {
        await client.query('UPDATE users SET hwm_balance = $1 WHERE user_id = $2', [newLedgerBalance, user.user_id]);
      }
    }

    await client.query('COMMIT');
    console.log(`Yield distributed successfully to ${users.length} accounts.`);
    return { success: true, count: users.length, processedCount: users.length, skippedCount: 0, errorCount: 0 };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Yield distribution failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Schedule to run every day at midnight ('0 0 * * *'). 
// NOTE FOR DEV: Change to '*/1 * * * *' (every minute) if you want to test it immediately.
const task = cron.schedule('0 0 * * *', async () => {
  try {
    await executeYieldDistribution();
  } catch (error) {
    console.error('Error in daily yield cron job:', error);
  }
});

module.exports = {
  executeYieldDistribution,
  distributeDailyYield: executeYieldDistribution,
  task
};
