#!/usr/bin/env node

/**
 * AI Analysis Debugging Script
 * 
 * This script tests all components of the AI analysis system:
 * - Environment variables
 * - API endpoints
 * - n8n webhook connectivity
 * - Database connectivity
 * - Creative data validation
 * 
 * Usage: node scripts/debug-ai-analysis.js
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bright}${colors.cyan} ${title}${colors.reset}`);
  log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 10000
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test environment variables
async function testEnvironment() {
  logHeader('ENVIRONMENT VARIABLES CHECK');
  
  const requiredVars = [
    'NEXT_PUBLIC_N8N_WEBHOOK_URL',
    'DATABASE_URL',
    'NEXT_PUBLIC_FACEBOOK_APP_ID'
  ];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName}: ${process.env[varName]}`);
    } else {
      logError(`${varName}: Not set`);
    }
  }

  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    logInfo('Running in development mode');
  } else {
    logWarning(`Running in ${process.env.NODE_ENV || 'unknown'} mode`);
  }
}

// Test Next.js API endpoints
async function testAPIEndpoints() {
  logHeader('NEXT.JS API ENDPOINTS TEST');
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    // Test AI analyze creative endpoint
    logInfo('Testing AI analyze creative endpoint...');
    const analyzeResponse = await makeRequest(`${baseUrl}/api/ai/analyze-creative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creativeId: 'test_123',
        adAccountId: 'act_test',
        imageUrl: 'https://example.com/test.jpg',
        creativeName: 'Test Creative',
        creativeType: 'image'
      })
    });
    
    if (analyzeResponse.status === 500 && analyzeResponse.data.includes('n8n webhook URL not configured')) {
      logWarning('AI analyze endpoint: n8n webhook not configured (expected in dev)');
    } else if (analyzeResponse.status === 200) {
      logSuccess('AI analyze endpoint: Working correctly');
    } else {
      logError(`AI analyze endpoint: Unexpected status ${analyzeResponse.status}`);
    }

    // Test AI creative score endpoint
    logInfo('Testing AI creative score endpoint...');
    const scoreResponse = await makeRequest(`${baseUrl}/api/ai/creative-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creativeId: 'test_123',
        adAccountId: 'act_test',
        score: 8.5,
        analysisData: { test: 'data' }
      })
    });
    
    if (scoreResponse.status === 200) {
      logSuccess('AI creative score endpoint: Working correctly');
    } else {
      logError(`AI creative score endpoint: Status ${scoreResponse.status}`);
    }

    // Test database initialization
    logInfo('Testing database connection...');
    const dbResponse = await makeRequest(`${baseUrl}/api/init-db`);
    
    if (dbResponse.status === 200) {
      logSuccess('Database connection: Working correctly');
    } else {
      logError(`Database connection: Status ${dbResponse.status}`);
    }

  } catch (error) {
    logError(`API testing failed: ${error.message}`);
  }
}

// Test n8n connectivity
async function testN8nConnectivity() {
  logHeader('N8N CONNECTIVITY TEST');
  
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    logError('No n8n webhook URL configured');
    return;
  }

  try {
    const urlObj = new URL(webhookUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port || 5678}`;
    
    // Test n8n health endpoint
    logInfo('Testing n8n health endpoint...');
    try {
      const healthResponse = await makeRequest(`${baseUrl}/healthz`);
      if (healthResponse.status === 200) {
        logSuccess('n8n health endpoint: Responding');
      } else {
        logWarning(`n8n health endpoint: Status ${healthResponse.status}`);
      }
    } catch (error) {
      logWarning(`n8n health endpoint: ${error.message}`);
    }

    // Test webhook endpoint
    logInfo('Testing n8n webhook endpoint...');
    const webhookResponse = await makeRequest(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test: 'debug_ai_analysis',
        timestamp: new Date().toISOString()
      })
    });
    
    if (webhookResponse.status === 200) {
      logSuccess('n8n webhook endpoint: Working correctly');
      logInfo(`Response: ${webhookResponse.data.substring(0, 200)}...`);
    } else {
      logError(`n8n webhook endpoint: Status ${webhookResponse.status}`);
      logInfo(`Response: ${webhookResponse.data}`);
    }

  } catch (error) {
    logError(`n8n connectivity test failed: ${error.message}`);
  }
}

// Test creative data validation
async function testCreativeDataValidation() {
  logHeader('CREATIVE DATA VALIDATION TEST');
  
  const testCreatives = [
    {
      id: 'valid_image',
      creativeType: 'image',
      imageUrl: 'https://example.com/valid.jpg',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      adAccountId: 'act_123'
    },
    {
      id: 'no_image',
      creativeType: 'image',
      imageUrl: null,
      thumbnailUrl: null,
      adAccountId: 'act_123'
    },
    {
      id: 'video_creative',
      creativeType: 'video',
      imageUrl: 'https://example.com/video.jpg',
      thumbnailUrl: 'https://example.com/video_thumb.jpg',
      adAccountId: 'act_123'
    },
    {
      id: 'missing_ad_account',
      creativeType: 'image',
      imageUrl: 'https://example.com/valid.jpg',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      adAccountId: null
    }
  ];

  for (const creative of testCreatives) {
    logInfo(`Testing creative: ${creative.id}`);
    
    // Check if creative is valid for AI analysis
    const isValid = creative.creativeType === 'image' && 
                   (creative.imageUrl || creative.thumbnailUrl) && 
                   creative.adAccountId;
    
    if (isValid) {
      logSuccess(`${creative.id}: Valid for AI analysis`);
    } else {
      logWarning(`${creative.id}: Not valid for AI analysis`);
      
      if (creative.creativeType !== 'image') {
        logInfo(`  - Creative type '${creative.creativeType}' not supported`);
      }
      if (!creative.imageUrl && !creative.thumbnailUrl) {
        logInfo(`  - No image URLs available`);
      }
      if (!creative.adAccountId) {
        logInfo(`  - Missing ad account ID`);
      }
    }
  }
}

// Test image URL accessibility
async function testImageUrls() {
  logHeader('IMAGE URL ACCESSIBILITY TEST');
  
  const testUrls = [
    'https://example.com/test.jpg',
    'https://httpbin.org/image/jpeg',
    'https://picsum.photos/200/300'
  ];

  for (const url of testUrls) {
    logInfo(`Testing image URL: ${url}`);
    
    try {
      const response = await makeRequest(url, { method: 'HEAD' });
      
      if (response.status === 200) {
        const contentType = response.headers['content-type'] || '';
        if (contentType.startsWith('image/')) {
          logSuccess(`${url}: Accessible and is an image`);
        } else {
          logWarning(`${url}: Accessible but content-type is ${contentType}`);
        }
      } else {
        logWarning(`${url}: Status ${response.status}`);
      }
    } catch (error) {
      logError(`${url}: ${error.message}`);
    }
  }
}

// Generate test data for AI analysis
function generateTestPayload() {
  return {
    creativeId: `test_${Date.now()}`,
    adAccountId: 'act_test_debug',
    imageUrl: 'https://picsum.photos/400/300',
    creativeName: 'Debug Test Creative',
    creativeType: 'image',
    timestamp: new Date().toISOString(),
    debug: true
  };
}

// Test full AI analysis flow
async function testFullAIAnalysisFlow() {
  logHeader('FULL AI ANALYSIS FLOW TEST');
  
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    logError('Cannot test full flow without n8n webhook URL');
    return;
  }

  try {
    const testPayload = generateTestPayload();
    logInfo('Generated test payload:', JSON.stringify(testPayload, null, 2));
    
    logInfo('Sending test payload to n8n webhook...');
    const response = await makeRequest(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    if (response.status === 200) {
      logSuccess('Full AI analysis flow: Webhook call successful');
      logInfo(`Response: ${response.data.substring(0, 300)}...`);
      
      // Try to parse response as JSON
      try {
        const parsedResponse = JSON.parse(response.data);
        logInfo('Response parsed successfully as JSON');
        
        if (parsedResponse.success) {
          logSuccess('n8n workflow executed successfully');
        } else {
          logWarning('n8n workflow completed but with warnings');
        }
      } catch (parseError) {
        logWarning('Response is not valid JSON (this might be expected)');
      }
    } else {
      logError(`Full AI analysis flow: Webhook call failed with status ${response.status}`);
      logInfo(`Response: ${response.data}`);
    }
    
  } catch (error) {
    logError(`Full AI analysis flow test failed: ${error.message}`);
  }
}

// Generate debugging report
function generateReport() {
  logHeader('DEBUGGING REPORT SUMMARY');
  
  logInfo('To troubleshoot AI analysis issues:');
  logInfo('1. Check environment variables are set correctly');
  logInfo('2. Ensure n8n is running and workflow is active');
  logInfo('3. Verify database connectivity');
  logInfo('4. Check browser console for frontend errors');
  logInfo('5. Review n8n execution logs');
  
  logInfo('\nUseful debugging commands:');
  logInfo('• Check n8n status: curl http://localhost:5678/healthz');
  logInfo('• Test webhook: curl -X POST "your_webhook_url" -H "Content-Type: application/json" -d \'{"test": "data"}\'');
  logInfo('• Check Next.js API: curl http://localhost:3000/api/ai/analyze-creative');
  
  logInfo('\nFor more detailed troubleshooting, see: AI_ANALYSIS_TROUBLESHOOTING.md');
}

// Main execution
async function main() {
  logHeader('AI ANALYSIS SYSTEM DEBUGGING SCRIPT');
  logInfo('Starting comprehensive AI analysis system test...\n');
  
  try {
    await testEnvironment();
    await testAPIEndpoints();
    await testN8nConnectivity();
    await testCreativeDataValidation();
    await testImageUrls();
    await testFullAIAnalysisFlow();
    
    generateReport();
    
  } catch (error) {
    logError(`Script execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    logError(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testEnvironment,
  testAPIEndpoints,
  testN8nConnectivity,
  testCreativeDataValidation,
  testImageUrls,
  testFullAIAnalysisFlow
};
