import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, IndianRupee } from 'lucide-react';
import type { GatewayOrder, MerchantConfig } from '../types/gateway';

interface ReceiptModalProps {
  order: GatewayOrder | null;
  config: MerchantConfig | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, config, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none animate-in fade-in zoom-in duration-200">
        {/* Top Controls (Hidden during print) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between print:hidden bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase">Payment Receipt</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {config?.directUpi.name || 'Robin UPI Store'}
            </h2>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              VPA: {config?.directUpi.vpa || 'merchant@upi'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Direct UPI Payment Confirmation</p>
          </div>

          {/* Amount Callout */}
          <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500 uppercase">Amount Paid</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">
              ₹{order.amount.toFixed(2)}
            </div>
            <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Payment Completed</span>
            </span>
          </div>

          {/* Line items details */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Order ID</span>
              <span className="font-mono font-bold text-slate-900">{order.orderId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Bank UTR / Ref No.</span>
              <span className="font-mono font-bold text-slate-900">{order.utr || 'Direct NPCI Settlement'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Customer Name</span>
              <span className="font-semibold text-slate-900">{order.customerName || 'Walk-in Customer'}</span>
            </div>
            {order.customerPhone && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer Phone</span>
                <span className="font-medium text-slate-900">{order.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Purpose / Note</span>
              <span className="font-medium text-slate-900 text-right max-w-[200px] truncate">{order.note}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Payment Date</span>
              <span className="font-medium text-slate-900">{formattedDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Gateway Fee (MDR)</span>
              <span className="font-bold text-emerald-600">₹0.00 (Zero Commission)</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-dashed border-slate-200">
            <p>Direct bank transfer processed through NPCI UPI infrastructure.</p>
            <p className="mt-0.5">Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
