'use client'

import React, { useState } from 'react';
import { CreativeData } from './types';
import FacebookImage from './FacebookImage';
import { createOptimizedThumbnailUrl } from '../lib/facebook-utils';
import { 
  createCreativeAnalysisSession,
  logCreativeAnalysis,
  logCreativeAnalysisError,
  logCreativeAnalysisSuccess
} from '../lib/creative-analysis-logger';

interface CreativeDetailModalProps {
  creative: CreativeData | null;
  onClose: () => void;
  dateRange: string;
  facebookAccessToken: string;
}

// Helper for hi-res poster images
const getHighResUrl = (url: string | null | undefined, token: string, contentType: 'video' | 'carousel' | 'dynamic' | 'image' = 'video') => {
  return createOptimizedThumbnailUrl(url, token, contentType);
};

const CreativeDetailModal: React.FC<CreativeDetailModalProps> = ({
  creative,
  onClose,
  dateRange,
  facebookAccessToken
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'breakdown' | 'campaigns' | 'ai'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<'roas' | 'spend' | 'impressions' | 'clicks' | 'ctr'>('roas');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(creative?.aiScore || null);

  if (!creative) return null;

  // Mock trend data - in real implementation, this would come from API
  const trendData = {
    roas: [
      { date: '2024-01-01', value: 1.8 },
      { date: '2024-01-02', value: 2.1 },
      { date: '2024-01-03', value: 1.9 },
      { date: '2024-01-04', value: 2.3 },
      { date: '2024-01-05', value: 2.0 },
      { date: '2024-01-06', value: 2.2 },
      { date: '2024-01-07', value: 2.1 }
    ],
    spend: [
      { date: '2024-01-01', value: 150 },
      { date: '2024-01-02', value: 180 },
      { date: '2024-01-03', value: 165 },
      { date: '2024-01-04', value: 200 },
      { date: '2024-01-05', value: 175 },
      { date: '2024-01-06', value: 190 },
      { date: '2024-01-07', value: 185 }
    ],
    impressions: [
      { date: '2024-01-01', value: 12000 },
      { date: '2024-01-02', value: 14500 },
      { date: '2024-01-03', value: 13200 },
      { date: '2024-01-04', value: 15800 },
      { date: '2024-01-05', value: 14200 },
      { date: '2024-01-06', value: 15100 },
      { date: '2024-01-07', value: 14800 }
    ],
    clicks: [
      { date: '2024-01-01', value: 240 },
      { date: '2024-01-02', value: 290 },
      { date: '2024-01-03', value: 265 },
      { date: '2024-01-04', value: 320 },
      { date: '2024-01-05', value: 285 },
      { date: '2024-01-06', value: 305 },
      { date: '2024-01-07', value: 295 }
    ],
    ctr: [
      { date: '2024-01-01', value: 2.0 },
      { date: '2024-01-02', value: 2.0 },
      { date: '2024-01-03', value: 2.0 },
      { date: '2024-01-04', value: 2.0 },
      { date: '2024-01-05', value: 2.0 },
      { date: '2024-01-06', value: 2.0 },
      { date: '2024-01-07', value: 2.0 }
    ]
  };

  // Mock platform breakdown data
  const platformBreakdown = [
    { platform: 'Facebook', spend: 650, impressions: 65000, clicks: 1300, roas: 2.1 },
    { platform: 'Instagram', spend: 450, impressions: 45000, clicks: 900, roas: 2.3 },
    { platform: 'Audience Network', spend: 100, impressions: 10000, clicks: 200, roas: 1.8 }
  ];

  // Mock associated campaigns data
  const associatedCampaigns = [
    {
      id: 1,
      name: 'Summer Collection 2024',
      adsetName: 'Women 25-34',
      spend: 450,
      impressions: 45000,
      clicks: 900,
      roas: 2.3,
      status: 'ACTIVE'
    },
    {
      id: 2,
      name: 'Brand Awareness Q1',
      adsetName: 'General Audience',
      spend: 350,
      impressions: 35000,
      clicks: 700,
      roas: 1.9,
      status: 'ACTIVE'
    },
    {
      id: 3,
      name: 'Retargeting Campaign',
      adsetName: 'Previous Visitors',
      spend: 400,
      impressions: 40000,
      clicks: 800,
      roas: 2.5,
      status: 'PAUSED'
    }
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

  const getCreativeTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-green-100 text-green-800';
      case 'carousel': return 'bg-yellow-100 text-yellow-800';
      case 'dynamic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = () => {
    if (creative.imageUrl) {
      const link = document.createElement('a');
      link.href = creative.imageUrl;
      link.download = `${creative.name}.jpg`;
      link.click();
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(creative.id.toString());
    // You could add a toast notification here
  };

  const handleAIAnalysis = async () => {
    if (!creative) {
      console.error('❌ No creative data available for analysis');
      return;
    }

    const sessionId = createCreativeAnalysisSession(creative.id);
    
    try {
      logCreativeAnalysis(sessionId, 'info', '🚀 Starting individual creative analysis');
      logCreativeAnalysis(sessionId, 'info', '🎯 Creative details', {
        id: creative.id,
        type: creative.creativeType,
        name: creative.name
      });

      // Validate creative type
      if (creative.creativeType !== 'image') {
        logCreativeAnalysis(sessionId, 'warn', '⚠️ Creative is not an image, analysis may not work properly');
        alert('AI analysis is currently only available for image creatives. Video analysis is coming soon!');
        return;
      }

      // Check if creative has image URLs
      if (!creative.imageUrl && !creative.thumbnailUrl) {
        logCreativeAnalysis(sessionId, 'error', '❌ Creative has no image URLs available for analysis');
        alert('This creative has no image content available for AI analysis.');
        return;
      }

      logCreativeAnalysis(sessionId, 'info', '✅ Creative validation passed, proceeding with analysis');

      // Get ad account ID from the creative data or props
      const adAccountId = creative.adAccountId || 'unknown';
      if (!adAccountId || adAccountId === 'unknown') {
        logCreativeAnalysis(sessionId, 'error', '❌ No ad account ID available for this creative');
        return;
      }

      logCreativeAnalysis(sessionId, 'info', '🏢 Ad account ID', { adAccountId });

      // Prepare webhook payload
      const webhookPayload = {
        creativeId: creative.id.toString(),
        adAccountId: adAccountId,
        imageUrl: creative.imageUrl || creative.thumbnailUrl,
        creativeName: creative.name,
        creativeType: creative.creativeType,
        timestamp: new Date().toISOString()
      };

      logCreativeAnalysis(sessionId, 'info', '📦 Webhook payload prepared', webhookPayload);

      // Get webhook URL from environment
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        logCreativeAnalysis(sessionId, 'error', '❌ No webhook URL configured for AI analysis');
        alert('AI analysis is not configured. Please check your environment settings.');
        return;
      }

      logCreativeAnalysis(sessionId, 'info', '🔗 Calling webhook URL', { webhookUrl });

      setIsAnalyzing(true);
      const startTime = Date.now();

      // Call the webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      const responseTime = Date.now() - startTime;
      logCreativeAnalysis(sessionId, 'info', '⏱️ Webhook response time', { responseTime });

      if (!response.ok) {
        logCreativeAnalysis(sessionId, 'error', '❌ Webhook call failed', {
          status: response.status,
          statusText: response.statusText,
          responseTime
        });
        throw new Error(`Webhook call failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.text();
      logCreativeAnalysis(sessionId, 'info', '✅ Webhook call successful', result);

      let parsedResult;
      try {
        parsedResult = JSON.parse(result);
      } catch (parseError) {
        logCreativeAnalysis(sessionId, 'warn', '⚠️ Webhook response is not valid JSON', {
          response: result,
          parseError: parseError.message
        });
        // Continue with the response as-is
        parsedResult = { message: result };
      }

      const totalTime = Date.now() - startTime;
      logCreativeAnalysisSuccess(sessionId, parsedResult, totalTime);

      // Update local state with the AI score if available
      if (parsedResult.score !== undefined) {
        setAiScore(parsedResult.score);
      }

      alert(`AI analysis completed! Score: ${parsedResult.score || 'N/A'}/10`);

    } catch (error) {
      const totalTime = Date.now() - startTime;
      logCreativeAnalysisError(sessionId, error instanceof Error ? error : new Error('Unknown error occurred'), {
        creativeId: creative.id,
        totalTime
      });
      alert('AI analysis failed. Please check the console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              <FacebookImage
                src={creative.thumbnailUrl}
                accessToken={facebookAccessToken}
                alt={creative.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{creative.name}</h2>
              <p className="text-sm text-gray-600">Creative ID: {creative.id}</p>
            </div>
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
        <div className="overflow-auto max-h-[calc(95vh-140px)]">
          <div className="p-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'trends', label: 'Trends' },
                  { id: 'breakdown', label: 'Platform Breakdown' },
                  { id: 'campaigns', label: 'Associated Campaigns' },
                  ...(creative.aiScore !== undefined || creative.creativeType === 'image' ? [{ id: 'ai', label: '🤖 AI Analysis' }] : [])
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Creative Asset Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Creative Asset</h3>
                    <div className="relative rounded-lg overflow-hidden bg-gray-100">
                      {creative.videoUrl ? (
                        <video
                          src={creative.videoUrl}
                          controls
                          poster={getHighResUrl(creative.thumbnailUrl, facebookAccessToken, 'video')}
                          className="w-full h-64 object-cover"
                        />
                      ) : creative.imageUrl ? (
                        <FacebookImage
                          src={creative.imageUrl}
                          accessToken={facebookAccessToken}
                          alt={creative.name}
                          className="w-full h-64 object-cover"
                          contentType={creative.creativeType === 'video' ? 'video' : creative.creativeType === 'carousel' || creative.creativeType === 'dynamic' ? 'carousel' : 'image'}
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Preview Available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Creative Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Type:</span>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCreativeTypeColor(creative.creativeType)}`}>
                          {creative.creativeType.charAt(0).toUpperCase() + creative.creativeType.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Campaign:</span>
                        <span className="ml-2 text-sm text-gray-900">{creative.campaignName}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Ad Set:</span>
                        <span className="ml-2 text-sm text-gray-900">{creative.adsetName}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <span className="ml-2 text-sm text-gray-900">{creative.status}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Created:</span>
                        <span className="ml-2 text-sm text-gray-900">
                          {new Date(creative.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Performance:</span>
                        <span className={`ml-2 text-sm ${getPerformanceColor(creative.performance)}`}>
                          {creative.performance.charAt(0).toUpperCase() + creative.performance.slice(1)}
                        </span>
                      </div>
                      {creative.description && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Description:</span>
                          <p className="mt-1 text-sm text-gray-700">{creative.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics ({dateRange})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500">ROAS</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {creative.roas ? `${creative.roas.toFixed(2)}x` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500">Spend</p>
                      <p className="text-2xl font-bold text-gray-900">${creative.spend.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500">Impressions</p>
                      <p className="text-2xl font-bold text-gray-900">{creative.impressions.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500">Clicks</p>
                      <p className="text-2xl font-bold text-gray-900">{creative.clicks.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500">CTR</p>
                      <p className="text-2xl font-bold text-gray-900">{creative.ctr.toFixed(2)}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500">CPC</p>
                      <p className="text-2xl font-bold text-gray-900">${creative.cpc.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500">CPM</p>
                      <p className="text-2xl font-bold text-gray-900">${creative.cpm.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500">Reach</p>
                      <p className="text-2xl font-bold text-gray-900">{creative.reach.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Download Asset
                    </button>
                    <button
                      onClick={handleCopyId}
                      className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Copy Creative ID
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                      Tag Creative
                    </button>
                    <button className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors">
                      Favorite
                    </button>
                    {creative.creativeType === 'image' && (
                      <button
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          isAnalyzing
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {isAnalyzing ? '🤖 Analyzing...' : '🤖 AI Analysis'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                  <div className="mb-4">
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="roas">ROAS</option>
                      <option value="spend">Spend</option>
                      <option value="impressions">Impressions</option>
                      <option value="clicks">Clicks</option>
                      <option value="ctr">CTR</option>
                    </select>
                  </div>
                  
                  {/* Simple trend visualization */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-end space-x-2 h-32">
                      {trendData[selectedMetric].map((point, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-blue-500 rounded-t"
                            style={{ height: `${(point.value / Math.max(...trendData[selectedMetric].map(p => p.value))) * 100}%` }}
                          ></div>
                          <span className="text-xs text-gray-500 mt-1">
                            {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedMetric.toUpperCase()} over time
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'breakdown' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4 font-medium text-gray-900">Platform</th>
                          <th className="text-right py-2 px-4 font-medium text-gray-900">Spend</th>
                          <th className="text-right py-2 px-4 font-medium text-gray-900">Impressions</th>
                          <th className="text-right py-2 px-4 font-medium text-gray-900">Clicks</th>
                          <th className="text-right py-2 px-4 font-medium text-gray-900">ROAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {platformBreakdown.map((platform) => (
                          <tr key={platform.platform} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-medium text-gray-700">{platform.platform}</td>
                            <td className="py-3 px-4 text-right">${platform.spend.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right">{platform.impressions.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right">{platform.clicks.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right">{platform.roas.toFixed(2)}x</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Associated Campaigns</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4 font-medium text-gray-900">Campaign</th>
                          <th className="text-left py-2 px-4 font-medium text-gray-900">Ad Set</th>
                          <th className="text-right py-2 px-4 font-medium text-gray-900">Spend</th>
                          <th className="text-right py-2 px-4 font-medium text-gray-900">Impressions</th>
                          <th className="text-right py-2 px-4 font-medium text-gray-900">Clicks</th>
                          <th className="text-right py-2 px-4 font-medium text-gray-900">ROAS</th>
                          <th className="text-center py-2 px-4 font-medium text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {associatedCampaigns.map((campaign) => (
                          <tr key={campaign.id} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-medium text-gray-700">{campaign.name}</td>
                            <td className="py-3 px-4 text-gray-700">{campaign.adsetName}</td>
                            <td className="py-3 px-4 text-right">${campaign.spend.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right">{campaign.impressions.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right">{campaign.clicks.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right">{campaign.roas.toFixed(2)}x</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {campaign.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Creative Analysis</h3>
                  
                  {/* Current AI Score Display */}
                  {aiScore !== null && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">🤖</div>
                        <div>
                          <h4 className="font-semibold text-blue-900">Current AI Score</h4>
                          <p className="text-3xl font-bold text-blue-600">{aiScore}/10</p>
                          <p className="text-sm text-blue-700">AI analysis completed</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Controls */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Analyze Creative</h4>
                    
                    {creative.creativeType === 'image' ? (
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          Use AI to analyze this creative and get insights on visual appeal, 
                          brand consistency, and potential performance.
                        </p>
                        
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={handleAIAnalysis}
                            disabled={isAnalyzing}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                              isAnalyzing
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {isAnalyzing ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Analyzing...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span>🤖</span>
                                <span>Start AI Analysis</span>
                              </div>
                            )}
                          </button>
                          
                          {aiScore !== null && (
                            <button
                              onClick={() => window.open('/api/ai/creative-score?creativeId=' + creative.id + '&adAccountId=' + (creative.adAccountId || 'unknown'), '_blank')}
                              className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                            >
                              View Raw Data
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🎥</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Video Analysis Coming Soon</h4>
                        <p className="text-gray-500">AI analysis is currently only available for image creatives. Video analysis is coming soon!</p>
                      </div>
                    )}
                  </div>

                  {/* AI Analysis Info */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-yellow-600 text-xl">ℹ️</div>
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-2">How AI Analysis Works</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Analyzes visual elements, colors, and composition</li>
                          <li>• Evaluates brand consistency and messaging</li>
                          <li>• Provides score from 0-10 with detailed insights</li>
                          <li>• Results are saved for future reference</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeDetailModal; 