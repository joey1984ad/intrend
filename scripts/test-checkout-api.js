#!/usr/bin/env node

/**
 * Test Checkout API Script
 * 
 * This script tests the checkout API endpoint directly to identify issues.
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const API_BASE_URL = 'https://localhost:3000';

async function testCheckoutAPI() {
  console.log('🧪 Testing Checkout API\n');
  
  const testCases = [
    {
      name: 'Startup Monthly',
      data: {
        planId: 'startup',
        billingCycle: 'monthly',
        customerEmail: 'test@example.com',
        successUrl: 'http://localhost:3000/dashboard?success=true',
        cancelUrl: 'http://localhost:3000?canceled=true'
      }
    },
    {
      name: 'Pro Annual',
      data: {
        planId: 'pro',
        billingCycle: 'annual',
        customerEmail: 'test@example.com',
        successUrl: 'http://localhost:3000/dashboard?success=true',
        cancelUrl: 'http://localhost:3000?canceled=true'
      }
    },
    {
      name: 'Free Plan',
      data: {
        planId: 'free',
        billingCycle: 'monthly',
        customerEmail: 'test@example.com',
        successUrl: 'http://localhost:3000/dashboard?success=true',
        cancelUrl: 'http://localhost:3000?canceled=true'
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log('Request data:', JSON.stringify(testCase.data, null, 2));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });
      
      const data = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log('Response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('✅ Success!');
        if (data.url) {
          console.log(`Checkout URL: ${data.url}`);
        } else if (data.redirectUrl) {
          console.log(`Redirect URL: ${data.redirectUrl}`);
        }
      } else {
        console.log('❌ Failed');
        console.log(`Error: ${data.error}`);
      }
      
    } catch (error) {
      console.log('❌ Request failed');
      console.log(`Error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

// Wait a bit for the server to start, then test
setTimeout(() => {
  testCheckoutAPI().catch(console.error);
}, 3000);
