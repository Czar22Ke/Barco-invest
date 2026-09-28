// backend/src/services/tickerService.js
let cachedTickerData = [];

// Tokens we consider "New/Trending" for the ticker
const NEW_LISTINGS = ['WIFUSDT', 'SUIUSDT', 'SEIUSDT'];
const CORE_CRYPTO = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT'];
const FIAT_PAIRS = ['EURUSDT', 'GBPUSDT'];

const fetchLivePrices = async () => {
  try {
    // Fetch all tickers (no symbol parameter)
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    if (!response.ok) throw new Error('Failed to fetch from Binance');
    
    const allData = await response.json();
    
    // Filter down to USDT pairs to avoid clutter
    const usdtPairs = allData.filter(coin => coin.symbol.endsWith('USDT'));

    // Helper function to format a coin object
    const formatCoin = (coin) => {
      const formattedSymbol = coin.symbol.replace('USDT', '/USD');
      // Use more decimals for cheaper coins
      const priceVal = parseFloat(coin.lastPrice);
      const decimals = priceVal < 1 ? 4 : 2; 
      const formattedPrice = priceVal.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      
      const changePercent = parseFloat(coin.priceChangePercent);
      const formattedChange = (changePercent >= 0 ? '+' : '') + changePercent.toFixed(2);

      return {
        symbol: formattedSymbol,
        price: formattedPrice,
        change: formattedChange,
        isPositive: changePercent >= 0
      };
    };

    // 1. Extract Core Crypto
    const core = usdtPairs.filter(c => CORE_CRYPTO.includes(c.symbol)).map(formatCoin);
    
    // 2. Extract Fiat
    const fiats = usdtPairs.filter(c => FIAT_PAIRS.includes(c.symbol)).map(formatCoin);

    // 3. Extract Top Gainers (Sort by percentage, take top 3)
    const topGainers = [...usdtPairs]
      .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
      .slice(0, 3)
      .map(formatCoin);

    // 4. Extract New/Trending
    const newCoins = usdtPairs.filter(c => NEW_LISTINGS.includes(c.symbol)).map(formatCoin);

    // Assemble the final array with UI Labels injected
    cachedTickerData = [
      ...core,
      { isLabel: true, title: '💱 FIAT MARKETS' },
      ...fiats,
      { isLabel: true, title: '🚀 TOP GAINERS' },
      ...topGainers,
      { isLabel: true, title: '🆕 NEW & TRENDING' },
      ...newCoins
    ];
    
  } catch (error) {
    console.error('Ticker fetch error:', error.message);
  }
};

fetchLivePrices();
setInterval(fetchLivePrices, 60000);

module.exports = {
  getTickerData: () => cachedTickerData
};
