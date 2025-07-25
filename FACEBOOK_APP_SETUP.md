# Facebook App Setup Guide

## Step-by-Step Configuration for Facebook Business SDK Integration

### 1. Create Your Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose **"Business"** as the app type
4. Fill in your app details:
   - **App Name**: "Agency Dashboard" (or your preferred name)
   - **Contact Email**: Your email address
   - **Business Account**: Select your business account

### 2. Add Marketing API Product

1. In your app dashboard, go to **"Add Products"**
2. Find **"Marketing API"** and click "Set Up"
3. This is **required** for accessing ad account data

### 3. Configure App Settings

Go to **Settings** → **Basic**:

```
App Domains: 
- Development: localhost
- Production: your-domain.com

Privacy Policy URL: https://your-domain.com/privacy
Terms of Service URL: https://your-domain.com/terms
```

### 4. Set Up Facebook Login

1. Go to **Products** → **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   Development: http://localhost:3000
   Production: https://your-domain.com
   ```

### 5. Configure Advanced Settings

Go to **Settings** → **Advanced** and enable:

- ✅ **App Secret Proof for Server API calls** (Security)
- ✅ **Client OAuth Login**
- ✅ **Web OAuth Login**
- ✅ **Enforce HTTPS** (production only)

### 6. Set Required Permissions

In **Facebook Login** → **Permissions and Features**, add:

```
ads_read - Read ads data
ads_management - Manage ads
read_insights - Read insights data
pages_read_engagement - Read page engagement
business_management - Manage business accounts
pages_show_list - List pages the user manages
```

### 7. Get Your App Credentials

From your app dashboard, copy:
- **App ID** (for `NEXT_PUBLIC_FACEBOOK_APP_ID`)
- **App Secret** (for `FACEBOOK_APP_SECRET`)

### 8. Update Environment Variables

Create a `.env.local` file in your project root:

```bash
# Facebook App Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Optional: Facebook App Domain (for production)
NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=your-domain.com
```

### 9. Test Your Integration

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Connect with Facebook"
4. Authorize your app
5. Select an ad account
6. Load your ad data

### 10. Production Deployment

Before deploying to production:

1. **Update App Domains** in Facebook App settings
2. **Add Production OAuth Redirect URI**
3. **Enable HTTPS enforcement**
4. **Update environment variables** with production values
5. **Test the integration** in production environment

### Troubleshooting

**Common Issues:**

1. **"App not configured"** - Check your App ID in environment variables
2. **"Invalid redirect URI"** - Verify OAuth redirect URIs in Facebook App settings
3. **"Insufficient permissions"** - Ensure all required permissions are added
4. **"App Secret Proof required"** - Enable App Secret Proof in Advanced settings

**Debug Mode:**
Enable debug mode in your API calls to see detailed request/response logs.

### Security Best Practices

1. **Never expose App Secret** in client-side code
2. **Use App Secret Proof** for server API calls
3. **Store tokens securely** on the server side
4. **Validate tokens** before using them
5. **Use HTTPS** in production

### API Rate Limits

Facebook has rate limits for API calls:
- **200 calls per user per hour** (default)
- **Monitor usage** in your app dashboard
- **Implement caching** to reduce API calls

### Support Resources

- [Facebook Developers Documentation](https://developers.facebook.com/docs/)
- [Marketing API Documentation](https://developers.facebook.com/docs/marketing-api/)
- [Facebook Business SDK GitHub](https://github.com/facebook/facebook-nodejs-business-sdk)
- [Facebook Marketing Developer Community](https://www.facebook.com/groups/pmdcommunity) 