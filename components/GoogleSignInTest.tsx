'use client'

import React from 'react';

const GoogleSignInTest: React.FC = () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-2">Google Sign-In Configuration Test</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Client ID:</strong> {clientId ? '✅ Set' : '❌ Missing'}
        </div>
        <div>
          <strong>Client ID Value:</strong> {clientId || 'Not configured'}
        </div>
        <div>
          <strong>Environment:</strong> {process.env.NODE_ENV}
        </div>
        <div>
          <strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}
        </div>
        <div>
          <strong>Callback URL:</strong> {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/google/callback` : 'Server-side'}
        </div>
      </div>
      
      {!clientId && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
          <strong>Configuration Error:</strong> NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set in your environment variables.
          <br />
          Please add it to your .env.local file and restart your development server.
        </div>
      )}
    </div>
  );
};

export default GoogleSignInTest;
