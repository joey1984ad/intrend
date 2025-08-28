'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BarChart3, Target, Grid3X3, Users, Image, Library, User, ChevronDown, Settings, LogOut, CreditCard } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';
import { ConnectedAccount } from './types';

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

  isLoadingCreatives?: boolean;
  isLoadingCampaigns?: boolean;
  isLoadingAdSets?: boolean;
  isLoadingAds?: boolean;
  isLoadingDemographics?: boolean;
  isLoggedIn?: boolean;
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

  isLoadingCreatives,
  isLoadingCampaigns,
  isLoadingAdSets,
  isLoadingAds,
  isLoadingDemographics,
  isLoggedIn = false
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  
     // Get theme from context
   const themeContext = useDashboardTheme();
   const theme = themeContext?.theme || 'white';
   
   useEffect(() => {
     setMounted(true);
   }, []);
  
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <div className="shadow-sm border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleLogoClick = () => {
    if (isLoggedIn) {
      // If logged in, navigate to campaigns tab
      setActiveTab('campaigns');
    } else {
      // If not logged in, navigate to homepage
      router.push('/');
    }
  };

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
                                         <div className={`shadow-sm border-b transition-colors duration-300 p-2.5 ${
           theme === 'white' 
             ? 'bg-white border-gray-200' 
             : 'bg-slate-800 border-slate-700'
         }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8">
              <button 
                onClick={handleLogoClick}
                className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200 cursor-pointer group"
                title={isLoggedIn ? "Go to Campaigns" : "Go to Homepage"}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-sm transition-colors duration-300 ${
                    theme === 'white' ? 'bg-white' : 'bg-slate-200'
                  }`}></div>
                </div>
                                 <span className={`text-xl font-bold transition-colors duration-300 group-hover:text-blue-600 ${
                   theme === 'white' ? 'text-gray-900' : 'text-white'
                 }`}>Intrend</span>
              </button>
              
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
                              ? 'text-blue-700 border-b-2 border-blue-600'
                              : 'text-white border-b-2 border-blue-400'
                            : theme === 'white'
                              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              : 'text-gray-300 hover:text-white hover:bg-slate-700 hover:shadow-md'
                        }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                                             {tab.loading && (
                         <Loader2 className={`w-3.5 h-3.5 animate-spin transition-colors duration-300 ${
                           theme === 'white' ? 'text-blue-500' : 'text-blue-400'
                         }`} />
                       )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-4">


              {/* Account Selection */}
              <select 
                value={selectedAccount} 
                onChange={(e) => setSelectedAccount(e.target.value)}
                                 className={`border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                   theme === 'white'
                     ? 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                     : 'border-slate-500 bg-slate-800 text-white hover:border-slate-400 hover:bg-slate-700'
                 }`}
              >
                                 {connectedAccounts.filter(acc => acc.status === 'connected').map(account => (
                   <option key={account.id} value={account.id}>{account.name}</option>
                 ))}
              </select>

              {/* Date Range */}
              <div className="relative">
                <select 
                  value={selectedDateRange} 
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                                     className={`border rounded-lg px-3 py-2 text-sm appearance-none pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                     theme === 'white'
                       ? 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                       : 'border-slate-500 bg-slate-800 text-white hover:border-slate-400 hover:bg-slate-700'
                   }`}
                >
                  <option value="last_7d">Last 7 Days</option>
                  <option value="last_30d">Last 30 Days</option>
                  <option value="last_90d">Last 90 Days</option>
                  <option value="last_12m">Last 12 Months</option>
                </select>
                                 <ChevronDown className={`w-4 h-4 absolute right-2 top-3 pointer-events-none transition-colors duration-300 ${
                   theme === 'white' ? 'text-gray-400' : 'text-gray-500'
                 }`} />
              </div>

              {/* Refresh Button */}
              <button 
                onClick={handleRefresh}
                                 className={`p-2 transition-colors disabled:opacity-50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 ${
                   theme === 'white'
                     ? 'text-gray-400 hover:text-gray-600'
                     : 'text-gray-500 hover:text-gray-300'
                 }`}
                disabled={isLoading}
                title="Refresh data"
              >
                                 <Loader2 className={`w-5 h-5 transition-colors duration-300 ${
                   isLoading ? 'animate-spin' : ''
                 } ${
                   theme === 'white' ? 'text-gray-400' : 'text-gray-500'
                 }`} />
              </button>

                            {/* User Profile Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <button 
                                     className={`flex items-center space-x-3 pl-4 border-l transition-colors duration-300 hover:opacity-80 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 ${
                     theme === 'white' ? 'border-gray-200' : 'border-slate-700'
                   }`}
                >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  theme === 'white' ? 'bg-gray-200' : 'bg-slate-600'
                }`}>
                  <User className={`w-4 h-4 transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-600' : 'text-gray-300'
                  }`} />
                </div>
                <div className="text-sm">
                  <p className={`font-medium transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                  }`}>John Doe</p>
                  <p className={`transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                  }`}>Admin</p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div 
                                         className={`absolute right-0 mt-0 w-56 rounded-xl shadow-xl border z-50 transition-colors duration-300 ${
                       theme === 'white' 
                         ? 'bg-white border-gray-200' 
                         : 'bg-slate-900 border-slate-700'
                     }`}
                  >
                    <div className={`p-4 border-b transition-colors duration-300 ${
                      theme === 'white' ? 'border-gray-200' : 'border-slate-700'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          theme === 'white' ? 'bg-gray-200' : 'bg-slate-600'
                        }`}>
                          <User className={`w-5 h-5 transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-600' : 'text-gray-300'
                          }`} />
                        </div>
                        <div>
                          <p className={`font-medium transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                          }`}>John Doe</p>
                          <p className={`text-sm transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                          }`}>john.doe@example.com</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => router.push('/settings')}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 rounded-lg ${
                          theme === 'white'
                            ? 'text-gray-700 hover:bg-gray-50'
                            : 'text-white hover:bg-slate-700'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => router.push('/billing')}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 rounded-lg ${
                          theme === 'white'
                            ? 'text-gray-700 hover:bg-gray-50'
                            : 'text-white hover:bg-slate-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Billing</span>
                      </button>
                      <button
                        onClick={() => router.push('/profile')}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 rounded-lg ${
                          theme === 'white'
                            ? 'text-gray-700 hover:bg-gray-50'
                            : 'text-white hover:bg-slate-700'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                    </div>
                    
                    <div className={`py-2 border-t transition-colors duration-300 ${
                      theme === 'white' ? 'border-gray-200' : 'border-slate-700'
                    }`}>
                      <button
                        onClick={() => {
                          // Handle logout
                          console.log('Logout clicked');
                        }}
                                                 className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 rounded-lg ${
                           theme === 'white'
                             ? 'text-red-600 hover:bg-red-50'
                             : 'text-red-400 hover:bg-red-900/20'
                         }`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header; 