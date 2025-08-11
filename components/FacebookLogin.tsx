'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Enhanced Facebook Login Component with Multiple Initialization Solutions
 * 
 * This component implements three solutions to prevent "FB.login() called before FB.init()" errors:
 * 
 * Solution 1: Enhanced Initialization Validation
 * - Comprehensive checks before calling any FB methods
 * - Ensures all required methods are available
 * 
 * Solution 2: Promise-based Approach
 * - Uses global Promise-based initialization
 * - Prevents race conditions during SDK loading
 * 
 * Solution 3: Enhanced FB Status Checking
 * - ensureFBInit() function with retry logic
 * - ensureFacebookReady() comprehensive utility
 * 
 * Usage Examples:
 * 
 * // Simple usage with ensureFBInit
 * ensureFBInit(() => {
 *   FB.login(callback);
 * });
 * 
 * // Comprehensive usage with ensureFacebookReady
 * try {
 *   await ensureFacebookReady('your-app-id');
 *   FB.login(callback);
 * } catch (error) {
 *   console.error('Facebook not ready:', error);
 * }
 * 
 * // Global initialization promise
 * const initPromise = createGlobalFacebookInitPromise('your-app-id');
 * await initPromise;
 * FB.login(callback);
 */

interface FacebookLoginProps {
  onSuccess: (accessToken: string, userId: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
    __facebookSDKInitialized?: boolean;
    __facebookSDKPromise?: Promise<boolean>;
    __facebookSDKRetryCount?: number;
    fbInitialized?: boolean; // Added for compatibility
    // Solution 2: Global Promise-based initialization
    __facebookInitPromise?: Promise<void>;
    __facebookScriptLoaded?: boolean; // Global flag to prevent duplicate script loading
  }
}

/**
 * Centralized Facebook SDK script loader
 * Ensures the script is loaded only once across the entire application
 */
function loadFacebookScript(): void {
  if (window.__facebookScriptLoaded) {
    console.log('📜 Facebook script already loaded, skipping...');
    return;
  }

  if (document.querySelector('script[src*="connect.facebook.net"]')) {
    console.log('📜 Facebook script element already exists, marking as loaded...');
    window.__facebookScriptLoaded = true;
    return;
  }

  console.log('📜 Loading Facebook SDK script (first time)...');
  window.__facebookScriptLoaded = true;

  (function(d, s, id) {
    var js: HTMLScriptElement, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s) as HTMLScriptElement; js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    js.async = true;
    js.defer = true;
    js.crossOrigin = "anonymous";
    if (fjs && fjs.parentNode) {
      fjs.parentNode.insertBefore(js, fjs);
    } else {
      d.head.appendChild(js);
    }
  }(document, 'script', 'facebook-jssdk'));
}

// Global Facebook SDK state management with enhanced error handling
class FacebookSDKManager {
  private static instance: FacebookSDKManager;
  private initializationPromise: Promise<boolean> | null = null;
  private isInitializing = false;
  private isInitialized = false;
  private appId: string | null = null;
  private maxRetries = 5;
  private retryDelay = 1000;
  public static scriptLoaded = false; // Public static flag to prevent multiple script loads

  static getInstance(): FacebookSDKManager {
    if (!FacebookSDKManager.instance) {
      FacebookSDKManager.instance = new FacebookSDKManager();
    }
    return FacebookSDKManager.instance;
  }

