import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Real-Time WebSocket Gateway
 * 
 * Manages Socket.io client connections, room subscriptions, and real-time
 * event broadcasts for price feeds, yield accruals, deposits, and withdrawal receipts.
 */
export class WebSocketGateway {
  constructor(port = process.env.WS_PORT || 4001) {
    this.port = parseInt(port, 10);
    this.server = http.createServer();
    this.io = new Server(this.server, {
      cors: {
        origin: '*', // Allow modern decoupled frontend UI connections
        methods: ['GET', 'POST']
      }
    });

    this.connectedClients = new Set();
    this.isListening = false;

    this._setupHandlers();
  }

  _setupHandlers() {
    this.io.on('connection', (socket) => {
      this.connectedClients.add(socket.id);
      console.log(`[WebSocketGateway] Client connected: ${socket.id} (Total active: ${this.connectedClients.size})`);

      // Optional room subscription handler for localized user channels
      socket.on('subscribe_user_channel', (userId) => {
        socket.join(`user:${userId}`);
        console.log(`[WebSocketGateway] Socket ${socket.id} joined channel user:${userId}`);
      });

      socket.on('disconnect', () => {
        this.connectedClients.delete(socket.id);
        console.log(`[WebSocketGateway] Client disconnected: ${socket.id} (Total active: ${this.connectedClients.size})`);
      });
    });
  }

  /**
   * Starts the HTTP/WebSocket server.
   */
  async start() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        this.isListening = true;
        console.log(`[WebSocketGateway] Server running and broadcasting on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Event Broadcaster 1: LIVE_PRICE_UPDATE
   */
  broadcastLivePrice(priceData) {
    const payload = {
      event: 'LIVE_PRICE_UPDATE',
      pair: priceData.pair,
      rate: priceData.rate,
      liquidityPoolId: priceData.liquidityPoolId,
      feePct: priceData.feePct,
      timestamp: priceData.timestamp || Date.now()
    };
    this.io.emit('LIVE_PRICE_UPDATE', payload);
    return payload;
  }

  /**
   * Event Broadcaster 2: DEPOSIT_CLEARED
   */
  broadcastDepositCleared(depositData) {
    const payload = {
      event: 'DEPOSIT_CLEARED',
      userId: depositData.userId,
      amount: depositData.amount,
      newBalance: depositData.newBalance,
      highWaterMark: depositData.hwm,
      timestamp: depositData.timestamp || Date.now()
    };
    this.io.to(`user:${depositData.userId}`).emit('DEPOSIT_CLEARED', payload);
    this.io.emit('DEPOSIT_CLEARED', payload); // Broadcast globally for real-time dashboard monitoring
    return payload;
  }

  /**
   * Event Broadcaster 3: YIELD_ACCRUED
   */
  broadcastYieldAccrued(yieldData) {
    const payload = {
      event: 'YIELD_ACCRUED',
      userId: yieldData.userId,
      grossProfitGenerated: yieldData.grossProfit,
      newBalance: yieldData.newBalance,
      previousHWM: yieldData.previousHWM,
      isNewPeakAchieved: yieldData.isNewPeakAchieved,
      timestamp: Date.now()
    };
    this.io.to(`user:${yieldData.userId}`).emit('YIELD_ACCRUED', payload);
    this.io.emit('YIELD_ACCRUED', payload);
    return payload;
  }

  /**
   * Event Broadcaster 4: WITHDRAWAL_PROCESSED
   */
  broadcastWithdrawalProcessed(withdrawalData) {
    const payload = {
      event: 'WITHDRAWAL_PROCESSED',
      userId: withdrawalData.userId,
      netWithdrawalPayout: withdrawalData.netPayout,
      totalDeductions: withdrawalData.totalDeductions,
      auditReceipt: withdrawalData.auditReceipt,
      timestamp: Date.now()
    };
    this.io.to(`user:${withdrawalData.userId}`).emit('WITHDRAWAL_PROCESSED', payload);
    this.io.emit('WITHDRAWAL_PROCESSED', payload);
    return payload;
  }

  /**
   * Graceful server shutdown.
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.io) {
        this.io.close(() => {
          this.server.close(() => {
            this.isListening = false;
            console.log('[WebSocketGateway] Gateway stopped.');
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
  }
}
