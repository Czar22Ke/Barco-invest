import { Pool } from 'pg';
import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export class InvestmentEngine {
  constructor(adapter, dbPool) {
    this.adapter = adapter;
    this.pool = dbPool; 
  }

  isWithdrawalWindowOpen(now = new Date()) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = 18 * 60;       // 18:00 (6:00 PM)
    const closeMinutes = 7 * 60 + 30;  // 07:30 AM
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  async getTierRules(tierName) {
    const result = await this.pool.query('SELECT * FROM user_tiers WHERE tier_name = $1', [tierName.toUpperCase()]);
    if (result.rows.length === 0) throw new Error(`Invalid tier: ${tierName}`);
    return result.rows[0];
  }

  async _getCurrentBalance(client, userId) {
    const result = await client.query(
      `SELECT main_balance FROM ledger_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows.length > 0 ? new Decimal(result.rows[0].main_balance) : new Decimal(0);
  }

  async processDeposit(userId, amount, idempotencyKey) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await client.query('SELECT id FROM transactions WHERE idempotency_key = $1', [idempotencyKey]);
      if (existing.rows.length > 0) return { status: 'DUPLICATE', transactionId: existing.rows[0].id };

      const txId = uuidv4();
      await client.query(
        `INSERT INTO transactions (id, idempotency_key, transaction_type, status) VALUES ($1, $2, 'DEPOSIT', 'COMPLETED')`,
        [txId, idempotencyKey]
      );

      const currentBalance = await this._getCurrentBalance(client, userId);
      const depositAmount = new Decimal(amount);
      const newBalance = currentBalance.plus(depositAmount);

      await client.query(
        `INSERT INTO ledger (id, transaction_id, user_id, currency, amount, main_balance) VALUES ($1, $2, $3, 'USD', $4, $5)`,
        [uuidv4(), txId, userId, depositAmount.toFixed(8), newBalance.toFixed(8)]
      );

      await client.query(`UPDATE users SET high_water_mark = high_water_mark + $1 WHERE user_id = $2`, [depositAmount.toFixed(8), userId]);

      await client.query('COMMIT');
      return { status: 'COMPLETED', transactionId: txId, newBalance: newBalance.toFixed(8) };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async processWithdrawal(userId, amount, idempotencyKey) {
    if (!this.isWithdrawalWindowOpen()) {
      return { status: 'REJECTED_WINDOW_CLOSED', message: 'Withdrawals are only processed daily between 6:00 PM and 7:30 AM.' };
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await client.query('SELECT id FROM transactions WHERE idempotency_key = $1', [idempotencyKey]);
      if (existing.rows.length > 0) return { status: 'DUPLICATE', transactionId: existing.rows[0].id };

      const userResult = await client.query(
        `SELECT u.high_water_mark, u.tier_name, t.performance_fee_pct, t.tax_withholding_pct
         FROM users u JOIN user_tiers t ON u.tier_name = t.tier_name WHERE u.id = $1`,
        [userId]
      );
      const user = userResult.rows[0];

      const currentBalance = await this._getCurrentBalance(client, userId);
      const withdrawAmount = new Decimal(amount);

      if (withdrawAmount.gt(currentBalance)) throw new Error('Insufficient funds');

      const hwm = new Decimal(user.high_water_mark);
      const profitAboveHWM = Decimal.max(0, currentBalance.minus(hwm));
      const withdrawalRatio = withdrawAmount.div(currentBalance);
      const realizedProfit = profitAboveHWM.times(withdrawalRatio);

      const performanceFee = realizedProfit.times(new Decimal(user.performance_fee_pct).div(100));
      const taxWithholding = realizedProfit.times(new Decimal(user.tax_withholding_pct).div(100));
      const totalDeductions = performanceFee.plus(taxWithholding);
      const netPayout = withdrawAmount.minus(totalDeductions);

      const txId = uuidv4();
      await client.query(
        `INSERT INTO transactions (id, idempotency_key, transaction_type, status) VALUES ($1, $2, 'WITHDRAWAL', 'COMPLETED')`,
        [txId, idempotencyKey]
      );

      const newBalance = currentBalance.minus(withdrawAmount);

      await client.query(
        `INSERT INTO ledger (id, transaction_id, user_id, currency, amount, main_balance) VALUES ($1, $2, $3, 'USD', $4, $5)`,
        [uuidv4(), txId, userId, withdrawAmount.negated().toFixed(8), newBalance.toFixed(8)]
      );

      const principalWithdrawn = withdrawAmount.minus(realizedProfit);
      const newHWM = Decimal.max(0, hwm.minus(principalWithdrawn));
      await client.query('UPDATE users SET high_water_mark = $1 WHERE user_id = $2', [newHWM.toFixed(8), userId]);

      await client.query('COMMIT');
      return {
        status: 'COMPLETED', transactionId: txId, netPayout: netPayout.toFixed(8),
        performanceFee: performanceFee.toFixed(8), taxWithholding: taxWithholding.toFixed(8), newBalance: newBalance.toFixed(8)
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async distributeDailyYieldToAll() {
    const { distributeDailyYield } = await import('../../../src/services/yieldDistributor.js');
    return await distributeDailyYield();
  }
}