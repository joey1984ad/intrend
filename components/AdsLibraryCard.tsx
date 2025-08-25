'use client'

import React from 'react';
import { Eye, ExternalLink, Play, Image as ImageIcon, Calendar, DollarSign, MapPin } from 'lucide-react';

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

interface AdsLibraryCardProps {
  ad: AdsLibraryAd;
  onClick: () => void;
}

const AdsLibraryCard: React.FC<AdsLibraryCardProps> = ({ ad, onClick }) => {
  const formatCurrency = (amount: string) => {
    const num = parseInt(amount);
    if (isNaN(num)) return '$0';
    
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  const formatImpressions = (amount: string) => {
    const num = parseInt(amount);
    if (isNaN(num)) return '0';
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'messenger':
        return '💬';
      case 'audience_network':
        return '🌐';
      default:
        return '📱';
    }
  };

  const getMediaIcon = () => {
    switch (ad.mediaType) {
      case 'video':
        return <Play className="h-8 w-8 text-white" />;
      case 'image':
        return <ImageIcon className="h-8 w-8 text-white" />;
      case 'carousel':
        return <div className="text-white text-sm font-medium">Carousel</div>;
      case 'dynamic':
        return <div className="text-white text-sm font-medium">Dynamic</div>;
      default:
        return <ImageIcon className="h-8 w-8 text-white" />;
    }
  };

  const getStatusColor = () => {
    switch (ad.status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      {/* Media Preview */}
      <div className="relative aspect-video bg-gray-100">
        {ad.imageUrl || ad.thumbnailUrl ? (
          <img
            src={ad.imageUrl || ad.thumbnailUrl}
            alt="Ad preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
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
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {ad.pageName}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(ad.adSnapshotUrl, '_blank');
            }}
            className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View on Facebook"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        {/* Ad Title */}
        {ad.adCreativeLinkTitle && (
          <p className="text-sm font-medium text-gray-800 line-clamp-2">
            {ad.adCreativeLinkTitle}
          </p>
        )}

        {/* Ad Description */}
        {ad.adCreativeBody && (
          <p className="text-xs text-gray-600 line-clamp-3">
            {ad.adCreativeBody}
          </p>
        )}

        {/* Ad Caption */}
        {ad.adCreativeLinkCaption && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {ad.adCreativeLinkCaption}
          </p>
        )}

        {/* Metrics Row */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-3 w-3" />
            <span>
              {ad.spend.lowerBound === ad.spend.upperBound
                ? formatCurrency(ad.spend.lowerBound)
                : `${formatCurrency(ad.spend.lowerBound)} - ${formatCurrency(ad.spend.upperBound)}`
              }
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>
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
            <Calendar className="h-3 w-3" />
            <span>{formatDate(ad.adDeliveryStartTime)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{ad.region}</span>
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
          onClick={onClick}
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
