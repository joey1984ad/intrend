'use client'

import React, { useState, useEffect } from 'react';
import Header from './Header';
import AccountSummary from './AccountSummary';
import MetricsGrid from './MetricsGrid';
import ChartsSection from './ChartsSection';
import CreativesTab from './CreativesTab';
import CampaignsTab from './CampaignsTab';
import AdsetsTab from './AdsetsTab';
import AdsTab from './AdsTab';
import DemographicsTab from './DemographicsTab';
import Modals from './Modals';
import InsightsGraph from './InsightsGraph';
import { ConnectedAccount, Notification, Metric, Campaign, CreativeData } from './types';

const MetaDashboardRefactored: React.FC = () => {
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
  
  const [sortField, setSortField] = useState('campaign');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
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

  // Dynamic data state for real Facebook data
  const [clicksData, setClicksData] = useState<any[]>([]);
  const [campaignClicks, setCampaignClicks] = useState<any[]>([]);
  const [publisherData, setPublisherData] = useState<any[]>([]);
  const [currentAccountInfo, setCurrentAccountInfo] = useState<any>(null);
  const [campaignsData, setCampaignsData] = useState<any[]>([]);

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
      }
    }
  }, [activeTab, facebookAccessToken, selectedAdAccount]);

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
    setSelectedCampaigns([]);
  };

  const fetchCreativeData = async () => {
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
          dateRange: selectedDateRange
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

  const handleFacebookSuccess = async (accessToken: string, userId: string) => {
    console.log('🟢 MetaDashboard: handleFacebookSuccess called with userId:', userId);
    console.log('🟢 MetaDashboard: Access token length:', accessToken.length);
    
    // Set the access token immediately but don't close modal yet
    setFacebookAccessToken(accessToken);
    setFacebookUserId(userId);
    setFacebookError(''); // Clear any previous errors
    
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
          response = await fetch('/api/facebook/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken })
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
        setFacebookAdAccounts(data.adAccounts);
        setSelectedAdAccount(data.adAccounts[0].id);
        setIsUsingRealData(true);
        // Only close modal after successful data fetch
        setShowConnectModal(false);
        
        // Fetch initial data after successful connection with a longer delay
        setTimeout(() => {
          console.log('🟢 MetaDashboard: Fetching initial Facebook ads data...');
          fetchFacebookAdsData();
        }, 2000); // Increased delay for better reliability
      } else {
        console.log('⚠️ MetaDashboard: No ad accounts found or API error:', data);
        setFacebookError('No ad accounts found. Please check your Facebook permissions or try connecting with a different account.');
        // Don't close modal if there's an error
        setIsUsingRealData(false);
        throw new Error('No ad accounts found');
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
    setFacebookError(error);
    console.error('Facebook login error:', error);
  };

  const fetchFacebookAdsData = async () => {
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
          compare: compareMode
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
    <div className="min-h-screen bg-gray-100">
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
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AccountSummary
          currentAccountInfo={currentAccountInfo}
          currentAccount={null}
          isUsingRealData={isUsingRealData}
          facebookAccessToken={facebookAccessToken}
          setShowConnectModal={setShowConnectModal}
          isLoadingFacebookData={isLoadingFacebookData}
          selectedDateRange={selectedDateRange}
          setSelectedDateRange={setSelectedDateRange}
          setCompareMode={setCompareMode}
          compareMode={compareMode}
          facebookError={facebookError}
          facebookAdAccounts={facebookAdAccounts}
          selectedAdAccount={selectedAdAccount}
          setSelectedAdAccount={setSelectedAdAccount}
        />

        {/* Tab Content */}
        {activeTab === 'creatives' && (
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
          />
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <>
            <ChartsSection
              clicksData={clicksData}
              campaignClicks={campaignClicks}
              publisherData={publisherData}
              sampleClicksData={sampleClicksData}
              sampleCampaignClicks={sampleCampaignClicks}
              samplePublisherData={samplePublisherData}
            />

            <MetricsGrid metrics={metrics} />

            {/* Performance Insights Graph */}
            <div className="mb-6">
              <InsightsGraph
                accessToken={facebookAccessToken}
                adAccountId={selectedAdAccount}
                dateRange={selectedDateRange}
                isVisible={facebookAccessToken && selectedAdAccount ? true : false}
                compareMode={compareMode}
              />
            </div>

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
          </>
        )}

        {activeTab === 'adsets' && (
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
        )}

        {activeTab === 'ads' && (
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
        )}

        {activeTab === 'demographics' && (
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
        connectedAccounts={connectedAccounts}
      />
    </div>
  );
};

export default MetaDashboardRefactored; 