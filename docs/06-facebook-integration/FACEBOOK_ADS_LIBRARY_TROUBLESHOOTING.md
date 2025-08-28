# Facebook Ads Library 400 Error Troubleshooting Guide

## Overview
The "Search Error API error: 400" indicates a Bad Request error when calling the Facebook Ads Library API. This guide will help you identify and resolve the issue.

## Common Causes and Solutions

### 1. Access Token Issues

#### Problem: Invalid or Expired Access Token
- **Symptoms**: 400 error with "Invalid or expired access token" message
- **Solution**: Reconnect your Facebook account to get a fresh access token

#### Problem: Missing Required Permissions
- **Symptoms**: 400 error with permission-related messages
- **Required Permissions**:
  - `ads_read` - Required for accessing Ads Library
  - `read_insights` - Required for ad performance data
  - `pages_read_engagement` - Required for page-related data

**How to Fix**:
1. Go to your Facebook App settings
2. Navigate to "App Review" → "Permissions and Features"
3. Request the required permissions
4. Reconnect your Facebook account in the dashboard

### 2. Search Query Issues

#### Problem: Empty Search Query
- **Symptoms**: 400 error when search term is empty
- **Solution**: Ensure you have a non-empty search term
- **Default**: The system now defaults to "facebook ads" if no search term is provided

#### Problem: Invalid Search Parameters
- **Symptoms**: 400 error with parameter validation messages
- **Solution**: Check that all search parameters are properly formatted

### 3. Facebook App Configuration Issues

#### Problem: App Not Properly Configured
- **Symptoms**: 400 error with app-related messages
- **Required App Settings**:
  - App must be in "Live" mode (not development)
  - App must have Ads Library permissions enabled
  - App must be approved for business use

**How to Fix**:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Go to "App Settings" → "Basic"
4. Ensure app is in "Live" mode
5. Go to "App Review" → "Permissions and Features"
6. Request and get approval for required permissions

### 4. Rate Limiting

#### Problem: Too Many Requests
- **Symptoms**: 429 error (rate limit exceeded)
- **Solution**: Wait a few minutes before making another request
- **Limit**: Facebook allows 200 requests per minute for Ads Library

### 5. Regional Restrictions

#### Problem: Geographic Limitations
- **Symptoms**: 400 error with region-related messages
- **Solution**: Ensure your search parameters include valid regions
- **Default**: System defaults to "US" region

## Debugging Steps

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for error messages with 🔍 prefix
4. Check the Network tab for failed API calls

### Step 2: Run Test Script
Use the provided test script to verify your Facebook API access:

```bash
# Set your access token as environment variable
export FACEBOOK_ACCESS_TOKEN="your_token_here"

# Run the test
npm run test:facebook-ads-library
```

### Step 3: Check API Response Details
The enhanced error handling now provides detailed error information:
- Check the `details` field in error responses
- Look for specific Facebook API error messages
- Verify response status codes and headers

### Step 4: Validate Access Token
The system now automatically validates your access token:
- Checks if token is valid
- Verifies required permissions
- Tests basic API connectivity

## Environment Variables

Ensure these environment variables are set in your `.env.local` file:

```bash
# Facebook App Configuration
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_APP_VERSION=v18.0

# Optional: Test access token
FACEBOOK_ACCESS_TOKEN=your_test_token
```

## Testing the Fix

After implementing fixes:

1. **Clear Browser Cache**: Hard refresh (Ctrl+F5) or clear cache
2. **Reconnect Facebook**: Disconnect and reconnect your Facebook account
3. **Test with Simple Search**: Try searching for "facebook ads" first
4. **Check Console Logs**: Look for successful API calls
5. **Verify Permissions**: Ensure all required permissions are granted

## Common Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| "Access token is required" | Reconnect your Facebook account |
| "Search query is required" | Enter a search term |
| "Missing required permission: ads_read" | Request ads_read permission in Facebook App |
| "Invalid or expired access token" | Reconnect your Facebook account |
| "Rate limit exceeded" | Wait a few minutes before retrying |
| "Facebook API error: [specific message]" | Check the detailed error in console logs |

## Getting Help

If you're still experiencing issues:

1. **Check Console Logs**: Look for detailed error information
2. **Run Test Script**: Use `npm run test:facebook-ads-library`
3. **Verify App Settings**: Ensure Facebook App is properly configured
4. **Check Permissions**: Verify all required permissions are granted
5. **Contact Support**: Provide console logs and error details

## Prevention

To avoid future 400 errors:

1. **Regular Token Refresh**: Reconnect Facebook account periodically
2. **Monitor Permissions**: Ensure app permissions remain active
3. **Rate Limit Awareness**: Don't exceed 200 requests per minute
4. **App Maintenance**: Keep Facebook App in good standing
5. **Error Monitoring**: Watch for console errors and address them promptly

---

**Note**: This troubleshooting guide is based on the enhanced error handling implemented in the Facebook Ads Library API. The system now provides more detailed error information to help identify and resolve issues quickly.
