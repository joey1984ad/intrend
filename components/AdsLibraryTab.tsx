'use client'

import React, { useState, useEffect } from 'react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';
import AdsLibrarySearch from './AdsLibrarySearch';
import AdsLibraryFilters from './AdsLibraryFilters';
import AdsLibraryGrid from './AdsLibraryGrid';
import AdsLibraryDetailModal from './AdsLibraryDetailModal';

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

  const searchAds = async (searchQuery: string, searchFilters: any = filters) => {
    if (!facebookAccessToken) {
      setError('Please connect your Facebook account first');
      setConnectionStatus('disconnected');
      return;
    }

    console.log('🔍 AdsLibraryTab: Starting search with:', { searchQuery, searchFilters, accessToken: facebookAccessToken.substring(0, 20) + '...' });

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

      console.log('🔍 AdsLibraryTab: Request body:', requestBody);

      const response = await fetch('/api/facebook/ads-library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('🔍 AdsLibraryTab: Response status:', response.status);
      console.log('🔍 AdsLibraryTab: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 AdsLibraryTab: Error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        
        console.error('🔍 AdsLibraryTab: Parsed error data:', errorData);
        
        // Set connection status based on error type
        if (response.status === 401 || response.status === 403) {
          setConnectionStatus('error');
        } else {
          setConnectionStatus('error');
        }
        
        throw new Error(`API error: ${response.status} - ${errorData.error || errorText}`);
      }

      const data = await response.json();
      console.log('🔍 AdsLibraryTab: Success response:', data);
      
      if (data.success) {
        setAds(data.ads || []);
        setPagination(prev => ({
          ...prev,
          totalResults: data.totalResults || 0,
          totalPages: Math.ceil((data.totalResults || 0) / pagination.pageSize)
        }));
        setConnectionStatus('connected');
      } else {
        setError(data.error || 'Failed to search ads');
        setConnectionStatus('error');
      }
    } catch (err) {
      console.error('🔍 AdsLibraryTab: Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching ads');
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    searchAds(query);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    searchAds(searchTerm, newFilters);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    searchAds(searchTerm);
  };

  const handleAdClick = (ad: AdsLibraryAd) => {
    setSelectedAd(ad);
    setShowDetailModal(true);
  };

  const exportResults = async (format: 'csv' | 'json') => {
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
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ads-library-${searchTerm || 'search'}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  useEffect(() => {
    if (facebookAccessToken && searchTerm && searchTerm.trim() !== '') {
      searchAds(searchTerm);
    }
  }, [facebookAccessToken]);

  if (!facebookAccessToken) {
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
            }`}>Facebook Ads Library</h2>
            <p className={`transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Search and analyze ads from Facebook's public Ads Library
            </p>
          </div>
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
      </div>

      {/* Results */}
      <AdsLibraryGrid
        ads={ads}
        isLoading={isLoading}
        error={error}
        onAdClick={handleAdClick}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

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
