# Facebook Permissions Quick Reference

## 🎯 Essential Permissions for Your Agency Dashboard

### **Core Permissions (Required)**

| Permission | Purpose | Required |
|------------|---------|----------|
| `ads_read` | Read campaign data and metrics | ✅ **YES** |
| `ads_management` | Manage campaigns and settings | ✅ **YES** |
| `read_insights` | Access performance analytics | ✅ **YES** |

### **Additional Permissions (Recommended)**

| Permission | Purpose | Required |
|------------|---------|----------|
| `pages_read_engagement` | Read page engagement data | ✅ **YES** |
| `business_management` | Access business accounts | ✅ **YES** |
| `pages_show_list` | List managed pages | ✅ **YES** |

## 🚀 Quick Setup Steps

### **1. Add Products to Your App**
```
✅ Facebook Login
✅ Marketing API
```

### **2. Configure OAuth Redirect URIs**
```
Development: http://localhost:3000
Production: https://your-domain.com
```

### **3. Enable Advanced Settings**
```
✅ App Secret Proof for Server API calls
✅ Client OAuth Login
✅ Web OAuth Login
✅ Enforce HTTPS (production)
```

### **4. Request Permissions in Code**
```javascript
scope: 'ads_read,ads_management,read_insights,pages_read_engagement,business_management,pages_show_list'
```

## 📋 Complete Checklist

### **App Settings**
- [ ] App ID configured
- [ ] App Secret configured
- [ ] App domains set
- [ ] Privacy policy URL added
- [ ] Terms of service URL added

### **Facebook Login**
- [ ] Product added
- [ ] OAuth redirect URIs configured
- [ ] Client OAuth Login enabled
- [ ] Web OAuth Login enabled

### **Marketing API**
- [ ] Product added
- [ ] API settings configured
- [ ] Rate limiting set up

### **Permissions**
- [ ] `ads_read` added
- [ ] `ads_management` added
- [ ] `read_insights` added
- [ ] `pages_read_engagement` added
- [ ] `business_management` added
- [ ] `pages_show_list` added

### **Advanced Settings**
- [ ] App Secret Proof enabled
- [ ] HTTPS enforcement enabled
- [ ] Error handling configured

## 🧪 Test Your Setup

```bash
# Run the test script
npm run test:facebook

# Expected output:
✅ User info retrieved
✅ Ad accounts listed
✅ Campaign data fetched
✅ Insights data accessed
```

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Permission denied" | Add permissions to app settings |
| "Invalid redirect URI" | Check OAuth redirect URIs |
| "App not configured" | Verify App ID in environment |
| "Rate limit exceeded" | Implement caching and batching |

## 📊 API Endpoints You'll Use

### **Authentication**
- `GET /me` - Get user info
- `GET /me/adaccounts` - List ad accounts

### **Campaign Data**
- `GET /{ad_account_id}/campaigns` - Get campaigns
- `GET /{ad_account_id}/insights` - Get performance data
- `GET /{ad_account_id}/adsets` - Get ad sets
- `GET /{ad_account_id}/ads` - Get individual ads

### **Account Management**
- `GET /me/businesses` - Get business accounts
- `GET /me/pages` - Get managed pages

## 🎯 Success Criteria

Your app will be approved when:
- ✅ **All permissions** are properly configured
- ✅ **OAuth flow** works correctly
- ✅ **API calls** are successful
- ✅ **Error rate** is low (< 5%)
- ✅ **Rate limits** are respected

## 📞 Need Help?

1. **Check test script output** for specific errors
2. **Verify permissions** in Facebook App Dashboard
3. **Monitor API usage** in Analytics section
4. **Review error logs** for troubleshooting

## 🔄 What Happens After Login

### **Immediate Actions:**
1. ✅ **User authenticated** - Facebook returns access token
2. ✅ **Token verified** - Server validates the token
3. ✅ **Ad accounts fetched** - Get user's Facebook ad accounts
4. ✅ **Success notification** - Show connection success message
5. ✅ **Auto-load data** - Automatically fetch campaign data for first account

### **Dashboard Updates:**
1. ✅ **Real campaign data** - Replace sample data with Facebook data
2. ✅ **Updated metrics** - Calculate real performance metrics
3. ✅ **Success notifications** - Show data loading confirmation
4. ✅ **Account selection** - Allow user to choose different ad accounts

### **User Experience:**
- ✅ **Visual feedback** - Loading states and success messages
- ✅ **Error handling** - Clear error messages if something fails
- ✅ **Data persistence** - Keep connection state across sessions
- ✅ **Account switching** - Easy switching between ad accounts

---

**Remember:** Run `npm run test:facebook` daily for 15 days to build up successful API calls before re-submitting for review! 