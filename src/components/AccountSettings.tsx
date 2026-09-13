import React, { useState } from 'react';
import { User, Lock, Save, Plus, ShieldCheck, Key, Users } from 'lucide-react';
import { changeCredentials, createAdminUser } from '../services/api';

interface AccountSettingsProps {
  onCredentialsChanged: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onCredentialsChanged }) => {
  const [currentUsername, setCurrentUsername] = useState(''); // Just for UX if they want to know
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  
  const [error1, setError1] = useState('');
  const [success1, setSuccess1] = useState('');
  const [loading1, setLoading1] = useState(false);

  const [error2, setError2] = useState('');
  const [success2, setSuccess2] = useState('');
  const [loading2, setLoading2] = useState(false);

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError1('');
    setSuccess1('');
    setLoading1(true);
    try {
      await changeCredentials(newUsername, newPassword);
      setSuccess1('Credentials updated! Please log in again.');
      setTimeout(() => {
        onCredentialsChanged();
      }, 1500);
    } catch (err: any) {
      setError1(err.message || 'Failed to update credentials');
    } finally {
      setLoading1(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError2('');
    setSuccess2('');
    setLoading2(true);
    try {
      await createAdminUser(createUsername, createPassword);
      setSuccess2(`User "${createUsername}" created successfully!`);
      setCreateUsername('');
      setCreatePassword('');
    } catch (err: any) {
      setError2(err.message || 'Failed to create user');
    } finally {
      setLoading2(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-600">
          <Users className="w-6 h-6" />
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Admin User Management
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Manage your login credentials or create new admin accounts. Note: Normal users cannot register themselves. Only existing admins can create new accounts to ensure maximum security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Change Credentials */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-900">Change My Credentials</h3>
          </div>
          
          <form onSubmit={handleChangeCredentials} className="space-y-4">
            {error1 && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error1}</div>}
            {success1 && <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg">{success1}</div>}
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium"
                  placeholder="New Admin ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium"
                  placeholder="New Password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading1}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-70 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading1 ? 'Saving...' : 'Update & Log Out'}
            </button>
          </form>
        </div>

        {/* Create New Admin */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900">Create Admin Account</h3>
          </div>
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            {error2 && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error2}</div>}
            {success2 && <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg">{success2}</div>}
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium"
                  placeholder="New User ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium"
                  placeholder="Secret Password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading2}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-70 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading2 ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
