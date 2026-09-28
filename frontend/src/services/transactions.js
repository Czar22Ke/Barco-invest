import { useAuthStore } from '../stores/auth'; // Adjust path if needed

const API_URL = 'http://localhost:5000/api/transactions';

async function executeTransaction(endpoint, amount) {
  const authStore = useAuthStore();
  const idempotencyKey = crypto.randomUUID();

  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}` 
    },
    body: JSON.stringify({ amount, idempotencyKey })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Transaction failed');
  return data;
}

export const depositFunds = (amount) => executeTransaction('deposit', amount);
export const withdrawFunds = (amount) => executeTransaction('withdraw', amount);

export const generateYield = async (yieldPct) => {
  const authStore = useAuthStore();
  const response = await fetch(`${API_URL}/yield`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
    body: JSON.stringify({ yieldPct, idempotencyKey: crypto.randomUUID() })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};
