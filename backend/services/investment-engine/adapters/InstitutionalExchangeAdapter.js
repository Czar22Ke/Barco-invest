import { BaseExchangeAdapter } from './BaseExchangeAdapter.js';
import Decimal from 'decimal.js';

/**
 * Concrete Institutional Exchange Adapter
 * 
 * Simulates high-liquidity institutional pools (Fiat & Crypto) with 
 * customizable fee structures, order execution, and deep order book simulation.
 */
export class InstitutionalExchangeAdapter extends BaseExchangeAdapter {
  constructor(config = {}) {
    super('InstitutionalExchangeAdapter');

    // Preset institutional liquidity pools with mock yield rates & fees
    this.pools = new Map([
      ['FIAT_USD_POOL', {
        id: 'POOL_INST_USD_01',
        pair: 'USD/USDT',
        baseRate: new Decimal('1.0000'),
        feePct: new Decimal('0.0005'), // 0.05% institutional fee
        availableLiquidity: new Decimal('50000000.00'), // $50M pool depth
      }],
      ['CRYPTO_BTC_POOL', {
        id: 'POOL_INST_BTC_01',
        pair: 'BTC/USD',
        baseRate: new Decimal('65000.00'),
        feePct: new Decimal('0.0010'), // 0.10% fee
        availableLiquidity: new Decimal('100000000.00'), // $100M pool depth
      }],
      ['CRYPTO_ETH_POOL', {
        id: 'POOL_INST_ETH_01',
        pair: 'ETH/USD',
        baseRate: new Decimal('3500.00'),
        feePct: new Decimal('0.0008'), // 0.08% fee
        availableLiquidity: new Decimal('75000000.00'), // $75M pool depth
      }]
    ]);

    this.mockRateFluctuation = config.mockRateFluctuation ?? false;
  }

  /**
   * Fetch liquidity rate for a specific trading pair or pool key.
   */
  async fetchLiquidityRate(pair) {
    const pool = this._findPool(pair);
    if (!pool) {
      throw new Error(`[InstitutionalExchangeAdapter] Unsupported liquidity pair: ${pair}`);
    }

    let currentRate = pool.baseRate;
    if (this.mockRateFluctuation) {
      // Small simulated institutional spread variation (+/- 0.05%)
      const variation = Decimal.random().times('0.001').minus('0.0005');
      currentRate = currentRate.times(new Decimal('1').plus(variation));
    }

    return {
      pair: pool.pair,
      rate: currentRate.toFixed(4),
      liquidityPoolId: pool.id,
      feePct: pool.feePct.toFixed(4),
      availableLiquidity: pool.availableLiquidity.toFixed(2),
    };
  }

  /**
   * Execute an order against the institutional liquidity pool.
   */
  async executeOrder(side, amount, pair) {
    const uppercaseSide = side.toUpperCase();
    if (!['BUY', 'SELL'].includes(uppercaseSide)) {
      throw new Error(`[InstitutionalExchangeAdapter] Invalid order side: ${side}`);
    }

    const pool = this._findPool(pair);
    if (!pool) {
      throw new Error(`[InstitutionalExchangeAdapter] Unsupported liquidity pair: ${pair}`);
    }

    const decAmount = new Decimal(amount);
    if (decAmount.lte(0)) {
      throw new Error(`[InstitutionalExchangeAdapter] Order amount must be positive`);
    }

    if (decAmount.gt(pool.availableLiquidity)) {
      throw new Error(`[InstitutionalExchangeAdapter] Insufficient pool liquidity. Requested: ${decAmount.toFixed(2)}, Available: ${pool.availableLiquidity.toFixed(2)}`);
    }

    const { rate } = await this.fetchLiquidityRate(pair);
    const decRate = new Decimal(rate);
    const grossTotal = decAmount.times(decRate);
    const feeAmount = grossTotal.times(pool.feePct);

    // Deduct liquidity from simulated pool
    pool.availableLiquidity = pool.availableLiquidity.minus(decAmount);

    return {
      orderId: `ORD_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      status: 'EXECUTED',
      side: uppercaseSide,
      pair: pool.pair,
      executedAmount: decAmount.toFixed(6),
      executedRate: decRate.toFixed(4),
      grossTotal: grossTotal.toFixed(4),
      fee: feeAmount.toFixed(4),
      timestamp: Date.now()
    };
  }

  _findPool(pairOrId) {
    for (const pool of this.pools.values()) {
      if (pool.pair.toLowerCase() === pairOrId.toLowerCase() || pool.id.toLowerCase() === pairOrId.toLowerCase()) {
        return pool;
      }
    }
    // Check if key directly matches map key
    if (this.pools.has(pairOrId.toUpperCase())) {
      return this.pools.get(pairOrId.toUpperCase());
    }
    return null;
  }
}