  async initialize(appId: string): Promise<boolean> {
    console.log('🔧 FacebookSDKManager: Starting initialization with App ID:', appId);
    
    // If already initialized with the same app ID, return success
    if (this.isInitialized && this.appId === appId) {
      console.log('✅ FacebookSDKManager: Already initialized with same App ID');
      return true;
    }

    // If already initializing, wait for the existing promise
    if (this.isInitializing && this.initializationPromise) {
      console.log('⏳ FacebookSDKManager: Already initializing, waiting for existing promise');
      return this.initializationPromise;
    }

    // If we have a global promise from another instance, use it
    if (window.__facebookSDKPromise) {
      console.log('🌐 FacebookSDKManager: Using global initialization promise');
      return window.__facebookSDKPromise;
    }

    // Check if global Facebook init promise exists and use it
    if (window.__facebookInitPromise) {
      console.log('🌐 FacebookSDKManager: Using global Facebook init promise');
      try {
        await window.__facebookInitPromise;
        this.isInitialized = true;
        this.appId = appId;
        return true;
      } catch (error) {
        console.error('❌ FacebookSDKManager: Global init promise failed:', error);
        // Fall back to local initialization
      }
    }

    this.isInitializing = true;
    this.appId = appId;

    this.initializationPromise = this.performInitializationWithRetry(appId);
    window.__facebookSDKPromise = this.initializationPromise;

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

  private async performInitializationWithRetry(appId: string): Promise<boolean> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 FacebookSDKManager: Initialization attempt ${attempt}/${this.maxRetries}`);
        const result = await this.performInitialization(appId);
        if (result) {
          console.log(`✅ FacebookSDKManager: Initialization successful on attempt ${attempt}`);
          return true;
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ FacebookSDKManager: Attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          console.log(`⏳ FacebookSDKManager: Waiting ${this.retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          this.retryDelay *= 1.5; // Exponential backoff
        }
      }
    }
    
    throw lastError || new Error('Facebook SDK initialization failed after all retries');
  }

  private async performInitialization(appId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // If FB is present, attempt a direct init (idempotent)
      if (window.FB && typeof window.FB.init === 'function') {
        try {
          if (!window.__facebookSDKInitialized) {
            console.log('🔧 FacebookSDKManager: Directly initializing existing FB instance...');
            window.FB.init({ appId, cookie: true, xfbml: true, version: 'v23.0' });
            window.__facebookSDKInitialized = true;
            window.fbInitialized = true; // Additional flag for compatibility
          }
          console.log('✅ FacebookSDKManager: FB present; initialization state:', window.__facebookSDKInitialized);
          resolve(true);
          return;
        } catch (error) {
          console.warn('⚠️ FacebookSDKManager: Direct init failed, resetting state...', error);
          window.FB = undefined;
          window.__facebookSDKInitialized = false;
          window.fbInitialized = false;
        }
      }

      // Solution 2: Use a Promise-based Approach for more robust initialization
      let fbInitPromise = new Promise<void>((resolveInit) => {
        // Ensure fbAsyncInit is set BEFORE loading the script per FB docs
        // This follows the exact pattern from Facebook's official documentation
        window.fbAsyncInit = () => {
          try {
            console.log('🔧 FacebookSDKManager: fbAsyncInit fired, calling FB.init...');
            window.FB.init({ appId, cookie: true, xfbml: true, version: 'v23.0' });
            window.__facebookSDKInitialized = true;
            window.fbInitialized = true; // Additional flag for compatibility
            console.log('✅ FacebookSDKManager: FB initialized via fbAsyncInit');
            resolveInit();
          } catch (error) {
            console.error('❌ FacebookSDKManager: Error initializing FB in fbAsyncInit:', error);
            reject(error);
          }
        };
      });

      // If script already exists, wait for FB and attempt init again
      const existingScript = document.querySelector('script[src*="connect.facebook.net"]');
      if (existingScript) {
        console.log('📜 FacebookSDKManager: Script exists; waiting for FB then initializing...');
        this.waitForFB(10000)
          .then(() => {
            if (!window.__facebookSDKInitialized) {
              try {
                window.FB.init({ appId, cookie: true, xfbml: true, version: 'v23.0' });
                window.__facebookSDKInitialized = true;
                window.fbInitialized = true; // Additional flag for compatibility
              } catch (e) {
                reject(e);
                return;
              }
            }
            resolve(true);
          })
          .catch(reject);
        return;
      }

      // Only load the script if it hasn't been loaded by any other instance
      if (!FacebookSDKManager.scriptLoaded) {
        console.log('📜 FacebookSDKManager: Loading Facebook SDK (first time)...');
        FacebookSDKManager.scriptLoaded = true;
        
        // Use centralized script loader to prevent duplicates
        loadFacebookScript();
      } else {
        console.log('📜 FacebookSDKManager: Script already loaded by another instance, waiting...');
      }

      // Wait for the fbAsyncInit to complete, then resolve
      fbInitPromise.then(() => {
        resolve(true);
      }).catch(reject);

      // Fallback error handling
      setTimeout(() => {
        if (!window.FB || !window.__facebookSDKInitialized) {
          console.error('❌ FacebookSDKManager: SDK load timeout');
          reject(new Error('Facebook SDK load timeout'));
        }
      }, 15000); // 15 second timeout
    });
  }

  private async waitForFB(timeout = 10000): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Check if all required methods are available
      // Check both custom flag and standard fbInitialized flag for maximum compatibility
      const isFullyReady = () => {
        return window.FB && 
               (window.__facebookSDKInitialized || window.fbInitialized) &&
               typeof window.FB.init === 'function' &&
               typeof window.FB.login === 'function' &&
               typeof window.FB.getLoginStatus === 'function' &&
               typeof window.FB.api === 'function';
      };

      if (isFullyReady()) {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (isFullyReady()) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error('Facebook SDK initialization timeout - required methods not available'));
        }
      }, 100);
    });
  }

  isReady(): boolean {
    // Enhanced validation to ensure all required FB methods are available
    // Check both custom flag and standard fbInitialized flag for maximum compatibility
    return window.FB && 
           (window.__facebookSDKInitialized === true || window.fbInitialized === true) && 
           typeof window.FB.init === 'function' &&
           typeof window.FB.login === 'function' &&
           typeof window.FB.getLoginStatus === 'function' &&
           typeof window.FB.api === 'function';
  }

  // Force reset the SDK state
  reset(): void {
    console.log('🔄 FacebookSDKManager: Resetting SDK state');
    this.isInitialized = false;
    this.isInitializing = false;
    this.initializationPromise = null;
    window.__facebookSDKInitialized = false;
    window.fbInitialized = false; // Clear both flags
    window.__facebookSDKPromise = undefined;
    window.__facebookSDKRetryCount = 0;
    
    // Remove existing script
    const existingScript = document.querySelector('script[src*="connect.facebook.net"]');
    if (existingScript) {
      document.head.removeChild(existingScript);
    }
  }
}

