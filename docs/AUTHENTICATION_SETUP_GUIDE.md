# Authentication Setup Guide

## Current Issue
The "Sign In" button in the header is currently redirecting to the signup page due to Google OAuth configuration issues. The error "Access blocked: This app's request is invalid" occurs when Google OAuth is not properly configured.

## Quick Fix (Current Implementation)
The header now redirects users to `/signup` instead of trying to use Google OAuth directly. This provides a better user experience while the OAuth setup is being configured.

## Setting Up Google OAuth (Recommended)

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

### 2. Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Intrend"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `openid`, `email`, `profile`
5. Add test users if needed

### 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
5. Copy the Client ID and Client Secret

### 4. Update Environment Variables
Add these to your `.env.local` file:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 5. Test the Setup
1. Restart your development server
2. Try the "Sign In" button in the header
3. You should be redirected to Google OAuth

## Alternative Authentication Methods

### Option 1: Email/Password Authentication
If you prefer not to use Google OAuth, you can implement a traditional email/password authentication system:

1. Create login/signup forms
2. Implement JWT token-based authentication
3. Store user data in your database
4. Update the header to use the new authentication system

### Option 2: Other OAuth Providers
You can also implement authentication with other providers:
- GitHub OAuth
- Facebook Login
- Microsoft Azure AD
- Custom OAuth provider

## Current Authentication Flow

### Header Behavior
- **Not Logged In**: "Sign In" button redirects to `/signup`
- **Logged In**: Shows user name and "Dashboard" button

### Signup Page Features
- Google OAuth (when properly configured)
- Email/password signup form
- Error handling for OAuth failures
- Redirect to dashboard after successful authentication

### Login Page Features
- Google OAuth (when properly configured)
- Email/password login form
- Error handling for OAuth failures
- Redirect to dashboard after successful login

## Troubleshooting

### Common Issues

1. **"Access blocked: This app's request is invalid"**
   - Solution: Configure Google OAuth properly (see steps above)
   - Temporary fix: Use the signup page instead

2. **"Google Client ID not found"**
   - Solution: Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to your environment variables

3. **"Redirect URI mismatch"**
   - Solution: Add the correct redirect URI to your Google OAuth configuration

4. **"OAuth consent screen not configured"**
   - Solution: Complete the OAuth consent screen setup in Google Cloud Console

### Development vs Production
- **Development**: Use `http://localhost:3000` as the redirect URI
- **Production**: Use your actual domain as the redirect URI
- **Environment Variables**: Make sure to use different values for dev/prod

## Security Considerations

1. **Never commit secrets to version control**
   - Use `.env.local` for local development
   - Use environment variables in production

2. **Validate OAuth tokens**
   - Always verify tokens on the server side
   - Implement proper session management

3. **Handle user data securely**
   - Encrypt sensitive data
   - Follow GDPR/privacy regulations

## Next Steps

1. **Immediate**: The current implementation works by redirecting to signup
2. **Short-term**: Set up Google OAuth following the guide above
3. **Long-term**: Consider implementing additional authentication methods

## Support

If you need help with the authentication setup:
1. Check the Google Cloud Console documentation
2. Review the Next.js authentication examples
3. Contact the development team for assistance

---

*Last Updated: December 2024*
*Created by: AI Assistant*
