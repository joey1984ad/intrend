'use client'

import React from 'react';
import AdsLibraryCard from './AdsLibraryCard';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';

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

interface AdsLibraryGridProps {
  ads: AdsLibraryAd[];
  isLoading: boolean;
  error: string;
  onAdClick: (ad: AdsLibraryAd) => void;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalResults: number;
  };
  onPageChange: (page: number) => void;
}

const AdsLibraryGrid: React.FC<AdsLibraryGridProps> = ({
  ads,
  isLoading,
  error,
  onAdClick,
  pagination,
  onPageChange
}) => {
  debugLog('AdsLibraryGrid', 'constructor', 'Component initialized with props', {
    adsCount: ads.length,
    isLoading,
    error,
    pagination
  });

  const { theme } = useDashboardTheme();

  // Debug props changes
  React.useEffect(() => {
    debugLog('AdsLibraryGrid', 'useEffect', 'Props changed', {
      adsCount: ads.length,
      isLoading,
      error,
      pagination
    });
  }, [ads, isLoading, error, pagination]);

  const handleAdClick = (ad: AdsLibraryAd) => {
    debugLog('AdsLibraryGrid', 'handleAdClick', 'Ad clicked in grid', {
      adId: ad.id,
      adTitle: ad.adCreativeLinkTitle,
      pageName: ad.pageName,
      mediaType: ad.mediaType
    });
    onAdClick(ad);
  };

  const handlePageChange = (page: number) => {
    debugLog('AdsLibraryGrid', 'handlePageChange', 'Page change requested', {
      currentPage: pagination.currentPage,
      newPage: page,
      totalPages: pagination.totalPages
    });
    onPageChange(page);
  };

  const calculatePaginationRange = () => {
    const startResult = (pagination.currentPage - 1) * pagination.pageSize + 1;
    const endResult = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalResults);
    
    debugLog('AdsLibraryGrid', 'calculatePaginationRange', 'Pagination range calculated', {
      startResult,
      endResult,
      totalResults: pagination.totalResults
    });
    
    return { startResult, endResult };
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (pagination.totalPages <= maxVisiblePages) {
      // Show all pages if total is 5 or less
      for (let i = 1; i <= pagination.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (pagination.currentPage <= 3) {
      // Show first 5 pages if current page is 3 or less
      for (let i = 1; i <= maxVisiblePages; i++) {
        pageNumbers.push(i);
      }
    } else if (pagination.currentPage >= pagination.totalPages - 2) {
      // Show last 5 pages if current page is near the end
      for (let i = pagination.totalPages - 4; i <= pagination.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show 2 pages before and 2 pages after current page
      for (let i = pagination.currentPage - 2; i <= pagination.currentPage + 2; i++) {
        pageNumbers.push(i);
      }
    }
    
    debugLog('AdsLibraryGrid', 'generatePageNumbers', 'Page numbers generated', {
      pageNumbers,
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages
    });
    
    return pageNumbers;
  };

  if (isLoading) {
    debugLog('AdsLibraryGrid', 'render', 'Rendering loading state');
    return (
      <div className={`rounded-lg shadow p-8 transition-colors duration-300 ${
        theme === 'white' ? 'bg-white' : 'bg-slate-800'
      }`}>
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className={`ml-3 text-lg transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-600' : 'text-gray-300'
          }`}>Searching Facebook Ads Library...</span>
        </div>
      </div>
    );
  }

  if (error) {
    debugLog('AdsLibraryGrid', 'render', 'Rendering error state', { error });
    return (
      <div className={`rounded-lg shadow p-8 transition-colors duration-300 ${
        theme === 'white' ? 'bg-white' : 'bg-slate-800'
      }`}>
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">Search Error</div>
          <div className={`transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-600' : 'text-gray-300'
          }`}>{error}</div>
          <div className={`mt-4 text-sm transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Please check your Facebook connection and try again.
          </div>
        </div>
      </div>
    );
  }

  if (ads.length === 0) {
    debugLog('AdsLibraryGrid', 'render', 'Rendering empty state', { adsCount: ads.length });
    return (
      <div className={`rounded-lg shadow p-8 transition-colors duration-300 ${
        theme === 'white' ? 'bg-white' : 'bg-slate-800'
      }`}>
        <div className="text-center">
          <div className={`text-lg font-medium mb-2 transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-500' : 'text-gray-400'
          }`}>No Ads Found</div>
          <div className={`transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Try adjusting your search terms or filters to find more results.
          </div>
        </div>
      </div>
    );
  }

  const { startResult, endResult } = calculatePaginationRange();
  const pageNumbers = generatePageNumbers();

  debugLog('AdsLibraryGrid', 'render', 'Rendering main grid', {
    adsCount: ads.length,
    startResult,
    endResult,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    pageNumbers
  });

  return (
    <div className={`rounded-lg shadow transition-colors duration-300 ${
      theme === 'white' ? 'bg-white' : 'bg-slate-800'
    }`}>
      {/* Results Header */}
      <div className={`px-6 py-4 border-b transition-colors duration-300 ${
        theme === 'white' ? 'border-gray-200' : 'border-slate-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className={`text-sm transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Showing {startResult.toLocaleString()} - {endResult.toLocaleString()} of {pagination.totalResults.toLocaleString()} results
          </div>
          <div className={`text-sm transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ads.map((ad) => (
            <AdsLibraryCard
              key={ad.id}
              ad={ad}
              onClick={() => handleAdClick(ad)}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={`px-6 py-4 border-t transition-colors duration-300 ${
          theme === 'white' ? 'border-gray-200' : 'border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {startResult.toLocaleString()} - {endResult.toLocaleString()} of {pagination.totalResults.toLocaleString()} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className={`px-3 py-2 text-sm font-medium rounded-md border disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
                  theme === 'white'
                    ? 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                    : 'text-gray-300 bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {pageNumbers.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                      pageNum === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : theme === 'white'
                          ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          : 'text-gray-300 bg-slate-700 border border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className={`px-3 py-2 text-sm font-medium rounded-md border disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
                  theme === 'white'
                    ? 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                    : 'text-gray-300 bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsLibraryGrid;
