'use client'

import React from 'react';
import FacebookImage from './FacebookImage';
import { createOptimizedThumbnailUrl } from '../lib/facebook-utils';
import { CreativeData } from './types';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';

// Shared helper for background color based on performance
function getPerformanceBackground(performance: string): string {
  switch (performance) {
    case 'excellent': return 'bg-green-50';
    case 'good': return 'bg-blue-50';
    case 'average': return 'bg-yellow-50';
    case 'poor': return 'bg-red-50';
    default: return 'bg-white';
  }
}


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
  const { theme } = useDashboardTheme();
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

  function getPerformanceBackground(performance: string): string {
    switch (performance) {
      case 'excellent': return 'bg-green-50';
      case 'good': return 'bg-blue-50';
      case 'average': return 'bg-yellow-50';
      case 'poor': return 'bg-red-50';
      default: return 'bg-white';
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className={`rounded-lg h-48 mb-3 transition-colors duration-300 ${
              theme === 'white' ? 'bg-gray-200' : 'bg-slate-600'
            }`}></div>
            <div className="space-y-2">
              <div className={`h-4 rounded transition-colors duration-300 ${
                theme === 'white' ? 'bg-gray-200' : 'bg-slate-600'
              }`}></div>
              <div className={`h-3 rounded w-3/4 transition-colors duration-300 ${
                theme === 'white' ? 'bg-gray-200' : 'bg-slate-600'
              }`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (creatives.length === 0) {
    return (
      <div className="text-center py-12">
        <div className={`mb-4 transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-900' : 'text-gray-100'
        }`}>No creatives found</h3>
        <p className={`transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-500' : 'text-gray-400'
        }`}>Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
             {/* Top Performers Section */}
       {topPerformers.length > 0 && (
         <div className={`rounded-2xl p-6 border shadow-sm transition-colors duration-300 ${
           theme === 'white' 
             ? 'bg-gradient-to-r from-gray-50 to-white border-gray-100' 
             : 'bg-gradient-to-r from-slate-700 to-slate-800 border-slate-600'
         }`}>
           <h3 className={`text-xl font-bold mb-6 flex items-center transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-900' : 'text-gray-100'
           }`}>
             <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold mr-3 shadow-sm transition-colors duration-300 ${
               theme === 'white'
                 ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200'
                 : 'bg-gradient-to-r from-emerald-900/20 to-green-900/20 text-emerald-300 border-emerald-600'
             }`}>
               Top {Math.ceil(creatives.length * 0.1)} Performers
             </span>
             <span className={`transition-colors duration-300 ${
               theme === 'white' ? 'text-gray-700' : 'text-gray-300'
             }`}>Top Performers</span>
           </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
               theme={theme}
             />
            ))}
          </div>
        </div>
      )}

             {/* All Creatives Section */}
       <div className={`rounded-2xl p-6 border shadow-sm transition-colors duration-300 ${
         theme === 'white' ? 'bg-white border-gray-100' : 'bg-slate-800 border-slate-600'
       }`}>
         <h3 className={`text-xl font-bold mb-6 transition-colors duration-300 ${
           theme === 'white' ? 'text-gray-900' : 'text-gray-100'
         }`}>All Creatives</h3>
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
               theme={theme}
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
  theme: 'white' | 'dark';
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
  accessToken,
  theme
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
                         <div key={idx} className={`w-28 h-28 flex items-center justify-center rounded flex-shrink-0 text-xs transition-colors duration-300 ${
               theme === 'white' ? 'bg-gray-200 text-gray-500' : 'bg-slate-600 text-gray-400'
             }`}>N/A</div>
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
       <div className={`w-full h-full flex flex-col items-center justify-center rounded-t-lg text-xs transition-colors duration-300 ${
         theme === 'white' ? 'bg-gray-200 text-gray-500' : 'bg-slate-600 text-gray-400'
       }`}>
         No preview available
       </div>
     );
  }

     // Background color based on selection, type, and performance
   const getCardBackground = () => {
     if (isSelected) {
       return theme === 'white' ? 'bg-blue-50' : 'bg-blue-900/20';
     }
     if (creative.creativeType === 'dynamic') {
       return theme === 'white' ? 'bg-white' : 'bg-slate-700';
     }
     // Performance-based backgrounds
     switch (creative.performance) {
       case 'excellent':
         return theme === 'white' ? 'bg-green-50' : 'bg-green-900/20';
       case 'good':
         return theme === 'white' ? 'bg-blue-50' : 'bg-blue-900/20';
       case 'average':
         return theme === 'white' ? 'bg-yellow-50' : 'bg-yellow-900/20';
       case 'poor':
         return theme === 'white' ? 'bg-red-50' : 'bg-red-900/20';
       default:
         return theme === 'white' ? 'bg-white' : 'bg-slate-700';
     }
   };

  return (
         <div
       className={`relative group cursor-pointer rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${getCardBackground()} ${
         theme === 'white' ? 'border-gray-200' : 'border-slate-600'
       } ${
         isSelected 
           ? 'ring-2 ring-indigo-500 ring-opacity-60 border-indigo-300 shadow-lg' 
           : theme === 'white' ? 'hover:border-gray-300' : 'hover:border-slate-500'
       } ${isTopPerformer ? 'ring-2 ring-emerald-400 ring-opacity-40' : ''}`}
     >
      {/* Selection Checkbox */}
      <div className="absolute top-3 right-3 z-10">
                 <div 
           className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm ${
             isSelected 
               ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-500 shadow-md' 
               : theme === 'white' 
                 ? 'bg-white border-gray-300 hover:border-indigo-300 hover:shadow-md'
                 : 'bg-slate-700 border-slate-500 hover:border-indigo-400 hover:shadow-md'
           }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Top Performer Badge */}
      {isTopPerformer && (
                 <div className="absolute top-3 left-3 z-10">
           <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-colors duration-300 ${
             theme === 'white'
               ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200'
               : 'bg-gradient-to-r from-emerald-900/20 to-green-900/20 text-emerald-300 border-emerald-600'
           }`}>
             Top 10%
           </span>
         </div>
      )}

      {/* Asset Preview */}
      <div className="relative h-48 rounded-t-2xl overflow-hidden">
        {assetContent}
        {/* Creative Type Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm border ${
            creative.creativeType === 'image' ? 'bg-gradient-to-r from-blue-50 to-indigo-100 text-indigo-700 border-indigo-200' :
            creative.creativeType === 'video' ? 'bg-gradient-to-r from-emerald-50 to-teal-100 text-emerald-700 border-emerald-200' :
            creative.creativeType === 'carousel' ? 'bg-gradient-to-r from-amber-50 to-orange-100 text-amber-700 border-amber-200' :
            'bg-gradient-to-r from-violet-50 to-purple-100 text-violet-700 border-violet-200'
          }`}>
            {creative.creativeType === 'image' && '🖼️'}
            {creative.creativeType === 'video' && '🎥'}
            {creative.creativeType === 'carousel' && '🔄'}
            {creative.creativeType === 'dynamic' && '⚡'}
            <span className="ml-1">{creative.creativeType.charAt(0).toUpperCase() + creative.creativeType.slice(1)}</span>
          </span>
        </div>
      </div>

      {/* Creative Info */}
      <div className="p-5 space-y-4" onClick={() => onCreativeClick(creative)}>
                 {/* Name and Campaign */}
         <div className="space-y-2">
           <h4 className={`font-semibold truncate hover:text-indigo-600 cursor-pointer transition-colors duration-200 ${
             theme === 'white' ? 'text-gray-900' : 'text-gray-100'
           }`}>{creative.name}</h4>
           <p className={`text-sm truncate font-medium transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-600' : 'text-gray-300'
           }`}>{creative.campaignName}</p>
           <p className={`text-xs truncate transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-500' : 'text-gray-400'
           }`}>{creative.adsetName}</p>
         </div>

                 {/* Key Metrics */}
         <div className="grid grid-cols-2 gap-3 text-xs">
           <div className={`rounded-lg p-2 border transition-colors duration-300 ${
             theme === 'white' ? 'bg-gray-50 border-gray-100' : 'bg-slate-700 border-slate-600'
           }`}>
             <p className={`font-medium transition-colors duration-300 ${
               theme === 'white' ? 'text-gray-500' : 'text-gray-400'
             }`}>Spend</p>
             <p className={`font-bold transition-colors duration-300 ${
               theme === 'white' ? 'text-gray-900' : 'text-gray-100'
             }`}>${creative.spend.toFixed(2)}</p>
           </div>
           <div className={`rounded-lg p-2 border transition-colors duration-300 ${
             theme === 'white' ? 'bg-gray-50 border-gray-100' : 'bg-slate-700 border-slate-600'
           }`}>
             <p className={`font-medium transition-colors duration-300 ${
               theme === 'white' ? 'text-gray-500' : 'text-gray-400'
             }`}>Impressions</p>
             <p className={`font-bold transition-colors duration-300 ${
               theme === 'white' ? 'text-gray-900' : 'text-gray-100'
             }`}>{creative.impressions.toLocaleString()}</p>
           </div>
           <div className={`rounded-lg p-2 border transition-colors duration-300 ${
             theme === 'white' ? 'bg-gray-50 border-gray-100' : 'bg-slate-700 border-slate-600'
           }`}>
             <p className={`font-medium transition-colors duration-300 ${
               theme === 'white' ? 'text-gray-500' : 'text-gray-400'
             }`}>CTR</p>
             <p className={`font-bold transition-colors duration-300 ${
               theme === 'white' ? 'text-gray-900' : 'text-gray-100'
             }`}>{creative.ctr.toFixed(2)}%</p>
           </div>
           <div className={`rounded-lg p-2 border transition-colors duration-300 ${
             theme === 'white' ? 'bg-gray-50 border-gray-100' : 'bg-slate-700 border-slate-600'
           }`}>
             <p className={`font-medium transition-colors duration-300 ${
               theme === 'white' ? 'text-gray-500' : 'text-gray-400'
             }`}>CPC</p>
             <p className={`font-bold transition-colors duration-300 ${
               theme === 'white' ? 'text-gray-900' : 'text-gray-100'
             }`}>${creative.cpc.toFixed(2)}</p>
           </div>
           {creative.roas && (
             <div className={`col-span-2 rounded-lg p-2 border transition-colors duration-300 ${
               theme === 'white' 
                 ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100' 
                 : 'bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-600'
             }`}>
               <p className={`font-medium transition-colors duration-300 ${
                 theme === 'white' ? 'text-indigo-600' : 'text-indigo-300'
               }`}>ROAS</p>
               <p className={`font-bold transition-colors duration-300 ${
                 theme === 'white' ? 'text-indigo-900' : 'text-indigo-100'
               }`}>{creative.roas.toFixed(2)}x</p>
             </div>
           )}
         </div>

        {/* Performance and Fatigue */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm border ${
            creative.performance === 'excellent' ? 'bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border-emerald-200' :
            creative.performance === 'good' ? 'bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-700 border-blue-200' :
            creative.performance === 'average' ? 'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 border-amber-200' :
            'bg-gradient-to-r from-red-50 to-pink-100 text-red-700 border-red-200'
          }`}>
            {creative.performance === 'excellent' && '⭐'}
            {creative.performance === 'good' && '👍'}
            {creative.performance === 'average' && '➖'}
            {creative.performance === 'poor' && '⚠️'}
            <span className="ml-1">{creative.performance.charAt(0).toUpperCase() + creative.performance.slice(1)}</span>
          </span>
                     <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors duration-300 ${
             theme === 'white' ? 'bg-gray-50 border-gray-200' : 'bg-slate-700 border-slate-600'
           } ${getFatigueColor(creative.fatigueLevel)}`}>
             Fatigue: {creative.fatigueLevel.charAt(0).toUpperCase() + creative.fatigueLevel.slice(1)}
           </span>
        </div>
      </div>
    </div>
  );
};

export default CreativeGallery; 