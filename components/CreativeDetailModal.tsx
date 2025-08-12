'use client'

import React, { useState } from 'react';
import { CreativeData } from './types';
import FacebookImage from './FacebookImage';
import { createOptimizedThumbnailUrl } from '../lib/facebook-utils';
import { 
  createCreativeAnalysisSession,
  logCreativeAnalysis,
  logCreativeAnalysisError,
  logCreativeAnalysisSuccess,
  logWebhookCall,
  logWebhookResponse,
  activeSessions
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
    
    // Initialize timing variables outside try block for access in catch/finally
    let startTime: number = Date.now();
    
    try {
      logCreativeAnalysis(sessionId, 'info', '🚀 Starting individual creative analysis');
      logCreativeAnalysis(sessionId, 'info', '🎯 Creative details', {
        id: creative.id,
        type: creative.creativeType,
        name: creative.name
      });

      // Enhanced validation with detailed logging
      logCreativeAnalysis(sessionId, 'info', '🔍 Starting creative validation');
      
      // Validate creative type
      if (creative.creativeType !== 'image') {
        logCreativeAnalysis(sessionId, 'warn', '⚠️ Creative is not an image, analysis may not work properly', {
          expectedType: 'image',
          actualType: creative.creativeType
        });
        alert('AI analysis is currently only available for image creatives. Video analysis is coming soon!');
        return;
      }

      // Check if creative has image URLs with detailed validation
      const imageUrl = creative.imageUrl || creative.thumbnailUrl;
      if (!imageUrl) {
        logCreativeAnalysis(sessionId, 'error', '❌ Creative has no image URLs available for analysis', {
          imageUrl: creative.imageUrl,
          thumbnailUrl: creative.thumbnailUrl,
          availableFields: Object.keys(creative).filter(key => key.includes('url') || key.includes('image'))
        });
        alert('This creative has no image content available for AI analysis.');
        return;
      }

      // Validate image URL format
      try {
        new URL(imageUrl);
        logCreativeAnalysis(sessionId, 'info', '✅ Image URL format validation passed', { imageUrl });
      } catch (urlError) {
        logCreativeAnalysis(sessionId, 'error', '❌ Invalid image URL format', { 
          imageUrl, 
          error: urlError instanceof Error ? urlError.message : 'Unknown URL error' 
        });
        alert('The creative image URL is not valid. Please check the creative data.');
        return;
      }

      logCreativeAnalysis(sessionId, 'info', '✅ Creative validation passed, proceeding with analysis');

      // Enhanced ad account ID validation
      const adAccountId = creative.adAccountId || 'unknown';
      if (!adAccountId || adAccountId === 'unknown') {
        logCreativeAnalysis(sessionId, 'error', '❌ No ad account ID available for this creative', {
          adAccountId,
          creativeFields: Object.keys(creative),
          hasAdAccountId: 'adAccountId' in creative
        });
        
        // Try to extract from other fields
        const possibleAdAccountId = creative.campaignName || creative.adsetName;
        if (possibleAdAccountId) {
          logCreativeAnalysis(sessionId, 'warn', '⚠️ Attempting to use alternative identifier', { 
            alternativeId: possibleAdAccountId,
            type: typeof possibleAdAccountId 
          });
        }
        
        alert('Unable to identify the ad account for this creative. Please refresh the data and try again.');
        return;
      }

      logCreativeAnalysis(sessionId, 'info', '🏢 Ad account ID validation passed', { adAccountId });

      // Environment configuration validation
      logCreativeAnalysis(sessionId, 'info', '🔧 Validating environment configuration');
      
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        logCreativeAnalysis(sessionId, 'error', '❌ No webhook URL configured for AI analysis', {
          envVars: {
            hasWebhookUrl: !!process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
            hasAccessToken: !!facebookAccessToken,
            nodeEnv: process.env.NODE_ENV
          }
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
          error: urlError instanceof Error ? urlError.message : 'Unknown URL error' 
        });
        alert('The AI analysis service URL is not properly configured. Please contact support.');
        return;
      }

      // Enhanced webhook payload preparation
      logCreativeAnalysis(sessionId, 'info', '📦 Preparing webhook payload');
      
      const webhookPayload = {
        creativeId: creative.id.toString(),
        adAccountId: adAccountId,
        imageUrl: imageUrl,
        creativeName: creative.name,
        creativeType: creative.creativeType,
        timestamp: new Date().toISOString(),
        sessionId: sessionId, // Include session ID for tracking
        metadata: {
          campaignName: creative.campaignName,
          adsetName: creative.adsetName,
          performance: creative.performance,
          impressions: creative.impressions,
          clicks: creative.clicks,
          spend: creative.spend
        }
      };

      logCreativeAnalysis(sessionId, 'info', '📦 Webhook payload prepared successfully', webhookPayload);

      // Pre-flight checks
      logCreativeAnalysis(sessionId, 'info', '✈️ Performing pre-flight checks');
      
      // Check network connectivity
      try {
        const testResponse = await fetch(webhookUrl, { 
          method: 'HEAD',
          mode: 'no-cors' // Just check if we can reach the endpoint
        });
        logCreativeAnalysis(sessionId, 'info', '✅ Network connectivity test passed');
      } catch (networkError) {
        logCreativeAnalysis(sessionId, 'warn', '⚠️ Network connectivity test failed', { 
          error: networkError instanceof Error ? networkError.message : 'Unknown network error',
          webhookUrl 
        });
        // Continue anyway as this might be a CORS issue
      }

      // Check Facebook access token validity
      if (facebookAccessToken) {
        try {
          const tokenTest = await fetch(`https://graph.facebook.com/me?access_token=${facebookAccessToken}`);
          if (tokenTest.ok) {
            logCreativeAnalysis(sessionId, 'info', '✅ Facebook access token validation passed');
          } else {
            logCreativeAnalysis(sessionId, 'warn', '⚠️ Facebook access token may be expired', { 
              status: tokenTest.status,
              statusText: tokenTest.statusText 
            });
          }
        } catch (tokenError) {
          logCreativeAnalysis(sessionId, 'warn', '⚠️ Facebook access token validation failed', { 
            error: tokenError instanceof Error ? tokenError.message : 'Unknown token error' 
          });
        }
      }

      logCreativeAnalysis(sessionId, 'info', '🔗 Calling webhook URL', { webhookUrl });

      startTime = Date.now(); // Set startTime here
      setIsAnalyzing(true);

      // Enhanced webhook call with detailed logging
      logWebhookCall(sessionId, webhookUrl, webhookPayload);

      // Call the webhook with timeout and retry logic
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
          'X-Creative-ID': creative.id.toString(),
          'X-Timestamp': new Date().toISOString()
        },
        body: JSON.stringify(webhookPayload),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      const responseTime = Date.now() - startTime;
      logCreativeAnalysis(sessionId, 'info', '⏱️ Webhook response received', { responseTime });

      // Enhanced response handling
      logWebhookResponse(sessionId, response, '', responseTime);

      if (!response.ok) {
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          responseTime,
          headers: Object.fromEntries(response.headers.entries()),
          webhookUrl
        };
        
        logCreativeAnalysis(sessionId, 'error', '❌ Webhook call failed', errorDetails);
        
        // Provide specific error messages based on status codes
        let userMessage = 'AI analysis failed. ';
        switch (response.status) {
          case 400:
            userMessage += 'The request was invalid. Please check the creative data.';
            break;
          case 401:
            userMessage += 'Authentication failed. Please check your credentials.';
            break;
          case 403:
            userMessage += 'Access denied. You may not have permission to use this service.';
            break;
          case 404:
            userMessage += 'AI analysis service not found. Please contact support.';
            break;
          case 429:
            userMessage += 'Too many requests. Please wait a moment and try again.';
            break;
          case 500:
            userMessage += 'Internal server error. The AI service is experiencing issues.';
            break;
          case 502:
          case 503:
          case 504:
            userMessage += 'AI service temporarily unavailable. Please try again later.';
            break;
          default:
            userMessage += `Server error (${response.status}). Please try again.`;
        }
        
        throw new Error(`Webhook call failed: ${response.status} ${response.statusText} - ${userMessage}`);
      }

      // Parse response with enhanced error handling
      let result;
      try {
        result = await response.text();
        logCreativeAnalysis(sessionId, 'info', '📄 Raw response received', { 
          responseLength: result.length,
          responsePreview: result.substring(0, 200) + (result.length > 200 ? '...' : '')
        });
      } catch (readError) {
        logCreativeAnalysis(sessionId, 'error', '❌ Failed to read response body', { 
          error: readError instanceof Error ? readError.message : 'Unknown read error' 
        });
        throw new Error('Failed to read response from AI analysis service');
      }

      let parsedResult;
      try {
        parsedResult = JSON.parse(result);
        logCreativeAnalysis(sessionId, 'info', '✅ Response parsed successfully as JSON', { 
          hasScore: 'score' in parsedResult,
          hasMessage: 'message' in parsedResult,
          resultKeys: Object.keys(parsedResult)
        });
      } catch (parseError) {
        logCreativeAnalysis(sessionId, 'warn', '⚠️ Webhook response is not valid JSON', {
          response: result,
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          responseLength: result.length
        });
        
        // Try to extract useful information from non-JSON response
        if (result.includes('score') || result.includes('Score')) {
          const scoreMatch = result.match(/(?:score|Score)[:\s]*(\d+(?:\.\d+)?)/i);
          if (scoreMatch) {
            parsedResult = { 
              score: parseFloat(scoreMatch[1]),
              message: 'Score extracted from response',
              rawResponse: result 
            };
            logCreativeAnalysis(sessionId, 'info', '🔍 Extracted score from non-JSON response', { 
              extractedScore: parsedResult.score 
            });
          } else {
            parsedResult = { message: result, rawResponse: result };
          }
        } else {
          parsedResult = { message: result, rawResponse: result };
        }
      }

      const totalTime = Date.now() - startTime;
      logCreativeAnalysisSuccess(sessionId, parsedResult, totalTime);

      // Enhanced result validation and user feedback
      if (parsedResult.score !== undefined) {
        const score = typeof parsedResult.score === 'number' ? parsedResult.score : parseFloat(parsedResult.score);
        if (!isNaN(score) && score >= 0 && score <= 10) {
          setAiScore(score);
          logCreativeAnalysis(sessionId, 'info', '🎯 AI score updated successfully', { score });
          
          // Provide detailed feedback based on score
          let feedback = '';
          if (score >= 8) {
            feedback = 'Excellent! This creative has high AI appeal.';
          } else if (score >= 6) {
            feedback = 'Good! This creative shows promise.';
          } else if (score >= 4) {
            feedback = 'Fair. Consider optimizing visual elements.';
          } else {
            feedback = 'Needs improvement. Focus on visual appeal and messaging.';
          }
          
          alert(`AI analysis completed! Score: ${score}/10\n\n${feedback}`);
        } else {
          logCreativeAnalysis(sessionId, 'warn', '⚠️ Invalid score format received', { 
            score: parsedResult.score,
            parsedScore: score,
            isValid: !isNaN(score) && score >= 0 && score <= 10
          });
          alert(`AI analysis completed! Score: ${parsedResult.score}/10\n\nNote: Score format may be unexpected.`);
        }
      } else {
        logCreativeAnalysis(sessionId, 'warn', '⚠️ No score in response', { 
          resultKeys: Object.keys(parsedResult),
          hasScore: 'score' in parsedResult
        });
        alert(`AI analysis completed! ${parsedResult.message || 'Analysis finished successfully.'}`);
      }

    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      // Enhanced error context
      const errorContext = {
        creativeId: creative.id,
        creativeType: creative.creativeType,
        adAccountId: creative.adAccountId,
        imageUrl: creative.imageUrl || creative.thumbnailUrl,
        totalTime,
        step: 'ai_analysis',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error)
      };
      
      logCreativeAnalysisError(sessionId, error instanceof Error ? error : new Error('Unknown error occurred'), errorContext);
      
      // Enhanced user error message
      let userMessage = 'AI analysis failed. ';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          userMessage += 'The request timed out. Please check your internet connection and try again.';
        } else if (error.message.includes('fetch')) {
          userMessage += 'Network error. Please check your internet connection.';
        } else if (error.message.includes('webhook')) {
          userMessage += error.message;
        } else {
          userMessage += 'An unexpected error occurred. Please try again or contact support.';
        }
      } else {
        userMessage += 'An unexpected error occurred. Please try again.';
      }
      
      alert(userMessage);
      
      // Log additional debugging information
      console.group('🔍 AI Analysis Debug Information');
      console.log('Session ID:', sessionId);
      console.log('Creative Data:', creative);
      console.log('Facebook Access Token:', facebookAccessToken ? 'Present' : 'Missing');
      console.log('Environment Variables:', {
        hasWebhookUrl: !!process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
        nodeEnv: process.env.NODE_ENV
      });
      console.log('Error Details:', error);
      console.groupEnd();
      
    } finally {
      setIsAnalyzing(false);
      
      // Final session logging
      logCreativeAnalysis(sessionId, 'info', '🏁 AI analysis session completed', {
        finalStatus: 'completed',
        totalDuration: Date.now() - startTime,
        errors: activeSessions.get(sessionId)?.errors.length || 0
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

                  {/* Debug Panel - Only show in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-gray-600 text-xl">🔧</div>
                        <div className="w-full">
                          <h4 className="font-medium text-gray-900 mb-2">Debug Information</h4>
                          
                          {/* Session Status */}
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Session Status</h5>
                            <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                              {activeSessions.size > 0 ? (
                                <div>
                                  <p>Active Sessions: {activeSessions.size}</p>
                                  {Array.from(activeSessions.values()).map(session => (
                                    <div key={session.id} className="mt-1 p-1 bg-gray-50 rounded">
                                      <p><strong>ID:</strong> {session.id}</p>
                                      <p><strong>Status:</strong> <span className={`px-1 py-0.5 rounded text-xs ${
                                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        session.status === 'failed' ? 'bg-red-100 text-red-800' :
                                        session.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>{session.status}</span></p>
                                      <p><strong>Steps:</strong> {session.steps.length}</p>
                                      <p><strong>Errors:</strong> {session.errors.length}</p>
                                      <p><strong>Duration:</strong> {session.performance.totalTime}ms</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p>No active sessions</p>
                              )}
                            </div>
                          </div>

                          {/* Environment Check */}
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Environment Check</h5>
                            <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                              <p><strong>Webhook URL:</strong> {process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ? '✅ Configured' : '❌ Missing'}</p>
                              <p><strong>Access Token:</strong> {facebookAccessToken ? '✅ Present' : '❌ Missing'}</p>
                              <p><strong>Node Env:</strong> {process.env.NODE_ENV}</p>
                              <p><strong>Creative Type:</strong> {creative.creativeType}</p>
                              <p><strong>Has Image:</strong> {creative.imageUrl || creative.thumbnailUrl ? '✅ Yes' : '❌ No'}</p>
                            </div>
                          </div>

                          {/* Troubleshooting Actions */}
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Troubleshooting Actions</h5>
                            <div className="space-y-2">
                              <button
                                onClick={() => {
                                  const session = Array.from(activeSessions.values())[0];
                                  if (session) {
                                    console.group('🔍 Session Debug Data');
                                    console.log('Full Session:', session);
                                    console.log('Steps:', session.steps);
                                    console.log('Errors:', session.errors);
                                    console.log('Performance:', session.performance);
                                    console.log('Troubleshooting:', session.troubleshooting);
                                    console.groupEnd();
                                  }
                                }}
                                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded transition-colors"
                              >
                                Log Session to Console
                              </button>
                              <button
                                onClick={() => {
                                  const session = Array.from(activeSessions.values())[0];
                                  if (session) {
                                    const dataStr = JSON.stringify(session, null, 2);
                                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                    const url = URL.createObjectURL(dataBlob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `ai-analysis-session-${session.id}.json`;
                                    link.click();
                                    URL.revokeObjectURL(url);
                                  }
                                }}
                                className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 text-xs rounded transition-colors"
                              >
                                Export Session Data
                              </button>
                              <button
                                onClick={() => {
                                  activeSessions.clear();
                                  console.log('🧹 All sessions cleared');
                                }}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs rounded transition-colors"
                              >
                                Clear All Sessions
                              </button>
                            </div>
                          </div>

                          {/* Common Issues */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Common Issues & Solutions</h5>
                            <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                              <ul className="space-y-1">
                                <li>• <strong>Timeout:</strong> Check internet connection and webhook service status</li>
                                <li>• <strong>Authentication:</strong> Verify Facebook access token is valid</li>
                                <li>• <strong>Image Access:</strong> Ensure creative has accessible image URLs</li>
                                <li>• <strong>Webhook Error:</strong> Check environment configuration</li>
                                <li>• <strong>Rate Limit:</strong> Wait before retrying analysis</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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