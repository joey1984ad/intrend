# Facebook SDK HTTPS Fix Guide

## 🚨 **Root Cause: HTTPS Requirement**

The error "FB.login() called before FB.init()" is actually caused by **Facebook SDK requiring HTTPS** for authentication methods. Here's why:

### **Facebook SDK HTTPS Requirements:**
- ✅ **`FB.init()`** - Works on HTTP (but not recommended)
- ✅ **Basic SDK loading** - Works on HTTP
- ❌ **`FB.getLoginStatus()`** - **REQUIRES HTTPS**
- ❌ **`FB.login()`** - **REQUIRES HTTPS**
- ❌ **`FB.api()`** - **REQUIRES HTTPS**

## 🔧 **Solution: Use HTTPS for Development**

### **Step 1: Start HTTPS Development Server**

```bash
# Stop your current HTTP server (Ctrl+C)
# Then run:
npm run dev:https
```

This will start your app on `https://localhost:3000`

### **Step 2: Access Your App via HTTPS**

Open your browser and go to:
```
https://localhost:3000
```

**Note:** You'll see a "Not Secure" warning - this is normal for localhost HTTPS.

### **Step 3: Accept the Security Warning**

1. Click **"Advanced"**
2. Click **"Proceed to localhost (unsafe)"**
3. Your app will load with HTTPS

## 🔍 **Why This Happens**

### **Facebook Security Policy:**
Facebook blocks sensitive authentication methods on HTTP connections to prevent:
- Man-in-the-middle attacks
- Token interception
- Unauthorized access

### **Development vs Production:**
- **Development (localhost)**: Can use HTTP but Facebook SDK methods fail
- **Production**: Must use HTTPS (Facebook enforces this)

## ✅ **Your Setup is Already Configured**

### **Next.js Configuration:**
```javascript
// next.config.js
const nextConfig = {
  server: {
    https: true, // HTTPS enabled
  },
  // ... other config
};
```

### **Package.json Scripts:**
```json
{
  "scripts": {
    "dev:https": "next dev --experimental-https",
    "dev": "next dev --experimental-https"
  }
}
```

## 🧪 **Testing the Fix**

### **1. Start HTTPS Server:**
```bash
npm run dev:https
```

### **2. Check Console Logs:**
You should see:
```
🔍 FacebookLogin: Is HTTPS? true
🔍 FacebookLogin: Protocol = https:
🔵 FacebookLogin: Protocol: HTTPS ✅
```

### **3. Test Facebook Login:**
- Go to `https://localhost:3000`
- Click "Connect with Facebook"
- Should work without "FB.login() called before FB.init()" error

## 🚨 **Common Issues & Solutions**

### **Issue: "Not Secure" Warning**
**Solution:** This is normal for localhost HTTPS. Click "Advanced" → "Proceed to localhost (unsafe)"

### **Issue: Port Already in Use**
**Solution:** 
```bash
# Kill existing process
npx kill-port 3000
# Then restart
npm run dev:https
```

### **Issue: HTTPS Not Working**
**Solution:** Check your Next.js config and ensure `https: true` is set

### **Issue: Facebook App Not Configured**
**Solution:** Ensure your Facebook App has `localhost` in App Domains and OAuth redirect URIs

## 🔒 **Production HTTPS**

### **Vercel/Netlify:**
- Automatically provides HTTPS
- No configuration needed
- Facebook SDK will work out of the box

### **Custom Domain:**
- Purchase SSL certificate
- Configure your web server
- Update Facebook App settings with your domain

## 📱 **Alternative Solutions**

### **1. ngrok (Temporary HTTPS):**
```bash
# Install ngrok
npm install -g ngrok

# Start your HTTP server
npm run dev

# In another terminal, create HTTPS tunnel
ngrok http 3000
```

### **2. localtunnel:**
```bash
# Install localtunnel
npm install -g localtunnel

# Start your HTTP server
npm run dev

# In another terminal, create HTTPS tunnel
npx localtunnel --port 3000
```

## 🎯 **Quick Fix Summary**

1. **Stop HTTP server** (Ctrl+C)
2. **Run:** `npm run dev:https`
3. **Open:** `https://localhost:3000`
4. **Accept security warning**
5. **Test Facebook login** - should work!

## 🔍 **Debug Steps**

### **Check HTTPS Status:**
```javascript
// In browser console
console.log('Protocol:', window.location.protocol);
console.log('Is HTTPS:', window.location.protocol === 'https:');
```

### **Check Facebook SDK:**
```javascript
// In browser console
console.log('FB object:', window.FB);
console.log('FB.init available:', typeof window.FB?.init === 'function');
console.log('FB.login available:', typeof window.FB?.login === 'function');
```

### **Check Environment:**
```bash
# In terminal
echo $NODE_ENV
npm run dev:https
```

## ✅ **Expected Result**

After implementing HTTPS:
- ✅ Facebook SDK loads properly
- ✅ `FB.init()` completes successfully
- ✅ `FB.getLoginStatus()` works without errors
- ✅ `FB.login()` works without "called before FB.init()" error
- ✅ Facebook authentication completes successfully

## 🚀 **Next Steps**

1. **Test with HTTPS:** `npm run dev:https`
2. **Verify Facebook login works**
3. **Check console logs for HTTPS confirmation**
4. **Deploy to production** (which has HTTPS by default)

---

**The key insight:** Facebook SDK requires HTTPS for authentication methods. Your setup was correct, but you need to access it via `https://localhost:3000` instead of `http://localhost:3000`.
