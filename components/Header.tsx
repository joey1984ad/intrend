'use client'

import React from 'react';
import { Loader2, BarChart3, Target, Grid3X3, Users, Image, Library, Bell, User, ChevronDown } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';
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
  const { theme } = useDashboardTheme();
  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: BarChart3, loading: isLoadingCampaigns },
    { id: 'adsets', label: 'Ad Sets', icon: Target, loading: isLoadingAdSets },
    { id: 'ads', label: 'Ads', icon: Grid3X3, loading: isLoadingAds },
    { id: 'demographics', label: 'Demographics', icon: Users, loading: isLoadingDemographics },
    { id: 'creatives', label: 'Creatives', icon: Image, loading: isLoadingCreatives },
    { id: 'ads-library', label: 'Ads Library', icon: Library, loading: false }
  ];

  return (
    <>
      {/* Header */}
      <div className={`shadow-sm border-b transition-colors duration-300 ${
        theme === 'white' 
          ? 'bg-white border-gray-200' 
          : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <span className={`text-xl font-bold transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                }`}>Intrend</span>
              </div>
              
              {/* Main Navigation */}
              <nav className="flex space-x-1">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        isActive
                          ? theme === 'white'
                            ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                            : 'bg-blue-900/20 text-blue-300 border-b-2 border-blue-400'
                          : theme === 'white'
                            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            : 'text-gray-300 hover:text-gray-100 hover:bg-slate-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.loading && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 relative transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start">
                            <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                              notification.type === 'warning' ? 'bg-yellow-500' :
                              notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                            }`}></div>
                            <div>
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Account Selection */}
              <select 
                value={selectedAccount} 
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {connectedAccounts.length > 0 ? (
                  connectedAccounts.filter(acc => acc.status === 'connected').map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))
                ) : (
                  <option value="">No accounts connected</option>
                )}
              </select>

              {/* Date Range */}
              <div className="relative">
                <select 
                  value={selectedDateRange} 
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 text-sm appearance-none pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="last_7d">Last 7 Days</option>
                  <option value="last_30d">Last 30 Days</option>
                  <option value="last_90d">Last 90 Days</option>
                  <option value="last_12m">Last 12 Months</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Refresh Button */}
              <button 
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                disabled={isLoading}
                title="Refresh data"
              >
                <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">John Doe</p>
                  <p className="text-gray-500">Admin</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header; 