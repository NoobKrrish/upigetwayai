export type ProviderMode = 'direct_upi' | 'phonepe' | 'paytm';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface UpiAccount {
  id: string;
  vpa: string; // e.g. "robin@upi"
  name: string; // e.g. "Robin Store"
  bankName: string; // e.g. "HDFC Bank", "State Bank of India"
  enabled: boolean; // ON / OFF switch
  isPrimary: boolean;
  dailyLimit?: number; // Optional limit in ₹
  createdAt: string;
}

export interface GatewayToggles {
  gatewayOnline: boolean; // Master ON/OFF
  gpayEnabled: boolean; // ON/OFF
  phonepeEnabled: boolean; // ON/OFF
  paytmEnabled: boolean; // ON/OFF
  bhimEnabled: boolean; // ON/OFF
  autoApproveUtr: boolean; // ON/OFF
  soundboxVoice: boolean; // ON/OFF
}

export interface MerchantConfig {
  gatewayOnline: boolean;
  providerMode: ProviderMode;
  directUpi: {
    vpa: string;
    name: string;
    mcc: string;
    notePrefix: string;
  };
  upiAccounts: UpiAccount[];
  toggles: GatewayToggles;
  phonepe: {
    merchantId: string;
    saltKey: string;
    saltIndex: string;
    environment: 'sandbox' | 'production';
    enabled: boolean;
  };
  paytm: {
    mid: string;
    merchantKey: string;
    website: string;
    environment: 'stage' | 'production';
    enabled: boolean;
  };
  webhookUrl: string;
  webhookSecret: string;
  autoApproveSimulated: boolean;
}

export interface PaymentTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface GatewayOrder {
  orderId: string;
  amount: number; // in Rupees
  amountInPaise: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  note: string;
  status: PaymentStatus;
  provider: ProviderMode;
  upiUri: string;
  qrImage: string;
  intentLinks: {
    generic: string;
    phonepe: string;
    gpay: string;
    paytm: string;
    bhim: string;
  };
  vpa?: string;
  payeeName?: string;
  utr?: string;
  refundDetails?: {
    refundId: string;
    amount: number;
    reason: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  timeline: PaymentTimelineEvent[];
}

export interface CreateOrderInput {
  amount: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  note?: string;
  orderId?: string;
  upiAccountId?: string;
}

export interface ManualTransactionInput {
  amount: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  note?: string;
  status: PaymentStatus;
  utr?: string;
  upiAccountId?: string;
}

export interface AddUpiAccountInput {
  vpa: string;
  name: string;
  bankName: string;
  dailyLimit?: number;
  isPrimary?: boolean;
}

export interface GatewayStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
  successRate: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayCount: number;
}
