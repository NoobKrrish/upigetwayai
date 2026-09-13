import React, { useState } from 'react';
import {
  QrCode,
  IndianRupee,
  Link,
  Printer,
  Sparkles,
  ShieldCheck,
  Download,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Smartphone,
} from 'lucide-react';
import type { MerchantConfig, GatewayOrder } from '../types/gateway';
import { createOrder } from '../services/api';

interface PaymentLinkGeneratorProps {
  config: MerchantConfig | null;
  onOrderCreated: (order: GatewayOrder) => void;
}

export const PaymentLinkGenerator: React.FC<PaymentLinkGeneratorProps> = ({
  config,
  onOrderCreated,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'instant_link' | 'merchant_standee'>('instant_link');

  // Form states for Instant Link
  const [amount, setAmount] = useState('199');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [note, setNote] = useState('Payment for Order');
  const [customOrderId, setCustomOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<GatewayOrder | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Standee customization
  const [standeeAmount, setStandeeAmount] = useState('');
  const [standeeNote, setStandeeNote] = useState('Scan & Pay with Any UPI App');
  const [selectedUpiId, setSelectedUpiId] = useState('');

  const activeAccounts = (config?.upiAccounts || []).filter((a) => a.enabled);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder({
        amount: num,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        note: note.trim() || undefined,
        orderId: customOrderId.trim() || undefined,
        upiAccountId: selectedUpiId || undefined,
      });

      setCreatedOrder(order);
      onOrderCreated(order);
    } catch (err: any) {
      alert(err.message || 'Failed to generate payment session');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPaymentLink = () => {
    if (!createdOrder) return;
    const url = `${window.location.origin}/?orderId=${createdOrder.orderId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Sub-navigation tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto">
        <button
          onClick={() => setActiveSubTab('instant_link')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'instant_link'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Create Payment Link
        </button>
        <button
          onClick={() => setActiveSubTab('merchant_standee')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'merchant_standee'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Retail Shop Standee QR
        </button>
      </div>

      {/* Tab 1: Create Instant Payment Link & Order */}
      {activeSubTab === 'instant_link' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Form */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Link className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Generate Payment Order</h2>
                <p className="text-xs text-slate-500">
                  Creates an NPCI dynamic QR code & mobile deep links
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              {/* Amount input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Amount (INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="299.00"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Amount Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {['99', '199', '499', '999', '2499'].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setAmount(val)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mobile / Phone
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Purpose Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Payment Purpose / Note
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Invoice #1024 or Digital Goods"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Custom Order ID (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Custom Order ID (Optional)
                </label>
                <input
                  type="text"
                  value={customOrderId}
                  onChange={(e) => setCustomOrderId(e.target.value)}
                  placeholder="Leave empty for auto-generated ID"
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Route to UPI Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Settlement UPI Account
                </label>
                <select
                  value={selectedUpiId}
                  onChange={(e) => setSelectedUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">Default Active Channel ({config?.directUpi.vpa})</option>
                  {activeAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} - {acc.vpa} ({acc.name}) {acc.isPrimary ? '★ Primary' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Generating UPI QR...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Payment Order</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Result Preview */}
          <div className="md:col-span-5 flex flex-col justify-center">
            {createdOrder ? (
              <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-lg text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Payment Ready</span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs inline-block">
                  <img
                    src={createdOrder.qrImage}
                    alt="Generated UPI QR"
                    className="w-44 h-44 object-contain mx-auto"
                  />
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-medium">Payable Amount</span>
                  <div className="text-2xl font-black text-slate-900">
                    ₹{createdOrder.amount.toFixed(2)}
                  </div>
                  <span className="font-mono text-xs text-slate-500">{createdOrder.orderId}</span>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => onOrderCreated(createdOrder)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <span>Open Live Checkout Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleCopyPaymentLink}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Payment Web Link'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
                <QrCode className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-600" />
                <p className="font-semibold text-slate-600 text-sm">QR Code Preview</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Fill in the details on the left and click "Create Payment Order" to generate an instant QR code.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Retail Shop Standee Badge */}
      {activeSubTab === 'merchant_standee' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Customizer */}
          <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Customise Standee Card</h2>
            <p className="text-xs text-slate-500">
              Generate a printable UPI standee for shops, counters, or physical business locations.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Fixed Amount (Leave blank for Open Amount)
              </label>
              <input
                type="number"
                value={standeeAmount}
                onChange={(e) => setStandeeAmount(e.target.value)}
                placeholder="Open amount (customer enters value)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Standee Instruction Text
              </label>
              <input
                type="text"
                value={standeeNote}
                onChange={(e) => setStandeeNote(e.target.value)}
                placeholder="Scan & Pay with Any UPI App"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Standee Badge</span>
              </button>
            </div>
          </div>

          {/* Right Standee Visual Display */}
          <div className="md:col-span-6 flex justify-center">
            <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white text-center shadow-2xl border-4 border-slate-700 relative overflow-hidden">
              {/* Merchant Title */}
              <div className="mb-4">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 tracking-wider uppercase mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Accepted Here</span>
                </div>
                <h3 className="text-lg font-black text-white">
                  {config?.directUpi.name || 'Robin Store'}
                </h3>
                <p className="text-[11px] font-mono text-slate-300">
                  {config?.directUpi.vpa || 'merchant@upi'}
                </p>
              </div>

              {/* QR Container */}
              <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-xl overflow-hidden">
                  <QrCode className="w-40 h-40 text-slate-900" />
                </div>
              </div>

              {/* Amount badge if specified */}
              {standeeAmount && (
                <div className="mt-3 bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black inline-block">
                  Exact Amount: ₹{parseFloat(standeeAmount).toFixed(2)}
                </div>
              )}

              {/* Instruction */}
              <p className="mt-3 text-xs font-medium text-slate-300">{standeeNote}</p>

              {/* Brand Acceptance Logos Footer */}
              <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>GPay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
