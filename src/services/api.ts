import type {
  MerchantConfig,
  GatewayOrder,
  GatewayStats,
  CreateOrderInput,
  UpiAccount,
  GatewayToggles,
  ManualTransactionInput,
  AddUpiAccountInput,
} from '../types/gateway';

let authToken = localStorage.getItem('adminToken') || '';

export function setAuthToken(token: string) {
  authToken = token;
  if (token) {
    localStorage.setItem('adminToken', token);
  } else {
    localStorage.removeItem('adminToken');
  }
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
}

export async function fetchStats(): Promise<GatewayStats> {
  const res = await fetch('/api/stats', { headers: getHeaders() });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch stats');
  return data.stats;
}

export async function fetchConfig(): Promise<MerchantConfig> {
  const res = await fetch('/api/config', { headers: getHeaders() });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch config');
  return data.config;
}

export async function updateConfig(updates: Partial<MerchantConfig>): Promise<MerchantConfig> {
  const res = await fetch('/api/config', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to update config');
  return data.config;
}

export async function fetchOrders(status?: string, search?: string): Promise<GatewayOrder[]> {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.set('status', status);
  if (search) params.set('search', search);
  const res = await fetch(`/api/orders?${params.toString()}`, { headers: getHeaders() });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch orders');
  return data.orders;
}

export async function fetchOrder(orderId: string): Promise<GatewayOrder> {
  const res = await fetch(`/api/orders/${orderId}`, { headers: getHeaders() });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch order');
  return data.order;
}

export async function createOrder(input: CreateOrderInput): Promise<GatewayOrder> {
  // Public route, no auth needed
  const res = await fetch('/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to create order');
  return data.order;
}

export async function simulatePayment(orderId: string): Promise<GatewayOrder> {
  const res = await fetch(`/api/orders/${orderId}/simulate-payment`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to simulate payment');
  return data.order;
}

export async function submitUtr(orderId: string, utr: string): Promise<GatewayOrder> {
  const res = await fetch(`/api/orders/${orderId}/submit-utr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ utr }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to submit UTR');
  return data.order;
}

export async function verifyOrder(orderId: string, action: 'APPROVE' | 'REJECT', utr?: string): Promise<GatewayOrder> {
  const res = await fetch(`/api/orders/${orderId}/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action, utr }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to verify order');
  return data.order;
}

export async function refundOrder(orderId: string, reason: string): Promise<GatewayOrder> {
  const res = await fetch(`/api/orders/${orderId}/refund`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to refund order');
  return data.order;
}

export async function simulateWebhook(orderId: string): Promise<any> {
  const res = await fetch('/api/webhook/simulate', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to simulate webhook');
  return data;
}

export async function addUpiAccount(input: AddUpiAccountInput): Promise<{ account: UpiAccount; accounts: UpiAccount[] }> {
  const res = await fetch('/api/upi-accounts/add', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to add UPI account');
  return data;
}

export async function toggleUpiAccount(id: string): Promise<{ account: UpiAccount; accounts: UpiAccount[] }> {
  const res = await fetch(`/api/upi-accounts/${id}/toggle`, {
    method: 'POST',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to toggle UPI account');
  return data;
}

export async function setPrimaryUpiAccount(id: string): Promise<{ accounts: UpiAccount[] }> {
  const res = await fetch(`/api/upi-accounts/${id}/set-primary`, {
    method: 'POST',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to set primary UPI account');
  return data;
}

export async function deleteUpiAccount(id: string): Promise<{ accounts: UpiAccount[] }> {
  const res = await fetch(`/api/upi-accounts/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete UPI account');
  return data;
}

export async function updateToggles(toggles: Partial<GatewayToggles>): Promise<{ toggles: GatewayToggles; gatewayOnline: boolean }> {
  const res = await fetch('/api/toggles', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(toggles),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to update toggles');
  return data;
}

export async function addManualTransaction(input: ManualTransactionInput): Promise<GatewayOrder> {
  const res = await fetch('/api/orders/manual-add', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to record manual transaction');
  return data.order;
}

export async function toggleOrderStatus(orderId: string): Promise<GatewayOrder> {
  const res = await fetch(`/api/orders/${orderId}/toggle-status`, {
    method: 'POST',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to toggle status');
  return data.order;
}

export async function changeCredentials(newUsername: string, newPassword: string): Promise<any> {
  const res = await fetch('/api/users/change-credentials', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ newUsername, newPassword })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to update credentials');
  return data;
}

export async function createAdminUser(newUsername: string, newPassword: string): Promise<any> {
  const res = await fetch('/api/users/create', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ newUsername, newPassword })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to create user');
  return data;
}
