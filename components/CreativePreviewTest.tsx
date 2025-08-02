'use client'

import React, { useState } from 'react';
import { useCreativePreview } from './hooks/useCreativePreview';

interface CreativePreviewTestProps {
  accessToken: string;
  adAccountId: string;
}

const CreativePreviewTest: React.FC<CreativePreviewTestProps> = ({
  accessToken,
  adAccountId
}) => {
  const [testAdId, setTestAdId] = useState('');
  const [testCreativeId, setTestCreativeId] = useState('');
  const [healthCheckResult, setHealthCheckResult] = useState<any>(null);
  const [isTestingHealth, setIsTestingHealth] = useState(false);

  const { preview, isLoading, error, retry } = useCreativePreview({
    accessToken,
    adId: testAdId,
    creativeId: testCreativeId,
    enabled: !!(testAdId || testCreativeId)
  });

  const runHealthCheck = async () => {
    setIsTestingHealth(true);
    try {
      const response = await fetch('/api/facebook/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, adAccountId })
      });
      const result = await response.json();
      setHealthCheckResult(result);
    } catch (error) {
      setHealthCheckResult({ error: error instanceof Error ? error.message : 'Health check failed' });
    } finally {
      setIsTestingHealth(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Facebook Creative Preview Test</h2>
        <p className="text-gray-600 mt-2">Test the new Facebook preview system with diagnostic tools</p>
      </div>

      {/* Health Check Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">API Health Check</h3>
          <button
            onClick={runHealthCheck}
            disabled={isTestingHealth}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isTestingHealth ? 'Testing...' : 'Run Health Check'}
          </button>
        </div>
        
        {healthCheckResult && (
          <div className="bg-white p-3 rounded border">
            <div className={`font-medium ${
              healthCheckResult.overallStatus === 'HEALTHY' ? 'text-green-600' :
              healthCheckResult.overallStatus === 'DEGRADED' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              Status: {healthCheckResult.overallStatus || 'ERROR'}
            </div>
            
            {healthCheckResult.healthChecks && (
              <div className="mt-2 space-y-1">
                {healthCheckResult.healthChecks.map((check: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <span className={`font-medium ${
                      check.status === 'PASSED' ? 'text-green-600' :
                      check.status === 'WARNING' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {check.test}: {check.status}
                    </span>
                    <span className="text-gray-600 ml-2">{check.result}</span>
                  </div>
                ))}
              </div>
            )}
            
            {healthCheckResult.error && (
              <div className="text-red-600 text-sm mt-2">Error: {healthCheckResult.error}</div>
            )}
          </div>
        )}
      </div>

      {/* Preview Test Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preview Test</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Ad ID
            </label>
            <input
              type="text"
              value={testAdId}
              onChange={(e) => setTestAdId(e.target.value)}
              placeholder="Enter Facebook Ad ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Creative ID (alternative)
            </label>
            <input
              type="text"
              value={testCreativeId}
              onChange={(e) => setTestCreativeId(e.target.value)}
              placeholder="Enter Facebook Creative ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {(testAdId || testCreativeId) && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Preview Result</h4>
              <button
                onClick={retry}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Retry
              </button>
            </div>

            {isLoading && (
              <div className="text-center py-8 text-gray-500">
                Generating preview...
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">
                Error: {error}
              </div>
            )}

            {preview && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="text-green-800 font-medium">Preview Generated Successfully</div>
                  <div className="text-green-700 text-sm mt-1">
                    Method: {preview.method} | Success: {preview.success ? 'Yes' : 'No'}
                    {preview.format && ` | Format: ${preview.format}`}
                    {preview.fallback && ' | Used Fallback'}
                  </div>
                </div>

                {preview.previewHtml && (
                  <div className="border rounded">
                    <div className="bg-gray-50 px-3 py-2 text-sm font-medium border-b">
                      Facebook Ad Preview (HTML)
                    </div>
                    <div 
                      className="p-3"
                      dangerouslySetInnerHTML={{ __html: preview.previewHtml }}
                    />
                  </div>
                )}

                {preview.iframeHtml && (
                  <div className="border rounded">
                    <div className="bg-gray-50 px-3 py-2 text-sm font-medium border-b">
                      Facebook Ads Library Embed
                    </div>
                    <div 
                      className="p-3"
                      dangerouslySetInnerHTML={{ __html: preview.iframeHtml }}
                    />
                  </div>
                )}

                {preview.embedUrl && (
                  <div className="border rounded">
                    <div className="bg-gray-50 px-3 py-2 text-sm font-medium border-b">
                      Embed URL
                    </div>
                    <div className="p-3">
                      <a 
                        href={preview.embedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {preview.embedUrl}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How to Use This Test Tool</h4>
        <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
          <li>First, run the Health Check to verify your Facebook API connectivity</li>
          <li>Find a Facebook Ad ID from your creatives page (check browser console logs)</li>
          <li>Enter the Ad ID or Creative ID in the fields above</li>
          <li>The system will automatically try multiple preview methods:
            <ul className="ml-4 mt-1 list-disc list-inside">
              <li>Facebook Ad Preview API (best quality)</li>
              <li>Facebook Ads Library embed (fallback)</li>
              <li>Manual asset display (final fallback)</li>
            </ul>
          </li>
          <li>Check browser console for detailed diagnostic logs</li>
        </ol>
      </div>
    </div>
  );
};

export default CreativePreviewTest;