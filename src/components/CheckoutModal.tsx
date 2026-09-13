import React, { useState, useEffect } from 'react';
import {
  QrCode,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Smartphone,
  CreditCard,
  AlertCircle,
  Receipt,
  ArrowRight,
  Info,
  PowerOff,
} from 'lucide-react';
import type { GatewayOrder, MerchantConfig } from '../types/gateway';
import { simulatePayment, submitUtr, fetchOrder } from '../services/api';
import { playSoundboxAnnouncement } from '../lib/soundbox';

interface CheckoutModalProps {
  order: GatewayOrder | null;
  config: MerchantConfig | null;
  onClose?: () => void;
  onOpenReceipt: (order: GatewayOrder) => void;
  onPaymentUpdated: (updatedOrder: GatewayOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  order,
  config,
  onClose,
  onOpenReceipt,
  onPaymentUpdated,
}) => {
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [utrSubmitting, setUtrSubmitting] = useState(false);
  const [utrError, setUtrError] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 minutes
  const [hasAnnounced, setHasAnnounced] = useState(false);

  const activeOrder = order;
  const isGatewayOnline = config?.gatewayOnline ?? true;
  const toggles = config?.toggles || {
    gatewayOnline: true,
    gpayEnabled: true,
    phonepeEnabled: true,
    paytmEnabled: true,
    bhimEnabled: true,
    autoApproveUtr: true,
    soundboxVoice: true,
  };

  // Countdown timer
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'PENDING') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeOrder?.status]);

  // Polling order status while pending
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'PENDING') return;

    const interval = setInterval(async () => {
      try {
        const latest = await fetchOrder(activeOrder.orderId);
        if (latest && latest.status !== 'PENDING') {
          onPaymentUpdated(latest);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeOrder?.orderId, activeOrder?.status]);

  // Trigger Soundbox voice alert when payment is successful
  useEffect(() => {
    if (activeOrder?.status === 'SUCCESS' && !hasAnnounced) {
      setHasAnnounced(true);
      if (toggles.soundboxVoice !== false) {
        const merchantTitle = activeOrder.payeeName || config?.directUpi.name || 'Robin UPI';
        playSoundboxAnnouncement(activeOrder.amount, merchantTitle);
      }
    }
  }, [activeOrder?.status, hasAnnounced, toggles.soundboxVoice, config?.directUpi.name]);

  if (!activeOrder) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
        <p className="text-slate-500">No active payment order selected.</p>
      </div>
    );
  }

  // Display UPI VPA & Payee Name from order or fallback to config
  const displayVpa = activeOrder.vpa || config?.directUpi.vpa || 'merchant@upi';
  const displayPayeeName = activeOrder.payeeName || config?.directUpi.name || 'Merchant Store';

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(displayVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleCopyUri = () => {
    navigator.clipboard.writeText(activeOrder.upiUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  // Submit 12-digit UTR ref
  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError('');
    if (!utrInput.trim()) {
      setUtrError('Please enter the 12-digit UTR reference number from your UPI app');
      return;
    }

    setUtrSubmitting(true);
    try {
      const updated = await submitUtr(activeOrder.orderId, utrInput.trim());
      onPaymentUpdated(updated);
      setUtrInput('');
    } catch (err: any) {
      setUtrError(err.message || 'Failed to verify UTR');
    } finally {
      setUtrSubmitting(false);
    }
  };

  // Sandbox 1-click test simulation
  const handleSimulatePayment = async () => {
    setSimulating(true);
    try {
      const updated = await simulatePayment(activeOrder.orderId);
      onPaymentUpdated(updated);
    } catch (err: any) {
      alert(err.message || 'Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  // If Gateway is turned OFF by admin
  if (!isGatewayOnline && activeOrder.status === 'PENDING') {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 shadow-xl overflow-hidden max-w-lg mx-auto text-center p-8">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <PowerOff className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Gateway Offline</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          The merchant has currently turned OFF this payment gateway channel. No transactions can be accepted right now.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-sm"
          >
            Close / Return to Dashboard
          </button>
        )}
      </div>
    );
  }

  // SUCCESS PAYMENT VIEW
  if (activeOrder.status === 'SUCCESS') {
    return (
      <div className="bg-white rounded-3xl border border-emerald-200 shadow-2xl overflow-hidden max-w-lg mx-auto animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-b from-emerald-600 to-emerald-700 text-white p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Check className="w-10 h-10 text-white stroke-[3]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Payment Successful!</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Amount credited directly to merchant bank account
          </p>
          <div className="mt-4 inline-block bg-white/20 backdrop-blur-xs px-4 py-1.5 rounded-full text-xs font-mono text-white">
            Order #{activeOrder.orderId}
          </div>
        </div>

        {/* Transaction Summary Box */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Amount Paid</span>
              <span className="text-xl font-black text-slate-900">
                ₹{activeOrder.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Payee (Merchant)</span>
              <span className="font-semibold text-slate-800">{displayPayeeName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Merchant VPA</span>
              <span className="font-mono text-slate-700">{displayVpa}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Customer Name</span>
              <span className="font-medium text-slate-800">{activeOrder.customerName}</span>
            </div>
            {activeOrder.utr && (
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500">Bank Ref / UTR</span>
                <span className="font-mono font-bold text-emerald-700">{activeOrder.utr}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Status</span>
              <span className="font-bold text-emerald-600 uppercase">Settled (0% MDR Fee)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 space-y-3">
          <button
            id="btn-view-receipt-success"
            onClick={() => onOpenReceipt(activeOrder)}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            <span>View & Download Receipt</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all"
            >
              Done / Return
            </button>
          )}
        </div>
      </div>
    );
  }

  // PENDING PAYMENT VIEW
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-xl mx-auto">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
              UPI Instant Checkout
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg text-xs font-mono text-amber-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Expires in {formatTimer(secondsRemaining)}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-t border-slate-800 pt-3">
          <div>
            <span className="text-xs text-slate-400">Total Payable</span>
            <div className="text-3xl font-black tracking-tight text-white">
              ₹{activeOrder.amount.toFixed(2)}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">Paying To</span>
            <div className="text-sm font-semibold text-slate-200">
              {displayPayeeName}
            </div>
            <div className="text-xs font-mono text-slate-400">
              {displayVpa}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* QR Code Presentation */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md relative group">
            <img
              src={activeOrder.qrImage}
              alt="UPI Payment QR Code"
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
            />
            {/* NPCI / UPI Watermark Ribbon */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 rounded-full border border-slate-200 shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-slate-700 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scan with any UPI App</span>
            </div>
          </div>

          {/* Supported UPI Apps Row */}
          <div className="mt-5 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500">
            {toggles.gpayEnabled && <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">Google Pay</span>}
            {toggles.phonepeEnabled && <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">PhonePe</span>}
            {toggles.paytmEnabled && <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">Paytm</span>}
            {toggles.bhimEnabled && <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">BHIM UPI</span>}
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">Cred</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">+140 Banks</span>
          </div>
        </div>

        {/* Mobile UPI Intent Buttons (Controlled by ON/OFF Toggles) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Tap to Pay Directly on Mobile:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {toggles.gpayEnabled && (
              <a
                href={activeOrder.intentLinks.gpay}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-all"
              >
                <span>Google Pay</span>
              </a>
            )}
            {toggles.phonepeEnabled && (
              <a
                href={activeOrder.intentLinks.phonepe}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-purple-900 transition-all"
              >
                <span>PhonePe</span>
              </a>
            )}
            {toggles.paytmEnabled && (
              <a
                href={activeOrder.intentLinks.paytm}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-900 transition-all"
              >
                <span>Paytm</span>
              </a>
            )}
            {toggles.bhimEnabled && (
              <a
                href={activeOrder.intentLinks.generic}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-900 transition-all"
              >
                <span>BHIM / UPI</span>
              </a>
            )}
          </div>
        </div>

        {/* Copy UPI VPA Details Bar */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Merchant UPI ID: </span>
            <span className="font-mono font-bold text-slate-900">
              {displayVpa}
            </span>
          </div>
          <button
            onClick={handleCopyVpa}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 font-medium text-slate-700 transition-all"
          >
            {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedVpa ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Manual UTR Verification Form */}
        <form onSubmit={handleUtrSubmit} className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Already Paid? Enter 12-digit UPI UTR / Ref Number:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 425918274012"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={utrSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {utrSubmitting ? 'Verifying...' : 'Submit UTR'}
            </button>
          </div>
          {utrError && <p className="text-xs text-rose-600 mt-1">{utrError}</p>}
        </form>

        {/* Sandbox Quick Test Simulator Box */}
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950">Gateway Sandbox Simulation</p>
                <p className="text-[11px] text-emerald-700">
                  Simulate incoming bank clearance webhook (credit webhook)
                </p>
              </div>
            </div>
            <button
              id="btn-simulate-checkout-success"
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all whitespace-nowrap disabled:opacity-50"
            >
              {simulating ? 'Processing...' : 'Simulate Success'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
