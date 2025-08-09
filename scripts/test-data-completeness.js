const fs = require('fs');
const path = require('path');

console.log('🔍 Meta SDK Data Completeness Test\n');

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

// Test data completeness with different scenarios
async function testDataCompleteness() {
  console.log('\n🧪 Testing Data Completeness...');
  
  const testScenarios = [
    { name: 'Last 7 Days', dateRange: 'last_7d', expectedDays: 7 },
    { name: 'Last 30 Days', dateRange: 'last_30d', expectedDays: 30 },
    { name: 'Last 90 Days', dateRange: 'last_90d', expectedDays: 90 }
  ];

  for (const scenario of testScenarios) {
    console.log(`\n📊 Testing: ${scenario.name}`);
    console.log(`   Expected days: ${scenario.expectedDays}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/facebook/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: 'test_token',
          adAccountId: 'test_account',
          dateRange: scenario.dateRange
        })
      });
      
      if (response.ok) {
        console.log(`   ✅ API endpoint accessible`);
      } else {
        console.log(`   ⚠️ API responded with status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ API error: ${error.message}`);
    }
  }
}

// Test timezone handling
function testTimezoneHandling() {
  console.log('\n🌍 Testing Timezone Handling...');
  
  const { DateTime } = require('luxon');
  
  const timezones = [
    'America/New_York',
    'UTC',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];
  
  timezones.forEach(timezone => {
    console.log(`\n📅 Timezone: ${timezone}`);
    
    const today = DateTime.now().setZone(timezone).startOf('day');
    const last7Days = today.minus({ days: 6 });
    const last30Days = today.minus({ days: 29 });
    
    console.log(`   Today: ${today.toISODate()}`);
    console.log(`   Last 7 days: ${last7Days.toISODate()} to ${today.toISODate()}`);
    console.log(`   Last 30 days: ${last30Days.toISODate()} to ${today.toISODate()}`);
    
    const days7 = today.diff(last7Days, 'days').days + 1;
    const days30 = today.diff(last30Days, 'days').days + 1;
    
    console.log(`   Days in 7d range: ${days7}`);
    console.log(`   Days in 30d range: ${days30}`);
  });
}

// Test date range calculations
function testDateRangeCalculations() {
  console.log('\n📅 Testing Date Range Calculations...');
  
  const { DateTime } = require('luxon');
  
  // Test current date calculations
  const now = DateTime.now();
  const today = now.startOf('day');
  
  console.log(`\n📊 Current Date Analysis:`);
  console.log(`   Now: ${now.toISO()}`);
  console.log(`   Today start: ${today.toISO()}`);
  console.log(`   Today end: ${today.endOf('day').toISO()}`);
  
  // Test different date ranges
  const ranges = [
    { name: 'Last 7 Days', days: 6 },
    { name: 'Last 30 Days', days: 29 },
    { name: 'Last 90 Days', days: 89 }
  ];
  
  ranges.forEach(range => {
    const sinceDate = today.minus({ days: range.days });
    const untilDate = today.endOf('day');
    const expectedDays = untilDate.diff(sinceDate, 'days').days + 1;
    
    console.log(`\n📊 ${range.name}:`);
    console.log(`   Since: ${sinceDate.toISODate()} (${sinceDate.toISO()})`);
    console.log(`   Until: ${untilDate.toISODate()} (${untilDate.toISO()})`);
    console.log(`   Expected days: ${expectedDays}`);
    console.log(`   Includes today: ${expectedDays === range.days + 1 ? '✅' : '❌'}`);
  });
}

// Check for common data missing issues
function checkCommonDataIssues() {
  console.log('\n🔍 Common Data Missing Issues:');
  
  const issues = [
    {
      name: 'Facebook API Delay',
      description: 'Data can take 24-48 hours to appear in Facebook API',
      impact: 'Recent days (last 1-2 days) may show $0 or missing data',
      solution: 'Wait 24-48 hours for data to populate, or check Facebook Ads Manager'
    },
    {
      name: 'Timezone Mismatch',
      description: 'Server timezone vs account timezone differences',
      impact: 'Date boundaries may be calculated incorrectly',
      solution: 'Ensure timezone is properly set in Facebook Ad Account settings'
    },
    {
      name: 'Account Status',
      description: 'Ad account may be paused, disabled, or restricted',
      impact: 'No data returned for recent periods',
      solution: 'Check Facebook Ads Manager for account status'
    },
    {
      name: 'Campaign Status',
      description: 'All campaigns may be paused or inactive',
      impact: 'No spend data for recent periods',
      solution: 'Check if campaigns are active in Facebook Ads Manager'
    },
    {
      name: 'API Permissions',
      description: 'Insufficient permissions for recent data',
      impact: 'Limited or no data returned',
      solution: 'Ensure ads_read, ads_management, read_insights permissions'
    },
    {
      name: 'Rate Limiting',
      description: 'Facebook API rate limits exceeded',
      impact: 'Incomplete data or API errors',
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

// Browser debugging steps
function browserDebuggingSteps() {
  console.log('\n🔧 Browser Debugging Steps:');
  
  console.log('\n1. Open http://localhost:3001 in your browser');
  console.log('2. Press F12 to open Developer Tools');
  console.log('3. Go to Console tab');
  console.log('4. Look for these specific log messages:');
  console.log('   - 🔍 [DEBUG] Starting API call for adAccountId=...');
  console.log('   - 📊 [DEBUG] Expected days: X, Actual days: Y');
  console.log('   - ⚠️ [DEBUG] Data completeness issue: Missing Z days');
  console.log('   - 🔧 [DEBUG] Filling missing day: YYYY-MM-DD');
  console.log('   - ✅ [DEBUG] Data filled: X days total');
  
  console.log('\n5. Check Network tab for:');
  console.log('   - Failed API calls to Facebook');
  console.log('   - Response status codes (200, 400, 403, etc.)');
  console.log('   - CORS errors');
  
  console.log('\n6. Test Facebook SDK manually:');
  console.log('   - In console, type: window.FB');
  console.log('   - Should return Facebook SDK object');
  console.log('   - If undefined, SDK not loaded properly');
}

// Quick fixes for data completeness
function quickFixesForDataCompleteness() {
  console.log('\n🚀 Quick Fixes for Data Completeness:');
  
  console.log('\n1. Check Facebook Ads Manager:');
  console.log('   - Go to https://business.facebook.com/adsmanager');
  console.log('   - Check if campaigns are active');
  console.log('   - Verify spend data for recent days');
  console.log('   - Check account status');
  
  console.log('\n2. Verify Timezone Settings:');
  console.log('   - Check Facebook Ad Account timezone');
  console.log('   - Ensure it matches your local timezone');
  console.log('   - Update if necessary');
  
  console.log('\n3. Check API Permissions:');
  console.log('   - Go to https://developers.facebook.com/');
  console.log('   - Select your app');
  console.log('   - Verify ads_read, ads_management permissions');
  
  console.log('\n4. Test with Different Date Ranges:');
  console.log('   - Try "Last 30 Days" instead of "Last 7 Days"');
  console.log('   - Check if data appears for older periods');
  console.log('   - This helps identify if it\'s a recent data issue');
  
  console.log('\n5. Clear Browser Cache:');
  console.log('   - Hard refresh (Ctrl+Shift+R)');
  console.log('   - Clear cache and cookies');
  console.log('   - Try incognito/private mode');
  
  console.log('\n6. Restart Development Server:');
  console.log('   - Stop server (Ctrl+C)');
  console.log('   - Run: npm run dev');
  console.log('   - Check if port changed (3000 vs 3001)');
}

// Run all tests
async function runTests() {
  console.log('🧪 Running Data Completeness Tests...\n');
  
  testTimezoneHandling();
  testDateRangeCalculations();
  await testDataCompleteness();
  checkCommonDataIssues();
  browserDebuggingSteps();
  quickFixesForDataCompleteness();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Open http://localhost:3001 in browser');
  console.log('2. Check browser console for detailed logs');
  console.log('3. Look for data completeness messages');
  console.log('4. Verify Facebook Ads Manager has recent data');
  console.log('5. Test with different date ranges');
  
  console.log('\n📚 Helpful Resources:');
  console.log('- META_SDK_TROUBLESHOOTING.md: Comprehensive troubleshooting');
  console.log('- FACEBOOK_QUICK_FIX.md: Quick fixes');
  console.log('- scripts/test-date-fix-verification.js: Data completeness verification');
  
  console.log('\n✅ Data completeness test completed');
  console.log('The enhanced logging will show exactly which days are missing and how they\'re being filled');
}

runTests().catch(console.error); 