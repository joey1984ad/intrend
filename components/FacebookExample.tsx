'use client'

import React, { useState } from 'react';
import { 
  ensureFBInit, 
  ensureFacebookReady, 
  createGlobalFacebookInitPromise,
  safeFacebookLogin,
  safeFacebookAPI,
  isFacebookReady
} from '../lib/facebook-utils';

/**
 * Example Component Demonstrating Enhanced Facebook Initialization
 * 
 * This component shows how to use the three solutions to prevent
 * "FB.login() called before FB.init()" errors:
 * 
 * 1. ensureFBInit() - Simple callback-based approach
 * 2. ensureFacebookReady() - Comprehensive async utility  
 * 3. createGlobalFacebookInitPromise() - Global Promise-based approach
 * 4. safeFacebookLogin() - Safe wrapper functions
 */

const FacebookExample: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready');
  const [appId] = useState(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'your-app-id');

  // Example 1: Using ensureFBInit (Solution 3)
  const handleSimpleLogin = () => {
    setStatus('Using ensureFBInit...');
    
    ensureFBInit(() => {
      setStatus('FB ready, calling login...');
      
      if (window.FB && typeof window.FB.login === 'function') {
        window.FB.login((response: any) => {
          if (response.status === 'connected') {
            setStatus(`Login successful! User ID: ${response.authResponse.userID}`);
          } else {
            setStatus(`Login failed: ${response.status}`);
          }
        }, { scope: 'public_profile,email' });
      } else {
        setStatus('Error: FB.login not available');
      }
    });
  };

  // Example 2: Using ensureFacebookReady (Comprehensive Solution)
  const handleComprehensiveLogin = async () => {
    setStatus('Using ensureFacebookReady...');
    
    try {
      await ensureFacebookReady(appId);
      setStatus('FB ready, calling login...');
      
      if (window.FB && typeof window.FB.login === 'function') {
        window.FB.login((response: any) => {
          if (response.status === 'connected') {
            setStatus(`Login successful! User ID: ${response.authResponse.userID}`);
          } else {
            setStatus(`Login failed: ${response.status}`);
          }
        }, { scope: 'public_profile,email' });
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Example 3: Using global Promise (Solution 2)
  const handleGlobalPromiseLogin = async () => {
    setStatus('Using global Promise approach...');
    
    try {
      const initPromise = createGlobalFacebookInitPromise(appId);
      await initPromise;
      
      setStatus('FB ready via global promise, calling login...');
      
      if (window.FB && typeof window.FB.login === 'function') {
        window.FB.login((response: any) => {
          if (response.status === 'connected') {
            setStatus(`Login successful! User ID: ${response.authResponse.userID}`);
          } else {
            setStatus(`Login failed: ${response.status}`);
          }
        }, { scope: 'public_profile,email' });
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Example 4: Using safe wrapper functions
  const handleSafeLogin = async () => {
    setStatus('Using safe wrapper functions...');
    
    try {
      await safeFacebookLogin(appId, (response: any) => {
        if (response.status === 'connected') {
          setStatus(`Safe login successful! User ID: ${response.authResponse.userID}`);
        } else {
          setStatus(`Safe login failed: ${response.status}`);
        }
      }, { scope: 'public_profile,email' });
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Example 5: Check Facebook readiness
  const handleCheckReadiness = () => {
    const isReady = isFacebookReady();
    setStatus(`Facebook SDK ready: ${isReady ? 'Yes' : 'No'}`);
  };

  // Example 6: Safe API call
  const handleSafeAPICall = async () => {
    setStatus('Making safe API call...');
    
    try {
      const response = await safeFacebookAPI(appId, '/me', 'GET');
      setStatus(`API call successful: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setStatus(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          Enhanced Facebook Initialization Examples
        </h2>
        <p className="text-sm text-blue-600">
          This component demonstrates the three solutions to prevent "FB.login() called before FB.init()" errors.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-2">Current Status:</h3>
          <div className="p-3 bg-gray-100 rounded border">
            <code className="text-sm">{status}</code>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleSimpleLogin}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            Solution 1: ensureFBInit
          </button>

          <button
            onClick={handleComprehensiveLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Solution 2: ensureFacebookReady
          </button>

          <button
            onClick={handleGlobalPromiseLogin}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
          >
            Solution 3: Global Promise
          </button>

          <button
            onClick={handleSafeLogin}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm"
          >
            Safe Wrapper: safeFacebookLogin
          </button>

          <button
            onClick={handleCheckReadiness}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
          >
            Check Readiness
          </button>

          <button
            onClick={handleSafeAPICall}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
          >
            Safe API Call
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Key Benefits:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Solution 1:</strong> Simple callback-based approach with retry logic</li>
            <li>• <strong>Solution 2:</strong> Comprehensive async utility with global promise coordination</li>
            <li>• <strong>Solution 3:</strong> Global Promise-based initialization prevents race conditions</li>
            <li>• <strong>Safe Wrappers:</strong> Built-in error handling and SDK readiness checks</li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Usage Notes:</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• <code>ensureFBInit()</code> is best for simple cases where you just need to ensure FB is ready</p>
            <p>• <code>ensureFacebookReady()</code> is best for comprehensive initialization with error handling</p>
            <p>• <code>createGlobalFacebookInitPromise()</code> is best for coordinating initialization across multiple components</p>
            <p>• <code>safeFacebookLogin()</code> and <code>safeFacebookAPI()</code> are best for production use</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookExample;
