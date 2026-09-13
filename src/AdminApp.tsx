import React, { useState, useEffect } from 'react';
import { Navbar, type TabType } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { CheckoutModal } from './components/CheckoutModal';
import { TransactionDetailDrawer } from './components/TransactionDetailDrawer';
import { PaymentLinkGenerator } from './components/PaymentLinkGenerator';
import { SettingsPanel } from './components/SettingsPanel';
import { ApiDocsPanel } from './components/ApiDocsPanel';
import { AccountSettings } from './components/AccountSettings';
import { ReceiptModal } from './components/ReceiptModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddUpiAccountModal } from './components/AddUpiAccountModal';
import { LoginScreen } from './components/LoginScreen';
import type { GatewayOrder, GatewayStats, MerchantConfig, UpiAccount } from './types/gateway';
import {
  fetchConfig,
  fetchOrders,
  fetchStats,
  verifyOrder,
  createOrder,
  toggleOrderStatus,
  toggleUpiAccount,
  updateToggles,
  setAuthToken,
} from './services/api';

export function AdminApp() {
  const [token, setToken] = useState<string>(() => localStorage.getItem('adminToken') || '');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [config, setConfig] = useState<MerchantConfig | null>(null);
  const [stats, setStats] = useState<GatewayStats | null>(null);
  const [orders, setOrders] = useState<GatewayOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals and Drawers
  const [selectedOrder, setSelectedOrder] = useState<GatewayOrder | null>(null);
  const [checkoutOrder, setCheckoutOrder] = useState<GatewayOrder | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<GatewayOrder | null>(null);

  // Add Modals
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddUpiAccountOpen, setIsAddUpiAccountOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial data
  const loadData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [cfg, st, ords] = await Promise.all([
        fetchConfig(),
        fetchStats(),
        fetchOrders(),
      ]);
      setConfig(cfg);
      setStats(st);
      setOrders(ords);

      // Check URL query param for orderId
      const params = new URLSearchParams(window.location.search);
      const queryOrderId = params.get('orderId');
      if (queryOrderId) {
        const found = ords.find((o) => o.orderId === queryOrderId);
        if (found) {
          setCheckoutOrder(found);
          setActiveTab('checkout');
          return;
        }
      }

      // If no checkout order yet, set to the latest pending or latest order
      if (!checkoutOrder && ords.length > 0) {
        const pending = ords.find((o) => o.status === 'PENDING');
        setCheckoutOrder(pending || ords[0]);
      }
    } catch (err: any) {
      console.error('Error loading gateway data:', err);
      if (err.message?.includes('Unauthorized') || err.message?.includes('token')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleLogin = (newToken: string) => {
    setAuthToken(newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    setAuthToken('');
    setToken('');
    setConfig(null);
    setStats(null);
    setOrders([]);
  };

  if (!token) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Quick action: create a new demo payment order
  const handleQuickNewPayment = async () => {
    try {
      const order = await createOrder({
        amount: 299,
        customerName: 'Customer #' + Math.floor(1000 + Math.random() * 9000),
        note: 'UPI Payment Order',
      });
      setCheckoutOrder(order);
      setOrders((prev) => [order, ...prev]);
      setActiveTab('checkout');
      showToast('New payment session initialized!');
    } catch (err: any) {
      alert(err.message || 'Failed to create order');
    }
  };

  // Quick verify/approve from table
  const handleQuickApprove = async (orderId: string) => {
    try {
      const updated = await verifyOrder(orderId, 'APPROVE');
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
      if (checkoutOrder?.orderId === orderId) setCheckoutOrder(updated);
      if (selectedOrder?.orderId === orderId) setSelectedOrder(updated);
      showToast(`Order ${orderId} marked as SUCCESS!`);
      fetchStats().then(setStats).catch(() => {});
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    }
  };

  // Toggle order status between PENDING & SUCCESS
  const handleToggleOrderStatus = async (orderId: string) => {
    try {
      const updated = await toggleOrderStatus(orderId);
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
      if (checkoutOrder?.orderId === orderId) setCheckoutOrder(updated);
      if (selectedOrder?.orderId === orderId) setSelectedOrder(updated);
      showToast(`Status updated to ${updated.status} for #${orderId}`);
      fetchStats().then(setStats).catch(() => {});
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  // Master Gateway Status (ON / OFF)
  const handleToggleGatewayStatus = async () => {
    if (!config) return;
    const newStatus = !config.gatewayOnline;
    try {
      await updateToggles({ gatewayOnline: newStatus });
      setConfig((prev) => (prev ? { ...prev, gatewayOnline: newStatus } : null));
      showToast(`Payment Gateway turned ${newStatus ? 'ONLINE (ON)' : 'OFFLINE (OFF)'}`);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle gateway status');
    }
  };

  // Toggle specific UPI account (ON / OFF)
  const handleToggleUpiAccount = async (id: string) => {
    try {
      const res = await toggleUpiAccount(id);
      setConfig((prev) => (prev ? { ...prev, upiAccounts: res.accounts } : null));
      const toggled = res.accounts.find((a) => a.id === id);
      showToast(`UPI ID "${toggled?.vpa}" turned ${toggled?.enabled ? 'ON' : 'OFF'}`);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle UPI account');
    }
  };

  // When a new manual transaction is added
  const handleTransactionAdded = (newOrder: GatewayOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Transaction recorded: ₹${newOrder.amount} for ${newOrder.customerName}`);
    fetchStats().then(setStats).catch(() => {});
  };

  // When a new UPI account is added
  const handleUpiAccountAdded = (newAccount: UpiAccount, accounts: UpiAccount[]) => {
    setConfig((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        upiAccounts: accounts,
        directUpi: newAccount.isPrimary
          ? { ...prev.directUpi, vpa: newAccount.vpa, name: newAccount.name }
          : prev.directUpi,
      };
    });
    showToast(`Added new UPI ID: ${newAccount.vpa} (Turned ON)`);
  };

  // Order updated from drawer or checkout
  const handleOrderUpdated = (updated: GatewayOrder) => {
    setOrders((prev) => prev.map((o) => (o.orderId === updated.orderId ? updated : o)));
    if (checkoutOrder?.orderId === updated.orderId) setCheckoutOrder(updated);
    if (selectedOrder?.orderId === updated.orderId) setSelectedOrder(updated);
    fetchStats().then(setStats).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        onQuickNewPayment={handleQuickNewPayment}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            stats={stats}
            orders={orders}
            config={config}
            loading={loading}
            onRefresh={loadData}
            onSelectOrder={(order) => setSelectedOrder(order)}
            onOpenReceipt={(order) => setReceiptOrder(order)}
            onQuickApprove={handleQuickApprove}
            onToggleStatus={handleToggleOrderStatus}
            onNavigateToCheckout={() => setActiveTab('checkout')}
            onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
            onOpenAddUpiAccount={() => setIsAddUpiAccountOpen(true)}
            onToggleGatewayStatus={handleToggleGatewayStatus}
            onToggleUpiAccount={handleToggleUpiAccount}
          />
        )}

        {activeTab === 'checkout' && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                Customer Payment Experience
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Scan to Pay via UPI
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Zero fees, direct bank-to-bank settlement. Works seamlessly with any UPI mobile app.
              </p>
            </div>

            <CheckoutModal
              order={checkoutOrder}
              config={config}
              onOpenReceipt={(order) => setReceiptOrder(order)}
              onPaymentUpdated={handleOrderUpdated}
            />
          </div>
        )}

        {activeTab === 'generator' && (
          <PaymentLinkGenerator
            config={config}
            onOrderCreated={(order) => {
              setCheckoutOrder(order);
              setOrders((prev) => [order, ...prev]);
              setActiveTab('checkout');
              showToast('Payment order generated!');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            config={config}
            onConfigUpdated={(newConfig) => {
              setConfig(newConfig);
              showToast('Settings saved!');
            }}
          />
        )}

        {activeTab === 'developer' && <ApiDocsPanel config={config} />}
        {activeTab === 'account' && <AccountSettings onCredentialsChanged={handleLogout} />}
      </main>

      {/* Transaction Details Slide Drawer */}
      {selectedOrder && (
        <TransactionDetailDrawer
          order={selectedOrder}
          config={config}
          onClose={() => setSelectedOrder(null)}
          onOpenReceipt={(order) => {
            setReceiptOrder(order);
          }}
          onOrderUpdated={handleOrderUpdated}
        />
      )}

      {/* Printable Receipt Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          config={config}
          onClose={() => setReceiptOrder(null)}
        />
      )}

      {/* Add Manual Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        config={config}
        onTransactionAdded={handleTransactionAdded}
      />

      {/* Add UPI Account Modal */}
      <AddUpiAccountModal
        isOpen={isAddUpiAccountOpen}
        onClose={() => setIsAddUpiAccountOpen(false)}
        onAccountAdded={handleUpiAccountAdded}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
