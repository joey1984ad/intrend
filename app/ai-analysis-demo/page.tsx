'use client';

import React, { useState } from 'react';
import AIAnalysisPanel from '@/components/AIAnalysisPanel';

// Mock data for demonstration
const mockAnalysisData = {
  score: 8,
  aiScore: 8,
  analysis: "Creative scored 85/100 - Excellent performance with high engagement potential.",
  analysisText: "This creative demonstrates exceptional quality with strong visual appeal, clear messaging, and effective call-to-action elements. The design follows best practices and shows high potential for strong performance across different ad placements.",
  optimizationScore: 85,
  improvements: [
    'Maintain high-quality standards',
    'Optimize for different ad placements',
    'Scale successful elements to other creatives',
    'Focus on audience targeting refinement'
  ],
  recommendations: [
    'Scale successful elements to other creatives',
    'Focus on audience targeting optimization',
    'Test variations for continuous improvement',
    'Consider A/B testing with different variations',
    'Optimize for different ad placements and audiences',
    'Implement performance tracking and analytics',
    'Develop creative style guide for consistency'
  ],
  dimensions: {
    visualAppeal: 88,
    messageClarity: 85,
    brandAlignment: 90,
    callToAction: 82,
    targetAudience: 83,
    competitiveAdvantage: 78,
    compliance: 95,
    mobileOptimization: 85,
    engagementPotential: 87,
    textReadability: 89,
    colorHarmony: 86,
    composition: 84
  },
  strengths: [
    'Exceptional visual impact and modern aesthetic',
    'Clear and compelling brand messaging',
    'Strong call-to-action visibility and placement',
    'Excellent composition and visual hierarchy',
    'High brand recognition and consistency'
  ],
  issues: [
    'Minor optimization opportunities for specific audiences',
    'Could benefit from A/B testing variations'
  ],
  adVariations: [
    {
      variation: 1,
      description: 'High-contrast version for better visibility',
      keyChanges: 'Enhanced contrast, improved text readability',
      expectedImprovement: '15-20% increase in engagement'
    },
    {
      variation: 2,
      description: 'Audience-targeted version with demographic elements',
      keyChanges: 'Added audience-specific visual cues',
      expectedImprovement: '10-15% increase in relevance'
    },
    {
      variation: 3,
      description: 'Competitive advantage highlighted version',
      keyChanges: 'Emphasized unique selling propositions',
      expectedImprovement: '20-25% increase in conversion potential'
    }
  ],
  optimizationRecommendations: [
    'Maintain current high-quality standards',
    'Focus on audience targeting optimization',
    'Consider A/B testing with minor variations',
    'Optimize for different ad placements',
    'Scale successful elements to other creatives'
  ],
  scoreBreakdown: {
    overall: 85,
    visualAppeal: 88,
    messageClarity: 85,
    brandAlignment: 90,
    callToAction: 82,
    targetAudience: 83,
    competitiveAdvantage: 78,
    compliance: 95,
    mobileOptimization: 85,
    engagementPotential: 87
  },
  actionableInsights: {
    immediate: [
      'Minor optimizations recommended',
      'Focus on audience targeting',
      'Scale successful elements'
    ],
    shortTerm: [
      'A/B test current variations',
      'Optimize for different placements',
      'Refine audience targeting'
    ],
    longTerm: [
      'Develop creative style guide',
      'Build creative asset library',
      'Implement performance tracking'
    ]
  },
  performancePredictions: {
    expectedCTR: '4.25',
    expectedConversionRate: '2.55',
    engagementPotential: 'High',
    optimizationPriority: 'Low',
    expectedROI: 'Above Average',
    confidenceLevel: 'High'
  },
  abTestingSuggestions: [
    'Test different color schemes',
    'Experiment with layout variations',
    'Test audience-specific messaging',
    'Try different CTA placements',
    'Test various image styles'
  ]
};

export default function AIAnalysisDemoPage() {
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Creative Analysis Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our enhanced AI analysis system that provides comprehensive image optimization 
            recommendations, detailed scoring, and actionable insights for your ad creatives.
          </p>
        </div>

        {/* Demo Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Interactive Demo
            </h2>
            <p className="text-gray-600 mb-6">
              Click the button below to see the enhanced AI analysis panel in action
            </p>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center mx-auto space-x-2"
            >
              <span>{showAnalysis ? 'Hide' : 'Show'} AI Analysis</span>
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${showAnalysis ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Scoring</h3>
              <p className="text-gray-600 text-sm">
                Detailed analysis across multiple dimensions including visual appeal, message clarity, 
                brand alignment, and more.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
              <p className="text-gray-600 text-sm">
                AI-powered optimization suggestions tailored to your creative's performance level 
                and specific improvement areas.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Insights</h3>
              <p className="text-gray-600 text-sm">
                Predictive analytics including expected CTR, conversion rates, and engagement potential 
                to guide your optimization strategy.
              </p>
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        {showAnalysis && (
          <div className="mb-8">
            <AIAnalysisPanel 
              analysisData={mockAnalysisData}
              onClose={() => setShowAnalysis(false)}
            />
          </div>
        )}

        {/* Technical Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technical Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Analysis Capabilities</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Multi-dimensional scoring (visual, messaging, brand, CTA)</li>
                <li>• Performance prediction algorithms</li>
                <li>• A/B testing suggestion engine</li>
                <li>• Optimization priority assessment</li>
                <li>• Ad variation generation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Data Integration</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Real-time creative analysis</li>
                <li>• Historical performance tracking</li>
                <li>• Cross-platform optimization</li>
                <li>• Automated recommendation engine</li>
                <li>• Performance benchmarking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
