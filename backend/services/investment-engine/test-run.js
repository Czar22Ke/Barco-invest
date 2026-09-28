import { InstitutionalExchangeAdapter } from './adapters/InstitutionalExchangeAdapter.js';
import { InvestmentEngine, USER_TIERS } from './core/InvestmentEngine.js';

async function runSimulation() {
  console.log('========================================================================');
  console.log('         INSTITUTIONAL PORTFOLIO INVESTMENT ENGINE SIMULATION           ');
  console.log('========================================================================\n');

  // 0. Verify Deep Freeze Immutability on USER_TIERS
  console.log('[Step 0] Testing Deep-Freeze Immutability on USER_TIERS...');
  try {
    USER_TIERS.BRONZE.allocations[0].ratio = '0.99';
  } catch (err) {
    console.log('✔ Deep Freeze verified: Mutation threw error as expected:', err.message);
  }
  if (USER_TIERS.BRONZE.allocations[0].ratio === '0.70') {
    console.log('✔ Deep Freeze verified: USER_TIERS.BRONZE.allocations ratio remains 0.70');
  } else {
    throw new Error('Immutability failure: USER_TIERS allocations ratio was mutated!');
  }

  // 1. Initialize Exchange Adapter & Core Investment Engine
  console.log('\n[Step 1] Instantiating Institutional Exchange Adapter...');
  const adapter = new InstitutionalExchangeAdapter({ mockRateFluctuation: true });
  
  const engine = new InvestmentEngine(adapter);
  console.log('✔ Exchange Adapter initialized with pools: USD, BTC, ETH.');

  // Check rate query via Adapter
  const rateUSD = await adapter.fetchLiquidityRate('FIAT_USD_POOL');
  console.log(`✔ Liquidity Pool check: ${rateUSD.pair} | Pool ID: ${rateUSD.liquidityPoolId} | Fee: ${rateUSD.feePct}`);

  console.log('\n[Step 2] Testing NAV Calculation Window Enforcement...');
  
  // Test NAV window CLOSED rejection
  engine.setNAVWindowStatus(false);
  console.log(`   NAV Window Status: ${engine.isNAVWindowOpen() ? 'OPEN' : 'CLOSED'}`);

  // Create Institutional User Account ($50,000 deposit - new INSTITUTIONAL tier threshold)
  const userId = 'INST_CLIENT_001';
  console.log('\n[Step 3] Initializing Institutional User Account ($50,000.00)...');
  const accountInit = engine.createUserAccount(userId, 'INSTITUTIONAL', '50000.00');
  console.log('✔ Account Created:', JSON.stringify(accountInit, null, 2));

  // Attempt withdrawal while NAV window is closed
  console.log('\n[Step 4] Attempting Withdrawal outside NAV Window...');
  const closedNavResult = engine.processWithdrawal(userId, '5000.00');
  console.log('✖ Result:', closedNavResult.message);

  // Open NAV calculation window
  console.log('\n[Step 5] Opening NAV Calculation Window...');
  engine.setNAVWindowStatus(true);
  console.log(`✔ NAV Window Status: ${engine.isNAVWindowOpen() ? 'OPEN' : 'CLOSED'}`);

  // 6. Simulate Investment Yield / Profit Accrual (+20% profit)
  console.log('\n[Step 6] Simulating +20.00% High-Frequency Yield Accrual...');
  const yieldResult = await engine.simulateYield(userId, '0.20');
  console.log('✔ Yield Accrual Log:', JSON.stringify(yieldResult, null, 2));

  // 7. Process Profitable Withdrawal ($15,000)
  console.log('\n[Step 7] Processing Profitable Withdrawal Request ($15,000.00)...');
  const withdrawalResult = engine.processWithdrawal(userId, '15000.00');

  console.log('\n========================================================================');
  console.log('                      WITHDRAWAL AUDIT RECEIPT                          ');
  console.log('========================================================================');
  console.log(JSON.stringify(withdrawalResult, null, 2));

  // 8. Final Account Summary & HWM Verification
  console.log('\n========================================================================');
  console.log('                      POST-WITHDRAWAL ACCOUNT STATE                     ');
  console.log('========================================================================');
  const finalSummary = engine.getAccountSummary(userId);
  console.log(JSON.stringify(finalSummary, null, 2));
  console.log('\n✔ Portfolio Investment Engine Simulation Completed Successfully!\n');
}

runSimulation().catch(err => {
  console.error('Simulation Failed:', err);
  process.exit(1);
});
