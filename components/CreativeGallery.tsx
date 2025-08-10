'use client'

import React from 'react';
import FacebookImage from './FacebookImage';
import { createOptimizedThumbnailUrl } from '../lib/facebook-utils';
import { CreativeData } from './types';


interface CreativeGalleryProps {
  creatives: CreativeData[];
  selectedCreatives: number[];
  onCreativeSelect: (creativeId: number) => void;
  onCreativeClick: (creative: CreativeData) => void;
  isLoading: boolean;
  topPerformers: CreativeData[];
  accessToken: string;
}

const CreativeGallery: React.FC<CreativeGalleryProps> = ({
  creatives,
  selectedCreatives,
  onCreativeSelect,
  onCreativeClick,
  isLoading,
  topPerformers,
  accessToken
}) => {
  const isTopPerformer = (creative: CreativeData) => {
    return topPerformers.some(top => top.id === creative.id);
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'border-green-500 bg-green-50';
      case 'good': return 'border-blue-500 bg-blue-50';
      case 'average': return 'border-yellow-500 bg-yellow-50';
      case 'poor': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getFatigueColor = (fatigue: string) => {
    switch (fatigue) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center text-sm text-blue-600">
          <svg className="w-4 h-4 animate-spin mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Loading creatives gallery...
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
        </div>
      </div>
    );
  }

  if (creatives.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No creatives found</h3>
        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Performers Section */}
      {topPerformers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
              Top {Math.ceil(creatives.length * 0.1)} Performers
            </span>
            Top Performers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {topPerformers.map((creative) => (
              <CreativeCard
                key={creative.id}
                creative={creative}
                isSelected={selectedCreatives.includes(creative.id)}
                onSelect={() => onCreativeSelect(creative.id)}
                onCreativeClick={onCreativeClick}
                isTopPerformer={true}
                getPerformanceColor={getPerformanceColor}
                getFatigueColor={getFatigueColor}
                accessToken={accessToken}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Creatives Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Creatives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creatives.map((creative) => (
            <CreativeCard
              key={creative.id}
              creative={creative}
              isSelected={selectedCreatives.includes(creative.id)}
              onSelect={() => onCreativeSelect(creative.id)}
              onCreativeClick={onCreativeClick}
              isTopPerformer={isTopPerformer(creative)}
              getPerformanceColor={getPerformanceColor}
              getFatigueColor={getFatigueColor}
              accessToken={accessToken}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface CreativeCardProps {
  creative: CreativeData;
  isSelected: boolean;
  onSelect: () => void;
  onCreativeClick: (creative: CreativeData) => void;
  isTopPerformer: boolean;
  getPerformanceColor: (performance: string) => string;
  getFatigueColor: (fatigue: string) => string;
  accessToken: string;
}

// Helper to get high-res FB CDN stills with better quality parameters
const getHighResUrl = (url: string | null | undefined, token: string, contentType: 'video' | 'carousel' | 'dynamic' | 'image' = 'image') => {
  return createOptimizedThumbnailUrl(url, token, contentType);
};

const CreativeCard: React.FC<CreativeCardProps> = ({
  creative,
  isSelected,
  onSelect,
  onCreativeClick,
  isTopPerformer,
  getPerformanceColor,
  getFatigueColor,
  accessToken
}) => {
  // Direct media rendering from URLs
  let assetContent: React.ReactNode = null;
  if (creative.creativeType === 'video' && creative.videoUrl) {
    assetContent = (
      <video
        controls
        width="100%"
        height="100%"
        poster={getHighResUrl(creative.thumbnailUrl, accessToken, 'video')}
        className="w-full h-full object-cover rounded-t-lg"
        onError={(e) => {
          console.warn('Video poster failed to load (using fallback):', creative.videoUrl);
          const el = e.target as HTMLVideoElement;
          if (creative.thumbnailUrl) {
            el.poster = creative.thumbnailUrl;
          }
        }}
      >
        <source src={creative.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  } else if ((creative.creativeType === 'carousel' || creative.creativeType === 'dynamic') && creative.assets && creative.assets.length > 0) {
    assetContent = (
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
                console.warn(`Carousel video poster failed (using fallback) idx=${idx}:`, asset.videoUrl);
                const el = e.target as HTMLVideoElement;
                const fallback = asset.thumbnailUrl || asset.imageUrl;
                if (fallback) {
                  el.poster = fallback;
                }
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
              contentType="carousel"
              fallbackSrc="https://via.placeholder.com/112x112/6B7280/FFFFFF?text=Failed"
              onError={() => {
                console.warn(`Carousel image ${idx} failed to load:`, asset.imageUrl);
              }}
            />
          ) : (
            <div key={idx} className="w-28 h-28 bg-gray-200 flex items-center justify-center rounded flex-shrink-0 text-xs text-gray-500">N/A</div>
          )
        )}
      </div>
    );
  } else if (creative.imageUrl) {
    assetContent = (
      <FacebookImage
        src={creative.imageUrl || creative.thumbnailUrl}
        accessToken={accessToken}
        alt={creative.name}
        className="w-full h-full object-cover rounded-t-lg"
        contentType={creative.creativeType === 'video' ? 'video' : creative.creativeType === 'carousel' || creative.creativeType === 'dynamic' ? 'carousel' : 'image'}
        fallbackSrc="https://via.placeholder.com/400x200/6B7280/FFFFFF?text=Image+Failed"
        onError={() => {
          console.warn('Image failed to load:', creative.imageUrl);
        }}
      />
    );
  } else {
    assetContent = (
      <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center rounded-t-lg text-xs text-gray-500">
        No preview available
      </div>
    );
  }

  // For dynamic creatives, force a purple border on the card
  const cardVariantClass =
    creative.creativeType === 'dynamic'
      ? `${isSelected ? 'bg-blue-50' : 'bg-white'} border-purple-600`
      : isSelected
        ? 'border-blue-500 bg-blue-50'
        : getPerformanceColor(creative.performance);

  return (
    <div
      className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${cardVariantClass} ${isTopPerformer ? 'border-blue-900 ring-2 ring-blue-900 ring-opacity-50' : ''}`}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-2 right-2 z-10">
        <div 
          className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
            isSelected 
              ? 'bg-blue-500 border-blue-500' 
              : 'bg-white border-gray-300'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Top Performer Badge */}
      {isTopPerformer && (
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Top 10%
          </span>
        </div>
      )}

      {/* Asset Preview */}
      <div className="relative h-48 rounded-t-lg overflow-hidden">
        {assetContent}
        {/* Creative Type Badge */}
        <div className="absolute bottom-2 left-2">
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

      {/* Creative Info */}
      <div className="p-4 space-y-3" onClick={() => onCreativeClick(creative)}>
        {/* Name and Campaign */}
        <div>
          <h4 className="font-medium text-gray-900 truncate hover:text-blue-600 cursor-pointer">{creative.name}</h4>
          <p className="text-sm text-gray-500 truncate">{creative.campaignName}</p>
          <p className="text-xs text-gray-400 truncate">{creative.adsetName}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-500">Spend</p>
            <p className="font-medium text-gray-900">${creative.spend.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">Impressions</p>
            <p className="font-medium text-gray-900">{creative.impressions.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">CTR</p>
            <p className="font-medium text-gray-900">{creative.ctr.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-gray-500">CPC</p>
            <p className="font-medium text-gray-900">${creative.cpc.toFixed(2)}</p>
          </div>
          {creative.roas && (
            <div className="col-span-2">
              <p className="text-gray-500">ROAS</p>
              <p className="font-medium text-gray-900">{creative.roas.toFixed(2)}x</p>
            </div>
          )}
        </div>

        {/* Performance and Fatigue */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            creative.performance === 'excellent' ? 'bg-green-100 text-green-800' :
            creative.performance === 'good' ? 'bg-blue-100 text-blue-800' :
            creative.performance === 'average' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {creative.performance.charAt(0).toUpperCase() + creative.performance.slice(1)}
          </span>
          <span className={`text-xs font-medium ${getFatigueColor(creative.fatigueLevel)}`}>
            Fatigue: {creative.fatigueLevel.charAt(0).toUpperCase() + creative.fatigueLevel.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreativeGallery; 