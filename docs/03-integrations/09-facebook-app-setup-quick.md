# Quick Facebook App Setup for Localhost

## 🚀 Get Your Facebook App ID and Secret

### **Step 1: Create/Find Your Facebook App**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** in the top navigation
3. Either:
   - **Create a new app** (if you don't have one)
   - **Select your existing app** (if you already have one)

### **Step 2: Get Your App Credentials**

1. In your app dashboard, go to **Settings** → **Basic**
2. Copy your **App ID** (it's a long number like `123456789012345`)
3. Copy your **App Secret** (click "Show" to reveal it)

### **Step 3: Update Your .env.local File**

Replace the placeholder values in your `.env.local` file:

```bash
# Replace these lines in .env.local:
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# With your actual values:
NEXT_PUBLIC_FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abcdef123456789abcdef123456789ab
```

### **Step 4: Configure Your Facebook App**

1. **Add Website Platform:**
   - Go to **Add Platform** → **Website**
   - Add Site URL: `http://localhost:3000`

2. **Configure Facebook Login:**
   - Go to **Products** → **Facebook Login** → **Settings**
   - Add Valid OAuth Redirect URIs: `http://localhost:3000`
   - Enable **Client OAuth Login**
   - Enable **Web OAuth Login**

3. **Add Required Permissions:**
   - Go to **Facebook Login** → **Permissions and Features**
   - Add these permissions:
     - `ads_read`
     - `ads_management`
     - `read_insights`
     - `pages_read_engagement`
     - `business_management`
     - `pages_show_list`

### **Step 5: Test Your Setup**

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Go to your app:** http://localhost:3000

3. **Test Facebook Login:**
   - Click "Connect with Facebook"
   - The SDK should load properly now
   - Complete the OAuth flow

### **Troubleshooting**

#### **If you still see "Loading Facebook SDK...":**
- ✅ Check that your App ID is correct (not a placeholder)
- ✅ Verify your app is in Development mode
- ✅ Make sure you're added as a developer/admin
- ✅ Check browser console for errors

#### **If you get "App not configured" error:**
- ✅ Verify App ID matches your Facebook app
- ✅ Check that your app is in Development mode
- ✅ Ensure you're added as developer/admin

#### **If you get "Invalid redirect URI" error:**
- ✅ Add `http://localhost:3000` to Valid OAuth Redirect URIs
- ✅ Check for exact match (no trailing slashes unless needed)

### **Example .env.local File**

Your `.env.local` should look like this:

```bash
# Facebook App Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abcdef123456789abcdef123456789ab

# Your existing database configuration...
DATABASE_URL=postgres://neondb_owner:...
# ... rest of your existing config
```

### **Quick Test**

After updating your `.env.local`, restart your server and check the browser console. You should see:
```
🔵 FacebookLogin: Facebook SDK loaded successfully
🔵 FacebookLogin: fbAsyncInit called, initializing FB...
🔵 FacebookLogin: FB initialized with appId: 123456789012345
```

If you see these logs, your Facebook SDK is working correctly! 