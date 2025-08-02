const fs = require('fs');
const path = require('path');

console.log('🔍 Meta SDK Data Fetching Test\n');

// Read environment variables
const envPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const FB_APP_ID = envVars.NEXT_PUBLIC_FACEBOOK_APP_ID;

console.log('📋 Configuration Check:');
console.log(`✅ App ID: ${FB_APP_ID ? FB_APP_ID.substring(0, 8) + '...' : '❌ Not found'}`);

if (!FB_APP_ID || FB_APP_ID === 'your-facebook-app-id') {
  console.log('\n❌ ISSUE: Facebook App ID not configured');
  console.log('This is likely why Meta SDK data is not showing properly');
  process.exit(1);
}

console.log('\n✅ App ID is configured');

// Test the development server
async function testDevelopmentServer() {
  console.log('\n🔍 Testing Development Server...');
  
  try {
    // Try port 3001 first (current server), then fallback to 3000
    let response = await fetch('http://localhost:3001');
    if (response.ok) {
      console.log('✅ Development server is running on http://localhost:3001');
      return true;
    }
  } catch (error) {
    // Try port 3000 as fallback
    try {
      const response = await fetch('http://localhost:3000');
      if (response.ok) {
        console.log('✅ Development server is running on http://localhost:3000');
        return true;
      } else {
        console.log('⚠️ Development server responded with status:', response.status);
      }
    } catch (error2) {
      console.log('❌ Development server is not running or not accessible');
      console.log('Please start the development server with: npm run dev');
      return false;
    }
  }
  
  return true;
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🔍 Testing API Endpoints...');
  
  const endpoints = [
    {
      name: 'Facebook Auth',
      url: 'http://localhost:3001/api/facebook/auth',
      method: 'POST',
      body: { accessToken: 'test_token', adAccountId: 'test_account' }
    },
    {
      name: 'Facebook Ads',
      url: 'http://localhost:3001/api/facebook/ads',
      method: 'POST',
      body: { accessToken: 'test_token', adAccountId: 'test_account', dateRange: 'last_7d' }
    },
    {
      name: 'Facebook Insights',
      url: 'http://localhost:3001/api/facebook/insights',
      method: 'POST',
      body: { accessToken: 'test_token', adAccountId: 'test_account', dateRange: 'last_7d' }
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📡 Testing ${endpoint.name}:`);
    console.log(`   URL: ${endpoint.url}`);
    
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(endpoint.body)
      });
      
      if (response.ok) {
        console.log(`   Status: ✅ ${response.status} - Endpoint accessible`);
      } else {
        console.log(`   Status: ⚠️ ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   Status: ❌ Error - ${error.message}`);
    }
  }
}

// Check for common Meta SDK issues
function checkCommonIssues() {
  console.log('\n🔍 Common Meta SDK Issues:');
  
  const issues = [
    {
      name: 'App in Development Mode',
      description: 'Facebook apps start in development mode',
      impact: 'Only developers and test users can access the app',
      solution: 'Go to Facebook App Dashboard → App Review → Make app public'
    },
    {
      name: 'Missing Permissions',
      description: 'App needs specific permissions for ads data',
      impact: 'API calls will fail or return limited data',
      solution: 'Add permissions: ads_read, ads_management, read_insights'
    },
    {
      name: 'Domain Configuration',
      description: 'App domain not configured for current domain',
      impact: 'CORS errors and connection failures',
      solution: 'Add localhost:3000 to App Settings → Basic → App Domains'
    },
    {
      name: 'Access Token Issues',
      description: 'Access token expired or invalid',
      impact: 'Authentication failures',
      solution: 'Re-authenticate with Facebook to get fresh token'
    },
    {
      name: 'Rate Limiting',
      description: 'Facebook API rate limits exceeded',
      impact: 'API calls fail or return errors',
      solution: 'Check Facebook App Dashboard → Analytics → API Usage'
    }
  ];
  
  issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.name}:`);
    console.log(`   Issue: ${issue.description}`);
    console.log(`   Impact: ${issue.impact}`);
    console.log(`   Solution: ${issue.solution}`);
  });
}

// Browser debugging guide
function browserDebuggingGuide() {
  console.log('\n🔍 Browser Debugging Guide:');
  
  console.log('\n1. Open Browser Developer Tools:');
  console.log('   - Press F12 or right-click → Inspect');
  console.log('   - Go to Console tab');
  
  console.log('\n2. Look for these specific errors:');
  console.log('   - "FB is not defined" → Facebook SDK not loaded');
  console.log('   - "Invalid App ID" → App ID configuration issue');
  console.log('   - "CORS error" → Domain configuration issue');
  console.log('   - "Permission denied" → App permissions issue');
  console.log('   - "Access token expired" → Authentication issue');
  
  console.log('\n3. Check Network tab:');
  console.log('   - Look for failed API calls to Facebook');
  console.log('   - Check response status codes');
  console.log('   - Look for CORS errors');
  
  console.log('\n4. Test Facebook SDK manually:');
  console.log('   - In console, type: window.FB');
  console.log('   - Should return the Facebook SDK object');
  console.log('   - If undefined, SDK not loaded properly');
}

// Quick fixes
function quickFixes() {
  console.log('\n🔧 Quick Fixes to Try:');
  
  console.log('\n1. Restart Development Server:');
  console.log('   - Stop the server (Ctrl+C)');
  console.log('   - Run: npm run dev');
  
  console.log('\n2. Clear Browser Cache:');
  console.log('   - Hard refresh (Ctrl+Shift+R)');
  console.log('   - Clear browser cache and cookies');
  
  console.log('\n3. Check Facebook App Settings:');
  console.log('   - Go to https://developers.facebook.com/');
  console.log('   - Select your app');
  console.log('   - Check App Review status');
  console.log('   - Verify domain settings');
  
  console.log('\n4. Test with Different Browser:');
  console.log('   - Try Chrome, Firefox, or Edge');
  console.log('   - Check if issue is browser-specific');
  
  console.log('\n5. Check Environment Variables:');
  console.log('   - Verify .env.local file exists');
  console.log('   - Ensure NEXT_PUBLIC_FACEBOOK_APP_ID is set');
  console.log('   - Restart server after changing env vars');
}

// Run all tests
async function runTests() {
  console.log('🧪 Running Meta SDK Data Tests...\n');
  
  const serverRunning = await testDevelopmentServer();
  
  if (serverRunning) {
    await testAPIEndpoints();
  }
  
  checkCommonIssues();
  browserDebuggingGuide();
  quickFixes();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Start development server: npm run dev');
  console.log('2. Open http://localhost:3000 in browser');
  console.log('3. Open Developer Tools (F12)');
  console.log('4. Check Console for error messages');
  console.log('5. Try connecting with Facebook');
  console.log('6. Look for the detailed logs I added to the API routes');
  
  console.log('\n📚 Helpful Resources:');
  console.log('- FACEBOOK_QUICK_FIX.md: Quick troubleshooting');
  console.log('- FACEBOOK_APP_SETUP_QUICK.md: Setup guide');
  console.log('- FACEBOOK_PERMISSIONS_CHECKLIST.md: Required permissions');
  
  console.log('\n✅ Meta SDK test completed');
  console.log('Check the browser console for specific error messages to identify the exact issue');
}

runTests().catch(console.error); 