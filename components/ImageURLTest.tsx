'use client'

import React, { useState } from 'react';
import { appendAccessTokenToImageUrl } from '../lib/facebook-utils';

interface ImageURLTestProps {
  accessToken: string;
}

const ImageURLTest: React.FC<ImageURLTestProps> = ({ accessToken }) => {
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingUrl, setIsTestingUrl] = useState(false);

  const testImageUrl = async () => {
    if (!testUrl) return;
    
    setIsTestingUrl(true);
    try {
      const response = await fetch('/api/facebook/test-image-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: testUrl, accessToken })
      });
      const result = await response.json();
      setTestResult(result);
      
      // Log detailed results to console
      console.log('🔍 IMAGE URL TEST COMPLETE:', result);
    } catch (error) {
      setTestResult({ 
        error: error instanceof Error ? error.message : 'Test failed',
        success: false 
      });
    } finally {
      setIsTestingUrl(false);
    }
  };

  const openInNewTab = () => {
    if (testUrl) {
      window.open(testUrl, '_blank');
    }
  };

  const openWithToken = () => {
    if (testUrl && accessToken) {
      const urlWithToken = appendAccessTokenToImageUrl(testUrl, accessToken);
      window.open(urlWithToken, '_blank');
    }
  };

  const getStatusColor = (success: boolean) => success ? 'text-green-600' : 'text-red-600';
  const getStatusIcon = (success: boolean) => success ? '✅' : '❌';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Facebook Image URL Test</h2>
        <p className="text-gray-600 mt-2">
          Test individual image URLs to see if they're accessible and require authentication
        </p>
      </div>

      {/* URL Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL to Test
          </label>
          <input
            type="url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://scontent.fbcdn.net/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={testImageUrl}
            disabled={!testUrl || isTestingUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isTestingUrl ? 'Testing...' : 'Test URL'}
          </button>
          
          <button
            onClick={openInNewTab}
            disabled={!testUrl}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Open in New Tab
          </button>
          
          {accessToken && (
            <button
              onClick={openWithToken}
              disabled={!testUrl}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Open with Access Token
            </button>
          )}
        </div>
      </div>

      {/* Sample URLs for testing */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Quick Test - Paste a sample URL:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Go to your browser console and look for image URLs in the API logs</p>
          <p>• Look for URLs like: scontent.fbcdn.net, fbcdn.net, fbsbx.com</p>
          <p>• Copy any image_url, picture, or media.image_url values and paste above</p>
        </div>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="space-y-4">
          {/* Summary */}
          {testResult.summary && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Test Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium">URL Accessible</div>
                  <div className={`text-lg ${getStatusColor(testResult.summary.isAccessible)}`}>
                    {getStatusIcon(testResult.summary.isAccessible)} {testResult.summary.isAccessible ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium">Any Method Worked</div>
                  <div className={`text-lg ${getStatusColor(testResult.summary.anyMethodWorked)}`}>
                    {getStatusIcon(testResult.summary.anyMethodWorked)} {testResult.summary.anyMethodWorked ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium">Recommended Method</div>
                  <div className="text-sm">
                    {testResult.summary.recommendedMethod || 'None'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {testResult.testResults?.recommendations && testResult.testResults.recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔧 Recommendations</h3>
              <div className="space-y-3">
                {testResult.testResults.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-yellow-800">{rec.method}</div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="text-yellow-700 text-sm">{rec.description}</div>
                    <div className="text-yellow-600 text-sm mt-1 font-medium">
                      Action: {rec.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Test Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detailed Test Results</h3>
            
            {testResult.testResults?.tests && Object.entries(testResult.testResults.tests).map(([testName, result]: [string, any]) => (
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
                </div>
                
                <div className="p-4 space-y-2">
                  {result.status && (
                    <div className="text-sm">
                      <span className="font-medium">Status:</span> {result.status} {result.statusText}
                    </div>
                  )}
                  
                  {result.redirected && (
                    <div className="text-sm">
                      <span className="font-medium">Redirected:</span> Yes
                      {result.finalUrl && result.finalUrl !== testUrl && (
                        <div className="ml-2 text-xs text-gray-600 break-all">
                          Final URL: {result.finalUrl}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {result.contentType && (
                    <div className="text-sm">
                      <span className="font-medium">Content Type:</span> {result.contentType}
                      {result.contentLength && (
                        <span className="ml-2">({(result.contentLength / 1024).toFixed(1)} KB)</span>
                      )}
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-red-600 text-sm">
                      <span className="font-medium">Error:</span> {result.error}
                    </div>
                  )}
                  
                  {result.url && result.url !== testUrl && (
                    <div className="text-xs text-gray-600 break-all">
                      <span className="font-medium">Test URL:</span> {result.url}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* URL Analysis */}
          {testResult.testResults?.urlAnalysis && (
            <div className="border rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h4 className="font-medium">URL Analysis</h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div><span className="font-medium">Domain:</span> {testResult.testResults.urlAnalysis.domain}</div>
                <div><span className="font-medium">Facebook CDN:</span> {testResult.testResults.urlAnalysis.isFacebookCDN ? 'Yes' : 'No'}</div>
                <div><span className="font-medium">HTTPS:</span> {testResult.testResults.urlAnalysis.isHTTPS ? 'Yes' : 'No'}</div>
                <div><span className="font-medium">Has Parameters:</span> {testResult.testResults.urlAnalysis.hasParameters ? 'Yes' : 'No'}</div>
                {Object.keys(testResult.testResults.urlAnalysis.parameters || {}).length > 0 && (
                  <div>
                    <span className="font-medium">Parameters:</span>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded">
                      {JSON.stringify(testResult.testResults.urlAnalysis.parameters, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {testResult.error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <div className="text-red-700">{testResult.error}</div>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How to Use This Tool</h4>
        <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
          <li>Open your browser console and load the creatives page</li>
          <li>Look for image URLs in the API response logs</li>
          <li>Copy any image URL (from image_url, picture, media.image_url fields)</li>
          <li>Paste it above and run the test</li>
          <li>The test will try multiple access methods and tell you which works</li>
          <li>Use the "Open in New Tab" buttons to manually verify the results</li>
        </ol>
      </div>
    </div>
  );
};

export default ImageURLTest;