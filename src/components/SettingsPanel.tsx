import React, { useState, useEffect } from 'react';
import {
  Save,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Smartphone,
  Key,
  Webhook,
  Sparkles,
  Info,
  Check,
  Power,
  Volume2,
  QrCode,
  Sliders,
} from 'lucide-react';
import type { MerchantConfig, ProviderMode, UpiAccount, GatewayToggles } from '../types/gateway';
import { updateConfig } from '../services/api';
import { UpiAccountsManager } from './UpiAccountsManager';
import { AddUpiAccountModal } from './AddUpiAccountModal';

interface SettingsPanelProps {
  config: MerchantConfig | null;
  onConfigUpdated: (newConfig: MerchantConfig) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onConfigUpdated }) => {
  // Master Gateway Status
  const [gatewayOnline, setGatewayOnline] = useState(true);

  // Architecture Mode
  const [providerMode, setProviderMode] = useState<ProviderMode>('direct_upi');

  // Direct UPI
  const [vpa, setVpa] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [mcc, setMcc] = useState('5411');
  const [notePrefix, setNotePrefix] = useState('Payment to Store');

  // Toggles
  const [toggles, setToggles] = useState<GatewayToggles>({
    gatewayOnline: true,
    gpayEnabled: true,
    phonepeEnabled: true,
    paytmEnabled: true,
    bhimEnabled: true,
    autoApproveUtr: true,
    soundboxVoice: true,
  });

  // PhonePe
  const [phonepeEnabled, setPhonepeEnabled] = useState(false);
  const [phonepeMerchantId, setPhonepeMerchantId] = useState('');
  const [phonepeSaltKey, setPhonepeSaltKey] = useState('');
  const [phonepeSaltIndex, setPhonepeSaltIndex] = useState('1');
  const [phonepeEnv, setPhonepeEnv] = useState<'sandbox' | 'production'>('sandbox');

  // Paytm
  const [paytmEnabled, setPaytmEnabled] = useState(false);
  const [paytmMid, setPaytmMid] = useState('');
  const [paytmKey, setPaytmKey] = useState('');
  const [paytmWebsite, setPaytmWebsite] = useState('DEFAULT');
  const [paytmEnv, setPaytmEnv] = useState<'stage' | 'production'>('stage');

  // Webhook
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);

  // Accounts
  const [upiAccounts, setUpiAccounts] = useState<UpiAccount[]>([]);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setGatewayOnline(config.gatewayOnline ?? true);
      setProviderMode(config.providerMode);
      setVpa(config.directUpi.vpa);
      setMerchantName(config.directUpi.name);
      setMcc(config.directUpi.mcc);
      setNotePrefix(config.directUpi.notePrefix);

      if (config.toggles) {
        setToggles(config.toggles);
      }

      setPhonepeEnabled(config.phonepe.enabled ?? false);
      setPhonepeMerchantId(config.phonepe.merchantId);
      setPhonepeSaltKey(config.phonepe.saltKey);
      setPhonepeSaltIndex(config.phonepe.saltIndex);
      setPhonepeEnv(config.phonepe.environment);

      setPaytmEnabled(config.paytm.enabled ?? false);
      setPaytmMid(config.paytm.mid);
      setPaytmKey(config.paytm.merchantKey);
      setPaytmWebsite(config.paytm.website);
      setPaytmEnv(config.paytm.environment);

      setWebhookUrl(config.webhookUrl);
      setAutoApprove(config.autoApproveSimulated);
      setUpiAccounts(config.upiAccounts || []);
    }
  }, [config]);

  const handleToggleChange = (key: keyof GatewayToggles) => {
    setToggles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await updateConfig({
        gatewayOnline,
        providerMode,
        directUpi: {
          vpa: vpa.trim(),
          name: merchantName.trim(),
          mcc: mcc.trim(),
          notePrefix: notePrefix.trim(),
        },
        toggles: {
          ...toggles,
          gatewayOnline,
        },
        phonepe: {
          merchantId: phonepeMerchantId.trim(),
          saltKey: phonepeSaltKey.trim(),
          saltIndex: phonepeSaltIndex.trim(),
          environment: phonepeEnv,
          enabled: phonepeEnabled,
        },
        paytm: {
          mid: paytmMid.trim(),
          merchantKey: paytmKey.trim(),
          website: paytmWebsite.trim(),
          environment: paytmEnv,
          enabled: paytmEnabled,
        },
        webhookUrl: webhookUrl.trim(),
        autoApproveSimulated: autoApprove,
        upiAccounts,
      });

      onConfigUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAccountsUpdated = (newAccounts: UpiAccount[]) => {
    setUpiAccounts(newAccounts);
    if (config) {
      onConfigUpdated({
        ...config,
        upiAccounts: newAccounts,
      });
    }
  };

  const handleAccountAdded = (newAccount: UpiAccount, accounts: UpiAccount[]) => {
    setUpiAccounts(accounts);
    if (config) {
      onConfigUpdated({
        ...config,
        upiAccounts: accounts,
        directUpi: newAccount.isPrimary
          ? { ...config.directUpi, vpa: newAccount.vpa, name: newAccount.name }
          : config.directUpi,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ─── SECTION 1: MASTER GATEWAY STATUS (ON / OFF) ─── */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          gatewayOnline
            ? 'bg-gradient-to-r from-emerald-900 to-teal-950 text-white border-emerald-800 shadow-md'
            : 'bg-slate-900 text-white border-slate-700 shadow-md'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                gatewayOnline
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Payment Gateway Master Switch</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    gatewayOnline
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {gatewayOnline ? '🟢 ONLINE (ON)' : '🔴 OFFLINE (OFF)'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {gatewayOnline
                  ? 'The gateway is currently ONLINE and accepting customer payments via dynamic QR & UPI intent links.'
                  : 'The gateway is currently OFF. Customer checkout will display a paused notice and reject new payment sessions.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-bold text-slate-300">
              {gatewayOnline ? 'Turn OFF' : 'Turn ON'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gatewayOnline}
                onChange={(e) => setGatewayOnline(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: MULTIPLE UPI ACCOUNTS MANAGER (ADD & ON/OFF) ─── */}
      <UpiAccountsManager
        accounts={upiAccounts}
        onAccountsUpdated={handleAccountsUpdated}
        onOpenAddModal={() => setIsAddAccountModalOpen(true)}
      />

      {/* ─── SECTION 3: APP INTENT & FEATURE TOGGLES (ON / OFF) ─── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Payment Apps & Features (On / Off Controls)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Control checkout capabilities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Google Pay */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Google Pay Intent</span>
              <span className="text-[11px] text-slate-500">Direct GPay app link</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={toggles.gpayEnabled}
                onChange={() => handleToggleChange('gpayEnabled')}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* PhonePe App */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">PhonePe Intent</span>
              <span className="text-[11px] text-slate-500">Direct PhonePe app link</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={toggles.phonepeEnabled}
                onChange={() => handleToggleChange('phonepeEnabled')}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Paytm App */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Paytm Intent</span>
              <span className="text-[11px] text-slate-500">Direct Paytm app link</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={toggles.paytmEnabled}
                onChange={() => handleToggleChange('paytmEnabled')}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* BHIM App */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">BHIM App Intent</span>
              <span className="text-[11px] text-slate-500">NPCI BHIM intent</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={toggles.bhimEnabled}
                onChange={() => handleToggleChange('bhimEnabled')}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Auto UTR Approval */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Auto UTR Approval</span>
              <span className="text-[11px] text-slate-500">Auto verify 12-digit UTR</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={toggles.autoApproveUtr}
                onChange={() => handleToggleChange('autoApproveUtr')}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Soundbox Voice Alert */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Soundbox Voice Alert</span>
              <span className="text-[11px] text-slate-500">Hindi audio on payment</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={toggles.soundboxVoice}
                onChange={() => handleToggleChange('soundboxVoice')}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* ─── SECTION 4: ROUTING MODE SELECTION ─── */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Payment Gateway Routing Mode</h2>
            <p className="text-xs text-slate-500">
              Select how UPI payments should be routed and processed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Direct UPI */}
            <div
              onClick={() => setProviderMode('direct_upi')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                providerMode === 'direct_upi'
                  ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">Direct UPI (NPCI)</span>
                {providerMode === 'direct_upi' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 mb-1">
                Zero Fees (0% MDR)
              </span>
              <p className="text-xs text-slate-500">
                Direct to any personal or business UPI VPA. No merchant registration required.
              </p>
            </div>

            {/* PhonePe */}
            <div
              onClick={() => setProviderMode('phonepe')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                providerMode === 'phonepe'
                  ? 'border-purple-600 bg-purple-50/40 text-purple-950'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">PhonePe Business</span>
                {providerMode === 'phonepe' && (
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 mb-1">
                Official API Adapter
              </span>
              <p className="text-xs text-slate-500">
                Uses PhonePe Business free merchant API with SHA256 webhook signatures.
              </p>
            </div>

            {/* Paytm */}
            <div
              onClick={() => setProviderMode('paytm')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                providerMode === 'paytm'
                  ? 'border-blue-600 bg-blue-50/40 text-blue-950'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">Paytm Business</span>
                {providerMode === 'paytm' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 mb-1">
                Official API Adapter
              </span>
              <p className="text-xs text-slate-500">
                Uses Paytm Business merchant gateway with checksum verification.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Direct UPI Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Default Merchant Profile</h3>
          </div>
          <p className="text-xs text-slate-500">
            Default brand details attached to generated UPI payment requests.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Merchant VPA (ID) *
              </label>
              <input
                type="text"
                required
                value={vpa}
                onChange={(e) => setVpa(e.target.value)}
                placeholder="e.g. robin@upi or shop@okhdfcbank"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payee Legal / Brand Name *
              </label>
              <input
                type="text"
                required
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. Robin UPI Store"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Merchant Category Code (MCC)
              </label>
              <input
                type="text"
                value={mcc}
                onChange={(e) => setMcc(e.target.value)}
                placeholder="5411 (Grocery / General)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Transaction Note
              </label>
              <input
                type="text"
                value={notePrefix}
                onChange={(e) => setNotePrefix(e.target.value)}
                placeholder="Payment for goods"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* PhonePe Business Adapter Settings & ON/OFF */}
        <div className="bg-white rounded-3xl p-6 border border-purple-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">PhonePe Business API</h3>
                <p className="text-xs text-slate-500">Official PhonePe Merchant Gateway</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${phonepeEnabled ? 'text-purple-700' : 'text-slate-400'}`}>
                {phonepeEnabled ? 'ON' : 'OFF'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={phonepeEnabled}
                  onChange={(e) => setPhonepeEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Merchant ID</label>
              <input
                type="text"
                value={phonepeMerchantId}
                onChange={(e) => setPhonepeMerchantId(e.target.value)}
                placeholder="PGTESTPAYUAT"
                className="w-full px-3.5 py-2.5 font-mono rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Salt Key</label>
              <input
                type="password"
                value={phonepeSaltKey}
                onChange={(e) => setPhonepeSaltKey(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 font-mono rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Salt Index</label>
              <input
                type="text"
                value={phonepeSaltIndex}
                onChange={(e) => setPhonepeSaltIndex(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 font-mono rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Environment</label>
              <select
                value={phonepeEnv}
                onChange={(e) => setPhonepeEnv(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="sandbox">Sandbox (Testing / UAT)</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>
        </div>

        {/* Paytm Business Adapter Settings & ON/OFF */}
        <div className="bg-white rounded-3xl p-6 border border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Paytm Business API</h3>
                <p className="text-xs text-slate-500">Official Paytm Payment Gateway</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${paytmEnabled ? 'text-blue-700' : 'text-slate-400'}`}>
                {paytmEnabled ? 'ON' : 'OFF'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paytmEnabled}
                  onChange={(e) => setPaytmEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Merchant ID (MID)</label>
              <input
                type="text"
                value={paytmMid}
                onChange={(e) => setPaytmMid(e.target.value)}
                placeholder="TEST_MID_123"
                className="w-full px-3.5 py-2.5 font-mono rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Merchant Key</label>
              <input
                type="password"
                value={paytmKey}
                onChange={(e) => setPaytmKey(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 font-mono rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website Name</label>
              <input
                type="text"
                value={paytmWebsite}
                onChange={(e) => setPaytmWebsite(e.target.value)}
                placeholder="DEFAULT or WEBSTAGING"
                className="w-full px-3.5 py-2.5 font-mono rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Environment</label>
              <select
                value={paytmEnv}
                onChange={(e) => setPaytmEnv(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="stage">Stage / Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>
        </div>

        {/* Webhooks & Automation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Webhook & Auto-Reconciliation</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Webhook Endpoint URL</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://yoursite.com/api/webhook"
              className="w-full px-3.5 py-2.5 font-mono rounded-xl border border-slate-200 text-xs"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>All settings and toggles saved successfully!</span>
            </span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Add UPI Account Modal */}
      <AddUpiAccountModal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        onAccountAdded={handleAccountAdded}
      />
    </div>
  );
};
