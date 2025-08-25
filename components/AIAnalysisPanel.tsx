import React, { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  BarChart3, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Eye,
  MessageSquare,
  Palette,
  Smartphone,
  Users
} from 'lucide-react';

interface AIAnalysisData {
  score: number;
  aiScore: number;
  analysis: string;
  analysisText: string;
  optimizationScore: number;
  improvements: string[];
  recommendations: string[];
  dimensions: {
    visualAppeal: number;
    messageClarity: number;
    brandAlignment: number;
    callToAction: number;
    targetAudience: number;
    competitiveAdvantage: number;
    compliance: number;
    mobileOptimization: number;
    engagementPotential: number;
    textReadability?: number;
    colorHarmony?: number;
    composition?: number;
  };
  strengths: string[];
  issues: string[];
  adVariations: Array<{
    variation: number;
    description: string;
    keyChanges: string;
    expectedImprovement: string;
  }>;
  optimizationRecommendations: string[];
  scoreBreakdown: {
    overall: number;
    visualAppeal: number;
    messageClarity: number;
    brandAlignment: number;
    callToAction: number;
    targetAudience: number;
    competitiveAdvantage: number;
    compliance: number;
    mobileOptimization: number;
    engagementPotential: number;
  };
  actionableInsights: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  performancePredictions: {
    expectedCTR: string;
    expectedConversionRate: string;
    engagementPotential: string;
    optimizationPriority: string;
    expectedROI: string;
    confidenceLevel: string;
  };
  abTestingSuggestions: string[];
}

interface AIAnalysisPanelProps {
  analysisData: AIAnalysisData;
  onClose?: () => void;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ analysisData, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'scoring' | 'insights' | 'variations'>('overview');

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    return 'Needs Improvement';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderScoreBar = (score: number, label: string, maxScore: number = 100) => {
    const percentage = (score / maxScore) * 100;
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold text-gray-900">{score}/{maxScore}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">AI Creative Analysis</h2>
              <p className="text-blue-100">Comprehensive optimization insights and recommendations</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Overall Score */}
        <div className="mt-6 flex items-center space-x-6">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(analysisData.score)} px-4 py-2 rounded-full`}>
              {analysisData.score}/10
            </div>
            <p className="text-blue-100 mt-1">{getScoreLabel(analysisData.score)}</p>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{analysisData.analysis}</h3>
            <p className="text-blue-100 text-sm">{analysisData.analysisText}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
            { id: 'scoring', label: 'Detailed Scoring', icon: BarChart3 },
            { id: 'insights', label: 'Insights', icon: Target },
            { id: 'variations', label: 'Ad Variations', icon: Zap }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Expected CTR</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {analysisData.performancePredictions?.expectedCTR || 'N/A'}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-900">
                      {analysisData.performancePredictions?.expectedConversionRate || 'N/A'}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Engagement Potential</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {analysisData.performancePredictions?.engagementPotential || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {analysisData.strengths?.map((strength, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {analysisData.issues?.map((issue, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Quick Actions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisData.actionableInsights?.immediate?.slice(0, 4).map((insight, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Optimization Recommendations */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Optimization Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisData.optimizationRecommendations?.map((rec, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-600 font-semibold text-sm">#{index + 1}</span>
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* A/B Testing Suggestions */}
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                A/B Testing Suggestions
              </h3>
              <div className="space-y-3">
                {analysisData.abTestingSuggestions?.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-purple-600 font-semibold text-sm">#{index + 1}</span>
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Insights */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Actionable Insights
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Immediate Actions</h4>
                  <ul className="space-y-2">
                    {analysisData.actionableInsights?.immediate?.map((insight, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Short Term</h4>
                  <ul className="space-y-2">
                    {analysisData.actionableInsights?.shortTerm?.map((insight, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Scoring Tab */}
        {activeTab === 'scoring' && (
          <div className="space-y-6">
            {/* Overall Score Breakdown */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Score Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {renderScoreBar(analysisData.scoreBreakdown?.visualAppeal || 0, 'Visual Appeal')}
                  {renderScoreBar(analysisData.scoreBreakdown?.messageClarity || 0, 'Message Clarity')}
                  {renderScoreBar(analysisData.scoreBreakdown?.brandAlignment || 0, 'Brand Alignment')}
                  {renderScoreBar(analysisData.scoreBreakdown?.callToAction || 0, 'Call to Action')}
                  {renderScoreBar(analysisData.scoreBreakdown?.targetAudience || 0, 'Target Audience')}
                </div>
                <div>
                  {renderScoreBar(analysisData.scoreBreakdown?.competitiveAdvantage || 0, 'Competitive Advantage')}
                  {renderScoreBar(analysisData.scoreBreakdown?.compliance || 0, 'Compliance')}
                  {renderScoreBar(analysisData.scoreBreakdown?.mobileOptimization || 0, 'Mobile Optimization')}
                  {renderScoreBar(analysisData.scoreBreakdown?.engagementPotential || 0, 'Engagement Potential')}
                  {renderScoreBar(analysisData.scoreBreakdown?.overall || 0, 'Overall Score')}
                </div>
              </div>
            </div>

            {/* Performance Predictions */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Performance Predictions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Expected CTR</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {analysisData.performancePredictions?.expectedCTR || 'N/A'}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Conversion Rate</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {analysisData.performancePredictions?.expectedConversionRate || 'N/A'}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Optimization Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(analysisData.performancePredictions?.optimizationPriority || '')}`}>
                    {analysisData.performancePredictions?.optimizationPriority || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Key Insights */}
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Key Insights
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">Engagement Potential</h4>
                  <p className="text-sm text-yellow-700">
                    This creative has {analysisData.performancePredictions?.engagementPotential?.toLowerCase()} engagement potential 
                    with an expected ROI of {analysisData.performancePredictions?.expectedROI?.toLowerCase()}.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">Confidence Level</h4>
                  <p className="text-sm text-yellow-700">
                    Analysis confidence: {analysisData.performancePredictions?.confidenceLevel?.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Improvement Areas */}
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Priority Improvement Areas</h3>
              <div className="space-y-3">
                {analysisData.improvements?.map((improvement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-red-600 font-semibold text-sm">#{index + 1}</span>
                    <p className="text-sm text-red-700">{improvement}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Strategic Recommendations</h3>
              <div className="space-y-3">
                {analysisData.recommendations?.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-green-600 font-semibold text-sm">#{index + 1}</span>
                    <p className="text-sm text-green-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ad Variations Tab */}
        {activeTab === 'variations' && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Suggested Ad Variations
              </h3>
              <div className="space-y-4">
                {analysisData.adVariations?.map((variation) => (
                  <div key={variation.variation} className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-purple-900">
                        Variation {variation.variation}
                      </h4>
                      <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        {variation.expectedImprovement}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{variation.description}</p>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Key Changes:</span> {variation.keyChanges}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisPanel;
