/**
 * Abstract Base Exchange Adapter Interface
 * 
 * Defines standard contract methods for liquidity providers and exchanges.
 * Institutional clients can extend this class to interface with custom 
 * liquidity pools, OTC desks, or exchange APIs (e.g., FIX protocol, REST/WebSocket).
 */
export class BaseExchangeAdapter {
  constructor(adapterName = 'BaseExchangeAdapter') {
    if (new.target === BaseExchangeAdapter) {
      throw new Error('BaseExchangeAdapter is an abstract class and cannot be instantiated directly.');
    }
    this.adapterName = adapterName;
  }

  /**
   * Fetches real-time liquidity rate and pool parameters for a given trading pair.
   * 
   * @param {string} pair - e.g. "USDT/USD", "BTC/USDT", "ETH/USD"
   * @returns {Promise<{ pair: string, rate: string, liquidityPoolId: string, feePct: string, availableLiquidity: string }>}
   */
  async fetchLiquidityRate(pair) {
    throw new Error(`fetchLiquidityRate(pair) must be implemented by ${this.constructor.name}`);
  }

  /**
   * Executes a trade order against the connected liquidity pool.
   * 
   * @param {string} side - "BUY" or "SELL"
   * @param {string|number} amount - Order size/quantity
   * @param {string} pair - Trading pair
   * @returns {Promise<{ orderId: string, status: string, executedAmount: string, executedRate: string, fee: string, timestamp: number }>}
   */
  async executeOrder(side, amount, pair) {
    throw new Error(`executeOrder(side, amount, pair) must be implemented by ${this.constructor.name}`);
  }

  /**
   * Optional helper to fetch exchange status or health.
   * @returns {Promise<{ status: string, latencyMs: number }>}
   */
  async getHealthStatus() {
    return { status: 'ONLINE', latencyMs: 10 };
  }
}
