'use client'

import React, { useState } from 'react';

interface APIComparisonTestProps {
  accessToken: string;
  adAccountId: string;
}

const APIComparisonTest: React.FC<APIComparisonTestProps> = ({
  accessToken,
  adAccountId
}) => {
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runComparison = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/facebook/api-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, adAccountId })
      });
      const result = await response.json();
      setComparisonResult(result);
      
      // Also log to console for detailed inspection
      console.log('🔍 API COMPARISON COMPLETE:', result);
    } catch (error) {
      setComparisonResult({ 
        error: error instanceof Error ? error.message : 'Comparison failed',
        success: false 
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (success: boolean) => success ? 'text-green-600' : 'text-red-600';
  const getStatusIcon = (success: boolean) => success ? '✅' : '❌';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Facebook API Field Comparison</h2>
        <p className="text-gray-600 mt-2">
          Compare what image/video fields Facebook is actually returning vs what we expect
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Account: {adAccountId}</p>
          <p className="text-sm text-gray-600">Token: {accessToken ? '✅ Present' : '❌ Missing'}</p>
        </div>
        <button
          onClick={runComparison}
          disabled={isRunning || !accessToken || !adAccountId}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running Comparison...' : 'Run API Comparison'}
        </button>
      </div>

      {comparisonResult && (
        <div className="space-y-6">
          {/* Analysis Summary */}
          {comparisonResult.analysis && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Analysis Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {Object.entries(comparisonResult.analysis.comparison || {}).map(([test, success]: [string, any]) => (
                  <div key={test} className="bg-white p-3 rounded border">
                    <div className={`font-medium ${getStatusColor(success)}`}>
                      {getStatusIcon(success)} {test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium mb-2">Image URL Sources Found:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(comparisonResult.analysis.imageUrlSources || {}).map(([source, found]: [string, any]) => (
                    <div key={source} className={`${getStatusColor(found)}`}>
                      {getStatusIcon(found)} {source.replace(/_/g, '.')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {comparisonResult.recommendations && comparisonResult.recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔧 Recommendations</h3>
              <div className="space-y-3">
                {comparisonResult.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-white p-3 rounded border">
                    <div className="font-medium text-yellow-800">{rec.issue}</div>
                    <div className="text-yellow-700 text-sm mt-1">{rec.suggestion}</div>
                    <div className="text-yellow-600 text-sm mt-1 font-medium">Action: {rec.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detailed Test Results</h3>
            
            {Object.entries(comparisonResult.results || {}).map(([testName, result]: [string, any]) => (
              <div key={testName} className="border rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Test
                    </h4>
                    <span className={`font-medium ${getStatusColor(result.success)}`}>
                      {getStatusIcon(result.success)} {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  {result.fields && (
                    <div className="text-xs text-gray-600 mt-1 font-mono break-all">
                      Fields: {result.fields}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  {result.error ? (
                    <div className="text-red-600 text-sm">Error: {result.error}</div>
                  ) : result.response ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Ads found: {result.response.data?.length || 0}
                      </div>
                      
                      {result.response.data?.slice(0, 1).map((ad: any, adIdx: number) => (
                        <div key={adIdx} className="bg-gray-50 p-3 rounded text-sm">
                          <div className="font-medium">Ad {ad.id}:</div>
                          <div className="ml-2 space-y-1 font-mono text-xs">
                            <div>creative.image_url: {ad.creative?.image_url ? '✅ Present' : '❌ Missing'}</div>
                            <div>creative.video_id: {ad.creative?.video_id ? '✅ Present' : '❌ Missing'}</div>
                            <div>object_story_spec: {ad.creative?.object_story_spec ? '✅ Present' : '❌ Missing'}</div>
                            {ad.creative?.object_story_spec?.link_data && (
                              <div className="ml-2">
                                <div>link_data.image_url: {ad.creative.object_story_spec.link_data.image_url ? '✅ Present' : '❌ Missing'}</div>
                                <div>link_data.child_attachments: {ad.creative.object_story_spec.link_data.child_attachments?.length || 0} items</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600 text-sm">Show Raw Response</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No response data</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Error Display */}
          {comparisonResult.error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <div className="text-red-700">{comparisonResult.error}</div>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What This Test Does</h4>
        <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
          <li>Tests original field combination that might have worked before</li>
          <li>Tests expanded field combination with additional image sources</li>
          <li>Tests creative-focused fields with deep object_story_spec expansion</li>
          <li>Tests individual creative API calls vs bulk ad calls</li>
          <li>Compares multiple Facebook API versions (v23, v19, v18)</li>
          <li>Identifies exactly where image URLs are (or aren&apos;t) in the response</li>
          <li>Provides specific recommendations for fixing the issue</li>
        </ul>
        <div className="mt-2 text-blue-700 text-sm">
          <strong>Check your browser console for detailed logs during the test.</strong>
        </div>
      </div>
    </div>
  );
};

export default APIComparisonTest;