gi# Facebook App Permissions & Features Checklist

## Required Permissions for Marketing API Access

### **1. Basic App Permissions**

#### **Facebook Login Permissions:**
- ✅ **`ads_read`** - Read ads data and performance metrics
- ✅ **`ads_management`** - Manage campaigns and account settings
- ✅ **`read_insights`** - Access detailed performance analytics
- ✅ **`pages_read_engagement`** - Read page engagement data
- ✅ **`business_management`** - Manage business accounts

#### **Advanced Permissions:**
- ✅ **`ads_management_standard`** - Standard access to Ads Management API
- ✅ **`read_insights_standard`** - Standard access to Insights API
- ✅ **`pages_show_list`** - List pages the user manages
- ✅ **`pages_read_engagement`** - Read page engagement metrics

### **2. App Features to Enable**

#### **Products to Add:**
1. **✅ Facebook Login**
   - Enable for web platform
   - Add OAuth redirect URIs
   - Configure advanced settings

2. **✅ Marketing API**
   - Add to your app
   - Configure API settings
   - Set up rate limiting

3. **✅ Business Manager API** (Optional)
   - For multi-account management
   - Business account access

#### **Advanced Features:**
- ✅ **App Secret Proof** - Enable for server API calls
- ✅ **Client OAuth Login** - Enable for web login
- ✅ **Web OAuth Login** - Enable for web platform
- ✅ **Enforce HTTPS** - Enable for production

### **3. App Settings Configuration**

#### **Basic Settings:**
```
App Domains: 
- Development: localhost
- Production: your-domain.com

Privacy Policy URL: https://your-domain.com/privacy
Terms of Service URL: https://your-domain.com/terms
```

#### **Facebook Login Settings:**
```
Valid OAuth Redirect URIs:
- Development: http://localhost:3000
- Production: https://your-domain.com

Client OAuth Login: ✅ Enabled
Web OAuth Login: ✅ Enabled
Enforce HTTPS: ✅ Enabled (production)
```

#### **Advanced Settings:**
```
App Secret Proof for Server API calls: ✅ Enabled
Client OAuth Login: ✅ Enabled
Web OAuth Login: ✅ Enabled
Enforce HTTPS: ✅ Enabled (production)
```

### **4. API Permissions Breakdown**

#### **For Campaign Data:**
- **`ads_read`** - Access campaign performance metrics
- **`ads_management`** - Manage campaign settings
- **`read_insights`** - Get detailed analytics

#### **For Account Management:**
- **`business_management`** - Access business accounts
- **`pages_read_engagement`** - Read page data
- **`pages_show_list`** - List managed pages

#### **For Real-time Data:**
- **`ads_management_standard`** - Standard API access
- **`read_insights_standard`** - Standard insights access

### **5. Step-by-Step Setup Guide**

#### **Step 1: Add Products**
1. Go to your Facebook App Dashboard
2. Click **"Add Products"**
3. Add these products:
   - ✅ **Facebook Login**
   - ✅ **Marketing API**

#### **Step 2: Configure Facebook Login**
1. Go to **Products** → **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000
   https://your-domain.com
   ```
3. Enable **Client OAuth Login**
4. Enable **Web OAuth Login**

#### **Step 3: Set Permissions**
1. Go to **Facebook Login** → **Permissions and Features**
2. Add these permissions:
   ```
   ads_read
   ads_management
   read_insights
   pages_read_engagement
   business_management
   pages_show_list
   ```

#### **Step 4: Configure Advanced Settings**
1. Go to **Settings** → **Advanced**
2. Enable:
   - ✅ **App Secret Proof for Server API calls**
   - ✅ **Client OAuth Login**
   - ✅ **Web OAuth Login**
   - ✅ **Enforce HTTPS** (production)

#### **Step 5: Set App Domains**
1. Go to **Settings** → **Basic**
2. Add **App Domains**:
   ```
   Development: localhost
   Production: your-domain.com
   ```

### **6. Permission Request Flow**

#### **During Facebook Login:**
```javascript
// Request these permissions during OAuth
scope: 'ads_read,ads_management,read_insights,pages_read_engagement,business_management'
```

#### **User Experience:**
1. User clicks "Connect with Facebook"
2. Facebook shows permission request dialog
3. User grants permissions
4. App receives access token with requested permissions

### **7. API Endpoints You'll Use**

#### **Authentication:**
- `GET /me` - Get user info
- `GET /me/adaccounts` - List ad accounts

#### **Campaign Data:**
- `GET /{ad_account_id}/campaigns` - Get campaigns
- `GET /{ad_account_id}/insights` - Get performance data
- `GET /{ad_account_id}/adsets` - Get ad sets
- `GET /{ad_account_id}/ads` - Get individual ads

#### **Account Management:**
- `GET /me/businesses` - Get business accounts
- `GET /me/pages` - Get managed pages

### **8. Testing Your Permissions**

#### **Test Script:**
```bash
npm run test:facebook
```

#### **Expected Results:**
- ✅ User info retrieved
- ✅ Ad accounts listed
- ✅ Campaign data fetched
- ✅ Insights data accessed

### **9. Production Checklist**

#### **Before Going Live:**
- ✅ All permissions added to app
- ✅ OAuth redirect URIs configured
- ✅ App domains set for production
- ✅ HTTPS enforced
- ✅ Privacy policy and terms of service URLs set
- ✅ App reviewed and approved by Facebook

#### **Security Settings:**
- ✅ App Secret Proof enabled
- ✅ HTTPS enforcement enabled
- ✅ Valid OAuth redirect URIs configured
- ✅ Rate limiting configured

### **10. Troubleshooting Common Issues**

#### **"Permission denied" errors:**
- ✅ Ensure permissions are added to your app
- ✅ Request permissions during OAuth flow
- ✅ Verify app is properly configured

#### **"Invalid redirect URI" errors:**
- ✅ Add correct OAuth redirect URIs
- ✅ Use HTTPS for production
- ✅ Match exact URI format

#### **"App not configured" errors:**
- ✅ Verify App ID in environment variables
- ✅ Check app is properly set up
- ✅ Ensure app is in correct mode (development/live)

### **11. Rate Limiting Considerations**

#### **API Limits:**
- **200 calls per user per hour** (default)
- **Higher limits** with Standard Access
- **Monitor usage** in app dashboard

#### **Best Practices:**
- Implement caching to reduce API calls
- Use batch requests when possible
- Handle rate limit errors gracefully
- Monitor API usage regularly

---

## **Quick Setup Commands:**

```bash
# Test your Facebook integration
npm run test:facebook

# Setup helper
npm run setup:facebook

# Check app status
npm run dev
```

## **Next Steps:**

1. **Configure your Facebook App** with all permissions listed above
2. **Test the integration** using the provided scripts
3. **Monitor API usage** in your Facebook App Dashboard
4. **Submit for review** once everything is working
5. **Deploy to production** with proper security settings

---

**Need Help?**
- Check the test script output for specific errors
- Verify all permissions are properly configured
- Monitor API usage in Facebook dashboard
- Ensure proper error handling in your app 