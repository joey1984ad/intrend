'use client'

import React from 'react';
import { Eye, ExternalLink, Play, Image as ImageIcon, Calendar, DollarSign, MapPin } from 'lucide-react';

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

interface AdsLibraryCardProps {
  ad: AdsLibraryAd;
  onClick: () => void;
}

const AdsLibraryCard: React.FC<AdsLibraryCardProps> = ({ ad, onClick }) => {
  debugLog('AdsLibraryCard', 'constructor', 'Component initialized with ad', {
    adId: ad.id,
    adTitle: ad.adCreativeLinkTitle,
    pageName: ad.pageName,
    mediaType: ad.mediaType,
    status: ad.status
  });

  const formatCurrency = (amount: string) => {
    debugLog('AdsLibraryCard', 'formatCurrency', 'Formatting currency', { amount });
    
    const num = parseInt(amount);
    if (isNaN(num)) {
      debugLog('AdsLibraryCard', 'formatCurrency', 'Invalid amount, returning $0', { amount });
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
    
    debugLog('AdsLibraryCard', 'formatCurrency', 'Currency formatted', { amount, result });
    return result;
  };

  const formatImpressions = (amount: string) => {
    debugLog('AdsLibraryCard', 'formatImpressions', 'Formatting impressions', { amount });
    
    const num = parseInt(amount);
    if (isNaN(num)) {
      debugLog('AdsLibraryCard', 'formatImpressions', 'Invalid amount, returning 0', { amount });
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
    
    debugLog('AdsLibraryCard', 'formatImpressions', 'Impressions formatted', { amount, result });
    return result;
  };

  const formatDate = (dateString: string) => {
    debugLog('AdsLibraryCard', 'formatDate', 'Formatting date', { dateString });
    
    try {
      const date = new Date(dateString);
      const result = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      
      debugLog('AdsLibraryCard', 'formatDate', 'Date formatted', { dateString, result });
      return result;
    } catch (error) {
      debugLog('AdsLibraryCard', 'formatDate', 'Date formatting error', { dateString, error });
      return 'Invalid Date';
    }
  };

  const getPlatformIcon = (platform: string) => {
    debugLog('AdsLibraryCard', 'getPlatformIcon', 'Getting platform icon', { platform });
    
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
    
    debugLog('AdsLibraryCard', 'getPlatformIcon', 'Platform icon selected', { platform, icon });
    return icon;
  };

  const getMediaIcon = () => {
    debugLog('AdsLibraryCard', 'getMediaIcon', 'Getting media icon', { mediaType: ad.mediaType });
    
    let icon;
    switch (ad.mediaType) {
      case 'video':
        icon = <Play className="h-8 w-8 text-white" />;
        break;
      case 'image':
        icon = <ImageIcon className="h-8 w-8 text-white" />;
        break;
      case 'carousel':
        icon = <div className="text-white text-sm font-medium">Carousel</div>;
        break;
      case 'dynamic':
        icon = <div className="text-white text-sm font-medium">Dynamic</div>;
        break;
      default:
        icon = <ImageIcon className="h-8 w-8 text-white" />;
        break;
    }
    
    debugLog('AdsLibraryCard', 'getMediaIcon', 'Media icon selected', { mediaType: ad.mediaType });
    return icon;
  };

  const getStatusColor = () => {
    debugLog('AdsLibraryCard', 'getStatusColor', 'Getting status color', { status: ad.status });
    
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
    
    debugLog('AdsLibraryCard', 'getStatusColor', 'Status color selected', { status: ad.status, colorClass });
    return colorClass;
  };

  const handleCardClick = () => {
    debugLog('AdsLibraryCard', 'handleCardClick', 'Card clicked', {
      adId: ad.id,
      adTitle: ad.adCreativeLinkTitle,
      pageName: ad.pageName
    });
    onClick();
  };

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    debugLog('AdsLibraryCard', 'handleExternalLinkClick', 'External link clicked', {
      adId: ad.id,
      adSnapshotUrl: ad.adSnapshotUrl
    });
    window.open(ad.adSnapshotUrl, '_blank');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    debugLog('AdsLibraryCard', 'handleImageError', 'Image failed to load', {
      adId: ad.id,
      imageUrl: ad.imageUrl || ad.thumbnailUrl
    });
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  debugLog('AdsLibraryCard', 'render', 'Rendering ad card', {
    adId: ad.id,
    hasImage: !!(ad.imageUrl || ad.thumbnailUrl),
    hasVideo: !!ad.videoUrl,
    mediaType: ad.mediaType,
    status: ad.status
  });

  return (
    <div className={`border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
      theme === 'white' 
        ? 'bg-white border-gray-200' 
        : 'bg-slate-800 border-slate-700'
    }`}>
      {/* Media Preview */}
      <div className="relative aspect-video bg-gray-100">
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
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            {ad.status}
          </span>
        </div>

        {/* Media Type Badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-medium bg-black bg-opacity-50 text-white rounded-full">
            {ad.mediaType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Page Name */}
        <div className="flex items-start justify-between">
          <h3 className={`text-sm font-semibold line-clamp-2 transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
          }`}>
            {ad.pageName}
          </h3>
          <button
            onClick={handleExternalLinkClick}
            className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View on Facebook"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        {/* Ad Title */}
        {ad.adCreativeLinkTitle && (
          <p className={`text-sm font-medium line-clamp-2 transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-800' : 'text-gray-200'
          }`}>
            {ad.adCreativeLinkTitle}
          </p>
        )}

        {/* Ad Description */}
        {ad.adCreativeBody && (
          <p className={`text-xs line-clamp-3 transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {ad.adCreativeBody}
          </p>
        )}

        {/* Ad Caption */}
        {ad.adCreativeLinkCaption && (
          <p className={`text-xs line-clamp-2 transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            {ad.adCreativeLinkCaption}
          </p>
        )}

        {/* Metrics Row */}
        <div className={`flex items-center justify-between text-xs transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-3 w-3 flex-shrink-0" />
            <span className="ml-1">
              {ad.spend.lowerBound === ad.spend.upperBound
                ? formatCurrency(ad.spend.lowerBound)
                : `${formatCurrency(ad.spend.lowerBound)} - ${formatCurrency(ad.spend.upperBound)}`
              }
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3 flex-shrink-0" />
            <span className="ml-1">
              {ad.impressions.lowerBound === ad.impressions.upperBound
                ? formatImpressions(ad.impressions.lowerBound)
                : `${formatImpressions(ad.impressions.lowerBound)} - ${formatImpressions(ad.impressions.upperBound)}`
              }
            </span>
          </div>
        </div>

        {/* Platforms */}
        <div className="flex items-center space-x-1">
          {ad.publisherPlatforms.slice(0, 3).map((platform, index) => (
            <span
              key={index}
              className="text-xs"
              title={platform}
            >
              {getPlatformIcon(platform)}
            </span>
          ))}
          {ad.publisherPlatforms.length > 3 && (
            <span className="text-xs text-gray-400">
              +{ad.publisherPlatforms.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="ml-1">{formatDate(ad.adDeliveryStartTime)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="ml-1">{ad.region}</span>
          </div>
        </div>

        {/* Disclaimer */}
        {ad.disclaimer && (
          <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
            {ad.disclaimer}
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={handleCardClick}
          className="w-full mt-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Eye className="inline h-4 w-4 mr-1" />
          View Details
        </button>
      </div>
    </div>
  );
};

export default AdsLibraryCard;
