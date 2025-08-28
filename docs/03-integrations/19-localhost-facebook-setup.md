# Localhost Facebook SDK Setup Guide

## 🚀 Quick Setup for Localhost Development

### **Step 1: Create Environment File**

Create a `.env.local` file in your project root:

```bash
# Facebook App Configuration for Localhost Development
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=localhost
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Step 2: Facebook App Dashboard Configuration**

#### **2.1 Add Localhost to App Domains**
1. Go to your [Facebook App Dashboard](https://developers.facebook.com/)
2. Select your app
3. Go to **Settings** → **Basic**
4. Add `localhost` to **App Domains**

#### **2.2 Add Website Platform**
1. Go to **Add Platform** → **Website**
2. Add **Site URL**: `http://localhost:3000`
3. Save changes

#### **2.3 Configure Facebook Login**
1. Go to **Products** → **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000
   http://localhost:3000/
   ```
3. Enable **Client OAuth Login**
4. Enable **Web OAuth Login**
5. **Disable** "Enforce HTTPS" (for localhost development)

#### **2.4 Set Required Permissions**
Go to **Facebook Login** → **Permissions and Features** and add:
- ✅ `ads_read`
- ✅ `ads_management`
- ✅ `read_insights`
- ✅ `pages_read_engagement`
- ✅ `business_management`
- ✅ `pages_show_list`

### **Step 3: Update Your Facebook App Settings**

#### **3.1 App Status**
- Set your app to **Development Mode**
- Add yourself as a **Developer** or **Admin**

#### **3.2 Test Users (Optional)**
1. Go to **Roles** → **Test Users**
2. Create a test user for development
3. Use test user for Facebook Login testing

### **Step 4: Get Your App Credentials**

#### **4.1 App ID and Secret**
1. Go to **Settings** → **Basic**
2. Copy your **App ID**
3. Copy your **App Secret**

#### **4.2 Update .env.local**
Replace the placeholders in your `.env.local` file:
```bash
NEXT_PUBLIC_FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abcdef123456789abcdef123456789ab
```

### **Step 5: Test Your Configuration**

#### **5.1 Start Development Server**
```bash
npm run dev
```

#### **5.2 Access Your App**
Go to: **http://localhost:3000**

#### **5.3 Test Facebook Login**
1. Click "Connect with Facebook"
2. Complete OAuth flow
3. Grant permissions
4. Select ad account
5. Load real data

### **Step 6: Troubleshooting Common Issues**

#### **6.1 "App not configured" Error**
- ✅ Check App ID in `.env.local`
- ✅ Verify app is in Development mode
- ✅ Ensure you're added as developer/admin

#### **6.2 "Invalid redirect URI" Error**
- ✅ Add `http://localhost:3000` to Valid OAuth Redirect URIs
- ✅ Check for trailing slashes
- ✅ Ensure exact match

#### **6.3 "Permission denied" Error**
- ✅ Add required permissions to app
- ✅ Request permissions during OAuth
- ✅ Verify app configuration

#### **6.4 "HTTPS required" Error**
- ✅ Disable "Enforce HTTPS" for localhost
- ✅ Use HTTP for localhost development
- ✅ Enable HTTPS only for production

### **Step 7: Production vs Development**

#### **Development (Localhost)**
```bash
# .env.local
NEXT_PUBLIC_FACEBOOK_APP_ID=your_dev_app_id
FACEBOOK_APP_SECRET=your_dev_app_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### **Production**
```bash
# .env.production
NEXT_PUBLIC_FACEBOOK_APP_ID=your_prod_app_id
FACEBOOK_APP_SECRET=your_prod_app_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### **Step 8: Security Best Practices**

#### **8.1 Environment Variables**
- ✅ Never commit `.env.local` to git
- ✅ Use different app IDs for dev/prod
- ✅ Keep app secrets secure

#### **8.2 HTTPS for Production**
- ✅ Enable HTTPS enforcement in production
- ✅ Use valid SSL certificates
- ✅ Configure proper redirect URIs

#### **8.3 App Secret Protection**
- ✅ Never expose app secret in client code
- ✅ Use server-side API calls
- ✅ Validate tokens server-side

### **Step 9: Testing Checklist**

#### **9.1 Basic Functionality**
- [ ] App loads without errors
- [ ] Facebook SDK loads properly
- [ ] Login button appears
- [ ] OAuth flow completes
- [ ] Permissions granted
- [ ] Ad accounts loaded
- [ ] Data displays correctly

#### **9.2 Error Handling**
- [ ] Invalid credentials handled
- [ ] Network errors handled
- [ ] Permission errors handled
- [ ] User-friendly error messages

#### **9.3 Security**
- [ ] App secret not exposed
- [ ] Tokens handled securely
- [ ] HTTPS enforced in production
- [ ] Proper validation implemented

### **Step 10: Advanced Configuration**

#### **10.1 Multiple Environments**
```bash
# Development
NEXT_PUBLIC_FACEBOOK_APP_ID=dev_app_id
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Staging
NEXT_PUBLIC_FACEBOOK_APP_ID=staging_app_id
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com

# Production
NEXT_PUBLIC_FACEBOOK_APP_ID=prod_app_id
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### **10.2 Custom Domains**
If using custom localhost domains:
```bash
# Add to Facebook App settings
http://myapp.local:3000
http://localhost:3000
```

### **Quick Reference**

#### **Essential Settings for Localhost:**
```
✅ App Domains: localhost
✅ Site URL: http://localhost:3000
✅ Valid OAuth Redirect URIs: http://localhost:3000
✅ Client OAuth Login: ENABLED
✅ Web OAuth Login: ENABLED
❌ Enforce HTTPS: DISABLED (for localhost)
```

#### **Required Permissions:**
```
✅ ads_read
✅ ads_management
✅ read_insights
✅ pages_read_engagement
✅ business_management
✅ pages_show_list
```

#### **Environment Variables:**
```bash
NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

---

## **🚀 Ready to Test!**

After completing this setup:

1. **Start your server:** `npm run dev`
2. **Access your app:** http://localhost:3003
3. **Test Facebook Login:** Click "Connect with Facebook"
4. **Verify functionality:** Complete OAuth and load ad data

If you encounter any issues, check the troubleshooting section above or refer to the detailed Facebook setup guides in your project. 