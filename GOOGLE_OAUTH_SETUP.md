# Google OAuth Setup Guide

## 🚀 Complete Google OAuth Integration

This guide will help you set up real Google OAuth authentication for your Intrend dashboard.

## **Step 1: Create Google OAuth Credentials**

### **1.1 Go to Google Cloud Console**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. **Create a new project** or select an existing one
3. **Enable APIs**:
   - Go to "APIs & Services" → "Library"
   - Search for and enable:
     - **Google+ API** (or Google Identity API)
     - **Google OAuth2 API**

### **1.2 Create OAuth 2.0 Credentials**
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. **Configure OAuth consent screen**:
   - **User Type**: External
   - **App name**: "Intrend Dashboard"
   - **User support email**: Your email
   - **Developer contact information**: Your email
   - **Scopes**: Add `openid`, `email`, `profile`

### **1.3 Configure OAuth Client**
1. **Application type**: Web application
2. **Name**: "Intrend Dashboard Web Client"
3. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/google/callback
   https://your-production-domain.com/api/auth/google/callback
   ```
4. Click **"Create"**

### **1.4 Copy Your Credentials**
- **Client ID**: Copy this (you'll need it)
- **Client Secret**: Copy this (you'll need it)

## **Step 2: Update Environment Variables**

### **2.1 Update .env.local**
Replace the placeholder values in your `.env.local` file:

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here_32_characters_minimum
```

### **2.2 Generate NEXTAUTH_SECRET**
Generate a random secret for NextAuth:

```bash
# Option 1: Use openssl
openssl rand -base64 32

# Option 2: Use node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## **Step 3: Test Your Setup**

### **3.1 Restart Development Server**
```bash
npm run dev
```

### **3.2 Test Google Login**
1. Go to `http://localhost:3000/login`
2. Click **"Continue with Google"**
3. You should be redirected to Google's OAuth consent screen
4. Complete the authentication flow
5. You should be redirected back to your dashboard

## **Step 4: Production Deployment**

### **4.1 Update Production Environment Variables**
In your Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_production_client_id
   GOOGLE_CLIENT_SECRET=your_production_client_secret
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your_production_secret
   ```

### **4.2 Update Google OAuth Redirect URIs**
In Google Cloud Console:
1. Add your production domain to **Authorized redirect URIs**:
   ```
   https://your-domain.com/api/auth/google/callback
   ```

## **Troubleshooting**

### **Common Issues:**

#### **"Google OAuth not configured" Error**
- ✅ Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- ✅ Verify the value is not the placeholder text
- ✅ Restart your development server after changes

#### **"Invalid redirect URI" Error**
- ✅ Check that your redirect URI matches exactly in Google Cloud Console
- ✅ Include the full path: `/api/auth/google/callback`
- ✅ No trailing slashes unless specifically needed

#### **"OAuth not configured" Error**
- ✅ Check that both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- ✅ Verify neither contains placeholder text
- ✅ Ensure `NEXTAUTH_URL` is set correctly

#### **"Client ID not found" Error**
- ✅ Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- ✅ Check that the variable name is exactly correct
- ✅ Restart development server after changes

### **Debug Steps:**
1. **Check browser console** for error messages
2. **Check terminal logs** for server-side errors
3. **Verify environment variables** are loaded correctly
4. **Check Google Cloud Console** for correct redirect URIs

## **Security Best Practices**

### **✅ Do:**
- Use HTTPS in production
- Keep client secret secure (never expose in frontend)
- Use strong NEXTAUTH_SECRET
- Implement proper session management
- Add rate limiting to OAuth endpoints

### **❌ Don't:**
- Commit `.env.local` to version control
- Expose client secret in frontend code
- Use weak secrets
- Skip HTTPS in production

## **Code Implementation Details**

### **Frontend (Login/Signup Pages):**
- Real Google OAuth redirect implementation
- Proper error handling and user feedback
- Loading states during authentication

### **Backend (API Routes):**
- Secure token exchange with Google
- User data retrieval and validation
- Proper error handling and logging
- Environment variable validation

### **OAuth Flow:**
1. User clicks "Continue with Google"
2. Redirect to Google OAuth consent screen
3. User authorizes your app
4. Google redirects back with authorization code
5. Your server exchanges code for access token
6. Fetch user information from Google
7. Create/update user in your system
8. Redirect to dashboard

## **Next Steps**

After completing this setup:
1. **Test the complete OAuth flow**
2. **Implement user session management**
3. **Add user database integration**
4. **Implement logout functionality**
5. **Add user profile management**

---

## **Quick Reference**

### **Required Environment Variables:**
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret
```

### **Google Cloud Console Settings:**
- **Application Type**: Web application
- **Redirect URIs**: Include `/api/auth/google/callback`
- **Scopes**: `openid email profile`

### **Test URLs:**
- **Development**: `http://localhost:3000/api/auth/google/callback`
- **Production**: `https://your-domain.com/api/auth/google/callback`

---

**🎉 Congratulations!** You now have real Google OAuth authentication working in your Intrend dashboard!
