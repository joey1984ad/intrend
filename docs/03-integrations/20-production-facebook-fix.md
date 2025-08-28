# Production Facebook Connect Fix Guide

## 🚨 **Issue**: Facebook Connect Works on Localhost but Fails in Production

### **Root Causes & Solutions**

## 1. **Facebook App Domain Configuration** (Most Common)

### **Problem**: 
Facebook app is not configured for your production domain.

### **Solution**:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Go to **Settings** → **Basic**
4. Add to **App Domains**:
   ```
   your-production-domain.com
   www.your-production-domain.com
   ```
5. Add to **Valid OAuth Redirect URIs**:
   ```
   https://your-production-domain.com
   https://www.your-production-domain.com
   ```

## 2. **Environment Variables Not Set in Production**

### **Problem**: 
`NEXT_PUBLIC_FACEBOOK_APP_ID` not configured in Vercel.

### **Solution**:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   NEXT_PUBLIC_FACEBOOK_APP_ID=your_actual_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   ```
5. Redeploy your application

## 3. **Facebook App in Development Mode**

### **Problem**: 
App only allows developers/test users in development mode.

### **Solution**:
1. Go to **App Review** → **Make [App Name] public?**
2. Follow the review process
3. Add required permissions:
   - `ads_read`
   - `ads_management`
   - `read_insights`
   - `pages_read_engagement`

## 4. **HTTPS Requirements**

### **Problem**: 
Facebook requires HTTPS in production.

### **Solution**:
1. Ensure your production domain uses HTTPS
2. In Facebook App settings, enable **Enforce HTTPS**
3. Update all redirect URIs to use `https://`

## 5. **CORS and Security Settings**

### **Problem**: 
Browser security blocks Facebook SDK in production.

### **Solution**:
1. In Facebook App settings, add your production domain to **Allowed Domains for JavaScript SDK**
2. Enable **Client OAuth Login**
3. Enable **Web OAuth Login**

## 🔧 **Enhanced Code Fixes Applied**

### **Production Detection**:
```typescript
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname !== 'localhost' && 
   window.location.hostname !== '127.0.0.1' &&
   !window.location.hostname.includes('localhost'));
```

### **Production-Specific Timeouts**:
```typescript
const timeoutDuration = isProduction ? 15000 : 10000;
const loginDelay = isProduction ? 1000 : 500;
```

### **Enhanced Error Messages**:
- Shows production-specific error messages
- Indicates when environment variables need to be configured
- Provides domain configuration guidance

## 🚀 **Step-by-Step Production Setup**

### **Step 1: Configure Facebook App**
1. Add production domain to App Domains
2. Add HTTPS redirect URIs
3. Enable required permissions
4. Make app public (if needed)

### **Step 2: Configure Vercel Environment Variables**
1. Set `NEXT_PUBLIC_FACEBOOK_APP_ID`
2. Set `FACEBOOK_APP_SECRET`
3. Redeploy application

### **Step 3: Test Production**
1. Deploy to production
2. Check browser console for errors
3. Verify Facebook SDK loads
4. Test login flow

## 🔍 **Debugging Production Issues**

### **Check Browser Console**:
Look for these specific errors:
- `"FB is not defined"` → SDK not loaded
- `"Invalid App ID"` → Environment variable issue
- `"CORS error"` → Domain configuration issue
- `"Permission denied"` → App permissions issue

### **Check Network Tab**:
1. Look for failed requests to Facebook APIs
2. Check for CORS errors
3. Verify redirect URIs are correct

### **Environment Variable Check**:
```javascript
console.log('App ID:', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID);
console.log('Is production:', isProduction);
```

## 📋 **Production Checklist**

- [ ] Facebook App configured for production domain
- [ ] HTTPS redirect URIs added
- [ ] Environment variables set in Vercel
- [ ] App permissions configured
- [ ] App made public (if needed)
- [ ] CORS settings configured
- [ ] Production deployment completed
- [ ] Browser console checked for errors
- [ ] Login flow tested in production

## 🆘 **Common Production Errors & Fixes**

### **Error**: "App not configured"
**Fix**: Add production domain to Facebook App settings

### **Error**: "Invalid redirect URI"
**Fix**: Add exact production URL to Valid OAuth Redirect URIs

### **Error**: "Permission denied"
**Fix**: Request required permissions in App Review

### **Error**: "SDK timeout"
**Fix**: Check network connectivity and Facebook API status

## 📞 **Support**

If issues persist after following this guide:
1. Check Facebook Developer Console for app status
2. Verify all environment variables are set
3. Test with a fresh browser session
4. Check Facebook API status page 