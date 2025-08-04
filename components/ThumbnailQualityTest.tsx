'use client'

import React from 'react';
import { createOptimizedThumbnailUrl } from '../lib/facebook-utils';

interface ThumbnailQualityTestProps {
  accessToken: string;
  testImageUrl: string;
}

const ThumbnailQualityTest: React.FC<ThumbnailQualityTestProps> = ({
  accessToken,
  testImageUrl
}) => {
  const contentTypes = ['image', 'video', 'carousel', 'dynamic'] as const;
  
  const getOptimizedUrl = (contentType: typeof contentTypes[number]) => {
    return createOptimizedThumbnailUrl(testImageUrl, accessToken, contentType);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Thumbnail Quality Test</h2>
      <p className="text-sm text-gray-600 mb-4">
        Testing optimized thumbnail URLs for different content types
      </p>
      
      <div className="space-y-4">
        {contentTypes.map((contentType) => {
          const optimizedUrl = getOptimizedUrl(contentType);
          return (
            <div key={contentType} className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2 capitalize">
                {contentType} Content Type
              </h3>
              <div className="text-sm">
                <p className="text-gray-600 mb-1">Original URL:</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                  {testImageUrl}
                </p>
                <p className="text-gray-600 mb-1 mt-2">Optimized URL:</p>
                <p className="font-mono text-xs bg-blue-100 p-2 rounded break-all">
                  {optimizedUrl}
                </p>
                <div className="mt-2">
                  <img 
                    src={optimizedUrl} 
                    alt={`${contentType} thumbnail`}
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => {
                      console.warn(`Failed to load ${contentType} thumbnail:`, optimizedUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-medium text-green-800 mb-2">Improvements Made:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Increased resolution from 720x720 to 1080x1080 for better quality</li>
          <li>• Added quality parameter (95%) for sharper images</li>
          <li>• Video thumbnails use 16:9 aspect ratio (1280x720) with 98% quality</li>
          <li>• Carousel and dynamic content optimized for square format</li>
          <li>• Consistent access token handling across all components</li>
        </ul>
      </div>
    </div>
  );
};

export default ThumbnailQualityTest; 