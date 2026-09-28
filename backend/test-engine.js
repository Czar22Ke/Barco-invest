import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { InvestmentEngine } from './src/services/InvestmentEngine.js'; // Adjust path if necessary
import dotenv from 'dotenv';

dotenv.config();

// Connect to the database using the same credentials as the main server
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'investment_db'
});

async function runTest() {
  console.log('🚀 Booting Investment Engine Test Protocol...\n');
  const engine = new InvestmentEngine(null, pool);

  try {
    // 1. Find a test user (the one registered earlier)
    const userRes = await pool.query('SELECT id, email FROM users LIMIT 1');
    if (userRes.rows.length === 0) {
      console.log('❌ No users found in database. Please register a user on the frontend first.');
      process.exit(1);
    }
    const userId = userRes.rows[0].id;
    console.log(`✅ Found Test User: ${userRes.rows[0].email} (ID: ${userId})`);

    // 2. Test a $1000 Deposit
    console.log('\n--- 🧪 TEST 1: Processing $1,000 Deposit ---');
    const depositKey = uuidv4();
    const depositRes = await engine.processDeposit(userId, '1000.00', depositKey);
    console.log('Result:', depositRes);

    // 3. Test Idempotency (Trying the exact same deposit again)
    console.log('\n--- 🧪 TEST 2: Testing Idempotency (Double-Spend Prevention) ---');
    const duplicateRes = await engine.processDeposit(userId, '1000.00', depositKey);
    console.log('Result:', duplicateRes);

    // 4. Test Withdrawal (Should fail if tested between 7:30 AM and 6:00 PM)
    console.log('\n--- 🧪 TEST 3: Testing $200 Withdrawal (Time Window Check) ---');
    const withdrawalKey1 = uuidv4();
    const withdrawalRes1 = await engine.processWithdrawal(userId, '200.00', withdrawalKey1);
    console.log('Result:', withdrawalRes1);

    // 5. Force the Window Open to test actual math
    console.log('\n--- 🧪 TEST 4: Forcing Time Window Open to Test Withdrawal Math ---');
    engine.isWithdrawalWindowOpen = () => true; // Temporarily override the lock
    const withdrawalKey2 = uuidv4();
    const withdrawalRes2 = await engine.processWithdrawal(userId, '200.00', withdrawalKey2);
    console.log('Result:', withdrawalRes2);

  } catch (error) {
    console.error('\n❌ Test Failed with Error:', error);
  } finally {
    await pool.end();
    console.log('\n🏁 Tests Complete. Database connection closed.');
  }
}

runTest();
