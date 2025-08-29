'use client'

import React, { useState, useEffect } from 'react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';
import AdsLibrarySearch from './AdsLibrarySearch';
import AdsLibraryFilters from './AdsLibraryFilters';
import AdsLibraryGrid from './AdsLibraryGrid';
import AdsLibraryDetailModal from './AdsLibraryDetailModal';

// Debug utility function
const debugLog = (component: string, functionName: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `🔍 [${timestamp}] ${component}.${functionName}: ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

interface AdsLibraryAd {
  id: string;
  adCreativeBody: string;
  adCreativeLinkTitle: string;
  adCreativeLinkDescription?: string;
  adCreativeLinkCaption?: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  pageName: string;
  pageId: string;
  adDeliveryStartTime: string;
  adDeliveryStopTime?: string;
  adSnapshotUrl: string;
  currency: string;
  spend: {
    lowerBound: string;
    upperBound: string;
  };
  impressions: {
    lowerBound: string;
    upperBound: string;
  };
  publisherPlatforms: string[];
  mediaType: 'image' | 'video' | 'carousel' | 'dynamic';
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  region: string;
  disclaimer?: string;
  adType?: string;
  adCategory?: string;
}

interface AdsLibraryTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  facebookAccessToken: string;
  adAccountId: string;
  dateRange: string;
  selectedAdAccounts: any[];
}

const AdsLibraryTab: React.FC<AdsLibraryTabProps> = ({
  searchTerm,
  setSearchTerm,
  facebookAccessToken,
  adAccountId,
  dateRange,
  selectedAdAccounts
}) => {
  debugLog('AdsLibraryTab', 'constructor', 'Component initialized with props', {
    searchTerm,
    facebookAccessToken: facebookAccessToken ? `${facebookAccessToken.substring(0, 20)}...` : 'null',
    adAccountId,
    dateRange,
    selectedAdAccountsCount: selectedAdAccounts?.length || 0
  });

  const { theme } = useDashboardTheme();
  const [ads, setAds] = useState<AdsLibraryAd[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedAd, setSelectedAd] = useState<AdsLibraryAd | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | 'disconnected'>('checking');
  const [filters, setFilters] = useState({
    region: 'US',
    mediaType: 'all',
    adType: 'all',
    dateRange: 'last_30d',
    minSpend: '',
    maxSpend: '',
    publisherPlatforms: [] as string[]
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    totalResults: 0
  });

  // Debug state changes
  useEffect(() => {
    debugLog('AdsLibraryTab', 'useEffect', 'State changed', {
      adsCount: ads.length,
      isLoading,
      error,
      selectedAd: selectedAd?.id || null,
      showDetailModal,
      connectionStatus,
      filters,
      pagination
    });
  }, [ads, isLoading, error, selectedAd, showDetailModal, connectionStatus, filters, pagination]);

  const searchAds = async (searchQuery: string, searchFilters: any = filters) => {
    debugLog('AdsLibraryTab', 'searchAds', 'Starting search', {
      searchQuery,
      searchFilters,
      accessToken: facebookAccessToken ? `${facebookAccessToken.substring(0, 20)}...` : 'null',
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize
    });

    if (!facebookAccessToken) {
      debugLog('AdsLibraryTab', 'searchAds', 'No Facebook access token provided');
      setError('Please connect your Facebook account first');
      setConnectionStatus('disconnected');
      return;
    }

    setIsLoading(true);
    setError('');
    setConnectionStatus('checking');

    try {
      const requestBody = {
        accessToken: facebookAccessToken,
        searchQuery,
        filters: searchFilters,
        page: pagination.currentPage,
        pageSize: pagination.pageSize
      };

      debugLog('AdsLibraryTab', 'searchAds', 'Making API request', requestBody);

      const response = await fetch('/api/facebook/ads-library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      debugLog('AdsLibraryTab', 'searchAds', 'API response received', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        debugLog('AdsLibraryTab', 'searchAds', 'API error response', {
          status: response.status,
          errorText
        });
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        
        debugLog('AdsLibraryTab', 'searchAds', 'Parsed error data', errorData);
        
        // Handle specific error types
        if (response.status === 401) {
          // Token expired or invalid
          const errorMessage = errorData.error || errorText;
          if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
            setError('Your Facebook access token has expired. Please reconnect your Facebook account to continue.');
            setConnectionStatus('error');
            debugLog('AdsLibraryTab', 'searchAds', 'Token expired, prompting user to reconnect');
          } else {
            setError('Facebook authentication failed. Please check your connection and try again.');
            setConnectionStatus('error');
          }
        } else if (response.status === 403) {
          setError('Access denied. Please ensure your Facebook account has the required permissions.');
          setConnectionStatus('error');
        } else if (response.status === 429) {
          setError('Rate limit exceeded. Please wait a moment and try again.');
          setConnectionStatus('error');
        } else {
          setError(`Search failed: ${errorData.error || errorText}`);
          setConnectionStatus('error');
        }
        
        return;
      }

      const data = await response.json();
      debugLog('AdsLibraryTab', 'searchAds', 'API success response', data);
      
      if (data.success) {
        debugLog('AdsLibraryTab', 'searchAds', 'Setting ads data', {
          adsCount: data.ads?.length || 0,
          totalResults: data.totalResults || 0
        });
        
        setAds(data.ads || []);
        setPagination(prev => ({
          ...prev,
          totalResults: data.totalResults || 0,
          totalPages: Math.ceil((data.totalResults || 0) / pagination.pageSize)
        }));
        setConnectionStatus('connected');
      } else {
        debugLog('AdsLibraryTab', 'searchAds', 'API returned success: false', data);
        setError(data.error || 'Failed to search ads');
        setConnectionStatus('error');
      }
    } catch (err) {
      debugLog('AdsLibraryTab', 'searchAds', 'Search error occurred', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching ads');
      setConnectionStatus('error');
    } finally {
      debugLog('AdsLibraryTab', 'searchAds', 'Search completed, setting loading to false');
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    debugLog('AdsLibraryTab', 'handleSearch', 'Search triggered', { query });
    setSearchTerm(query);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    searchAds(query);
  };

  const handleFiltersChange = (newFilters: any) => {
    debugLog('AdsLibraryTab', 'handleFiltersChange', 'Filters changed', {
      oldFilters: filters,
      newFilters
    });
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    searchAds(searchTerm, newFilters);
  };

  const handlePageChange = (page: number) => {
    debugLog('AdsLibraryTab', 'handlePageChange', 'Page change requested', {
      currentPage: pagination.currentPage,
      newPage: page
    });
    setPagination(prev => ({ ...prev, currentPage: page }));
    searchAds(searchTerm);
  };

  const handleAdClick = (ad: AdsLibraryAd) => {
    debugLog('AdsLibraryTab', 'handleAdClick', 'Ad clicked', {
      adId: ad.id,
      adTitle: ad.adCreativeLinkTitle,
      pageName: ad.pageName
    });
    setSelectedAd(ad);
    setShowDetailModal(true);
  };

  const exportResults = async (format: 'csv' | 'json') => {
    debugLog('AdsLibraryTab', 'exportResults', 'Export requested', {
      format,
      searchTerm,
      filters,
      adsCount: ads.length
    });

    try {
      const response = await fetch('/api/facebook/ads-library/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: facebookAccessToken,
          searchQuery: searchTerm,
          filters,
          format
        })
      });

      if (response.ok) {
        debugLog('AdsLibraryTab', 'exportResults', 'Export successful, creating download');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ads-library-${searchTerm || 'search'}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        debugLog('AdsLibraryTab', 'exportResults', 'Download completed');
      } else {
        debugLog('AdsLibraryTab', 'exportResults', 'Export failed', { status: response.status });
      }
    } catch (error) {
      debugLog('AdsLibraryTab', 'exportResults', 'Export error', error);
    }
  };

  useEffect(() => {
    debugLog('AdsLibraryTab', 'useEffect', 'Facebook access token changed', {
      hasToken: !!facebookAccessToken,
      searchTerm,
      searchTermTrimmed: searchTerm?.trim()
    });
    
    if (facebookAccessToken && searchTerm && searchTerm.trim() !== '') {
      debugLog('AdsLibraryTab', 'useEffect', 'Auto-triggering search due to token change');
      searchAds(searchTerm);
    }
  }, [facebookAccessToken]);

  if (!facebookAccessToken) {
    debugLog('AdsLibraryTab', 'render', 'No Facebook access token, showing connect message');
    return (
      <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
        theme === 'white' ? 'bg-white' : 'bg-slate-800'
      }`}>
        <div className="text-center">
          <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
          }`}>Connect Facebook Account</h3>
          <p className={`mb-4 transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Please connect your Facebook account to access the Ads Library
          </p>
        </div>
      </div>
    );
  }

  debugLog('AdsLibraryTab', 'render', 'Rendering main component', {
    adsCount: ads.length,
    isLoading,
    error,
    connectionStatus
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
        theme === 'white' ? 'bg-white' : 'bg-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-gray-100'
            }`}>
              Facebook Ads Library
            </h2>
            <p className={`transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Search and analyze ads from Facebook's public Ads Library
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Export Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => exportResults('csv')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={() => exportResults('json')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Public Ads Library Section */}
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="mb-4">
          {/* Connection Status Indicator */}
          <div className={`flex items-center gap-2 mb-3 p-3 rounded-md text-sm transition-colors duration-300 ${
            theme === 'white' ? 'bg-gray-50' : 'bg-slate-700'
          }`}>
            {connectionStatus === 'checking' && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Checking Facebook connection...</span>
              </div>
            )}
            {connectionStatus === 'connected' && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>Connected to Facebook Ads Library</span>
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span>Connection error - check permissions or reconnect</span>
              </div>
            )}
            {connectionStatus === 'disconnected' && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>Not connected to Facebook</span>
              </div>
            )}
          </div>
        </div>

        <AdsLibrarySearch
          searchTerm={searchTerm}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        <AdsLibraryFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Results */}
        <AdsLibraryGrid
          ads={ads}
          isLoading={isLoading}
          error={error}
          onAdClick={handleAdClick}
          pagination={pagination}
          onPageChange={handlePageChange}
        />

        {/* Token Expired Help Message */}
        {error && error.includes('expired') && (
          <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
            theme === 'white' ? 'bg-yellow-50 border border-yellow-200' : 'bg-yellow-900/20 border border-yellow-700'
          }`}>
            <div className="text-center">
              <h3 className={`text-lg font-medium mb-3 transition-colors duration-300 ${
                theme === 'white' ? 'text-yellow-800' : 'text-yellow-200'
              }`}>
                🔑 Facebook Access Token Expired
              </h3>
              <p className={`mb-4 transition-colors duration-300 ${
                theme === 'white' ? 'text-yellow-700' : 'text-yellow-300'
              }`}>
                Your Facebook access token has expired and needs to be refreshed to continue using the Ads Library.
              </p>
              <div className={`space-y-3 text-sm transition-colors duration-300 ${
                theme === 'white' ? 'text-yellow-600' : 'text-yellow-400'
              }`}>
                <p><strong>To fix this:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                  <li>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Facebook Graph API Explorer</a></li>
                  <li>Select your app from the dropdown</li>
                  <li>Choose permissions: <code className="bg-yellow-100 px-1 rounded">ads_read</code>, <code className="bg-yellow-100 px-1 rounded">ads_management</code></li>
                  <li>Click "Generate Access Token"</li>
                  <li>Copy the new token and update your environment</li>
                </ol>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.open('https://developers.facebook.com/tools/explorer/', '_blank')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Open Facebook Graph API Explorer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAd && (
        <AdsLibraryDetailModal
          ad={selectedAd}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default AdsLibraryTab;
