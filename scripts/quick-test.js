#!/usr/bin/env node

/**
 * Quick Test - Check Current State
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Quick Test - Current State\n');

async function quickTest() {
  try {
    // Test 1: Check if server is responding
    console.log('1️⃣ Testing server response...');
    const response = await fetch('http://localhost:3000/api/auth/session');
    console.log('✅ Server is responding');
    
    const data = await response.json();
    console.log('Session data:', {
      isAuthenticated: data.isAuthenticated,
      email: data.user?.email,
      currentPlan: data.user?.currentPlanName,
      planId: data.user?.currentPlanId,
      status: data.user?.subscriptionStatus
    });
    
    // Test 2: Test verification endpoint with a mock session
    console.log('\n2️⃣ Testing verification endpoint...');
    const verifyResponse = await fetch('http://localhost:3000/api/subscription/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId: 'cs_test_mock_session_' + Date.now() 
      })
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Verification response:', verifyData);
    
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest();
