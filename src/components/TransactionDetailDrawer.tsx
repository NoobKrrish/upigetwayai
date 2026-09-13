import React, { useState } from 'react';
import {
  X,
  IndianRupee,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Copy,
  Check,
  Receipt,
  Terminal,
  Send,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { GatewayOrder, MerchantConfig, PaymentStatus } from '../types/gateway';
import { verifyOrder, refundOrder, simulateWebhook } from '../services/api';

interface TransactionDetailDrawerProps {
  order: GatewayOrder | null;
  config: MerchantConfig | null;
  onClose: () => void;
  onOpenReceipt: (order: GatewayOrder) => void;
  onOrderUpdated: (order: GatewayOrder) => void;
}

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  order,
  config,
  onClose,
  onOpenReceipt,
  onOrderUpdated,
}) => {
  const [copiedUri, setCopiedUri] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [customUtr, setCustomUtr] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);

  if (!order) return null;

  const handleCopyUri = () => {
    navigator.clipboard.writeText(order.upiUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(order, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleVerify = async (action: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    try {
      const updated = await verifyOrder(order.orderId, action, customUtr || undefined);
      onOrderUpdated(updated);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundReason.trim()) {
      alert('Please enter a refund reason');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await refundOrder(order.orderId, refundReason.trim());
      onOrderUpdated(updated);
      setShowRefundForm(false);
      setRefundReason('');
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      const res = await simulateWebhook(order.orderId);
      setWebhookResult(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setWebhookResult(`Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Transaction Details</span>
            <h2 className="text-lg font-bold text-slate-900 font-mono">{order.orderId}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Main Amount & Status Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Transaction Amount</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                ₹{order.amount.toFixed(2)}
              </div>
              <span className="text-xs text-slate-400 font-mono">({order.amountInPaise} paise)</span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium block mb-1">Status</span>
              {order.status === 'SUCCESS' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" /> SUCCESS
                </span>
              )}
              {order.status === 'PENDING' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <Clock className="w-4 h-4 animate-spin" /> PENDING
                </span>
              )}
              {order.status === 'REFUNDED' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                  <RotateCcw className="w-4 h-4" /> REFUNDED
                </span>
              )}
              {order.status === 'FAILED' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  <XCircle className="w-4 h-4" /> FAILED
                </span>
              )}
            </div>
          </div>

          {/* Customer & Merchant Metadata */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Payment Metadata</h3>
            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-xs block">Customer Name</span>
                <span className="font-semibold text-slate-800">{order.customerName || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-xs block">Phone / Mobile</span>
                <span className="font-semibold text-slate-800">{order.customerPhone || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-xs block">Customer Email</span>
                <span className="font-semibold text-slate-800 truncate block">{order.customerEmail || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-xs block">Banking UTR / Ref</span>
                <span className="font-mono font-bold text-slate-900">{order.utr || 'Awaiting'}</span>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-xs block">Transaction Purpose / Note</span>
                <span className="font-medium text-slate-800">{order.note}</span>
              </div>
            </div>
          </div>

          {/* NPCI UPI URI Specification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">NPCI UPI URI</span>
              <button
                onClick={handleCopyUri}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                {copiedUri ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUri ? 'Copied URI' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs break-all select-all">
              {order.upiUri}
            </div>
          </div>

          {/* Refund Details if applicable */}
          {order.refundDetails && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2 text-xs text-purple-950">
              <div className="font-bold flex items-center gap-1.5 text-purple-900">
                <RotateCcw className="w-4 h-4 text-purple-700" />
                <span>Refund Information</span>
              </div>
              <p><strong>Refund ID:</strong> {order.refundDetails.refundId}</p>
              <p><strong>Amount:</strong> ₹{order.refundDetails.amount.toFixed(2)}</p>
              <p><strong>Reason:</strong> {order.refundDetails.reason}</p>
              <p><strong>Time:</strong> {new Date(order.refundDetails.timestamp).toLocaleString('en-IN')}</p>
            </div>
          )}

          {/* Audit Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Audit Timeline</h3>
            <div className="border-l-2 border-slate-200 pl-4 space-y-4 ml-2">
              {order.timeline.map((event) => (
                <div key={event.id} className="relative">
                  <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                    event.type === 'success' ? 'bg-emerald-500' :
                    event.type === 'error' ? 'bg-rose-500' :
                    event.type === 'warning' ? 'bg-purple-500' : 'bg-slate-400'
                  }`} />
                  <div>
                    <span className="text-xs font-bold text-slate-800">{event.title}</span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Actions */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Admin Controls</h3>

            {order.status === 'PENDING' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Custom Bank UTR (optional)"
                    value={customUtr}
                    onChange={(e) => setCustomUtr(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200"
                  />
                  <button
                    onClick={() => handleVerify('APPROVE')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Confirm & Mark Paid
                  </button>
                </div>
                <button
                  onClick={() => handleVerify('REJECT')}
                  disabled={actionLoading}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all"
                >
                  Reject Transaction (Unverified)
                </button>
              </div>
            )}

            {order.status === 'SUCCESS' && !showRefundForm && (
              <div className="flex gap-2">
                <button
                  onClick={() => onOpenReceipt(order)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>View Receipt</span>
                </button>
                <button
                  onClick={() => setShowRefundForm(true)}
                  className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold rounded-xl transition-all"
                >
                  Initiate Refund
                </button>
              </div>
            )}

            {showRefundForm && (
              <form onSubmit={handleRefund} className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                <label className="text-xs font-bold text-purple-900">Reason for refunding ₹{order.amount}:</label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested cancellation"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-purple-300 bg-white"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowRefundForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg"
                  >
                    Confirm Refund
                  </button>
                </div>
              </form>
            )}

            {/* Developer Webhook Simulation */}
            <div className="pt-2">
              <button
                onClick={handleTestWebhook}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate PSP Webhook Call for this Order</span>
              </button>
              {webhookResult && (
                <pre className="mt-2 p-3 bg-slate-900 text-emerald-300 text-[11px] rounded-xl overflow-x-auto">
                  {webhookResult}
                </pre>
              )}
            </div>

            {/* Copy JSON representation */}
            <button
              onClick={handleCopyJson}
              className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center justify-center gap-1"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'JSON Copied' : 'Copy Raw Transaction JSON'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
