'use client';

import { useEffect, useState } from 'react';

export default function DebugRedirectURI() {
  const [redirectURI, setRedirectURI] = useState('');

  useEffect(() => {
    const currentOrigin = window.location.origin;
    const constructedURI = currentOrigin + '/api/auth/google/callback';
    
    setRedirectURI(constructedURI);
    
    console.log('=== DEBUG INFO ===');
    console.log('Current origin:', currentOrigin);
    console.log('Constructed redirect URI:', constructedURI);
    console.log('==================');
  }, []);

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold text-yellow-800">Debug Information</h3>
      <p className="text-yellow-700">
        <strong>Current Origin:</strong> {window.location.origin}
      </p>
      <p className="text-yellow-700">
        <strong>Redirect URI:</strong> {redirectURI}
      </p>
      <p className="text-sm text-yellow-600 mt-2">
        Copy this exact URI and add it to Google Cloud Console
      </p>
    </div>
  );
}
