import React, { useState } from 'react';

interface WebhookTestResult {
  name: string;
  url: string;
  method: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  responseTime?: number;
  data?: string;
}

interface WebhookConnectionTesterProps {
  webhookUrl?: string;
  onTestComplete?: (results: WebhookTestResult[]) => void;
}

export const WebhookConnectionTester: React.FC<WebhookConnectionTesterProps> = ({
  webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
  onTestComplete
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<WebhookTestResult[]>([]);
  const [customUrl, setCustomUrl] = useState(webhookUrl || '');

  const testEndpoints = [
    {
      name: 'n8n Webhook',
      url: customUrl || 'http://localhost:5678/webhook-test/analyze-creatives',
      method: 'POST'
    },
    {
      name: 'n8n Health Check',
      url: 'http://localhost:5678/healthz',
      method: 'GET'
    },
    {
      name: 'Next.js App',
      url: window.location.origin,
      method: 'GET'
    }
  ];

  const testConnection = async (config: { name: string; url: string; method: string }): Promise<WebhookTestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: config.method === 'POST' ? JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: 'Webhook connection test'
        }) : undefined,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseTime = Date.now() - startTime;
      const data = await response.text();

      return {
        name: config.name,
        url: config.url,
        method: config.method,
        success: response.ok,
        statusCode: response.status,
        responseTime,
        data: data.length > 200 ? data.substring(0, 200) + '...' : data
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out (10s)';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error - service may not be running';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        name: config.name,
        url: config.url,
        method: config.method,
        success: false,
        error: errorMessage,
        responseTime
      };
    }
  };

  const runTests = async () => {
    setIsTesting(true);
    setResults([]);

    const testResults: WebhookTestResult[] = [];
    
    for (const config of testEndpoints) {
      const result = await testConnection(config);
      testResults.push(result);
      setResults([...testResults]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setResults(testResults);
    onTestComplete?.(testResults);
    setIsTesting(false);
  };

  const getStatusIcon = (success: boolean) => success ? '✅' : '❌';
  const getStatusColor = (success: boolean) => success ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">🔧 Webhook Connection Tester</h3>
        <button
          onClick={runTests}
          disabled={isTesting}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isTesting
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isTesting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Testing...</span>
            </div>
          ) : (
            '🧪 Run Tests'
          )}
        </button>
      </div>

      {/* Custom URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Custom Webhook URL (optional):
        </label>
        <input
          type="url"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          placeholder="http://localhost:5678/webhook-test/analyze-creatives"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500">
          Leave empty to use default from environment variables
        </p>
      </div>

      {/* Test Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Test Results:</h4>
          
          {results.map((result, index) => (
            <div key={index} className="p-3 bg-white rounded-md border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={getStatusColor(result.success)}>
                    {getStatusIcon(result.success)}
                  </span>
                  <span className="font-medium text-gray-900">{result.name}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {result.responseTime ? `${result.responseTime}ms` : ''}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">URL:</span> {result.url}
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Method:</span> {result.method}
              </div>
              
              {result.success ? (
                <div className="text-sm text-green-600">
                  <span className="font-medium">Status:</span> {result.statusCode} OK
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  <span className="font-medium">Error:</span> {result.error}
                </div>
              )}
              
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                    View Response Data
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {result.data}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {results.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Recommendations:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            {results.some(r => !r.success && r.name.includes('n8n')) && (
              <>
                <p><strong>For n8n issues:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Ensure n8n is running on port 5678</li>
                  <li>Check if workflow is activated in n8n UI</li>
                  <li>Verify webhook path: /webhook-test/analyze-creatives</li>
                  <li>Restart n8n service if needed</li>
                </ul>
              </>
            )}
            
            {results.some(r => !r.success && r.name.includes('Next.js')) && (
              <>
                <p><strong>For Next.js issues:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Ensure Next.js dev server is running</li>
                  <li>Check if port 3000 is available</li>
                  <li>Restart development server</li>
                </ul>
              </>
            )}
            
            {results.every(r => r.success) && (
              <p>🎉 All tests passed! Your webhook should work correctly.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookConnectionTester;
