/**
 * Asynchronous Administrative API Service
 * 
 * Connects to decoupled backend microservices for transaction verification,
 * tier unlocking, and user role-based management.
 */

// Initial mock transaction queue (persisted in memory)
let mockTransactions = [
  {
    txId: 'TX_DEP_9901',
    userName: 'John Doe',
    email: 'john.doe@client.com',
    tier: 'INSTITUTIONAL',
    type: 'DEPOSIT',
    amount: '50000.00',
    date: new Date(Date.now() - 3600000).toLocaleString(),
    status: 'Pending',
    paymentMethod: 'CRYPTO'
  },
  {
    txId: 'TX_WD_9902',
    userName: 'Sarah Jenkins',
    email: 'sarah.j@client.com',
    tier: 'GOLD',
    type: 'WITHDRAWAL',
    amount: '2500.00',
    date: new Date(Date.now() - 7200000).toLocaleString(),
    status: 'Pending',
    paymentMethod: 'FIAT'
  },
  {
    txId: 'TX_DEP_9903',
    userName: 'Robert Chen',
    email: 'r.chen@client.com',
    tier: 'SILVER',
    type: 'DEPOSIT',
    amount: '2000.00',
    date: new Date(Date.now() - 86400000).toLocaleString(),
    status: 'Approved',
    paymentMethod: 'CRYPTO'
  },
  {
    txId: 'TX_DEP_9904',
    userName: 'Elena Rostova',
    email: 'elena@client.com',
    tier: 'BRONZE',
    type: 'DEPOSIT',
    amount: '500.00',
    date: new Date(Date.now() - 172800000).toLocaleString(),
    status: 'Approved',
    paymentMethod: 'FIAT'
  }
];

let mockUsers = [
  { userId: 'USER_1001', name: 'John Doe', email: 'john.doe@client.com', tier: 'INSTITUTIONAL', status: 'Pending Approval', joined: '2026-09-18' },
  { userId: 'USER_1002', name: 'Sarah Jenkins', email: 'sarah.j@client.com', tier: 'GOLD', status: 'Active', joined: '2026-09-15' },
  { userId: 'USER_1003', name: 'Robert Chen', email: 'r.chen@client.com', tier: 'SILVER', status: 'Active', joined: '2026-09-10' },
  { userId: 'USER_1004', name: 'Elena Rostova', email: 'elena@client.com', tier: 'BRONZE', status: 'Active', joined: '2026-09-08' }
];

/**
 * Fetch all financial transactions for admin queue
 */
export async function fetchAdminTransactions() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockTransactions]);
    }, 400);
  });
}

/**
 * Update transaction status (Approve / Reject) and unlock user tier access
 */
export async function updateTransactionStatus(txId, newStatus) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tx = mockTransactions.find(t => t.txId === txId);
      if (!tx) {
        reject(new Error(`Transaction ${txId} not found.`));
        return;
      }
      tx.status = newStatus;

      // Update matching user status if deposit approved
      if (tx.type === 'DEPOSIT' && newStatus === 'Approved') {
        const user = mockUsers.find(u => u.email === tx.email);
        if (user) user.status = 'Active';
      }

      resolve({
        success: true,
        txId,
        newStatus,
        message: `Transaction ${txId} successfully updated to ${newStatus}.`
      });
    }, 500);
  });
}

/**
 * Fetch user list for admin user management view
 */
export async function fetchAdminUsers() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockUsers]);
    }, 400);
  });
}
