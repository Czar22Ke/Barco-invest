-- =============================================================================
-- Institutional Investment Platform - Ledger Service Database Schema (PostgreSQL)
-- =============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Users Table
-- Localized user account records & investment tier designations.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tier VARCHAR(32) NOT NULL CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'INSTITUTIONAL')),
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CLOSED')),
    main_balance NUMERIC(28, 8) DEFAULT 0,
    invested_balance NUMERIC(28, 8) DEFAULT 0,
    profit_balance NUMERIC(28, 8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. Wallets Table
-- Tracks localized wallet balance, High-Water Mark (HWM), and deposit/withdrawal totals.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    currency VARCHAR(16) NOT NULL DEFAULT 'USD',
    balance NUMERIC(28, 4) NOT NULL DEFAULT 0.0000 CHECK (balance >= 0),
    high_water_mark NUMERIC(28, 4) NOT NULL DEFAULT 0.0000 CHECK (high_water_mark >= 0),
    total_deposited NUMERIC(28, 4) NOT NULL DEFAULT 0.0000 CHECK (total_deposited >= 0),
    total_withdrawn NUMERIC(28, 4) NOT NULL DEFAULT 0.0000 CHECK (total_withdrawn >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_currency UNIQUE (user_id, currency)
);

-- -----------------------------------------------------------------------------
-- 3. Ledger Transactions Table (Double-Entry Bookkeeping)
-- Implements strict double-entry ledger logic for institutional transparency.
-- Every financial movement must specify a debit account and a credit account.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ledger_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) NOT NULL REFERENCES users(user_id),
    transaction_type VARCHAR(64) NOT NULL CHECK (
        transaction_type IN (
            'DEPOSIT',
            'YIELD_ACCRUAL',
            'WITHDRAWAL_PAYOUT',
            'PERFORMANCE_FEE',
            'TAX_WITHHOLDING'
        )
    ),
    debit_account VARCHAR(128) NOT NULL,  -- Account being debited (source of funds)
    credit_account VARCHAR(128) NOT NULL, -- Account being credited (destination of funds)
    amount NUMERIC(28, 4) NOT NULL CHECK (amount > 0),
    hwm_before NUMERIC(28, 4) NOT NULL,
    hwm_after NUMERIC(28, 4) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance & quick audit trail lookups
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_tx_user_id ON ledger_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_tx_type ON ledger_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_ledger_tx_created_at ON ledger_transactions(created_at);

-- Destination address for withdrawals (Wallet Address or Bank IBAN)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS destination_address VARCHAR(255);

-- Explicit High-Water Mark balance tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hwm_balance NUMERIC(28,8) DEFAULT 0;

