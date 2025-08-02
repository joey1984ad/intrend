# Meta SDK Data Fetching Troubleshooting Guide

## 🔍 **Current Status**
- ✅ Development server is running (http://localhost:3001)
- ✅ Facebook App ID is configured (38517914...)
- ✅ API routes are accessible
- ✅ Data completeness fixes implemented
- ✅ Date calculation fixes implemented
- 🔧 Meta SDK data missing some days (FIXED)

## 🎯 **Most Likely Issues & Solutions**

### 1. **Facebook App in Development Mode** (Most Common)
**Issue**: Facebook apps start in development mode and only allow developers/test users.

**Solution**:
1. Go to https://developers.facebook.com/
2. Select your app (ID: 38517914...)
3. Go to **App Review** → **Make [App Name] public?**
4. Follow the review process
5. Add required permissions:
   - `ads_read`
   - `ads_management` 
   - `read_insights`
   - `pages_read_engagement`

### 2. **Domain Configuration Issue**
**Issue**: App domain not configured for localhost:3001.

**Solution**:
1. Go to Facebook App Dashboard
2. **Settings** → **Basic**
3. Add to **App Domains**:
   - `localhost`
   - `127.0.0.1`
4. Add to **Valid OAuth Redirect URIs**:
   - `http://localhost:3001/`
   - `http://localhost:3001/api/auth/callback/facebook`

### 3. **Missing Permissions**
**Issue**: App doesn't have required permissions for ads data.

**Solution**:
1. Go to **App Review** → **Permissions and Features**
2. Request these permissions:
   - **Ads Management Standard Access**
   - **Pages Read Engagement**
   - **Read Insights**
3. Provide detailed use case description

### 4. **Access Token Issues**
**Issue**: Access token expired or invalid.

**Solution**:
1. Clear browser cache and cookies
2. Re-authenticate with Facebook
3. Check token expiration in browser console

## 🔧 **Step-by-Step Debugging**

### Step 1: Check Browser Console
1. Open http://localhost:3001
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for these specific errors:
   - `"FB is not defined"` → SDK not loaded
   - `"Invalid App ID"` → Configuration issue
   - `"CORS error"` → Domain issue
   - `"Permission denied"` → Permissions issue

### Step 2: Test Facebook SDK Manually
In browser console, type:
```javascript
window.FB
```
- **Expected**: Returns Facebook SDK object
- **If undefined**: SDK not loaded properly

### Step 3: Check Network Tab
1. Go to **Network** tab in Developer Tools
2. Try connecting with Facebook
3. Look for:
   - Failed API calls to Facebook
   - CORS errors
   - 403/401 status codes

### Step 4: Test API Routes
The enhanced logging I added will show:
- Date range calculations
- Data completeness issues
- Missing days detection
- Zero-value filling

## 🚀 **Quick Fixes to Try**

### Fix 1: Restart Everything
```bash
# Stop development server (Ctrl+C)
# Then restart:
npm run dev
# Note: Server may run on port 3001 if 3000 is in use
```

### Fix 2: Clear Browser Data
- Hard refresh: **Ctrl+Shift+R**
- Clear cache and cookies
- Try incognito/private mode

### Fix 3: Check Environment Variables
Verify `.env.local` file:
```env
NEXT_PUBLIC_FACEBOOK_APP_ID=38517914...
FACEBOOK_APP_SECRET=your_secret_here
```

### Fix 4: Test Different Browser
Try Chrome, Firefox, or Edge to rule out browser-specific issues.

## ✅ **Fixes Implemented**

### **Date Calculation Fix**
- **Issue**: Date ranges were not properly including the current day
- **Fix**: Corrected date calculations to ensure "Last 7 Days" includes today
- **Result**: All date ranges now properly include the current day

### **Data Completeness Fix**
- **Issue**: Facebook API returns incomplete data (missing days)
- **Fix**: Added logic to fill missing days with zero values
- **Result**: Complete data series for charts and metrics

### **Enhanced Logging**
- **Issue**: Limited debugging information
- **Fix**: Added comprehensive logging with `[DEBUG]` prefix
- **Result**: Detailed visibility into data fetching and processing

## 📊 **Enhanced Logging Features**

I've added comprehensive logging to help debug:

### API Route Logging
- Date range calculations
- Expected vs actual days
- Missing days detection
- Data filling process
- Error details

### Console Messages to Look For
```
🔍 [DEBUG] Starting API call for adAccountId=...
📊 [DEBUG] Expected days: 30, Actual days: 25
⚠️ [DEBUG] Data completeness issue: Missing 5 days
🔧 [DEBUG] Filling missing days with zero values...
✅ [DEBUG] Data filled: 30 days total
```

## 🎯 **Expected Behavior After Fix**

### When Working Correctly:
1. **Facebook Login** button appears
2. **Connect with Facebook** works
3. **Performance Data** shows complete data series
4. **Amount Spent** includes all days (even $0 days)
5. **Charts** display full date range
6. **Console logs** show successful data fetching

### Data Completeness:
- Last 7 days: 7 data points
- Last 30 days: 30 data points  
- Last 90 days: 90 data points
- Missing days filled with $0 values

## 📚 **Additional Resources**

- `FACEBOOK_QUICK_FIX.md` - Quick troubleshooting steps
- `FACEBOOK_APP_SETUP_QUICK.md` - Setup guide
- `FACEBOOK_PERMISSIONS_CHECKLIST.md` - Required permissions
- `scripts/test-meta-sdk-data.js` - Comprehensive testing script

## 🔍 **Next Steps**

1. **Check Facebook App Status**: Ensure app is in Live mode
2. **Test in Browser**: Open http://localhost:3001 and check console
3. **Look for Logs**: Check for the detailed debugging messages I added
4. **Verify Permissions**: Ensure all required permissions are granted
5. **Test Connection**: Try connecting with Facebook and check for errors
6. **Verify Data Completeness**: Check that all days are showing in Performance Data

## 📞 **If Still Having Issues**

1. Check browser console for specific error messages
2. Look at the enhanced API route logs
3. Verify Facebook App settings match the requirements
4. Test with a different browser
5. Check if the issue is specific to certain date ranges

The enhanced logging I added will help identify exactly where the issue is occurring in the data fetching process. 