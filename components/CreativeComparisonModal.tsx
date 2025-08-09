'use client'

import React from 'react';
import { CreativeData } from './types';
import FacebookImage from './FacebookImage';
import { createOptimizedThumbnailUrl } from '../lib/facebook-utils';

interface CreativeComparisonModalProps {
  creatives: CreativeData[];
  onClose: () => void;
  facebookAccessToken: string;
}

// Helper for hi-res poster images with better quality parameters
const getHighResUrl = (url: string | null | undefined, token: string, contentType: 'video' | 'carousel' | 'dynamic' | 'image' = 'image') => {
  return createOptimizedThumbnailUrl(url, token, contentType);
};

const CreativeComparisonModal: React.FC<CreativeComparisonModalProps> = ({
  creatives,
  onClose,
  facebookAccessToken
}) => {
  if (creatives.length < 2) {
    return null;
  }

  const metrics = [
    { key: 'spend', label: 'Spend', format: (value: number) => `$${value.toFixed(2)}` },
    { key: 'impressions', label: 'Impressions', format: (value: number) => value.toLocaleString() },
    { key: 'clicks', label: 'Clicks', format: (value: number) => value.toLocaleString() },
    { key: 'ctr', label: 'CTR', format: (value: number) => `${value.toFixed(2)}%` },
    { key: 'cpc', label: 'CPC', format: (value: number) => `$${value.toFixed(2)}` },
    { key: 'cpm', label: 'CPM', format: (value: number) => `$${value.toFixed(2)}` },
    { key: 'reach', label: 'Reach', format: (value: number) => value.toLocaleString() },
    { key: 'frequency', label: 'Frequency', format: (value: number) => value.toFixed(1) },
    { key: 'roas', label: 'ROAS', format: (value: number) => value ? `${value.toFixed(2)}x` : 'N/A' }
  ];

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
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

  const getCreativeTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-green-100 text-green-800';
      case 'carousel': return 'bg-yellow-100 text-yellow-800';
      case 'dynamic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Creative Comparison</h2>
            <p className="text-sm text-gray-600">Comparing {creatives.length} creatives</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Creative Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {creatives.map((creative) => (
                <div key={creative.id} className="border border-gray-200 rounded-lg p-4">
                  {/* Creative Asset */}
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                    {creative.creativeType === 'video' && creative.videoUrl ? (
                      <video
                        controls
                        width="100%"
                        height="100%"
                        poster={getHighResUrl(creative.thumbnailUrl, facebookAccessToken, 'video')}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.warn('Video failed to load:', creative.videoUrl);
                          (e.target as HTMLVideoElement).style.display = 'none';
                        }}
                      >
                        <source src={creative.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : creative.imageUrl ? (
                      <FacebookImage
                        src={creative.imageUrl || creative.thumbnailUrl}
                        accessToken={facebookAccessToken}
                        alt={creative.name}
                        className="w-full h-full object-cover"
                        fallbackSrc="https://via.placeholder.com/300x200/6B7280/FFFFFF?text=No+Image"
                      />
                    ) : creative.assets && creative.assets.length > 0 ? (
                      creative.assets?.[0]?.videoUrl ? (
                        <video
                          controls
                          width="100%"
                          height="100%"
                          poster={getHighResUrl(creative.assets?.[0]?.thumbnailUrl || creative.thumbnailUrl, facebookAccessToken, 'video')}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.warn('Video failed to load:', creative.assets?.[0]?.videoUrl);
                            (e.target as HTMLVideoElement).style.display = 'none';
                          }}
                        >
                          <source src={creative.assets?.[0]?.videoUrl} type="video/mp4" />
                        </video>
                      ) : (
                        <FacebookImage
                          src={creative.assets?.[0]?.imageUrl || creative.assets?.[0]?.thumbnailUrl}
                          accessToken={facebookAccessToken}
                          alt={creative.name}
                          className="w-full h-full object-cover"
                          contentType="carousel"
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Preview Available</span>
                      </div>
                    )}
                    
                    {/* Creative Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCreativeTypeColor(creative.creativeType)}`}>
                        {creative.creativeType.charAt(0).toUpperCase() + creative.creativeType.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Creative Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 truncate">{creative.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{creative.campaignName}</p>
                    <p className="text-xs text-gray-400 truncate">{creative.adsetName}</p>
                    
                    {/* Performance and Fatigue */}
                    <div className="flex items-center justify-between pt-2">
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
              ))}
            </div>

            {/* Metrics Comparison Table */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 font-medium text-gray-900">Metric</th>
                      {creatives.map((creative) => (
                        <th key={creative.id} className="text-center py-2 px-4 font-medium text-gray-900">
                          {creative.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric) => (
                      <tr key={metric.key} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-700">{metric.label}</td>
                        {creatives.map((creative) => (
                          <td key={creative.id} className="py-3 px-4 text-center">
                            <span className="font-medium text-gray-900">
                              {metric.format(creative[metric.key as keyof CreativeData] as number)}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Best ROAS */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Best ROAS</h4>
                {(() => {
                  const bestROAS = creatives.reduce((prev, current) => 
                    ((current.roas || 0) > (prev.roas || 0)) ? current : prev
                  );
                  return (
                    <div>
                      <p className="text-sm font-medium text-green-900">{bestROAS.name}</p>
                      <p className="text-xs text-green-600">ROAS: {bestROAS.roas ? `${bestROAS.roas.toFixed(2)}x` : 'N/A'}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Best CTR */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Best CTR</h4>
                {(() => {
                  const bestCTR = creatives.reduce((prev, current) => 
                    (current.ctr > prev.ctr) ? current : prev
                  );
                  return (
                    <div>
                      <p className="text-sm font-medium text-blue-900">{bestCTR.name}</p>
                      <p className="text-xs text-blue-600">CTR: {bestCTR.ctr.toFixed(2)}%</p>
                    </div>
                  );
                })()}
              </div>

              {/* Most Efficient */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Most Efficient</h4>
                {(() => {
                  const mostEfficient = creatives.reduce((prev, current) => 
                    (current.cpc < prev.cpc) ? current : prev
                  );
                  return (
                    <div>
                      <p className="text-sm font-medium text-purple-900">{mostEfficient.name}</p>
                      <p className="text-xs text-purple-600">CPC: ${mostEfficient.cpc.toFixed(2)}</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreativeComparisonModal; 