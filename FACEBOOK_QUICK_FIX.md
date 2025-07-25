# Facebook Integration Quick Fix

## 🚨 Current Issues Found:

1. **Missing Facebook App ID** - Using placeholder `your_facebook_app_id_here`
2. **HTTPS Requirement** - Facebook blocks `getLoginStatus` on HTTP
3. **Environment Variables** - Not configured

## 🔧 Quick Fix Steps:

### Step 1: Create Facebook App (5 minutes)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose **"Business"** as app type
4. Fill in:
   - **App Name**: "Agency Dashboard"
   - **Contact Email**: Your email
5. Click "Create App"

### Step 2: Configure Facebook App

1. **Add Marketing API Product:**
   - Go to "Add Products"
   - Find "Marketing API" → "Set Up"

2. **Configure Facebook Login:**
   - Go to "Products" → "Facebook Login" → "Settings"
   - Add **Valid OAuth Redirect URIs**:
     ```
     https://localhost:3000
     http://localhost:3000
     ```

3. **Add Required Permissions:**
   - Go to "Facebook Login" → "Permissions and Features"
   - Add these permissions:
     - `ads_read`
     - `ads_management` 
     - `read_insights`
     - `pages_read_engagement`
     - `business_management`
     - `pages_show_list`

### Step 3: Get Your App Credentials

1. Go to **Settings** → **Basic**
2. Copy your **App ID** (you'll need this)

### Step 4: Set Environment Variables

Create a `.env.local` file in your project root:

```bash
# Facebook App Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID=YOUR_ACTUAL_APP_ID_HERE
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Development settings
NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=localhost
```

**Replace `YOUR_ACTUAL_APP_ID_HERE` with your real Facebook App ID**

### Step 5: Run with HTTPS

```bash
npm run dev-https
```

This will start your app on `https://localhost:3000`

### Step 6: Test the Integration

1. Go to `https://localhost:3000`
2. Click "Connect Account"
3. Click "Connect with Facebook"
4. Authorize your app
5. You should now see your ad accounts!

## 🔍 Debug Console Logs

After fixing the App ID, you should see these logs:

```
✅ FacebookLogin: FB initialized with appId: YOUR_REAL_APP_ID
✅ FacebookLogin: Login successful, calling onSuccess...
✅ MetaDashboard: Successfully fetched ad accounts: [...]
```

## 🚨 Common Issues:

### "App not configured"
- Check your App ID in `.env.local`
- Make sure you're using the correct App ID

### "Invalid redirect URI"
- Add both `http://localhost:3000` and `https://localhost:3000` to OAuth redirect URIs

### "Insufficient permissions"
- Make sure all required permissions are added to your Facebook app

### "getLoginStatus can no longer be called from http pages"
- Use `npm run dev-https` to run with HTTPS

## 📞 Need Help?

1. Check the console logs (F12 → Console)
2. Verify your Facebook App settings
3. Make sure you're using HTTPS (`https://localhost:3000`)
4. Ensure your App ID is correctly set in `.env.local` 