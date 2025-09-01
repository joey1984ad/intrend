'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface AdAccount {
  id: number;
  account_name: string;
  account_id?: string;
  platform: string;
  status: string;
  created_at: string;
}

interface BillingInfo {
  activeAccounts: number;
  pricePerAccount: number;
  nextCharge: number;
  nextBillingDate?: string;
  latestBillingCycle?: any;
  billingHistory: any[];
}

const AdAccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { user } = useUser();

  useEffect(() => {
    if (user?.email) {
      loadAccounts();
      loadBillingInfo();
    }
  }, [user]);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/accounts?userId=${user?.email}`);
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.accounts);
      } else {
        setError('Failed to load accounts');
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      setError('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBillingInfo = async () => {
    try {
      const response = await fetch(`/api/billing/accounts?userId=${user?.email}`);
      const data = await response.json();
      
      if (data.success) {
        setBillingInfo(data);
      }
    } catch (error) {
      console.error('Error loading billing info:', error);
    }
  };

  const addAccount = async () => {
    if (!newAccountName.trim()) {
      setError('Account name is required');
      return;
    }

    try {
      setIsAddingAccount(true);
      setError(null);
      
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.email,
          accountName: newAccountName.trim(),
          platform: 'facebook'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.accounts);
        setBillingInfo(prev => prev ? {
          ...prev,
          activeAccounts: data.totalAccounts,
          nextCharge: data.nextCharge
        } : null);
        setNewAccountName('');
        setSuccess(data.message);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to add account');
      }
    } catch (error) {
      console.error('Error adding account:', error);
      setError('Failed to add account');
    } finally {
      setIsAddingAccount(false);
    }
  };

  const deleteAccount = async (accountId: number, accountName: string) => {
    if (!confirm(`Are you sure you want to delete "${accountName}"? This will reduce your monthly bill.`)) {
      return;
    }

    try {
      setIsDeletingAccount(accountId);
      setError(null);
      
      const response = await fetch(`/api/accounts?accountId=${accountId}&userId=${user?.email}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setAccounts(prev => prev.filter(acc => acc.id !== accountId));
        setBillingInfo(prev => prev ? {
          ...prev,
          activeAccounts: data.totalAccounts,
          nextCharge: data.nextCharge
        } : null);
        setSuccess(data.message);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
    } finally {
      setIsDeletingAccount(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading accounts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ad Account Management</h2>
          <p className="text-gray-600 mt-1">Manage your connected ad accounts and billing</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <DollarSign className="w-4 h-4" />
          <span>${billingInfo?.pricePerAccount || 10} per account/month</span>
        </div>
      </div>

      {/* Billing Summary */}
      {billingInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{billingInfo.activeAccounts}</div>
              <div className="text-sm text-gray-600">Active Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(billingInfo.nextCharge)}
              </div>
              <div className="text-sm text-gray-600">Next Monthly Charge</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {billingInfo.nextBillingDate ? formatDate(billingInfo.nextBillingDate) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Next Billing Date</div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Add New Account */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Account</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Enter account name (e.g., 'My Business Account')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addAccount()}
          />
          <button
            onClick={addAccount}
            disabled={isAddingAccount || !newAccountName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isAddingAccount ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Account
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Adding a new account will increase your monthly bill by ${billingInfo?.pricePerAccount || 10}.
        </p>
      </div>

      {/* Accounts List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Ad Accounts</h3>
        </div>
        
        {accounts.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h4>
            <p className="text-gray-600">Add your first ad account to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <div key={account.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{account.account_name}</h4>
                      <p className="text-sm text-gray-500">
                        Platform: {account.platform} • Added: {formatDate(account.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteAccount(account.id, account.account_name)}
                  disabled={isDeletingAccount === account.id}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isDeletingAccount === account.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing History */}
      {billingInfo?.billingHistory && billingInfo.billingHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {billingInfo.billingHistory.map((cycle: any) => (
              <div key={cycle.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(cycle.period_start)} - {formatDate(cycle.period_end)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {cycle.total_accounts} accounts • {formatCurrency(cycle.amount_charged)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    cycle.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cycle.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdAccountManager;
