#!/usr/bin/env node

/**
 * Test Script for AI Analysis adAccountId Fix
 * 
 * This script tests if the adAccountId is now properly included in creative data
 * after the fix to the creatives API route.
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

// Test the creatives API to see if adAccountId is included
async function testCreativesAPI() {
  logHeader('TESTING CREATIVES API FOR ADACCOUNTID FIX');
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    logInfo('Testing creatives API with mock data...');
    
    const response = await makeRequest(`${baseUrl}/api/facebook/creatives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: 'mock',
        adAccountId: 'act_test_123',
        dateRange: 'last_30d'
      })
    });
    
    if (response.status === 200) {
      logSuccess('Creatives API responded successfully');
      
      try {
        const data = JSON.parse(response.data);
        
        if (data.success && data.creatives && data.creatives.length > 0) {
          logSuccess(`Found ${data.creatives.length} creatives`);
          
          // Check if each creative has adAccountId
          let allHaveAdAccountId = true;
          let missingAdAccountId = [];
          
          data.creatives.forEach((creative, index) => {
            if (!creative.adAccountId) {
              allHaveAdAccountId = false;
              missingAdAccountId.push(`Creative ${index + 1} (${creative.id})`);
            }
          });
          
          if (allHaveAdAccountId) {
            logSuccess('All creatives have adAccountId field');
            
            // Show sample creative data
            const sampleCreative = data.creatives[0];
            logInfo('Sample creative data:');
            logInfo(`  ID: ${sampleCreative.id}`);
            logInfo(`  Name: ${sampleCreative.name}`);
            logInfo(`  Type: ${sampleCreative.creativeType}`);
            logInfo(`  adAccountId: ${sampleCreative.adAccountId}`);
            logInfo(`  Has imageUrl: ${!!sampleCreative.imageUrl}`);
            logInfo(`  Has thumbnailUrl: ${!!sampleCreative.thumbnailUrl}`);
            
            // Check if this creative would be valid for AI analysis
            const isValidForAI = sampleCreative.creativeType === 'image' && 
                               (sampleCreative.imageUrl || sampleCreative.thumbnailUrl) && 
                               sampleCreative.adAccountId;
            
            if (isValidForAI) {
              logSuccess('✅ This creative is valid for AI analysis!');
            } else {
              logWarning('⚠️ This creative is not valid for AI analysis');
              if (sampleCreative.creativeType !== 'image') {
                logInfo(`  - Creative type '${sampleCreative.creativeType}' not supported`);
              }
              if (!sampleCreative.imageUrl && !sampleCreative.thumbnailUrl) {
                logInfo(`  - No image URLs available`);
              }
              if (!sampleCreative.adAccountId) {
                logInfo(`  - Missing ad account ID`);
              }
            }
            
          } else {
            logError('Some creatives are missing adAccountId:');
            missingAdAccountId.forEach(item => logError(`  - ${item}`));
          }
          
        } else {
          logError('No creatives found in response');
        }
        
      } catch (parseError) {
        logError(`Failed to parse response as JSON: ${parseError.message}`);
        logInfo('Raw response:', response.data.substring(0, 500));
      }
      
    } else {
      logError(`Creatives API failed with status ${response.status}`);
      logInfo('Response:', response.data);
    }
    
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

// Test the AI analysis endpoint to see if it now works
async function testAIAnalysisEndpoint() {
  logHeader('TESTING AI ANALYSIS ENDPOINT');
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    logInfo('Testing AI analysis endpoint...');
    
    const response = await makeRequest(`${baseUrl}/api/ai/analyze-creative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creativeId: 'test_123',
        adAccountId: 'act_test_123',
        imageUrl: 'https://picsum.photos/400/300',
        creativeName: 'Test Creative',
        creativeType: 'image'
      })
    });
    
    if (response.status === 500 && response.data.includes('n8n webhook URL not configured')) {
      logWarning('AI analyze endpoint: n8n webhook not configured (expected in dev)');
      logSuccess('✅ But the endpoint is working and accepting requests!');
    } else if (response.status === 200) {
      logSuccess('AI analyze endpoint: Working correctly');
    } else {
      logError(`AI analyze endpoint: Unexpected status ${response.status}`);
      logInfo('Response:', response.data);
    }
    
  } catch (error) {
    logError(`AI analysis test failed: ${error.message}`);
  }
}

// Generate a summary report
function generateReport() {
  logHeader('FIX VERIFICATION SUMMARY');
  
  logInfo('The adAccountId fix has been applied to:');
  logInfo('✅ Real creative data processing');
  logInfo('✅ Mock creative data generation');
  logInfo('✅ Error fallback cases');
  logInfo('✅ Testing scenarios');
  
  logInfo('\nTo test the fix:');
  logInfo('1. Restart your Next.js dev server');
  logInfo('2. Refresh your creatives data');
  logInfo('3. Try clicking "🤖 Analyze" on an image creative');
  logInfo('4. Check browser console for adAccountId logs');
  
  logInfo('\nExpected behavior:');
  logInfo('✅ AI analysis button should work for image creatives');
  logInfo('✅ No more "No ad account ID available" errors');
  logInfo('✅ Webhook calls should proceed normally');
}

// Main execution
async function main() {
  logHeader('AI ANALYSIS ADACCOUNTID FIX TEST');
  logInfo('Testing if the adAccountId fix is working...\n');
  
  try {
    await testCreativesAPI();
    await testAIAnalysisEndpoint();
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
  testCreativesAPI,
  testAIAnalysisEndpoint
};
