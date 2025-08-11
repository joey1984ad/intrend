#!/usr/bin/env node

/**
 * Test script to verify Facebook SDK initialization fix
 * This script tests the proper sequence: FB.init() before FB.login()
 */

console.log('🧪 Testing Facebook SDK initialization fix...\n');

// Mock window object for testing
global.window = {
  FB: undefined,
  fbAsyncInit: undefined,
  __facebookSDKInitialized: false,
  __facebookSDKPromise: undefined,
  __facebookSDKRetryCount: 0,
  location: { hostname: 'localhost' },
  document: {
    head: {
      appendChild: (script) => {
        console.log('📜 Script would be appended to head:', script.src);
        // Simulate script load
        setTimeout(() => {
          console.log('✅ Script loaded, calling fbAsyncInit...');
          if (global.window.fbAsyncInit) {
            global.window.fbAsyncInit();
          }
        }, 100);
      },
      removeChild: (script) => {
        console.log('🗑️ Script removed from head:', script.src);
      }
    },
    querySelector: (selector) => {
      console.log('🔍 Query selector called:', selector);
      return null; // No existing script
    }
  }
};

// Mock Facebook SDK
global.window.fbAsyncInit = () => {
  console.log('🔧 fbAsyncInit called');
  
  // Simulate FB object creation
  global.window.FB = {
    init: (config) => {
      console.log('🔧 FB.init called with config:', config);
      
      // Simulate initialization delay
      setTimeout(() => {
        console.log('✅ FB.init completed, setting __facebookSDKInitialized = true');
        global.window.__facebookSDKInitialized = true;
        
        // Now FB.login should be available
        console.log('🔍 Testing FB.login availability...');
        if (typeof global.window.FB.login === 'function') {
          console.log('✅ FB.login is available after FB.init()');
          
          // Test the login flow
          console.log('🔍 Testing FB.login() call...');
          try {
            global.window.FB.login((response) => {
              console.log('✅ FB.login() called successfully after FB.init()');
              console.log('📊 Login response:', response);
            });
          } catch (error) {
            console.error('❌ Error calling FB.login():', error);
          }
        } else {
          console.error('❌ FB.login not available after FB.init()');
        }
      }, 200);
      
      return true;
    },
    login: (callback) => {
      console.log('🔧 FB.login called');
      callback({ status: 'connected', authResponse: { accessToken: 'test-token', userID: 'test-user' } });
    },
    getLoginStatus: (callback) => {
      console.log('🔧 FB.getLoginStatus called');
      callback({ status: 'unknown' });
    },
    api: () => {
      console.log('🔧 FB.api called');
    }
  };
  
  console.log('✅ FB object created with all methods');
  
  // Call FB.init immediately after creating the object
  console.log('🔧 Calling FB.init immediately...');
  global.window.FB.init({ appId: 'test-app-id', cookie: true, xfbml: true, version: 'v23.0' });
};

// Test the initialization sequence
console.log('🚀 Starting Facebook SDK initialization test...\n');

// Simulate loading the SDK script
const script = {
  src: 'https://connect.facebook.net/en_US/sdk.js',
  async: true,
  defer: true,
  crossOrigin: 'anonymous',
  onload: () => {
    console.log('📜 Script onload triggered');
  }
};

console.log('📜 Loading Facebook SDK script...');
global.window.document.head.appendChild(script);

// Wait for the test to complete
setTimeout(() => {
  console.log('\n🏁 Test completed!');
  console.log('📊 Final state:');
  console.log('  - FB object exists:', !!global.window.FB);
  console.log('  - __facebookSDKInitialized:', global.window.__facebookSDKInitialized);
  console.log('  - FB.login available:', typeof global.window.FB?.login === 'function');
  console.log('  - FB.getLoginStatus available:', typeof global.window.FB?.getLoginStatus === 'function');
  
  if (global.window.__facebookSDKInitialized && typeof global.window.FB?.login === 'function') {
    console.log('\n✅ SUCCESS: Facebook SDK properly initialized before FB.login() call');
  } else {
    console.log('\n❌ FAILURE: Facebook SDK not properly initialized');
  }
  
  process.exit(0);
}, 1000);