// Global Facebook SDK initialization with Promise-based approach
function createGlobalFacebookInitPromise(appId: string): Promise<void> {
  if (window.__facebookInitPromise) {
    console.log('🌐 Global Facebook init promise already exists, reusing...');
    return window.__facebookInitPromise;
  }

  console.log('🔧 Creating global Facebook init promise for App ID:', appId);
  
  window.__facebookInitPromise = new Promise<void>((resolve, reject) => {
    // Set fbAsyncInit BEFORE loading the script
    window.fbAsyncInit = () => {
      try {
        console.log('🔧 Global fbAsyncInit fired, calling FB.init...');
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v23.0'
        });
        window.__facebookSDKInitialized = true;
        window.fbInitialized = true;
        console.log('✅ Global FB initialized successfully');
        resolve();
      } catch (error) {
        console.error('❌ Global FB initialization failed:', error);
        reject(error);
      }
    };

    // Use centralized script loader to prevent duplicates
    loadFacebookScript();

    // Fallback timeout
    setTimeout(() => {
      if (!window.FB || !window.__facebookSDKInitialized) {
        const error = new Error('Global Facebook SDK initialization timeout');
        console.error('❌ Global Facebook init timeout:', error);
        reject(error);
      }
    }, 15000);
  });

  return window.__facebookInitPromise;
}

// Solution 3: Enhanced FB Status Checking Function
function ensureFBInit(callback: () => void, maxAttempts = 50): void {
  if (typeof window !== 'undefined' && 
      window.FB && 
      window.__facebookSDKInitialized && 
      typeof window.FB.getLoginStatus === 'function' &&
      typeof window.FB.login === 'function' &&
      typeof window.FB.api === 'function') {
    console.log('✅ ensureFBInit: FB is ready, executing callback immediately');
    callback();
  } else {
    if (maxAttempts > 0) {
      console.log(`⏳ ensureFBInit: FB not ready, retrying in 100ms... (${maxAttempts} attempts left)`);
      setTimeout(() => {
        ensureFBInit(callback, maxAttempts - 1);
      }, 100);
    } else {
      console.error('❌ ensureFBInit: FB initialization timeout after maximum attempts');
    }
  }
}

// Comprehensive Facebook readiness utility that combines all solutions
async function ensureFacebookReady(appId: string): Promise<void> {
  // Solution 1: Check if already ready
  if (window.FB && window.__facebookSDKInitialized && 
      typeof window.FB.login === 'function' && 
      typeof window.FB.getLoginStatus === 'function' && 
      typeof window.FB.api === 'function') {
    console.log('✅ ensureFacebookReady: FB already ready');
    return;
  }

  // Solution 2: Use global Promise-based approach
  if (window.__facebookInitPromise) {
    console.log('🌐 ensureFacebookReady: Using existing global init promise');
    await window.__facebookInitPromise;
    return;
  }

  // Solution 3: Create new global promise and wait
  console.log('🔧 ensureFacebookReady: Creating new global init promise');
  await createGlobalFacebookInitPromise(appId);
  
  // Final validation
  if (!window.FB || !window.__facebookSDKInitialized) {
    throw new Error('Facebook SDK failed to initialize properly');
  }
}

