'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FacebookLoginProps {
  onSuccess: (accessToken: string, userId: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
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
  const initAttempted = useRef(false);
  const scriptLoaded = useRef(false);
  const scriptElement = useRef<HTMLScriptElement | null>(null);
  const maxRetries = 5;

  // Facebook App ID - Replace with your actual Facebook App ID
  const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'your-facebook-app-id';
  
  // Debug logging
  console.log('🔍 FacebookLogin: FB_APP_ID =', FB_APP_ID);
  console.log('🔍 FacebookLogin: Is placeholder?', FB_APP_ID === 'your-facebook-app-id');
  console.log('🔍 FacebookLogin: Environment =', process.env.NODE_ENV);

  // Check if SDK is ready
  const isSdkReady = useCallback(() => {
    return window.FB && sdkReady && !isInitializing;
  }, [sdkReady, isInitializing]);

  // Force reload Facebook SDK
  const forceReloadSDK = useCallback(() => {
    console.log('🔄 FacebookLogin: Force reloading SDK...');
    
    // Remove existing script if it exists
    if (scriptElement.current) {
      document.head.removeChild(scriptElement.current);
      scriptElement.current = null;
    }
    
    // Clear existing FB
    if (window.FB) {
      delete window.FB;
    }
    
    // Reset all states
    setSdkReady(false);
    setIsInitializing(true);
    setSdkError(null);
    scriptLoaded.current = false;
    initAttempted.current = false;
    
    // Force garbage collection hint
    if (window.gc) {
      window.gc();
    }
  }, []);

  // Wait for FB to be available with timeout
  const waitForFB = useCallback((timeout = 10000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.FB) {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (window.FB) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 50); // Check more frequently
    });
  }, []);

  // Initialize Facebook SDK
  const initializeFacebookSDK = useCallback(async () => {
    if (initAttempted.current && retryCount === 0) {
      console.log('🔵 FacebookLogin: Initialization already attempted');
      return;
    }

    initAttempted.current = true;
    setIsInitializing(true);
    setSdkError(null);
    console.log('🔵 FacebookLogin: Starting SDK initialization... (attempt:', retryCount + 1, ')');

    // Check if FB already exists and is properly initialized
    if (window.FB && typeof window.FB.init === 'function') {
      console.log('🔵 FacebookLogin: FB already exists and is properly initialized');
      setSdkReady(true);
      setIsInitializing(false);
      checkLoginStatus();
      return;
    }

    // Check if script is already loaded but FB is not ready
    if (scriptLoaded.current) {
      console.log('🔵 FacebookLogin: Script already loaded, waiting for FB...');
      const fbAvailable = await waitForFB();
      if (fbAvailable && typeof window.FB.init === 'function') {
        setSdkReady(true);
        setIsInitializing(false);
        checkLoginStatus();
        return;
      } else {
        console.log('🔄 FacebookLogin: FB not properly initialized, force reloading...');
        forceReloadSDK();
        // Wait a bit before retrying
        setTimeout(() => {
          initializeFacebookSDK();
        }, 500);
        return;
      }
    }

    console.log('🔵 FacebookLogin: Loading Facebook SDK...');
    
    // Load Facebook SDK
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    scriptElement.current = script;
    
    script.onload = () => {
      console.log('🔵 FacebookLogin: Facebook SDK loaded successfully');
      scriptLoaded.current = true;
      
      // Check if we have a valid App ID
      if (FB_APP_ID === 'your-facebook-app-id' || !FB_APP_ID) {
        console.error('❌ FacebookLogin: Invalid App ID detected:', FB_APP_ID);
        setSdkError('Invalid Facebook App ID. Please check your configuration.');
        setIsInitializing(false);
        return;
      }
      
      // Wait for FB to be available with longer timeout for production
      const timeout = process.env.NODE_ENV === 'production' ? 10000 : 5000;
      waitForFB(timeout).then((fbAvailable) => {
        if (!fbAvailable || typeof window.FB.init !== 'function') {
          console.error('❌ FacebookLogin: FB not available or not properly initialized after script load');
          setSdkError('Facebook SDK failed to initialize. Please try again.');
          setIsInitializing(false);
          return;
        }

        window.fbAsyncInit = () => {
          console.log('🔵 FacebookLogin: fbAsyncInit called, initializing FB...');
          
          try {
            window.FB.init({
              appId: FB_APP_ID,
              cookie: true,
              xfbml: true,
              version: 'v23.0'
            });
            console.log('🔵 FacebookLogin: FB initialized with appId:', FB_APP_ID);
            setSdkReady(true);
            setIsInitializing(false);
            setRetryCount(0); // Reset retry count on success
            
            // Check login status after initialization with longer delay for production
            setTimeout(() => {
              checkLoginStatus();
            }, process.env.NODE_ENV === 'production' ? 1000 : 100);
          } catch (error) {
            console.error('❌ FacebookLogin: Error initializing FB:', error);
            setSdkError('Failed to initialize Facebook SDK');
            setIsInitializing(false);
          }
        };
      });
    };

    script.onerror = () => {
      console.error('❌ FacebookLogin: Failed to load Facebook SDK');
      setSdkError('Failed to load Facebook SDK');
      setIsInitializing(false);
    };

    document.head.appendChild(script);
  }, [FB_APP_ID, retryCount, waitForFB, forceReloadSDK]);

  // Check login status
  const checkLoginStatus = useCallback(() => {
    if (!window.FB) {
      console.log('🔵 FacebookLogin: FB not available for status check');
      return;
    }

    console.log('🔵 FacebookLogin: Checking login status...');
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
  }, []);

  // Initialize SDK on mount
  useEffect(() => {
    console.log('🔵 FacebookLogin: Component mounted, initializing SDK...');
    
    // Force reload on mount in production
    if (process.env.NODE_ENV === 'production') {
      forceReloadSDK();
    }
    
    initializeFacebookSDK();
    
    // Cleanup function to reset state if component unmounts
    return () => {
      console.log('🔵 FacebookLogin: Component unmounting, cleaning up...');
      initAttempted.current = false;
    };
  }, [initializeFacebookSDK, forceReloadSDK]);

  const handleFacebookLogin = useCallback(() => {
    console.log('🔵 FacebookLogin: Login button clicked');
    console.log('🔵 FacebookLogin: SDK ready?', isSdkReady());
    console.log('🔵 FacebookLogin: Is loading?', isLoading);
    console.log('🔵 FacebookLogin: Is initializing?', isInitializing);
    console.log('🔵 FacebookLogin: FB available?', !!window.FB);
    console.log('🔵 FacebookLogin: FB.init available?', typeof window.FB?.init);

    if (!isSdkReady()) {
      console.log('❌ FacebookLogin: SDK not ready, cannot login');
      
      // Try to reinitialize if not ready
      if (retryCount < maxRetries) {
        console.log('🔄 FacebookLogin: Attempting to reinitialize SDK...');
        setRetryCount(prev => prev + 1);
        forceReloadSDK();
        setTimeout(() => {
          initializeFacebookSDK();
        }, 500);
        onError('Facebook SDK not ready. Retrying...');
      } else {
        onError('Facebook SDK not ready. Please refresh the page and try again.');
      }
      return;
    }

    if (isLoading) {
      console.log('❌ FacebookLogin: Login already in progress');
      return;
    }

    console.log('🔵 FacebookLogin: Starting login process...');
    setIsLoading(true);
    setSdkError(null);
    
    // Add a longer delay for production environments
    const delay = process.env.NODE_ENV === 'production' ? 500 : 100;
    
    setTimeout(() => {
      if (!window.FB || typeof window.FB.login !== 'function') {
        console.log('❌ FacebookLogin: FB not available or login method not available after delay');
        setIsLoading(false);
        onError('Facebook SDK not available. Please try again.');
        return;
      }
      
      window.FB.login((response: any) => {
        console.log('🔵 FacebookLogin: Login response received:', response);
        setIsLoading(false);
        
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
          }
          
          onError(errorMessage);
        }
      }, {
        scope: 'ads_read,ads_management,read_insights,pages_read_engagement,business_management,pages_show_list',
        return_scopes: true,
        auth_type: 'rerequest'
      });
    }, delay);
  }, [isSdkReady, onSuccess, onError, isLoading, isInitializing, retryCount, initializeFacebookSDK, forceReloadSDK]);

  const handleFacebookLogout = useCallback(() => {
    if (!window.FB) return;
    
    window.FB.logout((response: any) => {
      console.log('🔵 FacebookLogin: Logout response:', response);
      setIsConnected(false);
      setUserName('');
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
          </div>
        </div>
        <button
          onClick={() => {
            forceReloadSDK();
            setRetryCount(0);
            setTimeout(() => {
              initializeFacebookSDK();
            }, 500);
          }}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Retry Loading SDK
        </button>
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
          </div>
        </div>
        <div className="text-xs text-gray-500">
          <p>Current App ID: {FB_APP_ID}</p>
          <p>Follow the setup guide: FACEBOOK_APP_SETUP_QUICK.md</p>
        </div>
      </div>
    );
  }

  // Show loading state while SDK is initializing
  if (isInitializing || !isSdkReady()) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">
          {isInitializing ? 'Initializing Facebook SDK...' : 'Preparing Facebook SDK...'}
          {retryCount > 0 && ` (attempt ${retryCount + 1})`}
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
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
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