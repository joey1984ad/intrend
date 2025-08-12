console.log('🔍 AI Analysis Debug Script');
console.log('========================');

// Check environment variables
console.log('\n📋 Environment Check:');
console.log('NEXT_PUBLIC_N8N_WEBHOOK_URL:', process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'NOT SET');

// Test different webhook endpoints
const webhookEndpoints = [
  'https://n8n-meh7.onrender.com/webhook-test/analyze-creatives',
  'https://n8n-meh7.onrender.com/webhook/analyze-creatives',
  'https://n8n-meh7.onrender.com/webhook-test/creative-analysis',
  'https://n8n-meh7.onrender.com/webhook/creative-analysis'
];

console.log('\n🧪 Testing different webhook endpoints...');

async function testEndpoint(url) {
  try {
    console.log(`\n📡 Testing: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creativeId: 'test_123',
        adAccountId: 'test_account',
        imageUrl: 'https://example.com/test-image.jpg',
        creativeName: 'Test Creative',
        creativeType: 'image',
        timestamp: new Date().toISOString()
      })
    });
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log(`📄 Response: ${data}`);
    } else {
      const errorText = await response.text();
      console.log(`❌ Error Response: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`❌ Fetch Error: ${error.message}`);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('💡 This suggests a network connectivity issue or CORS problem');
    }
  }
}

// Test each endpoint
webhookEndpoints.forEach(testEndpoint);

console.log('\n🔧 Troubleshooting Steps:');
console.log('1. Check if n8n workflow is running and activated');
console.log('2. Verify webhook endpoint URL is correct');
console.log('3. Ensure workflow is in "Active" mode, not "Test" mode');
console.log('4. Check if webhook trigger node is properly configured');
console.log('5. Verify the webhook path matches exactly');

console.log('\n📱 To test in browser:');
console.log('1. Open browser console (F12)');
console.log('2. Click "AI Analysis" button');
console.log('3. Look for network errors in Console tab');
console.log('4. Check Network tab for failed requests');

