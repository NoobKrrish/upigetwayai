import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { generateUPIQR, buildIntentLinks, rupeesToPaise } from './src/lib/upipay/index.js';
import type { MerchantConfig, GatewayOrder, PaymentTimelineEvent, GatewayStats } from './src/types/gateway.js';

const app = express();
const PORT = 3000;

// Enable JSON and raw body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin Credentials & Users
const users = new Map<string, any>();
users.set('admin', { username: 'admin', password: 'admin123' });
const SECRET = process.env.SESSION_SECRET || 'fallback-secret-for-demo';

function generateToken(username: string) {
  const payload = Buffer.from(JSON.stringify({ username, exp: Date.now() + 86400000 })).toString('base64');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function verifyToken(token: string) {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (expected !== signature) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (data.exp < Date.now()) return null;
    return data.username;
  } catch (e) {
    return null;
  }
}

// Authentication Middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or missing token' });
  }
  const token = authHeader.split(' ')[1];
  const username = verifyToken(token);
  if (!username) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
  (req as any).user = { username };
  next();
};

// Admin Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);
  if (user && user.password === password) {
    const token = generateToken(username);
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, error: 'Invalid username or password' });
});

// Admin Account Management
app.post('/api/users/change-credentials', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  const currentUsername = verifyToken(token);
  if (!currentUsername) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const user = users.get(currentUsername);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  const { newUsername, newPassword } = req.body;
  if (!newUsername || !newPassword) return res.status(400).json({ success: false, error: 'Missing fields' });

  if (newUsername !== currentUsername) {
    if (users.has(newUsername)) return res.status(400).json({ success: false, error: 'Username already taken' });
    users.delete(currentUsername);
  }
  
  user.username = newUsername;
  user.password = newPassword;
  users.set(newUsername, user);
  activeTokens.set(token, newUsername);
  
  res.json({ success: true });
});

app.post('/api/users/create', (req, res) => {
  const { newUsername, newPassword } = req.body;
  if (!newUsername || !newPassword) return res.status(400).json({ success: false, error: 'Missing fields' });
  if (users.has(newUsername)) return res.status(400).json({ success: false, error: 'Username already exists' });
  
  users.set(newUsername, { username: newUsername, password: newPassword });
  res.json({ success: true });
});

// Protect Admin routes
const protectedRoutes = [
  '/api/stats',
  '/api/config',
  '/api/orders',
  '/api/upi-accounts',
  '/api/toggles',
  '/api/users'
];

app.use((req, res, next) => {
  // Check if route should be protected
  const isProtected = protectedRoutes.some(route => req.path.startsWith(route));
  
  // Exclude public endpoints that happen to start with /api/orders
  const publicEndpoints = [
    '/api/orders/create',
    '/simulate-payment',
    '/submit-utr',
    '/webhook'
  ];
  
  const isPublicOverride = publicEndpoints.some(route => req.path.includes(route));
  
  // Specific check: GET /api/orders/:id is public for checkout polling
  const isGetOrder = req.method === 'GET' && req.path.match(/^\/api\/orders\/[a-zA-Z0-9_-]+$/);

  if (isProtected && !isPublicOverride && !isGetOrder) {
    return requireAuth(req, res, next);
  }
  
  next();
});

