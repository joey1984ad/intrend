'use client'

import React from 'react';
import AdsLibraryCard from './AdsLibraryCard';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-600">Searching Facebook Ads Library...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">Search Error</div>
          <div className="text-gray-600">{error}</div>
          <div className="mt-4 text-sm text-gray-500">
            Please check your Facebook connection and try again.
          </div>
        </div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-gray-500 text-lg font-medium mb-2">No Ads Found</div>
          <div className="text-gray-600">
            Try adjusting your search terms or filters to find more results.
          </div>
        </div>
      </div>
    );
  }

  const startResult = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endResult = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalResults);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Results Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startResult.toLocaleString()} - {endResult.toLocaleString()} of {pagination.totalResults.toLocaleString()} results
          </div>
          <div className="text-sm text-gray-500">
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
              onClick={() => onAdClick(ad)}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {startResult.toLocaleString()} - {endResult.toLocaleString()} of {pagination.totalResults.toLocaleString()} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
