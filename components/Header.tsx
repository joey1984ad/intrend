'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BarChart3, Target, Grid3X3, Users, Image, Library, User, ChevronDown, Settings, LogOut, CreditCard, Menu, X } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';
import { useUser } from '@/contexts/UserContext';
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
  setShowDatePicker: (show: boolean) => void;
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
  setShowDatePicker,
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Get theme from context
  const themeContext = useDashboardTheme();
  const theme = themeContext?.theme || 'white';
  
  // Get user from context
  const { user, isLoggedIn: isUserLoggedIn, logout } = useUser();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const router = useRouter();

  const handleLogoClick = () => {
    if (isUserLoggedIn) {
      // If logged in, navigate to campaigns tab
      setActiveTab('campaigns');
    } else {
      // If not logged in, navigate to homepage
      router.push('/');
    }
    // Close mobile menu on logo click
    setShowMobileMenu(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      router.push('/');
    }
  };

  const handleDebugLogout = () => {
    console.log('Debug Logout clicked. Simulating logout...');
    // In a real application, you would call the actual logout function
    // For debugging, we'll just navigate to the homepage
    router.push('/');
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowMobileMenu(false);
  };

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: BarChart3, loading: isLoadingCampaigns },
    { id: 'adsets', label: 'Ad Sets', icon: Target, loading: isLoadingAdSets },
    { id: 'ads', label: 'Ads', icon: Grid3X3, loading: isLoadingAds },
    { id: 'demographics', label: 'Demographics', icon: Users, loading: isLoadingDemographics },
    { id: 'creatives', label: 'Creatives', icon: Image, loading: isLoadingCreatives },
    { id: 'ads-library', label: 'Ads Library', icon: Library, loading: false }
  ];

  // User display information
  const userName = user?.name || 'Guest User';
  const userEmail = user?.email || 'No email';
  const userRole = user?.company ? 'Business User' : 'Individual User';

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <div className="shadow-sm border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className={`shadow-sm border-b transition-colors duration-300 ${
        theme === 'white' 
          ? 'bg-white border-gray-200' 
          : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4 lg:space-x-8">
              <button 
                onClick={handleLogoClick}
                className="flex items-center space-x-2 lg:space-x-3 hover:opacity-80 transition-all duration-200 cursor-pointer group"
                title={isUserLoggedIn ? "Go to Campaigns" : "Go to Homepage"}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-sm transition-colors duration-300 ${
                    theme === 'white' ? 'bg-white' : 'bg-slate-200'
                  }`}></div>
                </div>
                <span className={`text-lg lg:text-xl font-bold transition-colors duration-300 group-hover:text-blue-600 ${
                  theme === 'white' ? 'text-gray-900' : 'text-white'
                }`}>Intrend</span>
              </button>
              
              {/* Desktop Navigation - Visible on all screen sizes */}
              <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 lg:space-x-2 whitespace-nowrap ${
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
                       <span className="hidden sm:inline">{tab.label}</span>
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
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Desktop Controls - Hidden on mobile */}
              <div className="hidden lg:flex items-center space-x-4">
                {/* Account Selector */}
                <button
                  onClick={() => setShowAccountModal(true)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                    theme === 'white'
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-slate-600 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {selectedAccount}
                </button>

                {/* Date Range Selector */}
                <button
                  onClick={() => setShowDatePicker(true)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                    theme === 'white'
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-slate-600 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {selectedDateRange}
                </button>

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
              </div>

              {/* Mobile Controls */}
              <div className="lg:hidden flex items-center space-x-2">
                {/* Refresh Button - Mobile */}
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
                  <Loader2 className={`w-4 h-4 transition-colors duration-300 ${
                    isLoading ? 'animate-spin' : ''
                  } ${
                    theme === 'white' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    theme === 'white'
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-slate-700'
                  }`}
                  aria-label="Toggle mobile menu"
                >
                  {showMobileMenu ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* User Profile Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <button 
                  className={`flex items-center space-x-2 lg:space-x-3 pl-2 lg:pl-4 border-l transition-colors duration-300 hover:opacity-80 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 ${
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
                  {/* Hide user info on mobile */}
                  <div className="hidden lg:block text-sm">
                    <p className={`font-medium transition-colors duration-300 ${
                      theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                    }`}>{userName}</p>
                    <p className={`transition-colors duration-300 ${
                      theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                    }`}>{userRole}</p>
                  </div>
                  <ChevronDown className={`hidden lg:block w-4 h-4 transition-colors duration-300 ${
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
                          }`}>{userName}</p>
                          <p className={`text-sm transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                          }`}>{userEmail}</p>
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
                        onClick={handleLogout}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 rounded-lg ${
                          theme === 'white'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-red-400 hover:bg-red-900/20'
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                      
                      {/* Debug logout button - remove in production */}
                      <button
                        onClick={handleDebugLogout}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 rounded-lg mt-2 ${
                          theme === 'white'
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-orange-400 hover:bg-orange-900/20'
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Debug Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {showMobileMenu && (
            <div className={`lg:hidden border-t transition-colors duration-300 ${
              theme === 'white' ? 'border-gray-200' : 'border-slate-700'
            }`}>
              {/* Mobile Navigation Tabs */}
              <nav className="py-4">
                <div className="grid grid-cols-2 gap-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center space-y-2 ${
                          isActive
                            ? theme === 'white'
                              ? 'text-blue-700 bg-blue-50 border border-blue-200'
                              : 'text-white bg-blue-600/20 border border-blue-400/30'
                            : theme === 'white'
                              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                              : 'text-gray-300 hover:text-white hover:bg-slate-700 border border-transparent'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-xs">{tab.label}</span>
                        {tab.loading && (
                          <Loader2 className={`w-3.5 h-3.5 animate-spin transition-colors duration-300 ${
                            theme === 'white' ? 'text-blue-500' : 'text-blue-400'
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Mobile Controls */}
              <div className={`py-4 border-t transition-colors duration-300 ${
                theme === 'white' ? 'border-gray-200' : 'border-slate-700'
              }`}>
                <div className="space-y-3">
                  {/* Account Selector */}
                  <button
                    onClick={() => {
                      setShowAccountModal(true);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 text-left ${
                      theme === 'white'
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'border-slate-600 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="block text-xs text-gray-500 mb-1">Account</span>
                    {selectedAccount}
                  </button>

                  {/* Date Range Selector */}
                  <button
                    onClick={() => {
                      setShowDatePicker(true);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 text-left ${
                      theme === 'white'
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'border-slate-600 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="block text-xs text-gray-500 mb-1">Date Range</span>
                    {selectedDateRange}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header; 