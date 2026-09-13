import React, { useState } from 'react';
import { X, Plus, QrCode, ShieldCheck, Building2, Check, Sparkles } from 'lucide-react';
import type { AddUpiAccountInput, UpiAccount } from '../types/gateway';
import { addUpiAccount } from '../services/api';

interface AddUpiAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: (newAccount: UpiAccount, accounts: UpiAccount[]) => void;
}

const COMMON_BANKS = [
  'HDFC Bank',
  'State Bank of India',
  'ICICI Bank',
  'Axis Bank',
  'Paytm Payments Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
];

export const AddUpiAccountModal: React.FC<AddUpiAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountAdded,
}) => {
  const [vpa, setVpa] = useState('');
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [dailyLimit, setDailyLimit] = useState('100000');
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanVpa = vpa.trim().toLowerCase();
    if (!cleanVpa || !cleanVpa.includes('@')) {
      setError('Please enter a valid UPI ID (must contain "@", e.g. merchant@upi)');
      return;
    }
    if (!name.trim()) {
      setError('Please enter the merchant or account holder name');
      return;
    }

    setLoading(true);
    try {
      const res = await addUpiAccount({
        vpa: cleanVpa,
        name: name.trim(),
        bankName: bankName.trim(),
        dailyLimit: dailyLimit ? parseFloat(dailyLimit) : undefined,
        isPrimary,
      });

      onAccountAdded(res.account, res.accounts);
      onClose();
      // Reset
      setVpa('');
      setName('');
      setBankName('HDFC Bank');
      setIsPrimary(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add UPI account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Add New UPI ID / Account</h3>
              <p className="text-xs text-slate-300">
                Direct Settlement • 0% MDR Fee • Instant Activation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* VPA / UPI ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              UPI ID / VPA <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. robin.store@hdfcbank or paytm.merchant@paytm"
              required
              value={vpa}
              onChange={(e) => setVpa(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Your registered bank virtual payment address that receives customer payments.
            </p>
          </div>

          {/* Account / Payee Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payee Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Robin General Store"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Bank Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Settlement Bank Name
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Bank, ICICI Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />

            {/* Quick Bank Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_BANKS.slice(0, 5).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBankName(b)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    bankName === b
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Limit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Daily Limit (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 100000"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Maximum total amount to route through this UPI ID per day.
            </p>
          </div>

          {/* Set as Primary Checkbox */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Make Primary Channel</span>
              <span className="text-[11px] text-slate-500">
                Use this UPI ID by default for all dynamic customer checkout QR codes.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Live Preview Card */}
          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Activation (Will be turned ON immediately)</span>
            </span>
            <p className="text-emerald-800">
              UPI VPA: <span className="font-mono font-bold">{vpa || 'merchant@upi'}</span> • Display: {name || 'Merchant Store'}
            </p>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Adding...' : 'Add UPI Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