const FacebookLogin: React.FC<FacebookLoginProps> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState('');
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const initializationTimeout = useRef<NodeJS.Timeout | null>(null);
  const sdkManager = useRef(FacebookSDKManager.getInstance());
  const loginAttempted = useRef(false);

  // Facebook App ID - Replace with your actual Facebook App ID
  const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'your-facebook-app-id';
  
  // Detect if we're in production
  const isProduction = typeof window !== 'undefined' && 
    (window.location.hostname !== 'localhost' && 
     window.location.hostname !== '127.0.0.1' &&
     !window.location.hostname.includes('localhost'));
  
  // Debug logging
  console.log('🔍 FacebookLogin: FB_APP_ID =', FB_APP_ID);
  console.log('🔍 FacebookLogin: Is placeholder?', FB_APP_ID === 'your-facebook-app-id');
  console.log('🔍 FacebookLogin: Environment =', process.env.NODE_ENV);
  console.log('🔍 FacebookLogin: Is production?', isProduction);
  console.log('🔍 FacebookLogin: Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');

  // Check if SDK is ready with more lenient conditions
  const isSdkReady = useCallback(() => {
    // Enhanced validation to ensure all required FB methods are available
    // Check both custom flag and standard fbInitialized flag for maximum compatibility
    const hasAllRequiredMethods = window.FB && 
      (window.__facebookSDKInitialized || window.fbInitialized) && 
      typeof window.FB.login === 'function' && 
      typeof window.FB.getLoginStatus === 'function' && 
      typeof window.FB.api === 'function' && 
      typeof window.FB.init === 'function';
    
    return sdkManager.current.isReady() && sdkReady && !isInitializing && hasAllRequiredMethods;
  }, [sdkReady, isInitializing]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (initializationTimeout.current) {
      clearTimeout(initializationTimeout.current);
      initializationTimeout.current = null;
    }
  }, []);

  // Check login status with improved error handling
  const checkLoginStatus = useCallback(() => {
    // Use the enhanced FB status checking function
    ensureFBInit(() => {
      console.log('🔵 FacebookLogin: Checking login status...');
      try {
        window.FB.getLoginStatus((response: any) => {
          console.log('🔵 FacebookLogin: getLoginStatus response:', response);
          if (response.status === 'connected') {
            console.log('🔵 FacebookLogin: User already connected');
            setIsConnected(true);
            setUserName(response.authResponse.userID);
            // Don't call onSuccess here to avoid duplicate calls
          } else {
            console.log('🔵 FacebookLogin: User not connected, status:', response.status);
            setIsConnected(false);
            setUserName('');
          }
        });
      } catch (error) {
        console.error('❌ FacebookLogin: Error checking login status:', error);
      }
    });
  }, []);

  // Initialize Facebook SDK using the manager
  const initializeFacebookSDK = useCallback(async () => {
    console.log('🔵 FacebookLogin: Starting SDK initialization... (attempt:', retryCount + 1, ')');
    console.log('🔵 FacebookLogin: Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');

    // Check if we have a valid App ID
    if (FB_APP_ID === 'your-facebook-app-id' || !FB_APP_ID) {
      console.error('❌ FacebookLogin: Invalid App ID detected:', FB_APP_ID);
      setSdkError('Invalid Facebook App ID. Please check your configuration.');
      setIsInitializing(false);
      return;
    }

    try {
      // Use the comprehensive Facebook readiness utility
      await ensureFacebookReady(FB_APP_ID);
      
      console.log('✅ FacebookLogin: SDK initialized successfully via comprehensive utility');
      setSdkReady(true);
      setIsInitializing(false);
      setRetryCount(0);
      
      // Check login status after successful initialization
      setTimeout(() => {
        checkLoginStatus();
      }, 100);
      
    } catch (error) {
      console.error('❌ FacebookLogin: SDK initialization failed:', error);
      if (retryCount < maxRetries) {
        console.log('🔄 FacebookLogin: Retrying initialization...');
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          initializeFacebookSDK();
        }, 1000);
      } else {
        setSdkError('Facebook SDK failed to initialize after multiple attempts. Please refresh the page.');
        setIsInitializing(false);
      }
    }
  }, [FB_APP_ID, retryCount, maxRetries, isProduction, checkLoginStatus]);

  // Initialize SDK on mount
  useEffect(() => {
    console.log('🔵 FacebookLogin: Component mounted, initializing SDK...');
    
    // Set a timeout for initialization
    initializationTimeout.current = setTimeout(() => {
      if (isInitializing) {
        console.log('⚠️ FacebookLogin: Initialization timeout, retrying...');
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          initializeFacebookSDK();
        } else {
          setSdkError('Facebook SDK initialization timed out. Please try again.');
          setIsInitializing(false);
        }
      }
    }, 15000); // 15 second timeout
    
    initializeFacebookSDK();
    
    // Cleanup function
    return () => {
      console.log('🔵 FacebookLogin: Component unmounting, cleaning up...');
      cleanup();
    };
  }, [initializeFacebookSDK, cleanup, isInitializing, retryCount, maxRetries]);

  const handleFacebookLogin = useCallback(() => {
    console.log('🔵 FacebookLogin: Login button clicked');
    console.log('🔵 FacebookLogin: SDK ready?', isSdkReady());
    console.log('🔵 FacebookLogin: Is loading?', isLoading);
    console.log('🔵 FacebookLogin: Is initializing?', isInitializing);
    console.log('🔵 FacebookLogin: FB available?', !!window.FB);
    console.log('🔵 FacebookLogin: FB.init available?', typeof window.FB?.init);
    console.log('🔵 FacebookLogin: Login already attempted?', loginAttempted.current);
    console.log('🔵 FacebookLogin: Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');

    if (loginAttempted.current) {
      console.log('⚠️ FacebookLogin: Login already attempted, preventing duplicate');
      return;
    }

    if (isLoading) {
      console.log('❌ FacebookLogin: Login already in progress');
      return;
    }

    if (!isSdkReady()) {
      console.log('❌ FacebookLogin: SDK not ready, cannot login');
      
      // Try to reinitialize if not ready
      if (retryCount < maxRetries) {
        console.log('🔄 FacebookLogin: Attempting to reinitialize SDK...');
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          initializeFacebookSDK();
        }, 500);
        onError('Facebook SDK not ready. Retrying...');
      } else {
        onError('Facebook SDK not ready. Please refresh the page and try again.');
      }
      return;
    }

    console.log('🔵 FacebookLogin: Starting login process...');
    setIsLoading(true);
    setSdkError(null);
    loginAttempted.current = true;
    
    // Use the enhanced FB status checking function for login
    ensureFBInit(() => {
      // Check for popup blockers before attempting login
      const popupTest = window.open('', '_blank', 'width=1,height=1');
      if (popupTest) {
        popupTest.close();
      } else {
        console.warn('⚠️ FacebookLogin: Popup blocker detected');
        setIsLoading(false);
        loginAttempted.current = false;
        onError('Popup blocker detected. Please allow popups for this site and try again.');
        return;
      }

      try {
        window.FB.login((response: any) => {
          console.log('🔵 FacebookLogin: Login response received:', response);
          setIsLoading(false);
          loginAttempted.current = false;
          
          if (response.status === 'connected') {
            console.log('✅ FacebookLogin: Login successful, calling onSuccess...');
            console.log('🔵 FacebookLogin: Access token length:', response.authResponse.accessToken.length);
            console.log('🔵 FacebookLogin: User ID:', response.authResponse.userID);
            setIsConnected(true);
            setUserName(response.authResponse.userID);
            onSuccess(response.authResponse.accessToken, response.authResponse.userID);
          } else {
            console.log('❌ FacebookLogin: Login failed, calling onError...');
            console.log('🔵 FacebookLogin: Response status:', response.status);
            console.log('🔵 FacebookLogin: Response authResponse:', response.authResponse);
            
            let errorMessage = 'Facebook login failed. Please try again.';
            if (response.status === 'not_authorized') {
              errorMessage = 'Login was cancelled or permissions were denied.';
            } else if (response.status === 'unknown') {
              errorMessage = 'Login failed. Please check your internet connection and try again.';
            }
            
            onError(errorMessage);
          }
        }, {
          scope: 'ads_read,ads_management,read_insights,pages_read_engagement,business_management,pages_show_list',
          return_scopes: true,
          auth_type: 'rerequest'
        });
      } catch (error) {
        console.error('❌ FacebookLogin: Error during login:', error);
        setIsLoading(false);
        loginAttempted.current = false;
        onError('Facebook login error. Please try again.');
      }
    });
  }, [isSdkReady, onSuccess, onError, isLoading, isInitializing, retryCount, maxRetries, initializeFacebookSDK, isProduction]);

  const handleFacebookLogout = useCallback(() => {
    // Use the enhanced FB status checking function for logout
    ensureFBInit(() => {
      try {
        window.FB.logout((response: any) => {
          console.log('🔵 FacebookLogin: Logout response:', response);
          setIsConnected(false);
          setUserName('');
        });
      } catch (error) {
        console.error('❌ FacebookLogin: Error during logout:', error);
      }
    });
  }, []);

  // Show error state if SDK failed to load
  if (sdkError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-red-800">Facebook SDK Error</p>
            <p className="text-xs text-red-600">{sdkError}</p>
            {isProduction && (
              <p className="text-xs text-red-500 mt-1">
                Production environment detected. Check domain configuration in Facebook App settings.
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => {
              console.log('🔄 FacebookLogin: User clicked retry button');
              setSdkError(null);
              setIsInitializing(true);
              setRetryCount(0);
              cleanup();
              // Reset the SDK manager state completely
              sdkManager.current.reset();
              // Small delay to ensure state is reset
              setTimeout(() => {
                initializeFacebookSDK();
              }, 100);
            }}
            disabled={isInitializing}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isInitializing ? (
              <>
            <Loader2 className="w-4 h-4 animate-spin mr-2 loader-light" />
                Retrying...
              </>
            ) : (
              'Retry Loading SDK'
            )}
          </button>
          <button
            onClick={() => {
              console.log('🔄 FacebookLogin: User clicked hard reset button');
              // Complete hard reset
              sdkManager.current.reset();
              setSdkError(null);
              setIsInitializing(true);
              setRetryCount(0);
              cleanup();
              loginAttempted.current = false;
              // Force a complete reload
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }}
            className="w-full bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm hover:bg-orange-200"
          >
            Hard Reset & Reload
          </button>
          <button
            onClick={() => {
              console.log('🔄 FacebookLogin: User clicked refresh page button');
              window.location.reload();
            }}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
          >
            Refresh Page
          </button>
        </div>
        {retryCount > 0 && (
          <div className="text-xs text-gray-500 text-center">
            Previous attempts: {retryCount}
          </div>
        )}
      </div>
    );
  }

  // Show configuration error if App ID is invalid
  if (FB_APP_ID === 'your-facebook-app-id' || !FB_APP_ID) {
    return (
      <div className="space-y-4">
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-red-800">Facebook App ID Not Configured</p>
            <p className="text-xs text-red-600">
              Please update your .env.local file with a valid Facebook App ID
            </p>
            {isProduction && (
              <p className="text-xs text-red-500 mt-1">
                Production environment detected. Make sure to configure environment variables in Vercel.
              </p>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          <p>Current App ID: {FB_APP_ID}</p>
          <p>Environment: {isProduction ? 'Production' : 'Development'}</p>
          <p>Follow the setup guide: FACEBOOK_APP_SETUP_QUICK.md</p>
        </div>
      </div>
    );
  }

  // Show loading state while SDK is initializing
  if (isInitializing || !isSdkReady()) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin loader-light" />
        <span className="ml-2 text-sm text-gray-600">
          {isInitializing ? 'Initializing Facebook SDK...' : 'Preparing Facebook SDK...'}
          {retryCount > 0 && ` (attempt ${retryCount + 1})`}
          {isProduction && ' (Production mode)'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isConnected ? (
        <button
          onClick={handleFacebookLogin}
          disabled={isLoading || !isSdkReady()}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2 loader-light" />
          ) : (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          Connect with Facebook
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Connected to Facebook</p>
              <p className="text-xs text-green-600">User ID: {userName}</p>
            </div>
          </div>
          <button
            onClick={handleFacebookLogout}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
          >
            Disconnect Facebook
          </button>
        </div>
      )}
    </div>
  );
};

export default FacebookLogin; 