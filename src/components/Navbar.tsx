import React from 'react';
import { QrCode, ShieldCheck, Plus, Sparkles, Activity, LogOut } from 'lucide-react';
import type { MerchantConfig } from '../types/gateway';

export type TabType = 'dashboard' | 'checkout' | 'generator' | 'settings' | 'developer' | 'account';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  config: MerchantConfig | null;
  onQuickNewPayment: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  onQuickNewPayment,
  onLogout
}) => {
  const providerLabel = config?.providerMode === 'direct_upi'
    ? 'Direct UPI (₹0 Fees)'
    : config?.providerMode === 'phonepe'
    ? 'PhonePe Business'
    : 'Paytm Business';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/10">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  UPI<span className="text-emerald-600">Pay</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Zero Commission
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Direct to Bank • NPCI Standard Gateway
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 overflow-x-auto">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Admin Dashboard
            </button>
            <button
              id="nav-tab-checkout"
              onClick={() => setActiveTab('checkout')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'checkout'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>Live Checkout</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
            <button
              id="nav-tab-generator"
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'generator'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Payment Link / Standee
            </button>
            <button
              id="nav-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Gateway Settings
            </button>
            <button
              id="nav-tab-developer"
              onClick={() => setActiveTab('developer')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'developer'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              API & Webhook
            </button>
            <button
              id="nav-tab-account"
              onClick={() => setActiveTab('account')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'account'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Account
            </button>
          </nav>

          {/* Actions & Gateway Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>{providerLabel}</span>
            </div>
            <button
              id="btn-quick-new-payment"
              onClick={onQuickNewPayment}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Payment</span>
              <span className="sm:hidden">Pay</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
