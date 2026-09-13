import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  Plus,
  Power,
  Trash2,
  Star,
  Copy,
  Check,
  Building2,
  AlertCircle,
  IndianRupee,
  ExternalLink,
  Download,
  X,
} from 'lucide-react';
import type { UpiAccount } from '../types/gateway';
import { toggleUpiAccount, setPrimaryUpiAccount, deleteUpiAccount } from '../services/api';

interface UpiAccountsManagerProps {
  accounts: UpiAccount[];
  onAccountsUpdated: (newAccounts: UpiAccount[]) => void;
  onOpenAddModal: () => void;
}

export const UpiAccountsManager: React.FC<UpiAccountsManagerProps> = ({
  accounts,
  onAccountsUpdated,
  onOpenAddModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [qrModalAccount, setQrModalAccount] = useState<UpiAccount | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCopy = (vpa: string, id: string) => {
    navigator.clipboard.writeText(vpa);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    setErrorMessage('');
    try {
      const res = await toggleUpiAccount(id);
      onAccountsUpdated(res.accounts);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to toggle UPI account');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSetPrimary = async (id: string) => {
    setErrorMessage('');
    try {
      const res = await setPrimaryUpiAccount(id);
      onAccountsUpdated(res.accounts);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to set primary');
    }
  };

  const handleDelete = async (id: string, vpa: string) => {
    if (!confirm(`Are you sure you want to remove UPI ID "${vpa}"?`)) return;
    setErrorMessage('');
    try {
      const res = await deleteUpiAccount(id);
      onAccountsUpdated(res.accounts);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              UPI Accounts & Settlement Channels
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {accounts.filter((a) => a.enabled).length} of {accounts.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Add multiple bank UPI IDs and toggle them ON or OFF anytime to route incoming payments.
          </p>
        </div>

        <button
          id="btn-add-upi-account"
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all transform active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add New UPI ID</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isToggling = togglingId === acc.id;

          return (
            <div
              key={acc.id}
              className={`rounded-2xl border transition-all relative p-5 flex flex-col justify-between ${
                acc.enabled
                  ? 'bg-white border-slate-200 shadow-xs hover:border-emerald-300'
                  : 'bg-slate-50/80 border-slate-200/60 opacity-75'
              }`}
            >
              {/* Top Row: Bank + Primary Badge + ON/OFF Switch */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        acc.enabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block truncate max-w-[140px]">
                        {acc.bankName}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">
                        {acc.name}
                      </span>
                    </div>
                  </div>

                  {/* ON / OFF Toggle Switch */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold ${
                        acc.enabled ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {acc.enabled ? 'ON' : 'OFF'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acc.enabled}
                        disabled={isToggling}
                        onChange={() => handleToggle(acc.id)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* VPA Address Box */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-slate-900 truncate mr-2">
                    {acc.vpa}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(acc.vpa, acc.id)}
                    className="p-1 text-slate-500 hover:text-slate-900 rounded transition-colors shrink-0"
                    title="Copy UPI ID"
                  >
                    {copiedId === acc.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Meta details */}
                <div className="space-y-1 text-[11px] text-slate-500 mb-4">
                  {acc.dailyLimit && (
                    <div className="flex items-center justify-between">
                      <span>Daily Limit:</span>
                      <span className="font-semibold text-slate-700">
                        ₹{acc.dailyLimit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Routing Status:</span>
                    <span
                      className={`font-semibold ${
                        acc.enabled ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {acc.enabled ? 'Accepting Payments' : 'Disabled (Paused)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {acc.isPrimary ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      Primary
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(acc.id)}
                      className="text-[11px] font-medium text-slate-600 hover:text-emerald-700 hover:underline"
                    >
                      Set Primary
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQrModalAccount(acc)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(acc.id, acc.vpa)}
                    disabled={accounts.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Quick Modal */}
      {qrModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="flex justify-between items-center mb-4">
              <div className="text-left">
                <h4 className="font-bold text-slate-900 text-sm">{qrModalAccount.bankName}</h4>
                <p className="text-xs text-slate-500">{qrModalAccount.name}</p>
              </div>
              <button
                onClick={() => setQrModalAccount(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Generated UPI QR Code */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  `upi://pay?pa=${qrModalAccount.vpa}&pn=${encodeURIComponent(qrModalAccount.name)}&cu=INR`
                )}`}
                alt="Account UPI QR"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            </div>

            <p className="font-mono font-bold text-sm text-slate-900 mb-1">
              {qrModalAccount.vpa}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Status:{' '}
              <span
                className={`font-bold ${
                  qrModalAccount.enabled ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {qrModalAccount.enabled ? '● ONLINE (Accepting)' : '○ OFF (Disabled)'}
              </span>
            </p>

            <button
              type="button"
              onClick={() => setQrModalAccount(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
