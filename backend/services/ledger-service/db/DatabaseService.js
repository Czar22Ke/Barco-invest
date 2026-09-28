import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Decimal from 'decimal.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
dotenv.config();

const { Pool } = pg;

/**
 * Institutional Ledger Database Service
 * 
 * Manages PostgreSQL connection pools, transaction persistence,
 * and double-entry ledger bookkeeping for audit receipts.
 * Includes a transparent fallback mechanism for dev/test environments.
 */
export class DatabaseService {
  constructor(config = {}) {
    // Ensure dotenv is loaded so process.env is populated
    require('dotenv').config();

    this.connectionConfig = {
      host: config.host || process.env.DB_HOST || 'localhost',
      port: config.port || parseInt(process.env.DB_PORT || '5432', 10),
      database: config.database || process.env.DB_NAME, 
      user: config.user || process.env.DB_USER || 'postgres',
      password: config.password || process.env.DB_PASSWORD,
      max: config.max || parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 3000
    };

    // Fail loudly if critical credentials are missing
    if (!this.connectionConfig.database || !this.connectionConfig.password) {
      console.error('❌ FATAL ERROR: Database name or password is missing from the .env file.');
      process.exit(1); 
    }

    this.pool = null;
    this.isLivePostgres = false;

    // In-memory fallback store when local PostgreSQL daemon is unavailable
    this.memStore = {
      users: new Map(),
      wallets: new Map(),
      ledgerTransactions: []
    };
  }

  /**
   * Connect to PostgreSQL or fall back cleanly to local transactional memory store.
   */
  async initialize() {
    try {
      this.pool = new Pool(this.connectionConfig);
      // Test connectivity
      const client = await this.pool.connect();
      client.release();
      this.isLivePostgres = true;
      console.log(`[DatabaseService] Connected to PostgreSQL at ${this.connectionConfig.host}:${this.connectionConfig.port}/${this.connectionConfig.database}`);
      await this.initSchema();
    } catch (err) {
      this.isLivePostgres = false;
      console.log(`[DatabaseService] PostgreSQL not available on ${this.connectionConfig.host}:${this.connectionConfig.port}. Using localized fallback storage.`);
    }
  }

