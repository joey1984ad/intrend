'use client'

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Bell, Settings, ChevronDown, RefreshCw } from 'lucide-react';
import { ConnectedAccount, Notification } from './types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAccount: string;
  setSelectedAccount: (account: string) => void;
  connectedAccounts: ConnectedAccount[];
  setShowAccountModal: (show: boolean) => void;
  selectedDateRange: string;
  setSelectedDateRange: (range: string) => void;
  handleRefresh: () => void;
  isLoading: boolean;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notifications: Notification[];
  isLoadingCreatives?: boolean;
  isLoadingCampaigns?: boolean;
  isLoadingAdSets?: boolean;
  isLoadingAds?: boolean;
  isLoadingDemographics?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedAccount,
  setSelectedAccount,
  connectedAccounts,
  setShowAccountModal,
  selectedDateRange,
  setSelectedDateRange,
  handleRefresh,
  isLoading,
  showNotifications,
  setShowNotifications,
  notifications,
  isLoadingCreatives,
  isLoadingCampaigns,
  isLoadingAdSets,
  isLoadingAds,
  isLoadingDemographics
}) => {
  return (
    <>
      {/* Header */}
      <div className="bg-black text-white p-2 text-center text-sm">
        Use this exact template for free with AgencyAnalytics. 
        <button className="ml-2 underline hover:no-underline">Start Your 14-Day Free Trial</button>
      </div>
      
      {/* Top Navigation */}
      <div className="bg-white text-black shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <a href="/" className="text-blue-300 hover:text-blue-200 text-sm underline">← Back to Landing</a>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-600 rounded mr-2"></div>
                <span className="font-semibold">Facebook Ads</span>
              </div>
              <nav className="flex space-x-8">
                <button 
                  onClick={() => setActiveTab('campaigns')}
                  className={`pb-2 ${activeTab === 'campaigns' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-white hover:text-gray-200'}`}
                >
                  <span className="inline-flex items-center gap-2">
                    Campaigns
                    {isLoadingCampaigns && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin loader-light" />
                    )}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('adsets')}
                  className={`pb-2 ${activeTab === 'adsets' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-white hover:text-gray-200'}`}
                >
                  <span className="inline-flex items-center gap-2">
                    Ad Sets
                    {isLoadingAdSets && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin loader-light" />
                    )}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('ads')}
                  className={`pb-2 ${activeTab === 'ads' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-white hover:text-gray-200'}`}
                >
                  <span className="inline-flex items-center gap-2">
                    Ads
                    {isLoadingAds && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin loader-light" />
                    )}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('demographics')}
                  className={`pb-2 ${activeTab === 'demographics' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-white hover:text-gray-200'}`}
                >
                  <span className="inline-flex items-center gap-2">
                    Demographics
                    {isLoadingDemographics && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin loader-light" />
                    )}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('creatives')}
                  className={`pb-2 ${activeTab === 'creatives' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-white hover:text-gray-200'}`}
                >
                  <span className="inline-flex items-center gap-2">
                    Creatives
                    {isLoadingCreatives && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin loader-light" />
                    )}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('ads-library')}
                  className={`pb-2 ${activeTab === 'ads-library' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-white hover:text-gray-200'}`}
                >
                  <span className="inline-flex items-center gap-2">
                    Ads Library
                  </span>
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-200 bg-white">
                      <h3 className="font-medium">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className="p-3 border-b border-gray-700 hover:bg-gray-800">
                          <div className="flex items-start">
                            <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                              notification.type === 'warning' ? 'bg-yellow-500' :
                              notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                            }`}></div>
                            <div>
                              <p className="text-sm">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <select 
                value={selectedAccount} 
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm"
              >
                {connectedAccounts.length > 0 ? (
                  connectedAccounts.filter(acc => acc.status === 'connected').map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))
                ) : (
                  <option value="">No accounts connected</option>
                )}
              </select>
              <button 
                onClick={() => document.body.classList.toggle('theme-dark')}
                className="bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded-md text-sm flex items-center hover:bg-gray-100"
                title="Toggle dark/light theme"
              >
                <Settings className="w-4 h-4 mr-2" />
                Theme
              </button>
              <div className="relative">
                <select 
                  value={selectedDateRange} 
                  onChange={(e) => {
                    setSelectedDateRange(e.target.value);
                  }}
                  className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm appearance-none pr-8"
                >
                  <option value="last_7d">Last 7 Days</option>
                  <option value="last_30d">Last 30 Days</option>
                  <option value="last_90d">Last 90 Days</option>
                  <option value="last_12m">Last 12 Months</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
              </div>
              <button 
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header; 