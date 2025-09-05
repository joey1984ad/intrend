// Debug script to check what redirect URI is being sent
console.log('Current origin:', window.location.origin);
console.log('Redirect URI:', window.location.origin + '/api/auth/google/callback');
