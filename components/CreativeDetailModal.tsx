'use client'

import React, { useState, useEffect } from 'react';
import { CreativeData } from './types';
import FacebookImage from './FacebookImage';
import { createOptimizedThumbnailUrl } from '../lib/facebook-utils';
import { 
  createCreativeAnalysisSession,
  logCreativeAnalysis,
  logCreativeAnalysisError,
  logCreativeAnalysisSuccess,
  getSessionLogs,
  getAllLogs,
  clearLogs,
  exportLogs,
  setDebugMode,
  isDebugMode
} from '../lib/creative-analysis-logger';
import WebhookConnectionTester from './WebhookConnectionTester';

interface CreativeDetailModalProps {
  creative: CreativeData | null;
  onClose: () => void;
  dateRange: string;
  facebookAccessToken: string;
  adAccountId: string; // Add adAccountId as required prop
}

// Helper for hi-res poster images
const getHighResUrl = (url: string | null | undefined, token: string, contentType: 'video' | 'carousel' | 'dynamic' | 'image' = 'video') => {
  return createOptimizedThumbnailUrl(url, token, contentType);
};

const CreativeDetailModal: React.FC<CreativeDetailModalProps> = ({
  creative,
  onClose,
  dateRange,
  facebookAccessToken,
  adAccountId
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'breakdown' | 'campaigns' | 'ai'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<'roas' | 'spend' | 'impressions' | 'clicks' | 'ctr'>('roas');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(creative?.aiScore || null);
  
  // Debug panel state
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugMode, setDebugModeState] = useState(false);
  const [currentSessionLogs, setCurrentSessionLogs] = useState<any[]>([]);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);

  if (!creative) return null;

  // Sync debug mode with the logger
  useEffect(() => {
    setDebugModeState(isDebugMode());
  }, []);

  // Update debug mode when it changes
  const toggleDebugMode = () => {
    const newMode = !debugMode;
    setDebugModeState(newMode);
    setDebugMode(newMode);
  };

  // Get logs for the current session
  const refreshSessionLogs = () => {
    if (lastSessionId) {
      const logs = getSessionLogs(lastSessionId);
      setCurrentSessionLogs(logs);
    }
  };

  // Auto-refresh logs when analyzing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing && lastSessionId) {
      interval = setInterval(refreshSessionLogs, 1000); // Refresh every second during analysis
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, lastSessionId]);

  // Refresh logs when session ID changes
  useEffect(() => {
    if (lastSessionId) {
      refreshSessionLogs();
    }
  }, [lastSessionId]);

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
    setLastSessionId(sessionId); // Store session ID for debugging
    const startTime = Date.now();
    
    try {
      // 🚀 INITIALIZATION PHASE
      logCreativeAnalysis(sessionId, 'info', '🚀 Starting individual creative analysis');
      logCreativeAnalysis(sessionId, 'info', '🎯 Creative details', {
        id: creative.id,
        type: creative.creativeType,
        name: creative.name,
        hasImageUrl: !!creative.imageUrl,
        hasThumbnailUrl: !!creative.thumbnailUrl,
        adAccountId: creative.adAccountId || 'unknown',
        timestamp: new Date().toISOString()
      });

      // 📋 VALIDATION PHASE
      logCreativeAnalysis(sessionId, 'info', '📋 Starting validation phase');
      
      // Validate creative type
      if (creative.creativeType !== 'image') {
        logCreativeAnalysis(sessionId, 'warn', '⚠️ Creative is not an image, analysis may not work properly', {
          creativeType: creative.creativeType,
          supportedTypes: ['image'],
          message: 'AI analysis is currently only available for image creatives. Video analysis is coming soon!'
        });
        alert('AI analysis is currently only available for image creatives. Video analysis is coming soon!');
        return;
      }

      // Check if creative has image URLs
      if (!creative.imageUrl && !creative.thumbnailUrl) {
        logCreativeAnalysis(sessionId, 'error', '❌ Creative has no image URLs available for analysis', {
          imageUrl: creative.imageUrl,
          thumbnailUrl: creative.thumbnailUrl,
          message: 'This creative has no image content available for AI analysis.'
        });
        alert('This creative has no image content available for AI analysis.');
        return;
      }

      // Validate ad account ID
      if (!adAccountId || adAccountId === 'unknown') {
        logCreativeAnalysis(sessionId, 'error', '❌ No ad account ID available for this creative', {
          adAccountId,
          creativeId: creative.id,
          message: 'Ad account ID is required for AI analysis'
        });
        alert('Ad account ID is required for AI analysis. Please check your configuration.');
        return;
      }

      logCreativeAnalysis(sessionId, 'info', '✅ Creative validation passed', {
        validationTime: Date.now() - startTime,
        adAccountId,
        imageUrl: creative.imageUrl || creative.thumbnailUrl
      });

      // 🔧 CONFIGURATION PHASE
      logCreativeAnalysis(sessionId, 'info', '🔧 Starting configuration phase');
      
      // Get webhook URL from environment
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        logCreativeAnalysis(sessionId, 'error', '❌ No webhook URL configured for AI analysis', {
          envVar: 'NEXT_PUBLIC_N8N_WEBHOOK_URL',
          message: 'AI analysis is not configured. Please check your environment settings.'
        });
        alert('AI analysis is not configured. Please check your environment settings.');
        return;
      }

      // Validate webhook URL format
      try {
        new URL(webhookUrl);
        logCreativeAnalysis(sessionId, 'info', '✅ Webhook URL format validation passed', { webhookUrl });
      } catch (urlError) {
        logCreativeAnalysis(sessionId, 'error', '❌ Invalid webhook URL format', {
          webhookUrl,
          error: urlError instanceof Error ? urlError.message : 'Unknown URL error',
          message: 'Webhook URL is not properly formatted'
        });
        alert('Webhook URL is not properly formatted. Please check your configuration.');
        return;
      }

      // 📦 PAYLOAD PREPARATION PHASE
      logCreativeAnalysis(sessionId, 'info', '📦 Starting payload preparation phase');
      
      const webhookPayload = {
        creativeId: creative.id.toString(),
        adAccountId: adAccountId,
        imageUrl: creative.imageUrl || creative.thumbnailUrl,
        creativeName: creative.name,
        creativeType: creative.creativeType,
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        userAgent: navigator.userAgent,
        pageUrl: window.location.href
      };

      logCreativeAnalysis(sessionId, 'info', '📦 Webhook payload prepared', {
        payload: webhookPayload,
        payloadSize: JSON.stringify(webhookPayload).length,
        preparationTime: Date.now() - startTime
      });

      // 🌐 NETWORK PHASE
      logCreativeAnalysis(sessionId, 'info', '🌐 Starting network phase');
      logCreativeAnalysis(sessionId, 'info', '🔗 Calling webhook URL', { 
        webhookUrl,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      setIsAnalyzing(true);
      const networkStartTime = Date.now();

      // Call the webhook with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - networkStartTime;
        
        logCreativeAnalysis(sessionId, 'info', '⏱️ Webhook response received', {
          status: response.status,
          statusText: response.statusText,
          responseTime,
          headers: Object.fromEntries(response.headers.entries()),
          totalTime: Date.now() - startTime
        });

        // Check response status
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unable to read error response');
          logCreativeAnalysis(sessionId, 'error', '❌ Webhook call failed', {
            status: response.status,
            statusText: response.statusText,
            responseTime,
            errorResponse: errorText,
            totalTime: Date.now() - startTime
          });
          
          // Provide user-friendly error messages based on status codes
          let userMessage = 'AI analysis failed. ';
          switch (response.status) {
            case 400:
              userMessage += 'Invalid request data. Please check your creative information.';
              break;
            case 401:
              userMessage += 'Authentication failed. Please check your credentials.';
              break;
            case 403:
              userMessage += 'Access denied. Please check your permissions.';
              break;
            case 404:
              userMessage += 'AI analysis service not found. Please check your configuration.';
              break;
            case 429:
              userMessage += 'Too many requests. Please wait a moment and try again.';
              break;
            case 500:
              userMessage += 'Server error. Please try again later.';
              break;
            case 502:
            case 503:
            case 504:
              userMessage += 'Service temporarily unavailable. Please try again later.';
              break;
            default:
              userMessage += `Server returned error ${response.status}. Please try again.`;
          }
          
          throw new Error(`Webhook call failed: ${response.status} ${response.statusText} - ${userMessage}`);
        }

        // 📊 RESPONSE PROCESSING PHASE
        logCreativeAnalysis(sessionId, 'info', '📊 Starting response processing phase');
        
        const result = await response.text();
        const processingTime = Date.now() - networkStartTime;
        
        logCreativeAnalysis(sessionId, 'info', '✅ Webhook call successful', {
          responseLength: result.length,
          processingTime,
          totalTime: Date.now() - startTime
        });

        // Parse response
        let parsedResult;
        try {
          parsedResult = JSON.parse(result);
          logCreativeAnalysis(sessionId, 'info', '✅ Response parsed successfully', {
            parsedResult,
            parseTime: Date.now() - networkStartTime
          });
        } catch (parseError) {
          logCreativeAnalysis(sessionId, 'warn', '⚠️ Webhook response is not valid JSON', {
            response: result,
            parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
            parseTime: Date.now() - networkStartTime
          });
          // Continue with the response as-is
          parsedResult = { message: result };
        }

        // 🎯 SUCCESS PHASE
        const totalTime = Date.now() - startTime;
        logCreativeAnalysisSuccess(sessionId, parsedResult, totalTime);

        // Update local state with the AI score if available
        if (parsedResult.score !== undefined) {
          setAiScore(parsedResult.score);
          logCreativeAnalysis(sessionId, 'info', '✅ AI score updated in local state', {
            score: parsedResult.score,
            previousScore: creative.aiScore
          });
        }

        // Show success message with details
        const scoreMessage = parsedResult.score !== undefined ? `Score: ${parsedResult.score}/10` : 'Analysis completed';
        const timeMessage = `(${totalTime}ms)`;
        alert(`AI analysis completed successfully! ${scoreMessage} ${timeMessage}`);

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          logCreativeAnalysis(sessionId, 'error', '⏰ Webhook call timed out', {
            timeout: 30000,
            totalTime: Date.now() - startTime,
            message: 'Request took longer than 30 seconds'
          });
          throw new Error('AI analysis timed out. The request took longer than 30 seconds. Please try again.');
        }
        
        throw fetchError;
      }

    } catch (error) {
      const totalTime = Date.now() - startTime;
      const errorDetails = {
        creativeId: creative.id,
        totalTime,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        errorStack: error instanceof Error ? error.stack : undefined,
        sessionId,
        timestamp: new Date().toISOString()
      };

      logCreativeAnalysisError(sessionId, error instanceof Error ? error : new Error('Unknown error occurred'), errorDetails);
      
      // Enhanced error handling with user-friendly messages
      let userMessage = 'AI analysis failed. ';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          userMessage += 'The request timed out. Please try again.';
        } else if (error.message.includes('fetch')) {
          userMessage += 'Network error. Please check your internet connection.';
        } else if (error.message.includes('webhook')) {
          userMessage += error.message.split(' - ')[1] || 'Please try again.';
        } else {
          userMessage += 'An unexpected error occurred. Please try again.';
        }
      } else {
        userMessage += 'An unexpected error occurred. Please try again.';
      }
      
      alert(userMessage);
      
      // Log additional debugging information
      console.group(`🔍 AI Analysis Debug Info - Session ${sessionId}`);
      console.log('Creative Data:', creative);
      console.log('Environment Check:', {
        webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
        hasAccessToken: !!facebookAccessToken,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      console.log('Error Details:', errorDetails);
      console.groupEnd();
      
    } finally {
      setIsAnalyzing(false);
      const finalTime = Date.now() - startTime;
      logCreativeAnalysis(sessionId, 'info', '🏁 AI analysis session completed', {
        sessionId,
        totalTime: finalTime,
        success: aiScore !== null,
        finalState: {
          isAnalyzing: false,
          aiScore: aiScore
        }
      });
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
                  <div>
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
                          
                          <button
                            onClick={() => window.open('/api/ai/creative-score?creativeId=' + creative.id + '&adAccountId=' + adAccountId, '_blank')}
                            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                          >
                            View Raw Data
                          </button>
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

                  {/* Debug Panel Toggle */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900">🔧 Debug & Troubleshooting</h4>
                      <button
                        onClick={() => setShowDebugPanel(!showDebugPanel)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {showDebugPanel ? 'Hide Debug Panel' : 'Show Debug Panel'}
                      </button>
                    </div>
                    
                    {showDebugPanel && (
                      <div className="mt-4 space-y-4">
                        {/* Debug Controls */}
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={debugMode}
                              onChange={toggleDebugMode}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Enable Debug Mode</span>
                          </label>
                          
                          <button
                            onClick={refreshSessionLogs}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            🔄 Refresh Logs
                          </button>
                          
                          <button
                            onClick={() => {
                              clearLogs();
                              setCurrentSessionLogs([]);
                            }}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 transition-colors"
                          >
                            🗑️ Clear Logs
                          </button>
                          
                          <button
                            onClick={exportLogs}
                            className="px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-300 rounded hover:bg-green-50 transition-colors"
                          >
                            📥 Export Logs
                          </button>
                        </div>

                        {/* Session Information */}
                        {lastSessionId && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h5 className="font-medium text-blue-900 mb-2">📋 Current Session</h5>
                            <div className="text-sm text-blue-700">
                              <p><strong>Session ID:</strong> {lastSessionId}</p>
                              <p><strong>Status:</strong> {isAnalyzing ? '🔄 Analyzing...' : '⏸️ Idle'}</p>
                              <p><strong>Creative ID:</strong> {creative.id}</p>
                              <p><strong>Creative Type:</strong> {creative.creativeType}</p>
                            </div>
                          </div>
                        )}

                        {/* Environment Check */}
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h5 className="font-medium text-yellow-900 mb-2">🔍 Environment Check</h5>
                          <div className="text-sm text-yellow-700 space-y-1">
                            <p><strong>Webhook URL:</strong> {process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ? '✅ Configured' : '❌ Not configured'}</p>
                            <p><strong>Facebook Token:</strong> {facebookAccessToken ? '✅ Available' : '❌ Not available'}</p>
                            <p><strong>Creative Data:</strong> {creative ? '✅ Available' : '❌ Not available'}</p>
                            <p><strong>Ad Account ID:</strong> {adAccountId ? '✅ Available' : '❌ Missing'}</p>
                          </div>
                        </div>

                        {/* Webhook Connection Tester */}
                        <WebhookConnectionTester 
                          webhookUrl={process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}
                          onTestComplete={(results) => {
                            console.log('Webhook test results:', results);
                            // You can add additional logic here based on test results
                          }}
                        />

                        {/* Real-time Logs */}
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">📝 Real-time Logs</h5>
                            <span className="text-xs text-gray-500">{currentSessionLogs.length} entries</span>
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {currentSessionLogs.length > 0 ? (
                              currentSessionLogs.map((log, index) => (
                                <div key={index} className={`text-xs p-2 rounded border-l-4 ${
                                  log.level === 'error' ? 'border-red-400 bg-red-50' :
                                  log.level === 'warn' ? 'border-yellow-400 bg-yellow-50' :
                                  'border-blue-400 bg-blue-50'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{log.message}</span>
                                    <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                  {log.data && (
                                    <details className="mt-1">
                                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">View Data</summary>
                                      <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                                        {JSON.stringify(log.data, null, 2)}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-center py-4">No logs available. Start an AI analysis to see logs here.</p>
                            )}
                          </div>
                        </div>

                        {/* Troubleshooting Tips */}
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h5 className="font-medium text-green-900 mb-2">💡 Troubleshooting Tips</h5>
                          <div className="text-sm text-green-700 space-y-2">
                            <p><strong>Common Issues:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                              <li>Check if webhook URL is configured in environment variables</li>
                              <li>Verify Facebook access token is valid</li>
                              <li>Ensure creative has valid image URLs</li>
                              <li>Check browser console for detailed error messages</li>
                              <li>Verify n8n workflow is running and accessible</li>
                            </ul>
                            <p className="mt-2"><strong>Debug Mode:</strong> Enable debug mode for detailed logging and performance metrics.</p>
                          </div>
                        </div>

                        {/* Error Summary */}
                        {currentSessionLogs.some(log => log.level === 'error') && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h5 className="font-medium text-red-900 mb-2">🚨 Error Summary</h5>
                            <div className="text-sm text-red-700 space-y-2">
                              {(() => {
                                const errorLogs = currentSessionLogs.filter(log => log.level === 'error');
                                const warningLogs = currentSessionLogs.filter(log => log.level === 'warn');
                                
                                return (
                                  <>
                                    <p><strong>Errors:</strong> {errorLogs.length} | <strong>Warnings:</strong> {warningLogs.length}</p>
                                    {errorLogs.length > 0 && (
                                      <div className="space-y-1">
                                        <p><strong>Recent Errors:</strong></p>
                                        {errorLogs.slice(-3).map((log, index) => (
                                          <div key={index} className="ml-4 p-2 bg-red-100 rounded border-l-2 border-red-400">
                                            <p className="font-medium">{log.message}</p>
                                            {log.data && (
                                              <details className="mt-1">
                                                <summary className="cursor-pointer text-red-600 hover:text-red-800 text-xs">View Error Details</summary>
                                                <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                                                  {JSON.stringify(log.data, null, 2)}
                                                </pre>
                                              </details>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Performance Metrics */}
                        {currentSessionLogs.length > 0 && (
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <h5 className="font-medium text-purple-900 mb-2">📊 Performance Metrics</h5>
                            <div className="text-sm text-purple-700 space-y-1">
                              {(() => {
                                const infoLogs = currentSessionLogs.filter(log => log.level === 'info');
                                const performanceLogs = infoLogs.filter(log => 
                                  log.message.includes('Phase completed') || 
                                  log.message.includes('Performance Metric') ||
                                  log.message.includes('response time')
                                );
                                
                                return (
                                  <>
                                    <p><strong>Total Logs:</strong> {currentSessionLogs.length}</p>
                                    <p><strong>Performance Logs:</strong> {performanceLogs.length}</p>
                                    {performanceLogs.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {performanceLogs.slice(-5).map((log, index) => (
                                          <div key={index} className="ml-4 p-1 bg-purple-100 rounded text-xs">
                                            {log.message} {log.data && `(${JSON.stringify(log.data)})`}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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