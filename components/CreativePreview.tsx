'use client'

import React from 'react';
import FacebookImage from './FacebookImage';
import { createOptimizedThumbnailUrl } from '../lib/facebook-utils';
import { CreativeData } from './types';

interface CreativePreviewProps {
  creative: CreativeData;
  accessToken: string;
  className?: string;
  enablePreview?: boolean;
  fallbackToAssets?: boolean;
}

// Utility to create high-res Facebook CDN stills with better quality parameters
const getHighResUrl = (url: string | null | undefined, token: string, contentType: 'video' | 'carousel' | 'dynamic' | 'image' = 'image') => {
  return createOptimizedThumbnailUrl(url, token, contentType);
};

const CreativePreview: React.FC<CreativePreviewProps> = ({
  creative,
  accessToken,
  className = '',
  enablePreview = true, // ignored - we always show raw assets
  fallbackToAssets = true // ignored - we always show raw assets
}) => {

  // Manual asset display (fallback)
  const renderManualAssets = () => {
    if (creative.creativeType === 'video' && creative.videoUrl) {
      return (
        <video 
          controls 
          width="100%" 
          height="100%" 
          poster={getHighResUrl(creative.thumbnailUrl, accessToken, 'video')} 
          className="w-full h-full object-cover rounded"
          onError={(e) => {
            console.log('❌ Video failed to load:', creative.videoUrl);
            e.currentTarget.style.display = 'none';
          }}
        >
          <source src={creative.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if ((creative.creativeType === 'carousel' || creative.creativeType === 'dynamic') && creative.assets && creative.assets.length > 0) {
      return (
        <div className="flex overflow-x-auto space-x-2 w-full h-full p-2">
          {creative.assets.map((asset, idx) =>
            asset.videoUrl ? (
              <video 
                key={idx} 
                controls 
                width={120} 
                height={120} 
                poster={getHighResUrl(asset.thumbnailUrl || asset.imageUrl, accessToken, 'video')} 
                className="rounded object-cover flex-shrink-0"
                onError={(e) => {
                  console.log(`❌ Carousel video ${idx} failed to load:`, asset.videoUrl);
                  e.currentTarget.style.display = 'none';
                }}
              >
                <source src={asset.videoUrl} type="video/mp4" />
              </video>
            ) : asset.imageUrl ? (
              <FacebookImage
                key={idx}
                src={asset.imageUrl || asset.thumbnailUrl}
                accessToken={accessToken}
                alt={`Creative asset ${idx + 1}`}
                className="w-28 h-28 object-cover rounded flex-shrink-0"
                fallbackSrc="https://via.placeholder.com/112x112/6B7280/FFFFFF?text=Failed"
                onError={(e) => {
                  console.log(`❌ Carousel image ${idx} failed to load:`, asset.imageUrl);
                }}
              />
            ) : (
              <div key={idx} className="w-28 h-28 bg-gray-200 flex items-center justify-center rounded flex-shrink-0">
                <span className="text-xs text-gray-500">N/A</span>
              </div>
            )
          )}
        </div>
      );
    } else if (creative.imageUrl) {
      return (
        <img 
          src={creative.imageUrl} 
          alt={creative.name} 
          className="w-full h-full object-cover rounded" 
          onError={(e) => {
            console.log('❌ Image failed to load:', creative.imageUrl);
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x200/6B7280/FFFFFF?text=Image+Failed+to+Load';
          }}
        />
      );
    } else {
      return (
        <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center rounded">
          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-500">No preview available</span>
        </div>
      );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Preview Content - Always show raw media assets */}
      <div className="w-full h-full">
        {renderManualAssets()}
      </div>

      {/* Creative Type Badge */}
      <div className="absolute bottom-2 left-2 z-10">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          creative.creativeType === 'image' ? 'bg-blue-100 text-blue-800' :
          creative.creativeType === 'video' ? 'bg-green-100 text-green-800' :
          creative.creativeType === 'carousel' ? 'bg-yellow-100 text-yellow-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {creative.creativeType.charAt(0).toUpperCase() + creative.creativeType.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default CreativePreview;