import { reactive, ref } from 'vue';

export const portfolioState = reactive({ balance: 0, highWaterMark: 0, currency: 'USD' });
export const liveFeed = ref([]);

export const livePrices = reactive(new Map([
  ['BTC/USD', { pair: 'BTC/USD', rate: 0.00, poolId: 'POOL_BTC_01', feePct: '0.10%' }],
  ['ETH/USD', { pair: 'ETH/USD', rate: 0.00, poolId: 'POOL_ETH_01', feePct: '0.15%' }],
  ['USDT/USD', { pair: 'USDT/USD', rate: 1.00, poolId: 'POOL_FIAT_01', feePct: '0.00%' }]
]));

export const connectWebSocket = () => {
  const ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,tether');

  ws.onopen = () => console.log('✅ Connected to live global market feed');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.bitcoin) {
      const btc = livePrices.get('BTC/USD');
      btc.rate = parseFloat(data.bitcoin).toFixed(2);
      livePrices.set('BTC/USD', { ...btc });
    }
    if (data.ethereum) {
      const eth = livePrices.get('ETH/USD');
      eth.rate = parseFloat(data.ethereum).toFixed(2);
      livePrices.set('ETH/USD', { ...eth });
    }
  };

  ws.onclose = () => setTimeout(connectWebSocket, 5000);
};

export const syncPortfolioWithAuth = async (userId, tier) => {
  const token = localStorage.getItem('user_token');
  if (token) {
    try {
      const response = await fetch('http://localhost:5000/api/portfolio', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const responseData = await response.json();
        portfolioState.balance = parseFloat(responseData.balance || responseData.currentBalance || 0);
        return;
      }
    } catch (err) {
      console.error('Failed to sync portfolio with backend:', err);
    }
  }

  portfolioState.balance = tier === 'BRONZE' ? 500.00 : 5000.00;
  portfolioState.highWaterMark = tier === 'BRONZE' ? 500.00 : 5000.00;
  portfolioState.currency = 'USD';
};

