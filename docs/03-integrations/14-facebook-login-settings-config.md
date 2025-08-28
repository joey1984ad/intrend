# Facebook Login Settings Configuration

## **Required Settings for Agency Dashboard**

### **1. Client OAuth Settings**

#### **✅ Enable These Settings:**
```
✅ Client OAuth login: ENABLED
   - Enables the standard OAuth client token flow
   - Required for web-based authentication

✅ Web OAuth login: ENABLED
   - Enables web-based Client OAuth Login
   - Required for browser-based login

✅ Enforce HTTPS: ENABLED
   - Enforce the use of HTTPS for Redirect URIs
   - Strongly recommended for security
   - Required for production

✅ Use Strict Mode for redirect URIs: ENABLED
   - Only allow redirects that exactly match Valid OAuth Redirect URIs
   - Strongly recommended for security
   - Prevents unauthorized redirects
```

#### **❌ Disable These Settings:**
```
❌ Force Web OAuth reauthentication: DISABLED
   - Not needed for your use case
   - Would require users to enter password every time

❌ Login from Devices: DISABLED
   - Not needed for web application
   - Only for smart TVs and devices

❌ Login Connect with Messenger: DISABLED
   - Not needed for your dashboard
   - Only for Messenger integration
```

### **2. Valid OAuth Redirect URIs**

#### **Add These Exact URIs:**
```
http://localhost:3000
https://agency-dashboard.vercel.app
```

**Important Notes:**
- URIs must match exactly (including protocol, domain, and path)
- No trailing slashes unless specifically needed
- Case-sensitive
- Must be valid URLs

### **3. Allowed Domains for JavaScript SDK**

#### **Add These Domains:**
```
localhost
agency-dashboard.vercel.app
```

**Purpose:**
- Restricts where the JavaScript SDK can be used
- Prevents unauthorized domain usage
- Security measure

### **4. Optional Settings (Recommended)**

#### **✅ Enable These:**
```
✅ Login with the JavaScript SDK: ENABLED
   - Enables Login and signed-in functionality
   - Required for your React/Next.js app

✅ Embedded Browser OAuth Login: ENABLED
   - Enable webview Redirect URIs
   - Useful for mobile webviews
   - Better user experience on mobile
```

### **5. Callback URLs (Optional)**

#### **Deauthorize Callback URL:**
```
https://agency-dashboard.vercel.app/api/facebook/deauthorize
```
*Purpose: Notify your app when user deauthorizes*

#### **Data Deletion Request URL:**
```
https://agency-dashboard.vercel.app/api/facebook/data-deletion
```
*Purpose: Handle data deletion requests*

## **Step-by-Step Configuration**

### **Step 1: Access Facebook Login Settings**
1. Go to your Facebook App Dashboard
2. Navigate to **Products** → **Facebook Login** → **Settings**

### **Step 2: Configure Client OAuth Settings**
1. **Enable Client OAuth login**
2. **Enable Web OAuth login**
3. **Enable Enforce HTTPS**
4. **Enable Use Strict Mode for redirect URIs**

### **Step 3: Add Valid OAuth Redirect URIs**
1. In the **Valid OAuth Redirect URIs** section
2. Add each URI on a new line:
   ```
   http://localhost:3000
   https://agency-dashboard.vercel.app
   ```

### **Step 4: Configure JavaScript SDK**
1. **Enable Login with the JavaScript SDK**
2. Add **Allowed Domains for the JavaScript SDK**:
   ```
   localhost
   agency-dashboard.vercel.app
   ```

### **Step 5: Optional Settings**
1. **Enable Embedded Browser OAuth Login**
2. **Disable Force Web OAuth reauthentication**
3. **Disable Login from Devices**
4. **Disable Login Connect with Messenger**

## **Security Best Practices**

### **✅ Do Enable:**
- HTTPS enforcement
- Strict mode for redirect URIs
- Allowed domains restriction
- App Secret Proof (in Advanced Settings)

### **❌ Don't Enable:**
- Force reauthentication (unless required)
- Login from devices (not needed)
- Messenger integration (not needed)

## **Testing Your Configuration**

### **Test OAuth Flow:**
1. Go to your app: https://agency-dashboard.vercel.app
2. Click "Connect with Facebook"
3. Verify redirect works properly
4. Check that login completes successfully

### **Common Issues:**

#### **"Invalid redirect URI" Error:**
- ✅ Check URI matches exactly
- ✅ Include protocol (http/https)
- ✅ No extra spaces or characters
- ✅ Case-sensitive matching

#### **"App not configured" Error:**
- ✅ Verify App ID is correct
- ✅ Check app is in correct mode
- ✅ Ensure settings are saved

#### **"Permission denied" Error:**
- ✅ Add required permissions to app
- ✅ Request permissions during OAuth
- ✅ Verify app is properly configured

## **Production Checklist**

### **Before Going Live:**
- ✅ HTTPS enforcement enabled
- ✅ Strict mode enabled
- ✅ Valid redirect URIs configured
- ✅ Allowed domains set
- ✅ App reviewed and approved
- ✅ Error handling implemented

### **Security Settings:**
- ✅ App Secret Proof enabled
- ✅ HTTPS enforcement enabled
- ✅ Strict redirect URI validation
- ✅ Domain restrictions configured

## **Code Implementation**

### **Facebook Login Component:**
```javascript
// In your FacebookLogin component
window.FB.login((response) => {
  // Handle login response
}, {
  scope: 'ads_read,ads_management,read_insights',
  return_scopes: true
});
```

### **OAuth Redirect Handling:**
```javascript
// Handle OAuth redirect
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if (code) {
  // Exchange code for access token
}
```

---

## **Quick Reference**

### **Essential Settings:**
```
✅ Client OAuth login: ENABLED
✅ Web OAuth login: ENABLED
✅ Enforce HTTPS: ENABLED
✅ Use Strict Mode: ENABLED
✅ Login with JavaScript SDK: ENABLED
```

### **Valid Redirect URIs:**
```
http://localhost:3000
https://agency-dashboard.vercel.app
```

### **Allowed Domains:**
```
localhost
agency-dashboard.vercel.app
```

---

**Remember:** Save all settings after making changes, and test the OAuth flow to ensure everything works correctly! 