// Default in-memory configuration
let merchantConfig: MerchantConfig = {
  gatewayOnline: true,
  providerMode: 'direct_upi',
  directUpi: {
    vpa: process.env.MERCHANT_VPA || 'robin@upi',
    name: process.env.MERCHANT_NAME || 'Robin UPI Store',
    mcc: process.env.MERCHANT_MCC || '5411',
    notePrefix: 'Pay to Robin Store',
  },
  upiAccounts: [
    {
      id: 'upi_acc_primary',
      vpa: process.env.MERCHANT_VPA || 'robin@upi',
      name: process.env.MERCHANT_NAME || 'Robin UPI Store',
      bankName: 'HDFC Bank (Primary)',
      enabled: true,
      isPrimary: true,
      dailyLimit: 100000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'upi_acc_paytm',
      vpa: 'store.paytm@paytm',
      name: 'Robin Retail Shop',
      bankName: 'Paytm Payments Bank',
      enabled: true,
      isPrimary: false,
      dailyLimit: 50000,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'upi_acc_backup',
      vpa: 'backup.settle@icici',
      name: 'Robin Reserve Bank',
      bankName: 'ICICI Bank',
      enabled: false, // OFF by default
      isPrimary: false,
      dailyLimit: 200000,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  toggles: {
    gatewayOnline: true,
    gpayEnabled: true,
    phonepeEnabled: true,
    paytmEnabled: true,
    bhimEnabled: true,
    autoApproveUtr: true,
    soundboxVoice: true,
  },
  phonepe: {
    merchantId: process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT',
    saltKey: process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
    saltIndex: process.env.PHONEPE_SALT_INDEX || '1',
    environment: 'sandbox',
    enabled: false,
  },
  paytm: {
    mid: process.env.PAYTM_MID || 'TEST_MID_123',
    merchantKey: process.env.PAYTM_MERCHANT_KEY || 'TEST_KEY_123',
    website: 'DEFAULT',
    environment: 'stage',
    enabled: false,
  },
  webhookUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhook`,
  webhookSecret: 'sec_' + crypto.randomBytes(8).toString('hex'),
  autoApproveSimulated: true,
};

// In-memory orders store
const orders: Map<string, GatewayOrder> = new Map();

// Helper to generate 12-digit Indian Bank UTR
function generateMockUTR(): string {
  const prefix = '4' + Math.floor(100 + Math.random() * 900).toString(); // e.g. 4251
  const suffix = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digits
  return prefix + suffix;
}

// Seed initial orders so the dashboard looks vibrant and realistic immediately
async function seedInitialOrders() {
  const seeds = [
    {
      orderId: 'pay_7x92a10c',
      amount: 499,
      customerName: 'Aarav Sharma',
      customerPhone: '+91 98765 43210',
      customerEmail: 'aarav.sharma@example.com',
      note: 'Web Hosting Plan - Monthly',
      status: 'SUCCESS' as const,
      utr: '425918274012',
      minutesAgo: 25,
    },
    {
      orderId: 'pay_8b31c44d',
      amount: 1250,
      customerName: 'Priya Patel',
      customerPhone: '+91 91234 56789',
      customerEmail: 'priya.p@example.com',
      note: 'Ecommerce Order #5812',
      status: 'SUCCESS' as const,
      utr: '425917462981',
      minutesAgo: 60,
    },
    {
      orderId: 'pay_3f19e88a',
      amount: 250,
      customerName: 'Rohan Verma',
      customerPhone: '+91 97890 12345',
      customerEmail: 'rohan.v@example.com',
      note: 'Coffee & Snacks Combo',
      status: 'PENDING' as const,
      minutesAgo: 5,
    },
    {
      orderId: 'pay_9c44d71e',
      amount: 2999,
      customerName: 'Ananya Gupta',
      customerPhone: '+91 98111 22233',
      customerEmail: 'ananya.g@example.com',
      note: 'Software License Key (Pro)',
      status: 'SUCCESS' as const,
      utr: '425890123456',
      minutesAgo: 140,
    },
    {
      orderId: 'pay_1d55f90c',
      amount: 800,
      customerName: 'Karan Mehra',
      customerPhone: '+91 99000 88776',
      customerEmail: 'karan.m@example.com',
      note: 'Gym Membership Fee',
      status: 'REFUNDED' as const,
      utr: '425812349018',
      refundReason: 'Customer requested cancellation within 2 hours',
      minutesAgo: 280,
    },
    {
      orderId: 'pay_6e22b33a',
      amount: 150,
      customerName: 'Vikas Rao',
      customerPhone: '+91 94444 33221',
      customerEmail: 'vikas.rao@example.com',
      note: 'Book Purchase',
      status: 'FAILED' as const,
      minutesAgo: 360,
    },
  ];

  for (const item of seeds) {
    const createdTime = new Date(Date.now() - item.minutesAgo * 60000).toISOString();
    const qrResult = await generateUPIQR({
      vpa: merchantConfig.directUpi.vpa,
      name: merchantConfig.directUpi.name,
      amount: item.amount,
      orderId: item.orderId,
      note: item.note,
      mc: merchantConfig.directUpi.mcc,
    });

    const timeline: PaymentTimelineEvent[] = [
      {
        id: crypto.randomUUID(),
        timestamp: createdTime,
        title: 'Order Created',
        description: `Payment intent of ₹${item.amount.toFixed(2)} generated via UPI`,
        type: 'info',
      },
    ];

    if (item.status === 'SUCCESS') {
      timeline.push({
        id: crypto.randomUUID(),
        timestamp: new Date(Date.now() - (item.minutesAgo - 1) * 60000).toISOString(),
        title: 'Payment Successful',
        description: `Funds verified via UPI network. UTR: ${item.utr}`,
        type: 'success',
      });
    } else if (item.status === 'REFUNDED') {
      timeline.push({
        id: crypto.randomUUID(),
        timestamp: new Date(Date.now() - (item.minutesAgo - 1) * 60000).toISOString(),
        title: 'Payment Successful',
        description: `Funds credited via UPI. UTR: ${item.utr}`,
        type: 'success',
      });
      timeline.push({
        id: crypto.randomUUID(),
        timestamp: new Date(Date.now() - (item.minutesAgo - 10) * 60000).toISOString(),
        title: 'Refund Processed',
        description: `Full refund of ₹${item.amount.toFixed(2)} credited back to customer VPA.`,
        type: 'warning',
      });
    } else if (item.status === 'FAILED') {
      timeline.push({
        id: crypto.randomUUID(),
        timestamp: new Date(Date.now() - (item.minutesAgo - 5) * 60000).toISOString(),
        title: 'Payment Failed',
        description: 'Customer bank declined the UPI transaction (decline code: U30)',
        type: 'error',
      });
    }

    const order: GatewayOrder = {
      orderId: item.orderId,
      amount: item.amount,
      amountInPaise: rupeesToPaise(item.amount),
      currency: 'INR',
      customerName: item.customerName,
      customerPhone: item.customerPhone,
      customerEmail: item.customerEmail,
      note: item.note,
      status: item.status,
      provider: merchantConfig.providerMode,
      upiUri: qrResult.upiUri,
      qrImage: qrResult.qrImage,
      intentLinks: buildIntentLinks(qrResult.upiUri),
      utr: item.utr,
      createdAt: createdTime,
      updatedAt: createdTime,
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
      timeline,
      refundDetails: item.refundReason
        ? {
            refundId: `ref_${crypto.randomBytes(4).toString('hex')}`,
            amount: item.amount,
            reason: item.refundReason,
            timestamp: new Date(Date.now() - (item.minutesAgo - 10) * 60000).toISOString(),
          }
        : undefined,
    };

    orders.set(order.orderId, order);
  }
}

// ─── API Routes ─────────────────────────────────────────────────────────────

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get Merchant Configuration
app.get('/api/config', (req, res) => {
  // Return config with masked sensitive keys
  const safeConfig = {
    ...merchantConfig,
    phonepe: {
      ...merchantConfig.phonepe,
      saltKey: merchantConfig.phonepe.saltKey ? '••••••••' + merchantConfig.phonepe.saltKey.slice(-4) : '',
    },
    paytm: {
      ...merchantConfig.paytm,
      merchantKey: merchantConfig.paytm.merchantKey ? '••••••••' + merchantConfig.paytm.merchantKey.slice(-4) : '',
    },
  };
  res.json({ success: true, config: safeConfig });
});

// Update Merchant Configuration
app.post('/api/config', (req, res) => {
  try {
    const updates = req.body;
    if (updates.providerMode) {
      merchantConfig.providerMode = updates.providerMode;
    }
    if (updates.directUpi) {
      merchantConfig.directUpi = { ...merchantConfig.directUpi, ...updates.directUpi };
    }
    if (updates.phonepe) {
      // Don't overwrite with masked string
      const saltKey = updates.phonepe.saltKey?.includes('••••')
        ? merchantConfig.phonepe.saltKey
        : (updates.phonepe.saltKey || merchantConfig.phonepe.saltKey);

      merchantConfig.phonepe = {
        ...merchantConfig.phonepe,
        ...updates.phonepe,
        saltKey,
      };
    }
    if (updates.paytm) {
      const merchantKey = updates.paytm.merchantKey?.includes('••••')
        ? merchantConfig.paytm.merchantKey
        : (updates.paytm.merchantKey || merchantConfig.paytm.merchantKey);

      merchantConfig.paytm = {
        ...merchantConfig.paytm,
        ...updates.paytm,
        merchantKey,
      };
    }
    if (updates.webhookUrl) {
      merchantConfig.webhookUrl = updates.webhookUrl;
    }
    if (typeof updates.autoApproveSimulated === 'boolean') {
      merchantConfig.autoApproveSimulated = updates.autoApproveSimulated;
    }
    if (typeof updates.gatewayOnline === 'boolean') {
      merchantConfig.gatewayOnline = updates.gatewayOnline;
      merchantConfig.toggles.gatewayOnline = updates.gatewayOnline;
    }
    if (updates.toggles) {
      merchantConfig.toggles = { ...merchantConfig.toggles, ...updates.toggles };
    }
    if (Array.isArray(updates.upiAccounts)) {
      merchantConfig.upiAccounts = updates.upiAccounts;
    }

    res.json({ success: true, message: 'Settings saved successfully', config: merchantConfig });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update Quick Toggles (Gateway Online, GPay, PhonePe, Soundbox, etc.)
app.post('/api/toggles', (req, res) => {
  try {
    const updates = req.body;
    merchantConfig.toggles = {
      ...merchantConfig.toggles,
      ...updates,
    };
    if (typeof updates.gatewayOnline === 'boolean') {
      merchantConfig.gatewayOnline = updates.gatewayOnline;
    }
    res.json({ success: true, toggles: merchantConfig.toggles, gatewayOnline: merchantConfig.gatewayOnline });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── UPI Accounts Management (Add, Toggle On/Off, Set Primary, Delete) ──────

// Add New UPI Account
app.post('/api/upi-accounts/add', (req, res) => {
  try {
    const { vpa, name, bankName, dailyLimit, isPrimary } = req.body;
    if (!vpa || !vpa.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid VPA (UPI ID) is required (e.g. name@bank)' });
    }
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Payee / Account name is required' });
    }

    // If marked primary, unset other primaries
    const shouldBePrimary = Boolean(isPrimary) || merchantConfig.upiAccounts.length === 0;
    if (shouldBePrimary) {
      merchantConfig.upiAccounts.forEach((acc) => {
        acc.isPrimary = false;
      });
    }

    const newAccount = {
      id: `upi_acc_${crypto.randomBytes(4).toString('hex')}`,
      vpa: vpa.trim().toLowerCase(),
      name: name.trim(),
      bankName: bankName?.trim() || 'UPI Direct Bank',
      enabled: true, // Default ON when newly added
      isPrimary: shouldBePrimary,
      dailyLimit: dailyLimit ? parseFloat(dailyLimit) : undefined,
      createdAt: new Date().toISOString(),
    };

    merchantConfig.upiAccounts.push(newAccount);

    // If primary, also update directUpi settings
    if (newAccount.isPrimary) {
      merchantConfig.directUpi.vpa = newAccount.vpa;
      merchantConfig.directUpi.name = newAccount.name;
    }

    res.json({
      success: true,
      message: `UPI ID ${newAccount.vpa} added successfully and enabled`,
      account: newAccount,
      accounts: merchantConfig.upiAccounts,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle UPI Account ON / OFF
app.post('/api/upi-accounts/:id/toggle', (req, res) => {
  const account = merchantConfig.upiAccounts.find((a) => a.id === req.params.id);
  if (!account) {
    return res.status(404).json({ success: false, error: 'UPI account not found' });
  }

  account.enabled = !account.enabled;

  // If turning off a primary account, make another enabled account primary if exists
  if (!account.enabled && account.isPrimary) {
    account.isPrimary = false;
    const nextActive = merchantConfig.upiAccounts.find((a) => a.id !== account.id && a.enabled);
    if (nextActive) {
      nextActive.isPrimary = true;
      merchantConfig.directUpi.vpa = nextActive.vpa;
      merchantConfig.directUpi.name = nextActive.name;
    }
  }

  res.json({
    success: true,
    message: `UPI ID ${account.vpa} is now ${account.enabled ? 'ONLINE (ON)' : 'DISABLED (OFF)'}`,
    account,
    accounts: merchantConfig.upiAccounts,
  });
});

// Set UPI Account as Primary
app.post('/api/upi-accounts/:id/set-primary', (req, res) => {
  const account = merchantConfig.upiAccounts.find((a) => a.id === req.params.id);
  if (!account) {
    return res.status(404).json({ success: false, error: 'UPI account not found' });
  }

  // Ensure it's enabled when made primary
  account.enabled = true;
  merchantConfig.upiAccounts.forEach((a) => {
    a.isPrimary = a.id === account.id;
  });

  merchantConfig.directUpi.vpa = account.vpa;
  merchantConfig.directUpi.name = account.name;

  res.json({
    success: true,
    message: `${account.vpa} set as Primary UPI channel`,
    accounts: merchantConfig.upiAccounts,
  });
});

// Delete UPI Account
app.delete('/api/upi-accounts/:id', (req, res) => {
  if (merchantConfig.upiAccounts.length <= 1) {
    return res.status(400).json({ success: false, error: 'Cannot delete the only UPI account' });
  }

  const index = merchantConfig.upiAccounts.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'UPI account not found' });
  }

  const deleted = merchantConfig.upiAccounts.splice(index, 1)[0];
  if (deleted.isPrimary && merchantConfig.upiAccounts.length > 0) {
    merchantConfig.upiAccounts[0].isPrimary = true;
    merchantConfig.upiAccounts[0].enabled = true;
    merchantConfig.directUpi.vpa = merchantConfig.upiAccounts[0].vpa;
    merchantConfig.directUpi.name = merchantConfig.upiAccounts[0].name;
  }

  res.json({
    success: true,
    message: `UPI account ${deleted.vpa} removed`,
    accounts: merchantConfig.upiAccounts,
  });
});

// Manually Add a Transaction / Payment Record
app.post('/api/orders/manual-add', async (req, res) => {
  try {
    const { amount, customerName, customerPhone, customerEmail, note, status = 'SUCCESS', utr, upiAccountId } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
    }

    const orderId = `pay_man_${crypto.randomBytes(4).toString('hex')}`;
    const targetAccount = merchantConfig.upiAccounts.find((a) => a.id === upiAccountId) ||
      merchantConfig.upiAccounts.find((a) => a.isPrimary) ||
      merchantConfig.upiAccounts[0];

    const targetVpa = targetAccount ? targetAccount.vpa : merchantConfig.directUpi.vpa;
    const targetName = targetAccount ? targetAccount.name : merchantConfig.directUpi.name;

    const qrResult = await generateUPIQR({
      vpa: targetVpa,
      name: targetName,
      amount: parsedAmount,
      orderId,
      note: note?.trim() || 'Direct UPI Payment',
      mc: merchantConfig.directUpi.mcc,
    });

    const nowIso = new Date().toISOString();
    const finalStatus = status === 'PENDING' ? 'PENDING' : 'SUCCESS';
    const finalUtr = finalStatus === 'SUCCESS' ? (utr?.trim() || generateMockUTR()) : undefined;

    const timeline: PaymentTimelineEvent[] = [
      {
        id: crypto.randomUUID(),
        timestamp: nowIso,
        title: 'Transaction Recorded (Manual Add)',
        description: `₹${parsedAmount.toFixed(2)} recorded by Admin`,
        type: 'info',
      },
    ];

    if (finalStatus === 'SUCCESS') {
      timeline.push({
        id: crypto.randomUUID(),
        timestamp: nowIso,
        title: 'Payment Marked Successful',
        description: `Credited to ${targetVpa}. UTR: ${finalUtr}`,
        type: 'success',
      });
    }

    const newOrder: GatewayOrder = {
      orderId,
      amount: parsedAmount,
      amountInPaise: rupeesToPaise(parsedAmount),
      currency: 'INR',
      customerName: customerName?.trim() || 'Manual Customer',
      customerPhone: customerPhone?.trim() || '',
      customerEmail: customerEmail?.trim() || '',
      note: note?.trim() || 'Manual payment entry',
      status: finalStatus,
      provider: merchantConfig.providerMode,
      vpa: targetVpa,
      payeeName: targetName,
      upiUri: qrResult.upiUri,
      qrImage: qrResult.qrImage,
      intentLinks: buildIntentLinks(qrResult.upiUri),
      utr: finalUtr,
      createdAt: nowIso,
      updatedAt: nowIso,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      timeline,
    };

    orders.set(orderId, newOrder);

    res.json({
      success: true,
      message: `Transaction ${orderId} added successfully`,
      order: newOrder,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle Order Status between PENDING and SUCCESS
app.post('/api/orders/:orderId/toggle-status', (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const nowIso = new Date().toISOString();
  if (order.status === 'SUCCESS') {
    order.status = 'PENDING';
    order.timeline.push({
      id: crypto.randomUUID(),
      timestamp: nowIso,
      title: 'Status Toggled to PENDING',
      description: 'Transaction changed to Pending by merchant',
      type: 'warning',
    });
  } else {
    order.status = 'SUCCESS';
    if (!order.utr) {
      order.utr = generateMockUTR();
    }
    order.timeline.push({
      id: crypto.randomUUID(),
      timestamp: nowIso,
      title: 'Status Toggled to SUCCESS',
      description: `Payment approved by merchant. UTR: ${order.utr}`,
      type: 'success',
    });
  }

  order.updatedAt = nowIso;
  res.json({ success: true, order, message: `Status changed to ${order.status}` });
});

// Get Gateway Analytics & Statistics
app.get('/api/stats', (req, res) => {
  const allOrders = Array.from(orders.values());
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  let totalRevenue = 0;
  let successfulCount = 0;
  let pendingCount = 0;
  let failedCount = 0;
  let refundedCount = 0;
  let todayRevenue = 0;
  let todayCount = 0;

  for (const order of allOrders) {
    const orderTime = new Date(order.createdAt).getTime();
    const isToday = orderTime >= startOfDay;

    if (order.status === 'SUCCESS') {
      totalRevenue += order.amount;
      successfulCount++;
      if (isToday) {
        todayRevenue += order.amount;
        todayCount++;
      }
    } else if (order.status === 'PENDING') {
      pendingCount++;
    } else if (order.status === 'FAILED') {
      failedCount++;
    } else if (order.status === 'REFUNDED') {
      refundedCount++;
    }
  }

  const totalTransactions = allOrders.length;
  const successRate = totalTransactions > 0 ? (successfulCount / totalTransactions) * 100 : 0;
  const averageOrderValue = successfulCount > 0 ? totalRevenue / successfulCount : 0;

  const stats: GatewayStats = {
    totalRevenue,
    totalTransactions,
    successfulCount,
    pendingCount,
    failedCount,
    refundedCount,
    successRate: parseFloat(successRate.toFixed(1)),
    averageOrderValue: Math.round(averageOrderValue),
    todayRevenue,
    todayCount,
  };

  res.json({ success: true, stats });
});

// List Orders with Filters
app.get('/api/orders', (req, res) => {
  const { status, search, limit = '50' } = req.query;
  let list = Array.from(orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (status && status !== 'ALL') {
    list = list.filter((o) => o.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (o) =>
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        (o.utr && o.utr.toLowerCase().includes(q)) ||
        o.note.toLowerCase().includes(q)
    );
  }

  const max = parseInt(limit as string, 10) || 50;
  res.json({ success: true, orders: list.slice(0, max), total: list.length });
});

// Get Single Order
app.get('/api/orders/:orderId', (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, order });
});

// Create New Payment Intent / Order
app.post('/api/orders/create', async (req, res) => {
  try {
    if (merchantConfig.gatewayOnline === false) {
      return res.status(403).json({
        success: false,
        error: 'Payment gateway is currently OFFLINE (Turned OFF by Merchant). Please switch ON in Admin Dashboard to resume accepting payments.',
      });
    }

    const { amount, customerName, customerPhone, customerEmail, note, orderId: customOrderId, upiAccountId } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
    }

    const orderId = customOrderId && customOrderId.trim() !== ''
      ? customOrderId.trim()
      : `pay_${crypto.randomBytes(4).toString('hex')}`;

    const sanitizedName = customerName?.trim() || 'Customer';
    const sanitizedPhone = customerPhone?.trim() || '';
    const sanitizedEmail = customerEmail?.trim() || '';
    const sanitizedNote = note?.trim() || merchantConfig.directUpi.notePrefix || 'UPI Payment';

    // Find requested UPI Account or Primary Enabled Account or first enabled
    const targetAccount = upiAccountId
      ? merchantConfig.upiAccounts?.find((a) => a.id === upiAccountId && a.enabled)
      : (merchantConfig.upiAccounts?.find((a) => a.isPrimary && a.enabled) || merchantConfig.upiAccounts?.find((a) => a.enabled));

    const targetVpa = targetAccount ? targetAccount.vpa : merchantConfig.directUpi.vpa;
    const targetName = targetAccount ? targetAccount.name : merchantConfig.directUpi.name;

    // Generate UPI QR Code and Intent links using the core UPIPay library logic
    const qrResult = await generateUPIQR({
      vpa: targetVpa,
      name: targetName,
      amount: parsedAmount,
      orderId,
      note: sanitizedNote,
      mc: merchantConfig.directUpi.mcc,
    });

    const nowIso = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 15 * 60000).toISOString(); // 15 mins window

    const timeline: PaymentTimelineEvent[] = [
      {
        id: crypto.randomUUID(),
        timestamp: nowIso,
        title: 'Payment Session Initialized',
        description: `₹${parsedAmount.toFixed(2)} via ${targetVpa} (${targetName})`,
        type: 'info',
      },
    ];

    const newOrder: GatewayOrder = {
      orderId,
      amount: parsedAmount,
      amountInPaise: rupeesToPaise(parsedAmount),
      currency: 'INR',
      customerName: sanitizedName,
      customerPhone: sanitizedPhone,
      customerEmail: sanitizedEmail,
      note: sanitizedNote,
      status: 'PENDING',
      provider: merchantConfig.providerMode,
      vpa: targetVpa,
      payeeName: targetName,
      upiUri: qrResult.upiUri,
      qrImage: qrResult.qrImage,
      intentLinks: buildIntentLinks(qrResult.upiUri),
      createdAt: nowIso,
      updatedAt: nowIso,
      expiresAt,
      timeline,
    };

    orders.set(orderId, newOrder);

    res.json({
      success: true,
      order: newOrder,
      message: 'Payment session created successfully',
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create payment order' });
  }
});

// Simulate Successful Customer Payment (For Sandbox Testing / UPI App simulator)
app.post('/api/orders/:orderId/simulate-payment', (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  if (order.status === 'SUCCESS') {
    return res.json({ success: true, order, message: 'Order is already marked as SUCCESS' });
  }

  const utr = generateMockUTR();
  const nowIso = new Date().toISOString();

  order.status = 'SUCCESS';
  order.utr = utr;
  order.updatedAt = nowIso;
  order.timeline.push({
    id: crypto.randomUUID(),
    timestamp: nowIso,
    title: 'Payment Received via UPI',
    description: `Customer authenticated payment on UPI app. Bank UTR: ${utr}`,
    type: 'success',
  });

  orders.set(order.orderId, order);

  res.json({
    success: true,
    order,
    message: 'Payment simulated successfully!',
  });
});

// Customer submits 12-digit UTR/Ref Number
app.post('/api/orders/:orderId/submit-utr', (req, res) => {
  const { utr } = req.body;
  const order = orders.get(req.params.orderId);

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  if (!utr || typeof utr !== 'string' || utr.trim().length < 6) {
    return res.status(400).json({ success: false, error: 'Please enter a valid 12-digit UTR/Reference number' });
  }

  const cleanUtr = utr.trim();
  const nowIso = new Date().toISOString();

  order.utr = cleanUtr;
  order.updatedAt = nowIso;

  if (merchantConfig.autoApproveSimulated) {
    order.status = 'SUCCESS';
    order.timeline.push({
      id: crypto.randomUUID(),
      timestamp: nowIso,
      title: 'UTR Verified & Payment Confirmed',
      description: `UTR ${cleanUtr} verified via instant bank settlement stream`,
      type: 'success',
    });
  } else {
    order.timeline.push({
      id: crypto.randomUUID(),
      timestamp: nowIso,
      title: 'UTR Submitted by Customer',
      description: `Customer reported UTR: ${cleanUtr}. Awaiting admin reconciliation.`,
      type: 'info',
    });
  }

  orders.set(order.orderId, order);

  res.json({
    success: true,
    order,
    message: merchantConfig.autoApproveSimulated
      ? 'Payment verified successfully!'
      : 'UTR received. We are verifying with the bank.',
  });
});

// Admin Manual Action: Mark as SUCCESS or FAILED
app.post('/api/orders/:orderId/verify', (req, res) => {
  const { action, utr } = req.body; // action: 'APPROVE' | 'REJECT'
  const order = orders.get(req.params.orderId);

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const nowIso = new Date().toISOString();

  if (action === 'APPROVE') {
    order.status = 'SUCCESS';
    if (utr) order.utr = utr.trim();
    if (!order.utr) order.utr = generateMockUTR();
    order.updatedAt = nowIso;
    order.timeline.push({
      id: crypto.randomUUID(),
      timestamp: nowIso,
      title: 'Manual Approval by Merchant Admin',
      description: `Payment marked confirmed with UTR: ${order.utr}`,
      type: 'success',
    });
  } else {
    order.status = 'FAILED';
    order.updatedAt = nowIso;
    order.timeline.push({
      id: crypto.randomUUID(),
      timestamp: nowIso,
      title: 'Rejected by Merchant Admin',
      description: 'Transaction flagged as invalid or unverified in bank statement.',
      type: 'error',
    });
  }

  orders.set(order.orderId, order);
  res.json({ success: true, order });
});

// Initiate Refund
app.post('/api/orders/:orderId/refund', (req, res) => {
  const { reason = 'Merchant initiated refund' } = req.body;
  const order = orders.get(req.params.orderId);

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  if (order.status !== 'SUCCESS') {
    return res.status(400).json({ success: false, error: 'Only successful payments can be refunded' });
  }

  const nowIso = new Date().toISOString();
  const refundId = `ref_${crypto.randomBytes(4).toString('hex')}`;

  order.status = 'REFUNDED';
  order.refundDetails = {
    refundId,
    amount: order.amount,
    reason,
    timestamp: nowIso,
  };
  order.updatedAt = nowIso;
  order.timeline.push({
    id: crypto.randomUUID(),
    timestamp: nowIso,
    title: 'Refund Processed',
    description: `Refund ID: ${refundId}. Full amount ₹${order.amount.toFixed(2)} initiated to source VPA.`,
    type: 'warning',
  });

  orders.set(order.orderId, order);
  res.json({ success: true, order, message: 'Refund processed successfully' });
});

// Webhook Receiver (For PhonePe / Paytm / Partner PSPs)
app.post('/api/webhook', (req, res) => {
  const signature = req.headers['x-verify'] || req.headers['x-signature'];
  console.log('[Webhook Received]', { headers: req.headers, body: req.body });

  const { orderId, transactionId, status, amount } = req.body;

  if (orderId && orders.has(orderId)) {
    const order = orders.get(orderId)!;
    const nowIso = new Date().toISOString();

    if (status === 'COMPLETED' || status === 'SUCCESS') {
      order.status = 'SUCCESS';
      if (transactionId) order.utr = transactionId;
      order.updatedAt = nowIso;
      order.timeline.push({
        id: crypto.randomUUID(),
        timestamp: nowIso,
        title: 'Webhook Event: Payment Completed',
        description: `PSP confirmed payment via webhook. Txn ID: ${transactionId || 'N/A'}`,
        type: 'success',
      });
      orders.set(orderId, order);
    }
  }

  res.status(200).json({ received: true, timestamp: new Date().toISOString() });
});

// Webhook Simulator for Developers
app.post('/api/webhook/simulate', async (req, res) => {
  const { orderId, status = 'SUCCESS' } = req.body;
  const order = orders.get(orderId);

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const payload = {
    event: 'PAYMENT_SUCCESS',
    orderId: order.orderId,
    amount: order.amountInPaise,
    transactionId: generateMockUTR(),
    provider: merchantConfig.providerMode,
    timestamp: new Date().toISOString(),
  };

  const calculatedSignature = crypto
    .createHmac('sha256', merchantConfig.webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  res.json({
    success: true,
    message: 'Webhook payload generated and simulated',
    targetUrl: merchantConfig.webhookUrl,
    header: { 'x-verify': calculatedSignature },
    payload,
  });
});

// ─── Server Startup & Vite Integration ──────────────────────────────────────
export default app;


async function startServer() {
  await seedInitialOrders();

  // Skip static serving and binding port if running as Vercel serverless function
  if (process.env.VERCEL) {
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UPI Payment Gateway running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  if (!process.env.VERCEL) process.exit(1);
});
