'use client'

import React, { useState, useEffect } from 'react';
import Header from './Header';
import AccountSummary from './AccountSummary';
import MetricsGrid from './MetricsGrid';
import ChartsSection from './ChartsSection';
import CreativesTab from './CreativesTab';
import CampaignsTab from './CampaignsTab';
import AdsetsTab from './AdsetsTab';
import AdsetsChartsSection from './AdsetsChartsSection';
import AdsetsMetricsGrid from './AdsetsMetricsGrid';
import AdsTab from './AdsTab';
import DemographicsTab from './DemographicsTab';
import AdsLibraryTab from './AdsLibraryTab';
import AdAccountManager from './AdAccountManager';
import PerAccountBillingManager from './PerAccountBillingManager';
import PerAccountPlanSelector from './PerAccountPlanSelector';
import AdAccountSelector from './AdAccountSelector';
import Modals from './Modals';
import InsightsGraph from './InsightsGraph';
import DashboardThemeToggle from './DashboardThemeToggle';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';
import { useUser } from '@/contexts/UserContext';
import { ConnectedAccount, Notification, Metric, Campaign, CreativeData } from './types';

const MetaDashboardRefactored: React.FC = () => {
  // Theme management
  const { theme } = useDashboardTheme();
  
  // User context
  const { user } = useUser();
  
  // State management
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [selectedAccount, setSelectedAccount] = useState('acme-auto');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isLoading, setIsLoading] = useState(false);
  // Separate search states for each tab
  const [campaignsSearchTerm, setCampaignsSearchTerm] = useState('');
  const [adsetsSearchTerm, setAdsetsSearchTerm] = useState('');
  const [adsSearchTerm, setAdsSearchTerm] = useState('');
  const [demographicsSearchTerm, setDemographicsSearchTerm] = useState('');
  const [creativesSearchTerm, setCreativesSearchTerm] = useState('');
  const [adsLibrarySearchTerm, setAdsLibrarySearchTerm] = useState('facebook ads');
  
  const [sortField, setSortField] = useState('campaign');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [selectedCreatives, setSelectedCreatives] = useState<number[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Facebook integration state
  const [facebookAccessToken, setFacebookAccessToken] = useState<string>('');
  const [facebookUserId, setFacebookUserId] = useState<string>('');
  const [facebookAdAccounts, setFacebookAdAccounts] = useState<any[]>([]);
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>('');
  const [isLoadingFacebookData, setIsLoadingFacebookData] = useState(false);
  const [facebookError, setFacebookError] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState('last_30d');
  const [isUsingRealData, setIsUsingRealData] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [cacheTtlHours, setCacheTtlHours] = useState<number>(6);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  
  // Per-account billing state
  const [perAccountSubscriptions, setPerAccountSubscriptions] = useState<any[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  
  // Plan selection state
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [pendingAdAccounts, setPendingAdAccounts] = useState<any[]>([]);
  
  // Account selection state
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [allAdAccounts, setAllAdAccounts] = useState<any[]>([]);

  // Dynamic data state for real Facebook data
  const [clicksData, setClicksData] = useState<any[]>([]);
  const [campaignClicks, setCampaignClicks] = useState<any[]>([]);
  const [publisherData, setPublisherData] = useState<any[]>([]);
  const [currentAccountInfo, setCurrentAccountInfo] = useState<any>(null);
  const [campaignsData, setCampaignsData] = useState<any[]>([]);

  // Dynamic data state for ad sets
  const [adsetPerformanceData, setAdsetPerformanceData] = useState<any[]>([]);
  const [adsetClicks, setAdsetClicks] = useState<any[]>([]);
  const [adsetSpendData, setAdsetSpendData] = useState<any[]>([]);

  // Sample data
  const sampleClicksData = [
    { date: '16 Jun', clicks: 160, impressions: 12000, spend: 280 },
    { date: '17 Jun', clicks: 175, impressions: 13200, spend: 310 },
    { date: '18 Jun', clicks: 168, impressions: 12800, spend: 295 },
    { date: '19 Jun', clicks: 182, impressions: 14100, spend: 325 },
    { date: '20 Jun', clicks: 195, impressions: 15200, spend: 340 },
    { date: '21 Jun', clicks: 188, impressions: 14800, spend: 335 },
    { date: '22 Jun', clicks: 201, impressions: 15800, spend: 360 },
    { date: '23 Jun', clicks: 210, impressions: 16500, spend: 380 },
    { date: '24 Jun', clicks: 198, impressions: 15600, spend: 350 },
    { date: '25 Jun', clicks: 205, impressions: 16200, spend: 365 },
    { date: '26 Jun', clicks: 218, impressions: 17100, spend: 385 },
    { date: '27 Jun', clicks: 225, impressions: 17800, spend: 395 },
    { date: '28 Jun', clicks: 212, impressions: 16800, spend: 375 },
    { date: '29 Jun', clicks: 220, impressions: 17400, spend: 388 },
    { date: '30 Jun', clicks: 235, impressions: 18500, spend: 410 },
    { date: '1 Jul', clicks: 240, impressions: 19000, spend: 420 },
    { date: '2 Jul', clicks: 228, impressions: 18200, spend: 400 },
    { date: '3 Jul', clicks: 245, impressions: 19500, spend: 435 },
    { date: '4 Jul', clicks: 252, impressions: 20100, spend: 450 },
    { date: '5 Jul', clicks: 248, impressions: 19800, spend: 440 },
    { date: '6 Jul', clicks: 255, impressions: 20300, spend: 455 },
    { date: '7 Jul', clicks: 260, impressions: 20800, spend: 465 }
  ];

  const sampleCampaignClicks = [
    { name: 'Sample Campaign 1', clicks: 124, color: '#3B82F6', percentage: 26.7 },
    { name: 'Sample Campaign 2', clicks: 117, color: '#6B7280', percentage: 25.2 },
    { name: 'Sample Campaign 3', clicks: 114, color: '#10B981', percentage: 24.6 },
    { name: 'Sample Campaign 4', clicks: 108, color: '#F59E0B', percentage: 23.5 }
  ].filter(campaign => campaign.clicks > 0);

  const samplePublisherData = [
    { name: 'Facebook', value: 126, color: '#1877F2' },
    { name: 'Instagram', value: 119, color: '#E4405F' },
    { name: 'Messenger', value: 114, color: '#00B2FF' },
    { name: 'Audience Network', value: 110, color: '#8B5CF6' }
  ];

  // Sample ad sets data
  const sampleAdsetPerformanceData = [
    { date: '16 Jun', clicks: 45, spend: 85 },
    { date: '17 Jun', clicks: 52, spend: 95 },
    { date: '18 Jun', clicks: 48, spend: 88 },
    { date: '19 Jun', clicks: 55, spend: 102 },
    { date: '20 Jun', clicks: 58, spend: 108 },
    { date: '21 Jun', clicks: 51, spend: 96 },
    { date: '22 Jun', clicks: 62, spend: 115 },
    { date: '23 Jun', clicks: 65, spend: 120 },
    { date: '24 Jun', clicks: 59, spend: 110 },
    { date: '25 Jun', clicks: 68, spend: 125 },
    { date: '26 Jun', clicks: 71, spend: 130 },
    { date: '27 Jun', clicks: 74, spend: 135 },
    { date: '28 Jun', clicks: 67, spend: 122 },
    { date: '29 Jun', clicks: 70, spend: 128 },
    { date: '30 Jun', clicks: 73, spend: 132 }
  ];

  const sampleAdsetClicks = [
    { name: 'Ad Set A - Core', clicks: 245, color: '#6366F1', percentage: 28.5 },
    { name: 'Ad Set B - Lookalike', clicks: 218, color: '#8B5CF6', percentage: 25.4 },
    { name: 'Ad Set C - Interest', clicks: 195, color: '#06B6D4', percentage: 22.7 },
    { name: 'Ad Set D - Retarget', clicks: 178, color: '#F59E0B', percentage: 20.7 },
    { name: 'Ad Set E - Broad', clicks: 162, color: '#10B981', percentage: 18.8 }
  ].filter(adset => adset.clicks > 0);

  const sampleAdsetSpendData = [
    { name: 'Ad Set A - Core', spend: 425, color: '#7C3AED' },
    { name: 'Ad Set B - Lookalike', spend: 385, color: '#EC4899' },
    { name: 'Ad Set C - Interest', spend: 345, color: '#06B6D4' },
    { name: 'Ad Set D - Retarget', spend: 315, color: '#10B981' },
    { name: 'Ad Set E - Broad', spend: 285, color: '#F59E0B' }
  ];

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [campaignData, setCampaignData] = useState<Campaign[]>([]);
  const [creativeData, setCreativeData] = useState<CreativeData[]>([]);
  const [isLoadingCreatives, setIsLoadingCreatives] = useState(false);
  
  // Dummy data for all tabs
  const [adsetsData, setAdsetsData] = useState<any[]>([]);
  const [adsData, setAdsData] = useState<any[]>([]);
  const [demographicsData, setDemographicsData] = useState<any[]>([]);
  const [isLoadingAdsets, setIsLoadingAdsets] = useState(false);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  const [isLoadingDemographics, setIsLoadingDemographics] = useState(false);
  
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Restore Facebook session on component mount
  useEffect(() => {
    const restoreFacebookSession = async () => {
      try {
        console.log('🔄 MetaDashboard: Restoring Facebook session...');
        
        // First check localStorage for cached session
        const cachedToken = localStorage.getItem('facebookAccessToken');
        const cachedUserId = localStorage.getItem('facebookUserId');
        const cachedAdAccounts = localStorage.getItem('facebookAdAccounts');
        const cachedSelectedAccount = localStorage.getItem('selectedAdAccount');
        
        if (cachedToken && cachedUserId) {
          console.log('🔄 MetaDashboard: Found cached Facebook session, validating...');
          
          // Validate the token by making a simple API call
          try {
            const response = await fetch(`https://graph.facebook.com/v23.0/me?access_token=${cachedToken}`);
            if (response.ok) {
              console.log('✅ MetaDashboard: Cached token is valid');
              setFacebookAccessToken(cachedToken);
              setFacebookUserId(cachedUserId);
              
              if (cachedAdAccounts) {
                try {
                  const adAccounts = JSON.parse(cachedAdAccounts);
                  setFacebookAdAccounts(adAccounts);
                  console.log('🔄 MetaDashboard: Restored ad accounts:', adAccounts.length);
                } catch (error) {
                  console.error('Failed to parse cached ad accounts:', error);
                }
              }
              
              if (cachedSelectedAccount) {
                setSelectedAdAccount(cachedSelectedAccount);
                console.log('🔄 MetaDashboard: Restored selected account:', cachedSelectedAccount);
              }
              
              setIsUsingRealData(true);
              setIsRestoringSession(false);
              return;
            } else {
              console.log('❌ MetaDashboard: Cached token is invalid, clearing session');
              // Clear invalid session data
              localStorage.removeItem('facebookAccessToken');
              localStorage.removeItem('facebookUserId');
              localStorage.removeItem('facebookAdAccounts');
              localStorage.removeItem('selectedAdAccount');
            }
          } catch (error) {
            console.error('❌ MetaDashboard: Error validating cached token:', error);
            // Clear session data on validation error
            localStorage.removeItem('facebookAccessToken');
            localStorage.removeItem('facebookUserId');
            localStorage.removeItem('facebookAdAccounts');
            localStorage.removeItem('selectedAdAccount');
          }
        }
        
        // If no cached session, check with the session API
        console.log('🔄 MetaDashboard: No cached session, checking session API...');
        setIsRestoringSession(false);
        
      } catch (error) {
        console.error('❌ MetaDashboard: Error restoring Facebook session:', error);
        setIsRestoringSession(false);
      }
    };
    
    restoreFacebookSession();
  }, []);

  // Save selectedAdAccount to localStorage when it changes
  useEffect(() => {
    if (selectedAdAccount) {
      localStorage.setItem('selectedAdAccount', selectedAdAccount);
    }
  }, [selectedAdAccount]);

  // Load per-account subscriptions when user is available
  useEffect(() => {
    if (user?.id) {
      loadPerAccountSubscriptions();
    }
  }, [user?.id]);

  // Listen for Facebook account refresh requests
  useEffect(() => {
    const handleRefreshFacebookAccounts = () => {
      console.log('🔄 MetaDashboard: Received refresh Facebook accounts request');
      if (facebookAccessToken) {
        handleFacebookSuccess(facebookAccessToken, facebookUserId || '');
      } else {
        console.log('⚠️ MetaDashboard: No Facebook token available, opening connect modal');
        setShowConnectModal(true);
      }
    };

    const handleStartAccountSubscription = (event: any) => {
      console.log('🟢 MetaDashboard: Received startAccountSubscription event');
      console.log('🟢 MetaDashboard: Event detail:', event.detail);
      const { accounts, planId, billingCycle } = event.detail;
      console.log('🟢 MetaDashboard: Setting pending accounts:', accounts);
      console.log('🟢 MetaDashboard: Opening plan selector modal');
      setPendingAdAccounts(accounts);
      setShowPlanSelector(true);
    };

    const handleAddAccountSubscription = (event: any) => {
      console.log('🔄 MetaDashboard: Adding account subscription');
      const { account } = event.detail;
      setPendingAdAccounts([account]);
      setShowPlanSelector(true);
    };

    window.addEventListener('refreshFacebookAccounts', handleRefreshFacebookAccounts);
    window.addEventListener('startAccountSubscription', handleStartAccountSubscription);
    window.addEventListener('addAccountSubscription', handleAddAccountSubscription);
    
    return () => {
      window.removeEventListener('refreshFacebookAccounts', handleRefreshFacebookAccounts);
      window.removeEventListener('startAccountSubscription', handleStartAccountSubscription);
      window.removeEventListener('addAccountSubscription', handleAddAccountSubscription);
    };
  }, [facebookAccessToken, facebookUserId]);

  // Auto-load data when selectedAdAccount changes
  useEffect(() => {
    if (facebookAccessToken && selectedAdAccount && !isLoadingFacebookData) {
      console.log(`🔄 useEffect: Auto-loading data for account ${selectedAdAccount} with date range ${selectedDateRange}`);
      fetchFacebookAdsData();
    }
  }, [selectedAdAccount, facebookAccessToken]);

  // Auto-load data when date range or compare mode changes
  useEffect(() => {
    if (facebookAccessToken && selectedAdAccount && !isLoadingFacebookData) {
      console.log(`🔄 useEffect: Date range changed to ${selectedDateRange} or compare mode changed to ${compareMode}, reloading data`);
      fetchFacebookAdsData();
    }
  }, [selectedDateRange, compareMode]);

  // Auto-load creative data when tab changes to creatives
  useEffect(() => {
    if (activeTab === 'creatives' && facebookAccessToken && selectedAdAccount && !isLoadingCreatives) {
      console.log(`🎨 useEffect: Tab changed to creatives, loading creative data`);
      fetchCreativeData();
    }
  }, [activeTab, facebookAccessToken, selectedAdAccount]);

  // Auto-load creative data when date range or ad account changes (if on creatives tab)
  useEffect(() => {
    if (activeTab === 'creatives' && facebookAccessToken && selectedAdAccount && !isLoadingCreatives) {
      console.log(`🎨 useEffect: Date range or ad account changed, refreshing creative data`);
      fetchCreativeData();
    }
  }, [selectedDateRange, selectedAdAccount]);

  // Auto-load data for all tabs when they become active
  useEffect(() => {
    if (facebookAccessToken && selectedAdAccount) {
      switch (activeTab) {
        case 'campaigns':
          // Campaigns data is already loaded via fetchFacebookAdsData
          break;
        case 'adsets':
          if (!isLoadingAdsets) {
            console.log(`📊 useEffect: Tab changed to adsets, loading ad sets data`);
            fetchAdsetsData();
          }
          break;
        case 'ads':
          if (!isLoadingAds) {
            console.log(`📊 useEffect: Tab changed to ads, loading ads data`);
            fetchAdsData();
          }
          break;
        case 'demographics':
          if (!isLoadingDemographics) {
            console.log(`📊 useEffect: Tab changed to demographics, loading demographics data`);
            fetchDemographicsData();
          }
          break;
        case 'creatives':
          if (!isLoadingCreatives) {
            console.log(`📊 useEffect: Tab changed to creatives, loading creative data`);
            fetchCreativeData();
          }
          break;
        case 'ads-library':
          // Ads Library data is loaded via the component itself
          console.log(`📊 useEffect: Tab changed to ads-library`);
          break;
      }
    }
  }, [activeTab, facebookAccessToken, selectedAdAccount]);

  // Debug InsightsGraph props
  useEffect(() => {
    console.log('🔍 MetaDashboard: InsightsGraph props:', {
      hasAccessToken: !!facebookAccessToken,
      adAccountId: selectedAdAccount,
      dateRange: selectedDateRange,
      isVisible: facebookAccessToken && selectedAdAccount ? true : false,
      compareMode
    });
  }, [facebookAccessToken, selectedAdAccount, selectedDateRange, compareMode]);

  // Event handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectCampaign = (campaignId: number) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for campaigns:`, selectedCampaigns);
    
    if (action === 'ai-analysis') {
      // Handle AI analysis for selected creatives
      const imageCreatives = creativeData.filter(creative => 
        selectedCreatives.includes(creative.id) && creative.creativeType === 'image'
      );
      
      if (imageCreatives.length === 0) {
        alert('Please select image creatives to analyze. Video analysis is coming soon.');
        return;
      }
      
      if (imageCreatives.length > 10) {
        alert('Please select 10 or fewer creatives for AI analysis to avoid overwhelming the system.');
        return;
      }
      
      alert(`Starting AI analysis for ${imageCreatives.length} image creatives. Results will appear when analysis is complete.`);
      
      // Start AI analysis for each selected creative
      imageCreatives.forEach(async (creative) => {
        try {
          const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
          if (!webhookUrl) {
            console.error('No webhook URL configured for AI analysis');
            return;
          }
          
          const webhookPayload = {
            creativeId: creative.id.toString(),
            adAccountId: selectedAdAccount,
            accessToken: facebookAccessToken, // ✅ ADDED: Facebook access token
            imageUrl: creative.imageUrl || creative.thumbnailUrl,
            creativeName: creative.name,
            creativeType: creative.creativeType,
            dateRange: selectedDateRange, // ✅ ADDED: Date range for Facebook API
            timestamp: new Date().toISOString()
          };
          
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload),
          });
          
          if (response.ok) {
            console.log(`✅ AI analysis started for creative ${creative.id}`);
          } else {
            console.error(`❌ AI analysis failed for creative ${creative.id}`);
          }
        } catch (error) {
          console.error(`❌ Error starting AI analysis for creative ${creative.id}:`, error);
        }
      });
      
      setSelectedCreatives([]);
      return;
    }
    
    setSelectedCampaigns([]);
  };

  const fetchCreativeData = async (forceRefresh: boolean = false) => {
    if (!facebookAccessToken || !selectedAdAccount) return;
    
    setIsLoadingCreatives(true);
    try {
      console.log('🟢 MetaDashboard: Fetching creatives data from /api/facebook/creatives...');
      const response = await fetch('/api/facebook/creatives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: facebookAccessToken,
          adAccountId: selectedAdAccount,
          dateRange: selectedDateRange,
          cacheTtlHours: cacheTtlHours,
          refresh: forceRefresh === true
        })
      });
      
      console.log('🟢 MetaDashboard: Creatives API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Creatives API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🟢 MetaDashboard: Creatives API response data:', data);
      
      if (data.success) {
        console.log('✅ MetaDashboard: Successfully fetched creatives data');
        console.log(`📊 Found ${data.creatives?.length || 0} creatives`);
        setCreativeData(data.creatives || []);
      } else {
        console.error('❌ MetaDashboard: Creatives API returned error:', data.error);
        setCreativeData([]);
      }
    } catch (error) {
      console.error('❌ MetaDashboard: Error fetching creatives data:', error);
      setCreativeData([]);
    } finally {
      setIsLoadingCreatives(false);
    }
  };

  const fetchAdsetsData = async () => {
    if (!facebookAccessToken || !selectedAdAccount) return;
    
    setIsLoadingAdsets(true);
    try {
      console.log('🟢 MetaDashboard: Loading dummy ad sets data...');
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dummyAdsetsData = [
        { id: 1, name: 'Ad Set 1 - Broad Audience', status: 'ACTIVE', budget: 500, spend: 320, impressions: 15000, clicks: 180, ctr: 1.2, cpc: 1.78, reach: 8500 },
        { id: 2, name: 'Ad Set 2 - Lookalike', status: 'ACTIVE', budget: 300, spend: 245, impressions: 12000, clicks: 156, ctr: 1.3, cpc: 1.57, reach: 7200 },
        { id: 3, name: 'Ad Set 3 - Interest Based', status: 'PAUSED', budget: 400, spend: 180, impressions: 8500, clicks: 95, ctr: 1.12, cpc: 1.89, reach: 4800 },
        { id: 4, name: 'Ad Set 4 - Retargeting', status: 'ACTIVE', budget: 600, spend: 420, impressions: 18000, clicks: 210, ctr: 1.17, cpc: 2.00, reach: 10200 },
        { id: 5, name: 'Ad Set 5 - Custom Audience', status: 'ACTIVE', budget: 350, spend: 298, impressions: 13500, clicks: 165, ctr: 1.22, cpc: 1.81, reach: 7800 }
      ];
      
      setAdsetsData(dummyAdsetsData);
      console.log('✅ MetaDashboard: Successfully loaded dummy ad sets data');
    } catch (error) {
      console.error('❌ MetaDashboard: Error loading ad sets data:', error);
      setAdsetsData([]);
    } finally {
      setIsLoadingAdsets(false);
    }
  };

  const fetchAdsData = async () => {
    if (!facebookAccessToken || !selectedAdAccount) return;
    
    setIsLoadingAds(true);
    try {
      console.log('🟢 MetaDashboard: Loading dummy ads data...');
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dummyAdsData = [
        { id: 1, name: 'Ad 1 - Product Showcase', status: 'ACTIVE', adSet: 'Ad Set 1', impressions: 8500, clicks: 95, ctr: 1.12, cpc: 1.89, spend: 180, performance: 'Good' },
        { id: 2, name: 'Ad 2 - Brand Awareness', status: 'ACTIVE', adSet: 'Ad Set 2', impressions: 7200, clicks: 88, ctr: 1.22, cpc: 1.67, spend: 147, performance: 'Excellent' },
        { id: 3, name: 'Ad 3 - Lead Generation', status: 'PAUSED', adSet: 'Ad Set 3', impressions: 4800, clicks: 52, ctr: 1.08, cpc: 2.15, spend: 112, performance: 'Poor' },
        { id: 4, name: 'Ad 4 - Conversion Focus', status: 'ACTIVE', adSet: 'Ad Set 4', impressions: 10200, clicks: 125, ctr: 1.23, cpc: 1.76, spend: 220, performance: 'Good' },
        { id: 5, name: 'Ad 5 - Retargeting Ad', status: 'ACTIVE', adSet: 'Ad Set 5', impressions: 7800, clicks: 92, ctr: 1.18, cpc: 1.83, spend: 168, performance: 'Good' }
      ];
      
      setAdsData(dummyAdsData);
      console.log('✅ MetaDashboard: Successfully loaded dummy ads data');
    } catch (error) {
      console.error('❌ MetaDashboard: Error loading ads data:', error);
      setAdsData([]);
    } finally {
      setIsLoadingAds(false);
    }
  };

  const fetchDemographicsData = async () => {
    if (!facebookAccessToken || !selectedAdAccount) return;
    
    setIsLoadingDemographics(true);
    try {
      console.log('🟢 MetaDashboard: Loading dummy demographics data...');
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dummyDemographicsData = [
        { age: '18-24', gender: 'Male', impressions: 8500, clicks: 95, spend: 180, ctr: 1.12, cpc: 1.89 },
        { age: '18-24', gender: 'Female', impressions: 7200, clicks: 88, spend: 147, ctr: 1.22, cpc: 1.67 },
        { age: '25-34', gender: 'Male', impressions: 10200, clicks: 125, spend: 220, ctr: 1.23, cpc: 1.76 },
        { age: '25-34', gender: 'Female', impressions: 7800, clicks: 92, spend: 168, ctr: 1.18, cpc: 1.83 },
        { age: '35-44', gender: 'Male', impressions: 4800, clicks: 52, spend: 112, ctr: 1.08, cpc: 2.15 },
        { age: '35-44', gender: 'Female', impressions: 6500, clicks: 78, spend: 145, ctr: 1.20, cpc: 1.86 },
        { age: '45-54', gender: 'Male', impressions: 3200, clicks: 35, spend: 85, ctr: 1.09, cpc: 2.43 },
        { age: '45-54', gender: 'Female', impressions: 4200, clicks: 48, spend: 110, ctr: 1.14, cpc: 2.29 }
      ];
      
      setDemographicsData(dummyDemographicsData);
      console.log('✅ MetaDashboard: Successfully loaded dummy demographics data');
    } catch (error) {
      console.error('❌ MetaDashboard: Error loading demographics data:', error);
      setDemographicsData([]);
    } finally {
      setIsLoadingDemographics(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchFacebookAdsData();
    } finally {
      setIsLoading(false);
    }
  };

  // Force refresh bypassing cache for campaigns and creatives
  const handleRefreshNow = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchFacebookAdsData(true),
        fetchCreativeData(true)
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSuccess = async (accessToken: string, userId: string) => {
    console.log('🟢 MetaDashboard: handleFacebookSuccess called with userId:', userId);
    console.log('🟢 MetaDashboard: Access token length:', accessToken.length);
    console.log('🟢 MetaDashboard: Environment =', process.env.NODE_ENV);
    
    // Set the access token immediately but don't close modal yet
    setFacebookAccessToken(accessToken);
    setFacebookUserId(userId);
    setFacebookError(''); // Clear any previous errors
    
    // Show loading state
    setFacebookError('Connecting to Facebook... Please wait while we fetch your ad accounts.');
    
    // Save to localStorage for persistence
    localStorage.setItem('facebookAccessToken', accessToken);
    localStorage.setItem('facebookUserId', userId);
    
    // Add a small delay to ensure the token is properly set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      console.log('🟢 MetaDashboard: Making API call to /api/facebook/auth...');
      // Fetch ad accounts using the auth endpoint with retry logic
      let response;
      let data;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          // Update progress message
          if (retryCount > 0) {
            setFacebookError(`Retrying connection... (Attempt ${retryCount + 1}/${maxRetries})`);
          } else {
            setFacebookError('Fetching your Facebook ad accounts...');
          }
          
          response = await fetch('/api/facebook/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              accessToken,
              userEmail: user?.email 
            })
          });
          
          console.log('🟢 MetaDashboard: API response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          data = await response.json();
          console.log('🟢 MetaDashboard: API response data:', data);
          
          // If we get here, the request was successful
          break;
        } catch (fetchError) {
          retryCount++;
          console.error(`❌ MetaDashboard: API call attempt ${retryCount} failed:`, fetchError);
          
          if (retryCount >= maxRetries) {
            throw fetchError;
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      if (data.success && data.adAccounts && data.adAccounts.length > 0) {
        console.log('✅ MetaDashboard: Successfully fetched ad accounts:', data.adAccounts);
        
        // Show success message briefly
        setFacebookError(`✅ Successfully connected! Found ${data.adAccounts.length} ad account(s). You can now manage your ad accounts.`);
        
        setFacebookAdAccounts(data.adAccounts);
        setSelectedAdAccount(data.adAccounts[0].id);
        
        // Save ad accounts and selected account to localStorage
        localStorage.setItem('facebookAdAccounts', JSON.stringify(data.adAccounts));
        localStorage.setItem('selectedAdAccount', data.adAccounts[0].id);
        
        setIsUsingRealData(true);
        
        // Store all ad accounts for future use
        setAllAdAccounts(data.adAccounts);
        
        // Clear success message and close modal after a brief delay
        setTimeout(() => {
          setFacebookError('');
          setShowConnectModal(false);
          // Don't automatically show account selector - let user choose when to subscribe
        }, 2000);
        
        // Fetch initial data after successful connection with a longer delay
        setTimeout(() => {
          console.log('🟢 MetaDashboard: Fetching initial Facebook ads data...');
          fetchFacebookAdsData();
        }, 2000); // Increased delay for better reliability
      } else {
        console.log('⚠️ MetaDashboard: No ad accounts found or API error:', data);
        const errorMessage = data.error || 'No ad accounts found. Please check your Facebook permissions or try connecting with a different account.';
        setFacebookError(errorMessage);
        // Don't close modal if there's an error
        setIsUsingRealData(false);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ MetaDashboard: Error fetching ad accounts:', error);
      setFacebookError(`Failed to fetch ad accounts: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      // Don't close modal if there's an error
      setIsUsingRealData(false);
      throw error; // Re-throw to trigger error handling in modal
    }
  };

  const handleFacebookError = (error: string) => {
    console.error('❌ MetaDashboard: Facebook login error:', error);
    setFacebookError(error);
    // Clear Facebook session data from localStorage
    localStorage.removeItem('facebookAccessToken');
    localStorage.removeItem('facebookUserId');
    localStorage.removeItem('facebookAdAccounts');
    localStorage.removeItem('selectedAdAccount');
    // Don't close modal on error - let user retry
    setIsUsingRealData(false);
  };

  const clearFacebookSession = () => {
    console.log('🔄 MetaDashboard: Clearing Facebook session...');
    setFacebookAccessToken('');
    setFacebookUserId('');
    setFacebookAdAccounts([]);
    setSelectedAdAccount('');
    setIsUsingRealData(false);
    setFacebookError('');
    
    // Clear from localStorage
    localStorage.removeItem('facebookAccessToken');
    localStorage.removeItem('facebookUserId');
    localStorage.removeItem('facebookAdAccounts');
    localStorage.removeItem('selectedAdAccount');
  };

  // Load per-account subscriptions
  const loadPerAccountSubscriptions = async () => {
    if (!user?.id) return;
    
    setIsLoadingSubscriptions(true);
    try {
      const response = await fetch(`/api/per-account-subscriptions?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setPerAccountSubscriptions(data.subscriptions || []);
        console.log('📊 MetaDashboard: Loaded per-account subscriptions:', data.subscriptions?.length || 0);
      }
    } catch (error) {
      console.error('❌ MetaDashboard: Error loading per-account subscriptions:', error);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  // Handle plan selection confirmation
  const handlePlanSelectionConfirm = async (planId: string, billingCycle: 'monthly' | 'annual') => {
    console.log('🟢 MetaDashboard: Creating checkout session with plan:', planId, billingCycle);
    
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userEmail: user?.email,
          planId,
          billingCycle,
          adAccounts: pendingAdAccounts
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ MetaDashboard: Checkout session created, redirecting to Stripe');
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error('❌ MetaDashboard: Failed to create checkout session:', data.error);
        alert(`Failed to create checkout session: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ MetaDashboard: Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setShowPlanSelector(false);
      setPendingAdAccounts([]);
    }
  };

  // Handle plan selection cancellation
  const handlePlanSelectionCancel = () => {
    setShowPlanSelector(false);
    setPendingAdAccounts([]);
  };

  // Handle account selection confirmation
  const handleAccountSelectionConfirm = (selectedAccounts: any[]) => {
    console.log('🟢 MetaDashboard: Selected accounts for subscription:', selectedAccounts);
    setShowAccountSelector(false);
    setPendingAdAccounts(selectedAccounts);
    setShowPlanSelector(true);
  };

  // Handle account selection cancellation
  const handleAccountSelectionCancel = () => {
    setShowAccountSelector(false);
    setAllAdAccounts([]);
  };

  const fetchFacebookAdsData = async (forceRefresh: boolean = false) => {
    if (!facebookAccessToken || !selectedAdAccount) return;
    
    setIsLoadingFacebookData(true);
    try {
      console.log('🟢 MetaDashboard: Fetching ads data from /api/facebook/ads...');
      const response = await fetch('/api/facebook/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: facebookAccessToken,
          adAccountId: selectedAdAccount,
          dateRange: selectedDateRange,
          compare: compareMode,
          cacheTtlHours: cacheTtlHours,
          refresh: forceRefresh === true
        })
      });
      
      console.log('🟢 MetaDashboard: API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🟢 MetaDashboard: API response data:', data);
      
      if (data.success) {
        console.log('✅ MetaDashboard: API returned success, processing data...');
        
        // Transform the API response to match our component expectations
        const insights = data.insights || [];
        const accountTotals = data.accountTotals || {};
        
        // Transform insights data for charts
        const transformedClicksData = insights.map((day: any) => ({
          date: new Date(day.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          clicks: parseInt(day.clicks || 0),
          impressions: parseInt(day.impressions || 0),
          spend: parseFloat(day.spend || 0)
        }));
        
        // Transform campaigns data for charts - filter campaigns with at least 1 click
        const transformedCampaignClicks = (data.campaigns || [])
          .filter((campaign: any) => parseInt(campaign.insights?.clicks || 0) > 0)
          .map((campaign: any) => ({
            name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
            clicks: parseInt(campaign.insights?.clicks || 0),
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
            percentage: 0 // Will calculate below
          }));
        
        // Calculate percentages for campaign clicks
        const totalClicks = transformedCampaignClicks.reduce((sum: number, campaign: any) => sum + campaign.clicks, 0);
        transformedCampaignClicks.forEach((campaign: any) => {
          campaign.percentage = totalClicks > 0 ? (campaign.clicks / totalClicks) * 100 : 0;
        });
        
        // Create publisher data based on real platform breakdown
        // For now, we'll use a more realistic distribution based on total clicks
        const accountTotalClicks = accountTotals.totalClicks || 0;
        const transformedPublisherData = [
          { name: 'Facebook', value: Math.floor(accountTotalClicks * 0.6), color: '#1877F2' },
          { name: 'Instagram', value: Math.floor(accountTotalClicks * 0.25), color: '#E4405F' },
          { name: 'Messenger', value: Math.floor(accountTotalClicks * 0.1), color: '#00B2FF' },
          { name: 'Audience Network', value: Math.floor(accountTotalClicks * 0.05), color: '#8B5CF6' }
        ].filter(platform => platform.value > 0); // Only show platforms with clicks
        
        // Create metrics from account totals
        const transformedMetrics = [
          { label: 'Total Clicks', value: (accountTotals.totalClicks || 0).toLocaleString(), change: '+0%', trend: 'up' as const },
          { label: 'Total Impressions', value: (accountTotals.totalImpressions || 0).toLocaleString(), change: '+0%', trend: 'up' as const },
          { label: 'Total Reach', value: (accountTotals.totalReach || 0).toLocaleString(), change: '+0%', trend: 'up' as const },
          { label: 'Amount Spent', value: `$${(accountTotals.totalSpent || 0).toFixed(2)}`, change: '+0%', trend: 'up' as const },
          { label: 'Average CPC', value: `$${(accountTotals.avgCPC || 0).toFixed(2)}`, change: '+0%', trend: 'up' as const },
          { label: 'Average CPM', value: `$${(accountTotals.avgCPM || 0).toFixed(2)}`, change: '+0%', trend: 'up' as const },
          { label: 'Average CTR', value: `${(accountTotals.avgCTR || 0).toFixed(2)}%`, change: '+0%', trend: 'up' as const }
        ];
        
        // Update state with transformed data
        setClicksData(transformedClicksData);
        setCampaignClicks(transformedCampaignClicks);
        setPublisherData(transformedPublisherData);
        setCampaignsData(data.campaigns || []);
        setCurrentAccountInfo({
          ...data.accountInfo,
          activeCampaigns: (data.campaigns || []).filter((c: any) => c.status === 'ACTIVE').length,
          totalSpent: accountTotals.totalSpent
        });
        setMetrics(transformedMetrics);
        
        console.log('✅ MetaDashboard: Successfully processed and transformed ads data');
        console.log('📊 Transformed data:', {
          clicksData: transformedClicksData.length,
          campaignClicks: transformedCampaignClicks.length,
          publisherData: transformedPublisherData.length,
          metrics: transformedMetrics.length
        });
      } else {
        console.error('❌ MetaDashboard: API returned error:', data.error);
        setFacebookError(data.error || 'Failed to fetch ads data');
      }
    } catch (error) {
      console.error('❌ MetaDashboard: Error fetching Facebook ads data:', error);
      setFacebookError('Failed to fetch ads data');
    } finally {
      setIsLoadingFacebookData(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'white' 
        ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50' 
        : 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900'
    }`}>
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <DashboardThemeToggle />
      </div>
      
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        connectedAccounts={connectedAccounts}
        setShowAccountModal={setShowAccountModal}
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={setSelectedDateRange}
        handleRefresh={handleRefresh}
        isLoading={isLoading}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notifications={notifications}
        isLoadingCreatives={isLoadingCreatives}
        isLoadingCampaigns={isLoadingFacebookData}
        isLoadingAdSets={isLoadingAdsets}
        isLoadingAds={isLoadingAds}
        isLoadingDemographics={isLoadingDemographics}
        isLoggedIn={true}
      />

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 ${
        theme === 'white' ? 'text-gray-900' : 'text-gray-100'
      }`}>
        <AccountSummary
          currentAccountInfo={currentAccountInfo}
          currentAccount={null}
          isUsingRealData={isUsingRealData}
          facebookAccessToken={facebookAccessToken}
          setShowConnectModal={setShowConnectModal}
          isLoadingFacebookData={isLoadingFacebookData}
          isRestoringSession={isRestoringSession}
          selectedDateRange={selectedDateRange}
          setSelectedDateRange={setSelectedDateRange}
          setCompareMode={setCompareMode}
          compareMode={compareMode}
          facebookError={facebookError}
          facebookAdAccounts={facebookAdAccounts}
          selectedAdAccount={selectedAdAccount}
          setSelectedAdAccount={setSelectedAdAccount}
          cacheTtlHours={cacheTtlHours}
          setCacheTtlHours={setCacheTtlHours}
          onRefreshNow={handleRefreshNow}
          perAccountSubscriptions={perAccountSubscriptions}
        />

        {/* Subscribe to Plan Section - Show when user has Facebook accounts but no subscriptions */}
        {facebookAdAccounts.length > 0 && perAccountSubscriptions.length === 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Ready to Subscribe?
                  </h2>
                  <p className="text-gray-600">
                    You have {facebookAdAccounts.length} Facebook ad account{facebookAdAccounts.length > 1 ? 's' : ''} connected. 
                    Choose a plan to start managing your ad accounts with advanced analytics.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Available Plans</div>
                  <div className="text-lg font-semibold text-gray-900">Basic: $10/month</div>
                  <div className="text-lg font-semibold text-gray-900">Pro: $20/month</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    console.log('🔵 MetaDashboard: Choose Plan & Subscribe clicked');
                    console.log('🔵 MetaDashboard: facebookAdAccounts:', facebookAdAccounts.length);
                    console.log('🔵 MetaDashboard: Setting allAdAccounts and showing selector');
                    setAllAdAccounts(facebookAdAccounts);
                    setShowAccountSelector(true);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Choose Plan & Subscribe
                </button>
                <button
                  onClick={() => window.open('/billing', '_blank')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  View All Plans
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Per-Account Billing Section - Always Show */}
        <div className="mb-8">
          {perAccountSubscriptions.length > 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                All Ad Account Subscriptions
              </h2>
              <p className="text-gray-600 mb-6">
                Each Facebook ad account has its own individual subscription with separate billing.
              </p>
              
              {/* All Subscriptions Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {perAccountSubscriptions.map((subscription) => (
                  <div key={subscription.id} className={`p-4 border rounded-lg ${
                    subscription.ad_account_id === selectedAdAccount 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {subscription.ad_account_name}
                      </h3>
                      {subscription.ad_account_id === selectedAdAccount && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      ID: {subscription.ad_account_id}
                    </p>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        ${(subscription.amount_cents / 100).toFixed(2)} / {subscription.billing_cycle}
                      </p>
                      <p className={`text-xs ${
                        subscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Status: {subscription.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Individual Management for Selected Account */}
              <PerAccountBillingManager
                userId={user?.id || 0}
                adAccounts={perAccountSubscriptions}
                selectedAdAccount={selectedAdAccount}
                onSubscriptionUpdate={loadPerAccountSubscriptions}
                availableAdAccounts={facebookAdAccounts}
              />
            </div>
          ) : (
            /* Show interface for adding first subscription */
            <PerAccountBillingManager
              userId={user?.id || 0}
              adAccounts={perAccountSubscriptions}
              selectedAdAccount={selectedAdAccount}
              onSubscriptionUpdate={loadPerAccountSubscriptions}
              availableAdAccounts={facebookAdAccounts}
            />
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'creatives' && (
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            theme === 'white' 
              ? 'bg-white border-gray-200' 
              : 'bg-slate-800 border-slate-700'
          }`}>
            <CreativesTab
              searchTerm={creativesSearchTerm}
              setSearchTerm={setCreativesSearchTerm}
              selectedCampaigns={selectedCampaigns}
              handleBulkAction={handleBulkAction}
              setShowExportModal={setShowExportModal}
              isLoadingCreatives={isLoadingCreatives}
              creativeData={creativeData}
              facebookAccessToken={facebookAccessToken}
              dateRange={selectedDateRange}
              adAccountId={selectedAdAccount || ''}
            />
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <>
            <div className={`rounded-xl shadow-sm border p-6 mb-6 transition-colors duration-300 ${
              theme === 'white' 
                ? 'bg-white border-gray-200' 
                : 'bg-slate-800 border-slate-700'
            }`}>
              <ChartsSection
                clicksData={clicksData}
                campaignClicks={campaignClicks}
                publisherData={publisherData}
                sampleClicksData={sampleClicksData}
                sampleCampaignClicks={sampleCampaignClicks}
                samplePublisherData={samplePublisherData}
              />
            </div>

            <MetricsGrid metrics={metrics} />

            {/* Performance Insights Graph */}
            <div className={`rounded-xl shadow-sm border p-6 mb-6 transition-colors duration-300 ${
              theme === 'white' 
                ? 'bg-white border-gray-200' 
                : 'bg-slate-800 border-slate-700'
            }`}>
              <InsightsGraph
                accessToken={facebookAccessToken}
                adAccountId={selectedAdAccount}
                dateRange={selectedDateRange}
                isVisible={facebookAccessToken && selectedAdAccount ? true : false}
                compareMode={compareMode}
              />
            </div>

            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              theme === 'white' 
                ? 'bg-white border-gray-200' 
                : 'bg-slate-800 border-slate-700'
            }`}>
              <CampaignsTab
                campaigns={campaignsData}
                isLoading={isLoadingFacebookData}
                searchTerm={campaignsSearchTerm}
                setSearchTerm={setCampaignsSearchTerm}
                selectedCampaigns={selectedCampaigns}
                handleSelectCampaign={handleSelectCampaign}
                handleBulkAction={handleBulkAction}
                setShowExportModal={setShowExportModal}
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
              />
            </div>
          </>
        )}

        {activeTab === 'adsets' && (
          <>
            <div className={`rounded-xl shadow-sm border p-6 mb-6 transition-colors duration-300 ${
              theme === 'white' 
                ? 'bg-white border-gray-200' 
                : 'bg-slate-800 border-slate-700'
            }`}>
              <AdsetsChartsSection
                adsetPerformanceData={adsetPerformanceData}
                adsetClicks={adsetClicks}
                adsetSpendData={adsetSpendData}
                sampleAdsetPerformanceData={sampleAdsetPerformanceData}
                sampleAdsetClicks={sampleAdsetClicks}
                sampleAdsetSpendData={sampleAdsetSpendData}
              />
            </div>

            <AdsetsMetricsGrid metrics={metrics} />

            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              theme === 'white' 
                ? 'bg-white border-gray-200' 
                : 'bg-slate-800 border-slate-700'
            }`}>
              <AdsetsTab
                adsetsData={adsetsData}
                isLoading={isLoadingAdsets}
                searchTerm={adsetsSearchTerm}
                setSearchTerm={setAdsetsSearchTerm}
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
                selectedItems={selectedCampaigns}
                handleSelectItem={handleSelectCampaign}
                handleBulkAction={handleBulkAction}
              />
            </div>
          </>
        )}

        {activeTab === 'ads' && (
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            theme === 'white' 
              ? 'bg-white border-gray-200' 
              : 'bg-slate-800 border-slate-700'
          }`}>
            <AdsTab
              adsData={adsData}
              isLoading={isLoadingAds}
              searchTerm={adsSearchTerm}
              setSearchTerm={setAdsSearchTerm}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSort={handleSort}
              selectedItems={selectedCampaigns}
              handleSelectItem={handleSelectCampaign}
              handleBulkAction={handleBulkAction}
            />
          </div>
        )}

        {activeTab === 'demographics' && (
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            theme === 'white' 
              ? 'bg-white border-gray-200' 
              : 'bg-slate-800 border-slate-700'
          }`}>
            <DemographicsTab
              demographicsData={demographicsData}
              isLoading={isLoadingDemographics}
              searchTerm={demographicsSearchTerm}
              setSearchTerm={setDemographicsSearchTerm}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSort={handleSort}
              selectedItems={selectedCampaigns}
              handleSelectItem={handleSelectCampaign}
              handleBulkAction={handleBulkAction}
            />
          </div>
        )}

        {activeTab === 'ads-library' && (
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            theme === 'white' 
              ? 'bg-white border-gray-200' 
              : 'bg-slate-800 border-slate-700'
          }`}>
            <AdsLibraryTab
              searchTerm={adsLibrarySearchTerm}
              setSearchTerm={setAdsLibrarySearchTerm}
              facebookAccessToken={facebookAccessToken}
              adAccountId={selectedAdAccount}
              dateRange={selectedDateRange}
              selectedAdAccounts={facebookAdAccounts}
            />
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            theme === 'white' 
              ? 'bg-white border-gray-200' 
              : 'bg-slate-800 border-slate-700'
          }`}>
            <AdAccountManager />
          </div>
        )}
      </div>

      <Modals
        showConnectModal={showConnectModal}
        setShowConnectModal={setShowConnectModal}
        showAccountModal={showAccountModal}
        setShowAccountModal={setShowAccountModal}
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
        handleFacebookSuccess={handleFacebookSuccess}
        handleFacebookError={handleFacebookError}
        clearFacebookSession={clearFacebookSession}
        connectedAccounts={connectedAccounts}
      />

      {/* Account Selection Modal */}
      <AdAccountSelector
        adAccounts={allAdAccounts}
        onConfirm={handleAccountSelectionConfirm}
        onCancel={handleAccountSelectionCancel}
        isVisible={showAccountSelector}
      />

      {/* Plan Selection Modal */}
      <PerAccountPlanSelector
        adAccounts={pendingAdAccounts}
        onConfirm={handlePlanSelectionConfirm}
        onCancel={handlePlanSelectionCancel}
        isVisible={showPlanSelector}
      />
    </div>
  );
};

export default MetaDashboardRefactored; 