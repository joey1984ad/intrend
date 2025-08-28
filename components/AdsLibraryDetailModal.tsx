'use client'

import React from 'react';
import { X, ExternalLink, Calendar, DollarSign, Eye, MapPin, Building, Play, Image as ImageIcon } from 'lucide-react';
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

interface AdsLibraryDetailModalProps {
  ad: AdsLibraryAd;
  isOpen: boolean;
  onClose: () => void;
}

const AdsLibraryDetailModal: React.FC<AdsLibraryDetailModalProps> = ({
  ad,
  isOpen,
  onClose
}) => {
  debugLog('AdsLibraryDetailModal', 'constructor', 'Component initialized with props', {
    adId: ad.id,
    isOpen,
    adTitle: ad.adCreativeLinkTitle,
    pageName: ad.pageName
  });

  const { theme } = useDashboardTheme();

  // Debug props changes
  React.useEffect(() => {
    debugLog('AdsLibraryDetailModal', 'useEffect', 'Props changed', {
      adId: ad.id,
      isOpen,
      adTitle: ad.adCreativeLinkTitle
    });
  }, [ad, isOpen]);

  if (!isOpen) {
    debugLog('AdsLibraryDetailModal', 'render', 'Modal is closed, returning null');
    return null;
  }

  const formatCurrency = (amount: string) => {
    debugLog('AdsLibraryDetailModal', 'formatCurrency', 'Formatting currency', { amount });
    
    const num = parseInt(amount);
    if (isNaN(num)) {
      debugLog('AdsLibraryDetailModal', 'formatCurrency', 'Invalid amount, returning $0', { amount });
      return '$0';
    }
    
    let result;
    if (num >= 1000000) {
      result = `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      result = `$${(num / 1000).toFixed(1)}K`;
    } else {
      result = `$${num.toLocaleString()}`;
    }
    
    debugLog('AdsLibraryDetailModal', 'formatCurrency', 'Currency formatted', { amount, result });
    return result;
  };

  const formatImpressions = (amount: string) => {
    debugLog('AdsLibraryDetailModal', 'formatImpressions', 'Formatting impressions', { amount });
    
    const num = parseInt(amount);
    if (isNaN(num)) {
      debugLog('AdsLibraryDetailModal', 'formatImpressions', 'Invalid amount, returning 0', { amount });
      return '0';
    }
    
    let result;
    if (num >= 1000000) {
      result = `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      result = `${(num / 1000).toFixed(1)}K`;
    } else {
      result = num.toLocaleString();
    }
    
    debugLog('AdsLibraryDetailModal', 'formatImpressions', 'Impressions formatted', { amount, result });
    return result;
  };

  const formatDate = (dateString: string) => {
    debugLog('AdsLibraryDetailModal', 'formatDate', 'Formatting date', { dateString });
    
    try {
      const date = new Date(dateString);
      const result = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      debugLog('AdsLibraryDetailModal', 'formatDate', 'Date formatted', { dateString, result });
      return result;
    } catch (error) {
      debugLog('AdsLibraryDetailModal', 'formatDate', 'Date formatting error', { dateString, error });
      return 'Invalid Date';
    }
  };

  const getPlatformIcon = (platform: string) => {
    debugLog('AdsLibraryDetailModal', 'getPlatformIcon', 'Getting platform icon', { platform });
    
    let icon;
    switch (platform.toLowerCase()) {
      case 'facebook':
        icon = '📘';
        break;
      case 'instagram':
        icon = '📷';
        break;
      case 'messenger':
        icon = '💬';
        break;
      case 'audience_network':
        icon = '🌐';
        break;
      default:
        icon = '📱';
        break;
    }
    
    debugLog('AdsLibraryDetailModal', 'getPlatformIcon', 'Platform icon selected', { platform, icon });
    return icon;
  };

  const getStatusColor = () => {
    debugLog('AdsLibraryDetailModal', 'getStatusColor', 'Getting status color', { status: ad.status });
    
    let colorClass;
    switch (ad.status) {
      case 'ACTIVE':
        colorClass = 'bg-green-100 text-green-800';
        break;
      case 'PAUSED':
        colorClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'DELETED':
        colorClass = 'bg-red-100 text-red-800';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
        break;
    }
    
    debugLog('AdsLibraryDetailModal', 'getStatusColor', 'Status color selected', { status: ad.status, colorClass });
    return colorClass;
  };

  const getMediaIcon = () => {
    debugLog('AdsLibraryDetailModal', 'getMediaIcon', 'Getting media icon', { mediaType: ad.mediaType });
    
    let icon;
    switch (ad.mediaType) {
      case 'video':
        icon = <Play className="h-12 w-12 text-white" />;
        break;
      case 'image':
        icon = <ImageIcon className="h-12 w-12 text-white" />;
        break;
      case 'carousel':
        icon = <div className="text-white text-lg font-medium">Carousel</div>;
        break;
      case 'dynamic':
        icon = <div className="text-white text-lg font-medium">Dynamic</div>;
        break;
      default:
        icon = <ImageIcon className="h-12 w-12 text-white" />;
        break;
    }
    
    debugLog('AdsLibraryDetailModal', 'getMediaIcon', 'Media icon selected', { mediaType: ad.mediaType });
    return icon;
  };

  const handleClose = () => {
    debugLog('AdsLibraryDetailModal', 'handleClose', 'Close button clicked', {
      adId: ad.id,
      adTitle: ad.adCreativeLinkTitle
    });
    onClose();
  };

  const handleExternalLinkClick = () => {
    debugLog('AdsLibraryDetailModal', 'handleExternalLinkClick', 'External link clicked', {
      adId: ad.id,
      adSnapshotUrl: ad.adSnapshotUrl
    });
    window.open(ad.adSnapshotUrl, '_blank');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    debugLog('AdsLibraryDetailModal', 'handleImageError', 'Image failed to load', {
      adId: ad.id,
      imageUrl: ad.imageUrl || ad.thumbnailUrl
    });
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  debugLog('AdsLibraryDetailModal', 'render', 'Rendering detail modal', {
    adId: ad.id,
    hasImage: !!(ad.imageUrl || ad.thumbnailUrl),
    hasVideo: !!ad.videoUrl,
    mediaType: ad.mediaType,
    status: ad.status,
    theme
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
        theme === 'white' ? 'bg-white' : 'bg-slate-800'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${
          theme === 'white' ? 'border-gray-200' : 'border-slate-700'
        }`}>
          <div>
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-gray-100'
            }`}>Ad Details</h2>
            <p className={`transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-400'
            }`}>Detailed information about this advertisement</p>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors duration-300 ${
              theme === 'white'
                ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700'
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Media Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Media Preview */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {ad.imageUrl || ad.thumbnailUrl ? (
                  <img
                    src={ad.imageUrl || ad.thumbnailUrl}
                    alt="Ad preview"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : ad.videoUrl ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {getMediaIcon()}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    {getMediaIcon()}
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor()}`}>
                    {ad.status}
                  </span>
                </div>

                {/* Media Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 text-sm font-medium bg-black bg-opacity-50 text-white rounded-full">
                    {ad.mediaType}
                  </span>
                </div>
              </div>

              {/* External Link */}
              <div className="text-center">
                <a
                  href={ad.adSnapshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleExternalLinkClick}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View on Facebook</span>
                </a>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Page Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{ad.pageName}</span>
                  </div>
                  <div className="text-sm text-gray-500">Page ID: {ad.pageId}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ad Content</h3>
                <div className="space-y-2">
                  {ad.adCreativeLinkTitle && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Title</div>
                      <div className="text-gray-900">{ad.adCreativeLinkTitle}</div>
                    </div>
                  )}
                  {ad.adCreativeBody && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Description</div>
                      <div className="text-gray-900">{ad.adCreativeBody}</div>
                    </div>
                  )}
                  {ad.adCreativeLinkCaption && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Caption</div>
                      <div className="text-gray-900">{ad.adCreativeLinkCaption}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Spend Range</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {ad.spend.lowerBound === ad.spend.upperBound
                        ? formatCurrency(ad.spend.lowerBound)
                        : `${formatCurrency(ad.spend.lowerBound)} - ${formatCurrency(ad.spend.upperBound)}`
                      }
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Impressions</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {ad.impressions.lowerBound === ad.impressions.upperBound
                        ? formatImpressions(ad.impressions.lowerBound)
                        : `${formatImpressions(ad.impressions.lowerBound)} - ${formatImpressions(ad.impressions.upperBound)}`
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timing Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Timing Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Start Date</div>
                    <div className="text-gray-900">{formatDate(ad.adDeliveryStartTime)}</div>
                  </div>
                </div>
                {ad.adDeliveryStopTime && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">End Date</div>
                      <div className="text-gray-900">{formatDate(ad.adDeliveryStopTime)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Platform & Region */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform & Location</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Publisher Platforms</div>
                  <div className="flex flex-wrap gap-2">
                    {ad.publisherPlatforms.map((platform, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        <span>{getPlatformIcon(platform)}</span>
                        <span className="capitalize">{platform.replace('_', ' ')}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Region</div>
                    <div className="text-gray-900">{ad.region}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          {ad.disclaimer && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Disclaimer</h3>
              <p className="text-yellow-700">{ad.disclaimer}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Ad ID: {ad.id}
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsLibraryDetailModal;
