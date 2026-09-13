import React, { useState } from 'react';
import { Terminal, Copy, Check, Code2, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';
import type { MerchantConfig } from '../types/gateway';

interface ApiDocsPanelProps {
  config: MerchantConfig | null;
}

export const ApiDocsPanel: React.FC<ApiDocsPanelProps> = ({ config }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const curlCreateOrder = `curl -X POST "${window.location.origin}/api/orders/create" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 499.00,
    "customerName": "Rahul Sharma",
    "customerPhone": "+919876543210",
    "note": "Web Hosting Plan Pro"
  }'`;

  const nodeSdkCode = `// Install via npm: npm install upipay
import { UPIPay, generateUPIQR, rupeesToPaise } from 'upipay';

// 1. Direct UPI Mode (Zero Commission - No Merchant Account Needed)
const qr = await generateUPIQR({
  vpa: '${config?.directUpi.vpa || 'merchant@upi'}',
  name: '${config?.directUpi.name || 'Robin Store'}',
  amount: 499.00,
  orderId: 'order_12345',
  note: 'Invoice #1024',
});

console.log('UPI URI for apps:', qr.upiUri);
console.log('QR base64 PNG data URL:', qr.qrImage);

// 2. Or using PhonePe / Paytm Adapter
const client = new UPIPay({
  provider: 'phonepe',
  environment: 'sandbox',
  credentials: {
    merchantId: process.env.PHONEPE_MERCHANT_ID,
    saltKey: process.env.PHONEPE_SALT_KEY,
    saltIndex: '1',
  },
});`;

  const webhookVerifyCode = `// Express Webhook Listener with upipay
import express from 'express';
import { UPIPay } from 'upipay';

const app = express();

app.post('/api/webhook', express.raw({ type: '*/*' }), (req, res) => {
  const signature = req.headers['x-verify'];
  const event = client.verifyWebhook(req.body, signature);

  if (!event.verified) {
    return res.status(401).send('Invalid signature');
  }

  console.log('Payment confirmed for order:', event.orderId);
  // Fulfill order in your database
  res.status(200).send('OK');
});`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-600">
          <Terminal className="w-6 h-6" />
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Developer Integration Guide
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Integrate the UPI payment gateway into your apps, websites, or checkout pages in under 5 minutes.
          Using the open-source <strong>upipay</strong> engine, all payments flow straight from the customer's UPI app
          to your bank account with zero fees.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Bank Credit</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Direct settlement via NPCI without 24-48h gateway holds.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>₹0 Processing Fees</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Save 2-3% on every transaction compared to traditional aggregators.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Multi-App Deep Links</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports Google Pay, PhonePe, Paytm, BHIM, Cred, and WhatsApp Pay.
            </p>
          </div>
        </div>
      </div>

      {/* Code Snippet 1: Create Order API */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
              POST
            </span>
            <span className="text-xs font-mono text-slate-300">/api/orders/create</span>
          </div>
          <button
            onClick={() => copyToClipboard(curlCreateOrder, 'curl')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            {copiedCode === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode === 'curl' ? 'Copied' : 'Copy cURL'}</span>
          </button>
        </div>
        <pre className="text-xs font-mono text-slate-200 overflow-x-auto p-3 bg-slate-950/70 rounded-xl">
          {curlCreateOrder}
        </pre>
      </div>

      {/* Code Snippet 2: Node.js & upipay */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">Node.js / Express with 'upipay'</span>
          </div>
          <button
            onClick={() => copyToClipboard(nodeSdkCode, 'node')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            {copiedCode === 'node' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode === 'node' ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
        <pre className="text-xs font-mono text-slate-200 overflow-x-auto p-3 bg-slate-950/70 rounded-xl leading-relaxed">
          {nodeSdkCode}
        </pre>
      </div>

      {/* Code Snippet 3: Webhook Verification */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">Webhook Signature Verification</span>
          </div>
          <button
            onClick={() => copyToClipboard(webhookVerifyCode, 'webhook')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            {copiedCode === 'webhook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode === 'webhook' ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
        <pre className="text-xs font-mono text-slate-200 overflow-x-auto p-3 bg-slate-950/70 rounded-xl leading-relaxed">
          {webhookVerifyCode}
        </pre>
      </div>
    </div>
  );
};
