'use client'

import React, { useState } from 'react';
import { useCreativePreview } from './hooks/useCreativePreview';
import { CreativeData } from './types';
import { Loader2, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

interface CreativePreviewProps {
  creative: CreativeData;
  accessToken: string;
  className?: string;
  enablePreview?: boolean;
  fallbackToAssets?: boolean;
}

const CreativePreview: React.FC<CreativePreviewProps> = ({
  creative,
  accessToken,
  className = '',
  enablePreview = true,
  fallbackToAssets = true
}) => {
  const [showRawAssets, setShowRawAssets] = useState(false);
  
  const { preview, isLoading, error, retry } = useCreativePreview({
    accessToken,
    adId: creative.id.toString(),
    creativeId: creative.id.toString(),
    enabled: enablePreview && !!accessToken
  });

  // Manual asset display (fallback)
  const renderManualAssets = () => {
    if (creative.creativeType === 'video' && creative.videoUrl) {
      return (
        <video 
          controls 
          width="100%" 
          height="100%" 
          poster={creative.thumbnailUrl} 
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
                poster={asset.thumbnailUrl || asset.imageUrl} 
                className="rounded object-cover flex-shrink-0"
                onError={(e) => {
                  console.log(`❌ Carousel video ${idx} failed to load:`, asset.videoUrl);
                  e.currentTarget.style.display = 'none';
                }}
              >
                <source src={asset.videoUrl} type="video/mp4" />
              </video>
            ) : asset.imageUrl ? (
              <img 
                key={idx} 
                src={asset.imageUrl} 
                alt={`Creative asset ${idx + 1}`} 
                className="w-28 h-28 object-cover rounded flex-shrink-0" 
                onError={(e) => {
                  console.log(`❌ Carousel image ${idx} failed to load:`, asset.imageUrl);
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/112x112/6B7280/FFFFFF?text=Failed';
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

  // Debug panel
  const renderDebugPanel = () => (
    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
      <div className="font-medium text-gray-700 mb-1">Debug Info:</div>
      <div className="space-y-1 text-gray-600">
        <div>Creative Type: {creative.creativeType}</div>
        <div>Preview Method: {preview?.method || 'none'}</div>
        <div>Preview Success: {preview?.success ? 'Yes' : 'No'}</div>
        {preview?.format && <div>Format: {preview.format}</div>}
        {preview?.fallback && <div>Used Fallback: Yes</div>}
        <div>Has Image URL: {creative.imageUrl ? 'Yes' : 'No'}</div>
        <div>Has Video URL: {creative.videoUrl ? 'Yes' : 'No'}</div>
        <div>Has Assets: {creative.assets?.length || 0}</div>
        {error && <div className="text-red-600">Error: {error}</div>}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Preview Controls */}
      <div className="absolute top-2 right-2 z-10 flex space-x-1">
        {enablePreview && (
          <button
            onClick={retry}
            disabled={isLoading}
            className="p-1 bg-white/90 rounded shadow-sm hover:bg-white transition-colors"
            title="Retry preview generation"
          >
            <RefreshCw className={`w-3 h-3 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
        
        <button
          onClick={() => setShowRawAssets(!showRawAssets)}
          className="p-1 bg-white/90 rounded shadow-sm hover:bg-white transition-colors"
          title="Toggle manual assets view"
        >
          <ExternalLink className="w-3 h-3 text-gray-600" />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20 rounded">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Generating preview...</span>
          </div>
        </div>
      )}

      {/* Main Preview Content */}
      <div className="w-full h-full">
        {!enablePreview || showRawAssets || !preview?.success ? (
          // Show manual assets
          renderManualAssets()
        ) : preview.method === 'ad-preview' && preview.previewHtml ? (
          // Show Facebook Ad Preview API result
          <div 
            className="w-full h-full rounded overflow-hidden"
            dangerouslySetInnerHTML={{ __html: preview.previewHtml }}
          />
        ) : preview.method === 'ads-library' && preview.iframeHtml ? (
          // Show Facebook Ads Library embed
          <div 
            className="w-full h-full rounded overflow-hidden"
            dangerouslySetInnerHTML={{ __html: preview.iframeHtml }}
          />
        ) : (
          // Fallback to manual assets
          renderManualAssets()
        )}
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-50 border border-red-200 rounded p-2 z-10">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-700">Preview failed: {error}</span>
          </div>
        </div>
      )}

      {/* Creative Type Badge */}
      <div className="absolute bottom-2 left-2 z-10">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          creative.creativeType === 'image' ? 'bg-blue-100 text-blue-800' :
          creative.creativeType === 'video' ? 'bg-green-100 text-green-800' :
          creative.creativeType === 'carousel' ? 'bg-yellow-100 text-yellow-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {creative.creativeType.charAt(0).toUpperCase() + creative.creativeType.slice(1)}
          {preview?.method && preview.success && (
            <span className="ml-1 text-xs opacity-75">
              ({preview.method === 'ad-preview' ? 'API' : preview.method === 'ads-library' ? 'Embed' : 'Manual'})
            </span>
          )}
        </span>
      </div>

      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && renderDebugPanel()}
    </div>
  );
};

export default CreativePreview;