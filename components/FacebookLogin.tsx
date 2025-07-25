'use client'

import React, { useEffect, useState } from 'react';
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

  // Facebook App ID - Replace with your actual Facebook App ID
  const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'your-facebook-app-id';
  
  // Debug logging
  console.log('🔍 FacebookLogin: FB_APP_ID =', FB_APP_ID);
  console.log('🔍 FacebookLogin: Is placeholder?', FB_APP_ID === 'your-facebook-app-id');

  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      script.onload = () => {
        console.log('🔵 FacebookLogin: Facebook SDK loaded successfully');
        window.fbAsyncInit = () => {
          console.log('🔵 FacebookLogin: fbAsyncInit called, initializing FB...');
          
          // Check if we have a valid App ID
          if (FB_APP_ID === 'your-facebook-app-id' || !FB_APP_ID) {
            console.error('❌ FacebookLogin: Invalid App ID detected:', FB_APP_ID);
            console.error('❌ FacebookLogin: Please update your .env.local file with a valid Facebook App ID');
            return;
          }
          
          window.FB.init({
            appId: FB_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v23.0'
          });
          console.log('🔵 FacebookLogin: FB initialized with appId:', FB_APP_ID);

          // Check if user is already logged in
          window.FB.getLoginStatus((response: any) => {
            console.log('🔵 FacebookLogin: getLoginStatus response:', response);
            if (response.status === 'connected') {
              console.log('🔵 FacebookLogin: User already connected');
              setIsConnected(true);
              setUserName(response.authResponse.userID);
              onSuccess(response.authResponse.accessToken, response.authResponse.userID);
            }
          });
        };
      };
    };

    if (!window.FB) {
      loadFacebookSDK();
    }
  }, [FB_APP_ID, onSuccess]);

  const handleFacebookLogin = () => {
    console.log('🔵 FacebookLogin: Starting login process...');
    setIsLoading(true);
    
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
        onError('Facebook login failed. Please try again.');
      }
    }, {
      scope: 'ads_read,ads_management,read_insights,pages_read_engagement,business_management,pages_show_list',
      return_scopes: true,
      auth_type: 'rerequest' // This helps with permission issues
    });
  };

  const handleFacebookLogout = () => {
    window.FB.logout((response: any) => {
      setIsConnected(false);
      setUserName('');
    });
  };

  if (!window.FB) {
    console.log('🔵 FacebookLogin: FB not available, showing loading state');
    
    // Check if we have a valid App ID
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
    
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Loading Facebook SDK...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isConnected ? (
        <button
          onClick={handleFacebookLogin}
          disabled={isLoading}
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