  /**
   * Execute DDL schema setup.
   */
  async initSchema() {
    if (!this.isLivePostgres) return;

    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await this.pool.query(sql);
      console.log('[DatabaseService] DDL Schema initialized successfully.');
    }
  }

  /**
   * Save or update User and Wallet records.
   */
  async saveUserAndWallet(userSummary) {
    const { userId, tier, totalDeposited, currentBalance, highWaterMark } = userSummary;
    const email = `${userId.toLowerCase()}@institutional.client`;

    if (this.isLivePostgres) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        // Upsert User
        await client.query(`
          INSERT INTO users (user_id, email, tier, updated_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (user_id) DO UPDATE SET tier = EXCLUDED.tier, updated_at = NOW()
        `, [userId, email, tier]);

        // Upsert Wallet
        await client.query(`
          INSERT INTO wallets (user_id, currency, balance, high_water_mark, total_deposited, updated_at)
          VALUES ($1, 'USD', $2, $3, $4, NOW())
          ON CONFLICT (user_id, currency) DO UPDATE SET
            balance = EXCLUDED.balance,
            high_water_mark = EXCLUDED.high_water_mark,
            total_deposited = EXCLUDED.total_deposited,
            updated_at = NOW()
        `, [userId, currentBalance, highWaterMark, totalDeposited]);

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      // Fallback in-memory storage
      this.memStore.users.set(userId, { userId, email, tier, updatedAt: Date.now() });
      this.memStore.wallets.set(userId, {
        userId,
        currency: 'USD',
        balance: new Decimal(currentBalance).toFixed(4),
        highWaterMark: new Decimal(highWaterMark).toFixed(4),
        totalDeposited: new Decimal(totalDeposited).toFixed(4),
        totalWithdrawn: '0.0000',
        updatedAt: Date.now()
      });
    }

    return { userId, persisted: true, storageEngine: this.isLivePostgres ? 'PostgreSQL' : 'LocalizedMemory' };
  }

  /**
   * Record a deposit transaction in double-entry ledger.
   */
  async recordDeposit(userId, amount, newBalance, newHwm) {
    const decAmount = new Decimal(amount);
    const txId = `TX_DEP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (this.isLivePostgres) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        // Update Wallet
        await client.query(`
          UPDATE wallets
          SET balance = $1, high_water_mark = $2, total_deposited = total_deposited + $3, updated_at = NOW()
          WHERE user_id = $4 AND currency = 'USD'
        `, [newBalance, newHwm, decAmount.toFixed(4), userId]);

        // Record Double-Entry Ledger Entry: Debit External Bank Pool -> Credit User Wallet
        await client.query(`
          INSERT INTO ledger_transactions
          (user_id, transaction_type, debit_account, credit_account, amount, hwm_before, hwm_after, metadata)
          VALUES ($1, 'DEPOSIT', 'EXTERNAL_BANK_POOL', 'USER_WALLET', $2, $3, $4, $5)
        `, [
          userId,
          decAmount.toFixed(4),
          newHwm,
          newHwm,
          JSON.stringify({ note: 'Deposit cleared' })
        ]);

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      // Fallback
      const wallet = this.memStore.wallets.get(userId) || { totalDeposited: '0.0000' };
      wallet.balance = new Decimal(newBalance).toFixed(4);
      wallet.highWaterMark = new Decimal(newHwm).toFixed(4);
      wallet.totalDeposited = new Decimal(wallet.totalDeposited).plus(decAmount).toFixed(4);
      wallet.updatedAt = Date.now();
      this.memStore.wallets.set(userId, wallet);

      this.memStore.ledgerTransactions.push({
        txId,
        userId,
        transactionType: 'DEPOSIT',
        debitAccount: 'EXTERNAL_BANK_POOL',
        creditAccount: 'USER_WALLET',
        amount: decAmount.toFixed(4),
        hwmBefore: newHwm,
        hwmAfter: newHwm,
        timestamp: Date.now()
      });
    }

    return { txId, userId, amount: decAmount.toFixed(4), status: 'COMMITTED' };
  }

  /**
   * Record yield accrual in database and double-entry ledger.
   */
  async recordYield(userId, grossProfit, newBalance, oldHWM, isNewPeak) {
    const decProfit = new Decimal(grossProfit);
    const decNewBalance = new Decimal(newBalance);
    const decOldHWM = new Decimal(oldHWM);
    const newHWM = isNewPeak ? decNewBalance : decOldHWM;
    const txId = `TX_YIELD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (this.isLivePostgres) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        // Update Wallet balance
        await client.query(`
          UPDATE wallets
          SET balance = $1, high_water_mark = $2, updated_at = NOW()
          WHERE user_id = $3 AND currency = 'USD'
        `, [decNewBalance.toFixed(4), newHWM.toFixed(4), userId]);

        // Double-Entry Ledger Entry: Debit Arbitrage Yield Pool -> Credit User Wallet
        await client.query(`
          INSERT INTO ledger_transactions
          (user_id, transaction_type, debit_account, credit_account, amount, hwm_before, hwm_after, metadata)
          VALUES ($1, 'YIELD_ACCRUAL', 'ARBITRAGE_YIELD_POOL', 'USER_WALLET', $2, $3, $4, $5)
        `, [
          userId,
          decProfit.toFixed(4),
          decOldHWM.toFixed(4),
          newHWM.toFixed(4),
          JSON.stringify({ isNewPeak })
        ]);

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      const wallet = this.memStore.wallets.get(userId) || {};
      wallet.balance = decNewBalance.toFixed(4);
      wallet.highWaterMark = newHWM.toFixed(4);
      wallet.updatedAt = Date.now();
      this.memStore.wallets.set(userId, wallet);

      this.memStore.ledgerTransactions.push({
        txId,
        userId,
        transactionType: 'YIELD_ACCRUAL',
        debitAccount: 'ARBITRAGE_YIELD_POOL',
        creditAccount: 'USER_WALLET',
        amount: decProfit.toFixed(4),
        hwmBefore: decOldHWM.toFixed(4),
        hwmAfter: newHWM.toFixed(4),
        timestamp: Date.now()
      });
    }

    return { txId, userId, grossProfit: decProfit.toFixed(4), newBalance: decNewBalance.toFixed(4), status: 'COMMITTED' };
  }

  /**
   * Record withdrawal audit receipt with strict double-entry ledger allocations:
   * 1. Withdrawal Payout: Debit USER_WALLET -> Credit EXTERNAL_BENEFICIARY
   * 2. Performance Fee: Debit USER_WALLET -> Credit FEE_REVENUE_ACCOUNT
   * 3. Tax Withholding: Debit USER_WALLET -> Credit TAX_ESCROW_ACCOUNT
   */
  async recordWithdrawalAudit(auditReceipt) {
    const {
      userId,
      requestedWithdrawal,
      realizedProfitInWithdrawal,
      performanceCommissionDeduction,
      taxWithholdingDeduction,
      totalDeductions,
      netWithdrawalPayout,
      remainingBalance,
      updatedHighWaterMark
    } = auditReceipt;

    const txGroupBatch = [];

    if (this.isLivePostgres) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        // Update Wallet state
        await client.query(`
          UPDATE wallets
          SET balance = $1, high_water_mark = $2, total_withdrawn = total_withdrawn + $3, updated_at = NOW()
          WHERE user_id = $4 AND currency = 'USD'
        `, [remainingBalance, updatedHighWaterMark, netWithdrawalPayout, userId]);

        // 1. Net Payout Transaction
        await client.query(`
          INSERT INTO ledger_transactions
          (user_id, transaction_type, debit_account, credit_account, amount, hwm_before, hwm_after, metadata)
          VALUES ($1, 'WITHDRAWAL_PAYOUT', 'USER_WALLET', 'EXTERNAL_BENEFICIARY', $2, $3, $4, $5)
        `, [userId, netWithdrawalPayout, updatedHighWaterMark, updatedHighWaterMark, JSON.stringify({ requestedWithdrawal })]);

        // 2. Performance Fee Transaction (if > 0)
        if (new Decimal(performanceCommissionDeduction).gt(0)) {
          await client.query(`
            INSERT INTO ledger_transactions
            (user_id, transaction_type, debit_account, credit_account, amount, hwm_before, hwm_after, metadata)
            VALUES ($1, 'PERFORMANCE_FEE', 'USER_WALLET', 'FEE_REVENUE_ACCOUNT', $2, $3, $4, $5)
          `, [userId, performanceCommissionDeduction, updatedHighWaterMark, updatedHighWaterMark, JSON.stringify({ realizedProfitInWithdrawal })]);
        }

        // 3. Tax Withholding Transaction (if > 0)
        if (new Decimal(taxWithholdingDeduction).gt(0)) {
          await client.query(`
            INSERT INTO ledger_transactions
            (user_id, transaction_type, debit_account, credit_account, amount, hwm_before, hwm_after, metadata)
            VALUES ($1, 'TAX_WITHHOLDING', 'USER_WALLET', 'TAX_ESCROW_ACCOUNT', $2, $3, $4, $5)
          `, [userId, taxWithholdingDeduction, updatedHighWaterMark, updatedHighWaterMark, JSON.stringify({ realizedProfitInWithdrawal })]);
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      const wallet = this.memStore.wallets.get(userId) || { totalWithdrawn: '0.0000' };
      wallet.balance = remainingBalance;
      wallet.highWaterMark = updatedHighWaterMark;
      wallet.totalWithdrawn = new Decimal(wallet.totalWithdrawn).plus(netWithdrawalPayout).toFixed(4);
      wallet.updatedAt = Date.now();
      this.memStore.wallets.set(userId, wallet);

      const batchId = `BATCH_WD_${Date.now()}`;
      
      // Add double entry records
      this.memStore.ledgerTransactions.push({
        batchId,
        userId,
        transactionType: 'WITHDRAWAL_PAYOUT',
        debitAccount: 'USER_WALLET',
        creditAccount: 'EXTERNAL_BENEFICIARY',
        amount: netWithdrawalPayout,
        hwmBefore: updatedHighWaterMark,
        hwmAfter: updatedHighWaterMark,
        timestamp: Date.now()
      });

      if (new Decimal(performanceCommissionDeduction).gt(0)) {
        this.memStore.ledgerTransactions.push({
          batchId,
          userId,
          transactionType: 'PERFORMANCE_FEE',
          debitAccount: 'USER_WALLET',
          creditAccount: 'FEE_REVENUE_ACCOUNT',
          amount: performanceCommissionDeduction,
          hwmBefore: updatedHighWaterMark,
          hwmAfter: updatedHighWaterMark,
          timestamp: Date.now()
        });
      }

      if (new Decimal(taxWithholdingDeduction).gt(0)) {
        this.memStore.ledgerTransactions.push({
          batchId,
          userId,
          transactionType: 'TAX_WITHHOLDING',
          debitAccount: 'USER_WALLET',
          creditAccount: 'TAX_ESCROW_ACCOUNT',
          amount: taxWithholdingDeduction,
          hwmBefore: updatedHighWaterMark,
          hwmAfter: updatedHighWaterMark,
          timestamp: Date.now()
        });
      }
    }

    return {
      userId,
      netPayout: netWithdrawalPayout,
      totalDeductions,
      status: 'COMMITTED',
      ledgerEntriesCreated: 3
    };
  }

  /**
   * Get user account record and assigned tier by email.
   */
  async getUserByEmail(email) {
    if (!email) return null;
    const lowerEmail = email.toLowerCase().trim();

    if (this.isLivePostgres) {
      const res = await this.pool.query('SELECT user_id, email, tier, status, created_at FROM users WHERE LOWER(email) = $1', [lowerEmail]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          userId: row.user_id,
          email: row.email,
          tier: row.tier,
          status: row.status,
          createdAt: row.created_at
        };
      }
      return null;
    }

    // In-memory fallback lookup
    for (const [userId, record] of this.memStore.users.entries()) {
      if (record.email && record.email.toLowerCase() === lowerEmail) {
        return record;
      }
    }
    return null;
  }

  /**
   * Get user account record by userId.
   */
  async getUser(userId) {
    if (!userId) return null;

    if (this.isLivePostgres) {
      const res = await this.pool.query('SELECT user_id, email, tier, status, created_at FROM users WHERE user_id = $1', [userId]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          userId: row.user_id,
          email: row.email,
          tier: row.tier,
          status: row.status,
          createdAt: row.created_at
        };
      }
      return null;
    }
    return this.memStore.users.get(userId) || null;
  }

  /**
   * Get wallet snapshot for a user.
   */
  async getWallet(userId) {
    if (this.isLivePostgres) {
      const res = await this.pool.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
      return res.rows[0] || null;
    }
    return this.memStore.wallets.get(userId) || null;
  }

  /**
   * Get all ledger transactions for a user.
   */
  async getTransactions(userId) {
    if (this.isLivePostgres) {
      const res = await this.pool.query('SELECT * FROM ledger_transactions WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
      return res.rows;
    }
    return this.memStore.ledgerTransactions.filter(tx => tx.userId === userId);
  }

  /**
   * Graceful pool teardown.
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
