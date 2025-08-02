'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FacebookLoginProps {
  onSuccess: (accessToken: string, userId: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
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
  const sdkInitTimeout = useRef<NodeJS.Timeout | null>(null);

  // Facebook App ID - Replace with your actual Facebook App ID
  const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'your-facebook-app-id';
  
  // Debug logging
  console.log('🔍 FacebookLogin: FB_APP_ID =', FB_APP_ID);
  console.log('🔍 FacebookLogin: Is placeholder?', FB_APP_ID === 'your-facebook-app-id');

  // Check if SDK is ready with more lenient conditions
  const isSdkReady = useCallback(() => {
    const ready = window.FB && !isInitializing;
    console.log('🔍 FacebookLogin: SDK ready check:', {
      windowFB: !!window.FB,
      isInitializing,
      ready
    });
    return ready;
  }, [isInitializing]);

  // Initialize Facebook SDK with improved error handling
  const initializeFacebookSDK = useCallback(() => {
    console.log('🔵 FacebookLogin: Starting SDK initialization...');
    console.log('🔵 FacebookLogin: Init attempted:', initAttempted.current);
    console.log('🔵 FacebookLogin: Retry count:', retryCount);

    // Clear any existing timeout
    if (sdkInitTimeout.current) {
      clearTimeout(sdkInitTimeout.current);
      sdkInitTimeout.current = null;
    }

    setIsInitializing(true);
    setSdkError(null);

    // If FB already exists and is initialized, use it
    if (window.FB && window.FB.getLoginStatus) {
      console.log('🔵 FacebookLogin: FB already exists and appears initialized');
      setSdkReady(true);
      setIsInitializing(false);
      checkLoginStatus();
      return;
    }

    // If we've already attempted initialization, try a different approach
    if (initAttempted.current && retryCount < 3) {
      console.log('🔵 FacebookLogin: Retrying initialization with different approach...');
      setRetryCount(prev => prev + 1);
      
      // Remove existing script if it exists
      const existingScript = document.querySelector('script[src*="connect.facebook.net"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Reset global FB object
      if (window.FB) {
        delete window.FB;
      }
      if (window.fbAsyncInit) {
        delete window.fbAsyncInit;
      }
    }

    initAttempted.current = true;
    console.log('🔵 FacebookLogin: Loading Facebook SDK...');
    
    // Load Facebook SDK
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('🔵 FacebookLogin: Facebook SDK loaded successfully');
      
      // Check if we have a valid App ID
      if (FB_APP_ID === 'your-facebook-app-id' || !FB_APP_ID) {
        console.error('❌ FacebookLogin: Invalid App ID detected:', FB_APP_ID);
        setSdkError('Invalid Facebook App ID. Please check your configuration.');
        setIsInitializing(false);
        return;
      }
      
      // Set up fbAsyncInit with timeout protection
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
          
          // Check login status after initialization with a longer delay
          setTimeout(() => {
            checkLoginStatus();
          }, 500);
        } catch (error) {
          console.error('❌ FacebookLogin: Error initializing FB:', error);
          setSdkError('Failed to initialize Facebook SDK');
          setIsInitializing(false);
          
          // Retry initialization after a delay
          if (retryCount < 3) {
            setTimeout(() => {
              console.log('🔵 FacebookLogin: Retrying initialization after error...');
              initializeFacebookSDK();
            }, 2000);
          }
        }
      };

      // Set a timeout to detect if fbAsyncInit doesn't get called
      sdkInitTimeout.current = setTimeout(() => {
        if (!window.FB || !window.FB.getLoginStatus) {
          console.error('❌ FacebookLogin: fbAsyncInit timeout - SDK not properly initialized');
          setSdkError('Facebook SDK initialization timeout. Please refresh and try again.');
          setIsInitializing(false);
          
          // Retry initialization
          if (retryCount < 3) {
            setTimeout(() => {
              console.log('🔵 FacebookLogin: Retrying initialization after timeout...');
              initializeFacebookSDK();
            }, 2000);
          }
        }
      }, 10000); // 10 second timeout
    };

    script.onerror = () => {
      console.error('❌ FacebookLogin: Failed to load Facebook SDK');
      setSdkError('Failed to load Facebook SDK');
      setIsInitializing(false);
      
      // Retry loading the script
      if (retryCount < 3) {
        setTimeout(() => {
          console.log('🔵 FacebookLogin: Retrying script load...');
          initializeFacebookSDK();
        }, 2000);
      }
    };

    document.head.appendChild(script);
  }, [FB_APP_ID, retryCount]);

  // Check login status with improved error handling
  const checkLoginStatus = useCallback(() => {
    if (!window.FB || !window.FB.getLoginStatus) {
      console.log('🔵 FacebookLogin: FB not available for status check');
      return;
    }

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
  }, []);

  // Initialize SDK on mount
  useEffect(() => {
    console.log('🔵 FacebookLogin: Component mounted, initializing SDK...');
    initializeFacebookSDK();
    
    // Cleanup function to reset state if component unmounts
    return () => {
      console.log('🔵 FacebookLogin: Component unmounting, cleaning up...');
      if (sdkInitTimeout.current) {
        clearTimeout(sdkInitTimeout.current);
      }
      initAttempted.current = false;
    };
  }, [initializeFacebookSDK]);

  const handleFacebookLogin = useCallback(() => {
    console.log('🔵 FacebookLogin: Login button clicked');
    console.log('🔵 FacebookLogin: SDK ready?', isSdkReady());
    console.log('🔵 FacebookLogin: Is loading?', isLoading);
    console.log('🔵 FacebookLogin: Is initializing?', isInitializing);
    console.log('🔵 FacebookLogin: FB available?', !!window.FB);

    if (isLoading) {
      console.log('❌ FacebookLogin: Login already in progress');
      return;
    }

    // If SDK is not ready, try to reinitialize
    if (!isSdkReady()) {
      console.log('❌ FacebookLogin: SDK not ready, attempting reinitialization...');
      setIsLoading(true);
      setSdkError(null);
      
      // Reset and retry initialization
      initAttempted.current = false;
      setRetryCount(0);
      
      setTimeout(() => {
        initializeFacebookSDK();
        setIsLoading(false);
      }, 1000);
      return;
    }

    console.log('🔵 FacebookLogin: Starting login process...');
    setIsLoading(true);
    setSdkError(null);
    
    // Add a longer delay to ensure SDK is fully ready
    setTimeout(() => {
      if (!window.FB || !window.FB.login) {
        console.log('❌ FacebookLogin: FB not available after delay');
        setIsLoading(false);
        onError('Facebook SDK not available. Please try again.');
        return;
      }
      
      try {
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
      } catch (error) {
        console.error('❌ FacebookLogin: Error during login:', error);
        setIsLoading(false);
        onError('Facebook login error. Please try again.');
      }
    }, 500); // Increased delay for better reliability
  }, [isSdkReady, onSuccess, onError, isLoading, isInitializing, initializeFacebookSDK]);

  const handleFacebookLogout = useCallback(() => {
    if (!window.FB) return;
    
    try {
      window.FB.logout((response: any) => {
        console.log('🔵 FacebookLogin: Logout response:', response);
        setIsConnected(false);
        setUserName('');
      });
    } catch (error) {
      console.error('❌ FacebookLogin: Error during logout:', error);
    }
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
            initAttempted.current = false;
            setRetryCount(0);
            setSdkError(null);
            initializeFacebookSDK();
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