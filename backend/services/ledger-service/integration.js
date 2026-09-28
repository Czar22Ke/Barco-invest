import { io as ClientIO } from 'socket.io-client';
import { InstitutionalExchangeAdapter } from '../investment-engine/adapters/InstitutionalExchangeAdapter.js';
import { InvestmentEngine } from '../investment-engine/core/InvestmentEngine.js';
import { DatabaseService } from './db/DatabaseService.js';
import { WebSocketGateway } from './live/WebSocketGateway.js';

async function runIntegrationPipeline() {
  console.log('========================================================================');
  console.log('    LEDGER SERVICE & REAL-TIME WEBSOCKET BROADCASTING INTEGRATION      ');
  console.log('========================================================================\n');

  const WS_PORT = process.env.WS_PORT || 4001;

  // 1. Initialize Database Service & WebSocket Gateway
  console.log('[Step 1] Initializing Database Service & WebSocket Gateway...');
  const db = new DatabaseService();
  await db.initialize();

  const gateway = new WebSocketGateway(WS_PORT);
  await gateway.start();

  // 2. Connect a WebSocket client listener to verify live broadcasts
  console.log('\n[Step 2] Connecting Test Socket.io Client Subscriber...');
  const clientSocket = ClientIO(`http://localhost:${WS_PORT}`);
  
  const receivedEvents = [];
  
  clientSocket.on('connect', () => {
    console.log(`✔ Socket.io client connected with ID: ${clientSocket.id}`);
  });

  const setupListener = (eventName) => {
    clientSocket.on(eventName, (data) => {
      console.log(`📡 [WS Client Received -> ${eventName}]:`, JSON.stringify(data, null, 2));
      receivedEvents.push({ event: eventName, data });
    });
  };

  setupListener('LIVE_PRICE_UPDATE');
  setupListener('DEPOSIT_CLEARED');
  setupListener('YIELD_ACCRUED');
  setupListener('WITHDRAWAL_PROCESSED');

  // Give client socket 300ms to establish connection
  await new Promise(r => setTimeout(r, 300));

  // 3. Initialize Investment Engine & Adapter
  console.log('\n[Step 3] Initializing Portfolio Investment Engine & Exchange Adapter...');
  const adapter = new InstitutionalExchangeAdapter({ mockRateFluctuation: true });
  const engine = new InvestmentEngine(adapter);

  const userId = 'INST_CLIENT_777';

  // 4. PROCESS DEPOSIT (Engine -> DB Persistence -> WS Broadcast)
  console.log('\n[Step 4] Pipeline Execution A: Initial Account Creation & Deposit ($50,000.00)...');
  const accountSummary = engine.createUserAccount(userId, 'INSTITUTIONAL', '50000.00');

  // Persistence Step
  console.log(' 💾 Persisting user & wallet to Database...');
  await db.saveUserAndWallet(accountSummary);
  const dbDepResult = await db.recordDeposit(userId, '50000.00', '50000.0000', '50000.0000');
  console.log(' ✔ Database Persistence Success:', dbDepResult);

  // Broadcast ONLY after DB success
  console.log(' 📡 Emitting WebSocket event [DEPOSIT_CLEARED]...');
  gateway.broadcastDepositCleared({
    userId,
    amount: '50000.00',
    newBalance: '50000.0000',
    hwm: '50000.0000'
  });

  await new Promise(r => setTimeout(r, 300));

  // 5. PROCESS LIVE PRICE UPDATE
  console.log('\n[Step 5] Pipeline Execution B: Exchange Liquidity Rate Broadcast...');
  const rateInfo = await adapter.fetchLiquidityRate('FIAT_USD_POOL');
  
  console.log(' 📡 Emitting WebSocket event [LIVE_PRICE_UPDATE]...');
  gateway.broadcastLivePrice(rateInfo);

  await new Promise(r => setTimeout(r, 300));

  // 6. PROCESS YIELD ACCRUAL (Engine -> DB Persistence -> WS Broadcast)
  console.log('\n[Step 6] Pipeline Execution C: Simulating +15% Yield Accrual ($7,500 profit)...');
  const yieldResult = await engine.simulateYield(userId, '0.15');

  // Persistence Step
  console.log(' 💾 Persisting yield transaction to Database...');
  const dbYieldResult = await db.recordYield(
    userId,
    yieldResult.grossProfitGenerated,
    yieldResult.newBalance,
    yieldResult.previousHWM,
    yieldResult.isNewPeakAchieved
  );
  console.log(' ✔ Database Persistence Success:', dbYieldResult);

  // Broadcast ONLY after DB success
  console.log(' 📡 Emitting WebSocket event [YIELD_ACCRUED]...');
  gateway.broadcastYieldAccrued({
    userId,
    grossProfit: yieldResult.grossProfitGenerated,
    newBalance: yieldResult.newBalance,
    previousHWM: yieldResult.previousHWM,
    isNewPeakAchieved: yieldResult.isNewPeakAchieved
  });

  await new Promise(r => setTimeout(r, 300));

  // 7. PROCESS WITHDRAWAL (Engine -> DB Persistence -> WS Broadcast)
  console.log('\n[Step 7] Pipeline Execution D: NAV Window Open & Profitable Withdrawal ($20,000)...');
  engine.setNAVWindowStatus(true);
  const withdrawalResponse = engine.processWithdrawal(userId, '20000.00');

  // Persistence Step: Double-entry ledger for payout, performance fee, and tax withholding
  console.log(' 💾 Persisting 3-way double-entry audit receipt to Database...');
  const dbWdResult = await db.recordWithdrawalAudit(withdrawalResponse.auditReceipt);
  console.log(' ✔ Database Persistence Success:', dbWdResult);

  // Broadcast ONLY after DB success
  console.log(' 📡 Emitting WebSocket event [WITHDRAWAL_PROCESSED]...');
  gateway.broadcastWithdrawalProcessed({
    userId,
    netPayout: withdrawalResponse.auditReceipt.netWithdrawalPayout,
    totalDeductions: withdrawalResponse.auditReceipt.totalDeductions,
    auditReceipt: withdrawalResponse.auditReceipt
  });

  await new Promise(r => setTimeout(r, 500));

  // 8. Integration Assertions & Summary
  console.log('\n========================================================================');
  console.log('                     INTEGRATION PIPELINE VERIFICATION                  ');
  console.log('========================================================================');

  const dbTxList = await db.getTransactions(userId);
  console.log(`✔ Total Database Double-Entry Ledger Transactions Persisted: ${dbTxList.length}`);
  console.log(`✔ Total Real-Time WebSocket Events Received by Client: ${receivedEvents.length}`);

  const requiredEvents = ['DEPOSIT_CLEARED', 'LIVE_PRICE_UPDATE', 'YIELD_ACCRUED', 'WITHDRAWAL_PROCESSED'];
  const receivedEventNames = receivedEvents.map(e => e.event);

  let allPassed = true;
  for (const reqEv of requiredEvents) {
    if (receivedEventNames.includes(reqEv)) {
      console.log(`   [PASS] WebSocket Event '${reqEv}' verified.`);
    } else {
      console.log(`   [FAIL] WebSocket Event '${reqEv}' missing!`);
      allPassed = false;
    }
  }

  // Teardown
  clientSocket.disconnect();
  await gateway.stop();
  await db.close();

  if (allPassed) {
    console.log('\n✔ All Integration Tests and Real-Time WebSocket Broadcasts Passed!\n');
  } else {
    throw new Error('Integration verification failed.');
  }
}

runIntegrationPipeline().catch(err => {
  console.error('Integration Error:', err);
  process.exit(1);
});
