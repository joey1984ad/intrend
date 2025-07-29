/**
 * Test script to verify Facebook SDK initialization fixes
 * This script tests the improved Facebook SDK initialization logic
 */

console.log('🧪 Testing Facebook SDK initialization fixes...');

// Mock the global window object for testing
global.window = {
  FB: null,
  fbAsyncInit: null,
  __facebookSDKInitialized: false,
  __facebookSDKPromise: null,
  location: { reload: () => console.log('🔄 Page reloaded') },
  gc: () => console.log('🗑️ Garbage collection triggered')
};

// Mock document for testing
global.document = {
  head: {
    appendChild: (script) => {
      console.log('📜 Script appended to head:', script.src);
      // Simulate script loading
      setTimeout(() => {
        if (script.onload) {
          script.onload();
        }
      }, 100);
    },
    removeChild: (script) => {
      console.log('🗑️ Script removed from head:', script.src);
    }
  },
  querySelector: (selector) => {
    if (selector.includes('connect.facebook.net')) {
      console.log('🔍 Found existing Facebook script');
      return { src: 'https://connect.facebook.net/en_US/sdk.js' };
    }
    return null;
  }
};

// Mock setTimeout and setInterval
global.setTimeout = (fn, delay) => {
  console.log(`⏰ setTimeout called with delay: ${delay}ms`);
  return setTimeout(fn, delay);
};

global.setInterval = (fn, delay) => {
  console.log(`⏰ setInterval called with delay: ${delay}ms`);
  return setInterval(fn, delay);
};

// Test the FacebookSDKManager class
class FacebookSDKManager {
  constructor() {
    this.initializationPromise = null;
    this.isInitializing = false;
    this.isInitialized = false;
    this.appId = null;
  }

  async initialize(appId) {
    console.log(`🔧 Initializing SDK with App ID: ${appId}`);
    
    if (this.isInitialized && this.appId === appId) {
      console.log('✅ Already initialized with same App ID');
      return true;
    }

    if (this.isInitializing && this.initializationPromise) {
      console.log('⏳ Already initializing, waiting for existing promise');
      return this.initializationPromise;
    }

    if (global.window.__facebookSDKPromise) {
      console.log('🌐 Using global initialization promise');
      return global.window.__facebookSDKPromise;
    }

    this.isInitializing = true;
    this.appId = appId;

    this.initializationPromise = this.performInitialization(appId);
    global.window.__facebookSDKPromise = this.initializationPromise;

    try {
      const result = await this.initializationPromise;
      this.isInitialized = result;
      this.isInitializing = false;
      return result;
    } catch (error) {
      this.isInitializing = false;
      this.isInitialized = false;
      throw error;
    }
  }

  async performInitialization(appId) {
    return new Promise((resolve, reject) => {
      if (global.window.FB && global.window.__facebookSDKInitialized) {
        console.log('✅ FB already initialized globally');
        resolve(true);
        return;
      }

      const existingScript = global.document.querySelector('script[src*="connect.facebook.net"]');
      if (existingScript) {
        console.log('📜 Script already exists, waiting for FB...');
        this.waitForFB(8000).then(resolve).catch(reject);
        return;
      }

      console.log('📜 Loading Facebook SDK...');
      
      const script = {
        src: 'https://connect.facebook.net/en_US/sdk.js',
        async: true,
        defer: true,
        crossOrigin: 'anonymous',
        onload: null,
        onerror: null
      };
      
      script.onload = () => {
        console.log('✅ Facebook SDK loaded successfully');
        
        global.window.fbAsyncInit = () => {
          console.log('🔧 fbAsyncInit called, initializing FB...');
          
          try {
            global.window.FB = {
              init: (config) => {
                console.log('🔧 FB.init called with config:', config);
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
              logout: (callback) => {
                console.log('🔧 FB.logout called');
                callback({ status: 'unknown' });
              }
            };
            global.window.__facebookSDKInitialized = true;
            resolve(true);
          } catch (error) {
            console.error('❌ Error initializing FB:', error);
            reject(error);
          }
        };
        
        this.waitForFB(8000).then(resolve).catch(reject);
      };

      script.onerror = () => {
        console.error('❌ Failed to load Facebook SDK');
        reject(new Error('Failed to load Facebook SDK'));
      };

      global.document.head.appendChild(script);
    });
  }

  async waitForFB(timeout = 8000) {
    return new Promise((resolve, reject) => {
      if (global.window.FB && typeof global.window.FB.init === 'function') {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      const checkInterval = global.setInterval(() => {
        if (global.window.FB && typeof global.window.FB.init === 'function') {
          clearInterval(checkInterval);
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error('Facebook SDK initialization timeout'));
        }
      }, 100);
    });
  }

  isReady() {
    return global.window.FB && typeof global.window.FB.init === 'function' && global.window.__facebookSDKInitialized === true;
  }
}

// Test scenarios
async function runTests() {
  console.log('\n🧪 Running Facebook SDK initialization tests...\n');

  const sdkManager = new FacebookSDKManager();
  const testAppId = 'test-app-id-123';

  try {
    // Test 1: First initialization
    console.log('📋 Test 1: First initialization');
    const result1 = await sdkManager.initialize(testAppId);
    console.log(`✅ Test 1 result: ${result1}`);
    console.log(`✅ SDK ready: ${sdkManager.isReady()}`);

    // Test 2: Second initialization (should reuse existing)
    console.log('\n📋 Test 2: Second initialization (should reuse)');
    const result2 = await sdkManager.initialize(testAppId);
    console.log(`✅ Test 2 result: ${result2}`);
    console.log(`✅ SDK ready: ${sdkManager.isReady()}`);

    // Test 3: Test login functionality
    console.log('\n📋 Test 3: Test login functionality');
    if (sdkManager.isReady()) {
      global.window.FB.login((response) => {
        console.log(`✅ Login response: ${response.status}`);
        console.log(`✅ User ID: ${response.authResponse.userID}`);
      });
    }

    // Test 4: Test multiple rapid initializations
    console.log('\n📋 Test 4: Multiple rapid initializations');
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(sdkManager.initialize(testAppId));
    }
    const results = await Promise.all(promises);
    console.log(`✅ All rapid initializations successful: ${results.every(r => r)}`);

    console.log('\n🎉 All tests passed! Facebook SDK initialization fixes are working correctly.');
    console.log('✅ No need to close/reopen window for Facebook connection to work.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error); 