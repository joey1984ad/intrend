'use client'

import React from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';

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
  const { theme } = useDashboardTheme();
  return (
    <div className="mb-8">
      {/* Dashboard Title Section */}
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-bold mb-3 transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          Facebook Ads Dashboard
        </h1>
        <p className={`text-lg max-w-2xl mx-auto transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-600' : 'text-gray-300'
        }`}>
          Comprehensive analytics and management for your Facebook advertising campaigns
        </p>
      </div>

      {/* Account Info Card */}
      <div className={`rounded-xl shadow-sm border p-6 mb-6 transition-colors duration-300 ${
        theme === 'white' 
          ? 'bg-white border-gray-200' 
          : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-gray-100'
            }`}>
              {currentAccountInfo?.name || currentAccount?.name || 'Facebook Ad Account'}
            </h2>
            
            {/* Facebook Ad Account Selection */}
            {facebookAccessToken && facebookAdAccounts.length > 0 && setSelectedAdAccount && (
              <div className="mb-3">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-700' : 'text-gray-200'
                }`}>
                  Select Ad Account:
                </label>
                <select
                  value={selectedAdAccount}
                  onChange={(e) => setSelectedAdAccount(e.target.value)}
                  className={`border rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    theme === 'white' 
                      ? 'border-gray-300 bg-theme text-gray-900' 
                      : 'border-slate-600 bg-slate-700 text-gray-100'
                  }`}
                >
                  {facebookAdAccounts.map((account: any) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <p className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {currentAccountInfo?.activeCampaigns || currentAccount?.campaigns || 0} active campaigns • Last updated {currentAccountInfo?.lastSync || currentAccount?.lastSync || 'Never'}
            </p>
            
            {/* Status Indicators */}
            {isUsingRealData && (
              <div className="flex items-center mt-3">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600 font-medium">Connected to Facebook - Showing Real Data</span>
              </div>
            )}
            {!facebookAccessToken && (
              <div className="flex items-center mt-3">
                <AlertCircle className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm text-blue-600">Showing sample data - Connect Facebook to see real data</span>
                                 <button 
                   onClick={() => setShowConnectModal(true)}
                   className="ml-3 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                 >
                   <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                   </svg>
                   Connect Now
                 </button>
              </div>
            )}
            {isLoadingFacebookData && (
              <div className="flex items-center mt-3">
                <RefreshCw className="w-4 h-4 text-blue-500 mr-2 animate-spin" />
                <span className="text-sm text-blue-600">Loading Facebook data...</span>
              </div>
            )}
            {facebookError && (
              <div className="flex items-center mt-3">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-sm text-red-600">{facebookError}</span>
              </div>
            )}
          </div>
          
          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {facebookAccessToken && (
              <>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className={`border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all transition-colors duration-300 ${
                      theme === 'white'
                        ? 'border-gray-300 bg-white text-gray-900'
                        : 'border-slate-600 bg-slate-700 text-gray-100'
                    }`}
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
                    className={`w-20 border rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all transition-colors duration-300 ${
                      theme === 'white'
                        ? 'border-gray-300 bg-white text-gray-900'
                        : 'border-slate-600 bg-slate-700 text-gray-100'
                    }`}
                  />
                </div>
                
                {/* Compare Toggle */}
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    compareMode
                      ? 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {compareMode ? 'Hide Comparison' : 'Compare to Previous Period'}
                </button>

                {/* Force Refresh */}
                <button
                  onClick={onRefreshNow}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 transition-colors duration-300 ${
                    theme === 'white'
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-100 bg-white'
                      : 'border-slate-600 text-gray-200 hover:bg-slate-600 bg-slate-700'
                  }`}
                  title="Refresh now (bypass cache)"
                >
                  Refresh
                </button>
              </>
            )}
            
            {/* Total Spend Display */}
            <div className={`text-right pl-6 border-l transition-colors duration-300 ${
              theme === 'white' ? 'border-gray-200' : 'border-slate-700'
            }`}>
              <p className={`text-3xl font-bold transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-900' : 'text-gray-100'
              }`}>
                {currentAccountInfo?.totalSpent ? `$${parseFloat(currentAccountInfo.totalSpent).toFixed(2)}` : currentAccount?.spend || '$0.00'}
              </p>
              <p className={`text-sm transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Total spend ({selectedDateRange === 'last_7d' ? 'Last 7 Days' : 
                               selectedDateRange === 'last_30d' ? 'Last 30 Days' : 
                               selectedDateRange === 'last_90d' ? 'Last 90 Days' : 
                               selectedDateRange === 'last_12m' ? 'Last 12 Months' : 'Last 30 Days'})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary; 