import React, { useState } from 'react';
import {
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  RefreshCw,
  Eye,
  Check,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Filter,
  Plus,
  Power,
  QrCode,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import type { GatewayOrder, GatewayStats, PaymentStatus, MerchantConfig, UpiAccount } from '../types/gateway';

interface AdminDashboardProps {
  stats: GatewayStats | null;
  orders: GatewayOrder[];
  config: MerchantConfig | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectOrder: (order: GatewayOrder) => void;
  onOpenReceipt: (order: GatewayOrder) => void;
  onQuickApprove: (orderId: string) => void;
  onToggleStatus: (orderId: string) => void;
  onNavigateToCheckout: () => void;
  onOpenAddTransaction: () => void;
  onOpenAddUpiAccount: () => void;
  onToggleGatewayStatus: () => void;
  onToggleUpiAccount: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  orders,
  config,
  loading,
  onRefresh,
  onSelectOrder,
  onOpenReceipt,
  onQuickApprove,
  onToggleStatus,
  onNavigateToCheckout,
  onOpenAddTransaction,
  onOpenAddUpiAccount,
  onToggleGatewayStatus,
  onToggleUpiAccount,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const upiAccounts = config?.upiAccounts || [];
  const isGatewayOnline = config?.gatewayOnline ?? true;

  // Filter orders based on status & search
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      order.orderId.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerPhone.toLowerCase().includes(query) ||
      (order.utr && order.utr.toLowerCase().includes(query)) ||
      order.note.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            SUCCESS
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            PENDING
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            REFUNDED
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            FAILED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Banner: Master Gateway Status & Actions ─── */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Gateway Master On/Off Badge & Switch */}
              <button
                type="button"
                onClick={onToggleGatewayStatus}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                  isGatewayOnline
                    ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-rose-500/20 border border-rose-400/40 text-rose-300 hover:bg-rose-500/30'
                }`}
                title="Click to toggle Gateway ON/OFF"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Gateway Status: {isGatewayOnline ? 'ONLINE (ON)' : 'OFFLINE (OFF)'}</span>
                <span className="underline opacity-80 text-[11px]">(Toggle)</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-300 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>0% Commission Direct UPI</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              UPI Merchant Payment Gateway
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Accept instant customer payments via dynamic NPCI QR codes, app intent links, or record manual entries directly to bank accounts.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Add Transaction Button */}
            <button
              id="btn-add-transaction-banner"
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm shadow-md hover:bg-slate-100 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>+ Add Transaction</span>
            </button>

            {/* Test Live Checkout */}
            <button
              id="btn-test-checkout-banner"
              onClick={onNavigateToCheckout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <span>Test Checkout</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            {/* Refresh */}
            <button
              id="btn-refresh-dashboard"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/15 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Active UPI Accounts Bar (Quick On / Off Controls) ─── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Configured UPI IDs & Live Status (On / Off Controls)
            </h3>
            <span className="text-xs text-slate-500">
              ({upiAccounts.filter((a) => a.enabled).length}/{upiAccounts.length} Active)
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAddUpiAccount}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Another UPI ID</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {upiAccounts.map((acc) => (
            <div
              key={acc.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                acc.enabled
                  ? 'bg-slate-50 border-slate-200 text-slate-900'
                  : 'bg-slate-100/60 border-slate-200/60 opacity-60 text-slate-500'
              }`}
            >
              <div className="min-w-0 flex-1 mr-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold truncate">{acc.vpa}</span>
                  {acc.isPrimary && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{acc.bankName} • {acc.name}</p>
              </div>

              {/* Quick 1-Click Toggle ON/OFF */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-extrabold ${acc.enabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {acc.enabled ? 'ON' : 'OFF'}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleUpiAccount(acc.id)}
                  className="focus:outline-none"
                  title={acc.enabled ? 'Click to Turn OFF' : 'Click to Turn ON'}
                >
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      acc.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                        acc.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Analytics Metric Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ₹{stats ? stats.totalRevenue.toLocaleString('en-IN') : '0'}
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>₹{stats ? stats.todayRevenue.toLocaleString('en-IN') : '0'} collected today</span>
          </p>
        </div>

        {/* Transactions Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats ? stats.totalTransactions : 0}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {stats ? stats.successfulCount : 0} successful • {stats ? stats.pendingCount : 0} pending
          </p>
        </div>

        {/* Success Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Success Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats ? stats.successRate : 0}%
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Real-time bank UPI clearance
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Avg Ticket Size
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ₹{stats ? stats.averageOrderValue.toLocaleString('en-IN') : '0'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Average per paid checkout
          </p>
        </div>
      </div>

      {/* ─── Transactions List Section ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent UPI Transactions</h2>
              <p className="text-xs text-slate-500">
                Live ledger of incoming dynamic QR & app payments
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Add Transaction Button */}
            <button
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order, UTR, customer..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Filter Status Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    selectedStatus === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer & Note</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Banking UTR / Ref</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-base font-semibold text-slate-600">No transactions found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery ? 'Try clearing your search query' : 'Create a payment or add a transaction to see orders'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={order.orderId}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectOrder(order)}
                    >
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {order.orderId}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{dateStr}</div>
                      </td>

                      {/* Customer & Note */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 text-xs sm:text-sm truncate">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate" title={order.note}>
                          {order.note}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{order.amount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* UTR */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {order.utr ? (
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-200">
                            {order.utr}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Awaiting UTR</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Status Button (Pending ⇄ Success) */}
                          <button
                            type="button"
                            onClick={() => onToggleStatus(order.orderId)}
                            className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-all"
                            title={`Click to toggle status to ${order.status === 'SUCCESS' ? 'PENDING' : 'SUCCESS'}`}
                          >
                            Toggle Status
                          </button>

                          {order.status === 'PENDING' && (
                            <button
                              id={`btn-approve-${order.orderId}`}
                              onClick={() => onQuickApprove(order.orderId)}
                              title="Approve & Mark Paid"
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                          )}

                          {order.status === 'SUCCESS' && (
                            <button
                              id={`btn-receipt-${order.orderId}`}
                              onClick={() => onOpenReceipt(order)}
                              title="Download / View Receipt"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            id={`btn-details-${order.orderId}`}
                            onClick={() => onSelectOrder(order)}
                            title="View Full Payment Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
