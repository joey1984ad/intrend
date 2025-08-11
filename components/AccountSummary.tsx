'use client'

import React from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface AccountSummaryProps {
  currentAccountInfo: any;
  currentAccount: any;
  isUsingRealData: boolean;
  facebookAccessToken: string;
  setShowConnectModal: (show: boolean) => void;
  isLoadingFacebookData: boolean;
  selectedDateRange: string;
  setSelectedDateRange: (range: string) => void;
  setCompareMode: (mode: boolean) => void;
  compareMode: boolean;
  facebookError?: string;
  facebookAdAccounts?: any[];
  selectedAdAccount?: string;
  setSelectedAdAccount?: (accountId: string) => void;
  cacheTtlHours?: number;
  setCacheTtlHours?: (hours: number) => void;
  onRefreshNow?: () => void;
}

const AccountSummary: React.FC<AccountSummaryProps> = ({
  currentAccountInfo,
  currentAccount,
  isUsingRealData,
  facebookAccessToken,
  setShowConnectModal,
  isLoadingFacebookData,
  selectedDateRange,
  setSelectedDateRange,
  setCompareMode,
  compareMode,
  facebookError,
  facebookAdAccounts = [],
  selectedAdAccount = '',
  setSelectedAdAccount,
  cacheTtlHours = 6,
  setCacheTtlHours,
  onRefreshNow
}) => {
  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {currentAccountInfo?.name || currentAccount?.name || 'Facebook Ad Account'}
          </h1>
          
          {/* Facebook Ad Account Selection */}
          {facebookAccessToken && facebookAdAccounts.length > 0 && setSelectedAdAccount && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Ad Account:
              </label>
              <select
                value={selectedAdAccount}
                onChange={(e) => setSelectedAdAccount(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full max-w-xs"
              >
                {facebookAdAccounts.map((account: any) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.id})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            {currentAccountInfo?.activeCampaigns || currentAccount?.campaigns || 0} active campaigns • Last updated {currentAccountInfo?.lastSync || currentAccount?.lastSync || 'Never'}
          </p>
          {isUsingRealData && (
            <div className="flex items-center mt-2">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-sm text-green-600 font-medium">Connected to Facebook - Showing Real Data</span>
            </div>
          )}
          {!facebookAccessToken && (
            <div className="flex items-center mt-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm text-blue-600">Showing sample data - Connect Facebook to see real data</span>
              <button 
                onClick={() => setShowConnectModal(true)}
                className="ml-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Connect Now
              </button>
            </div>
          )}
          {isLoadingFacebookData && (
            <div className="flex items-center mt-2">
              <RefreshCw className="w-4 h-4 text-blue-500 mr-2 animate-spin" />
              <span className="text-sm text-blue-600">Loading Facebook data...</span>
            </div>
          )}
          {facebookError && (
            <div className="flex items-center mt-2">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-red-600">{facebookError}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {facebookAccessToken && (
            <>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="last_7d">Last 7 Days</option>
                  <option value="last_30d">Last 30 Days</option>
                  <option value="last_90d">Last 90 Days</option>
                  <option value="last_12m">Last 12 Months</option>
                </select>
              </div>

              {/* Cache TTL */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Cache (hrs):</span>
                <input
                  type="number"
                  min={0}
                  value={cacheTtlHours}
                  onChange={(e) => setCacheTtlHours?.(Math.max(0, Number(e.target.value)))}
                  className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
              
              {/* Compare Toggle */}
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  compareMode
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {compareMode ? 'Hide Comparison' : 'Compare to Previous Period'}
              </button>

              {/* Force Refresh */}
              <button
                onClick={onRefreshNow}
                className="px-3 py-1 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
                title="Refresh now (bypass cache)"
              >
                Refresh
              </button>
            </>
          )}
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              ${currentAccountInfo?.totalSpent ? parseFloat(currentAccountInfo.totalSpent).toFixed(2) : currentAccount?.spend || '$0.00'}
            </p>
            <p className="text-sm text-gray-600">Total spend ({selectedDateRange === 'last_7d' ? 'Last 7 Days' : 
                               selectedDateRange === 'last_30d' ? 'Last 30 Days' : 
                               selectedDateRange === 'last_90d' ? 'Last 90 Days' : 
                               selectedDateRange === 'last_12m' ? 'Last 12 Months' : 'Last 30 Days'})</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary; 