# HTTPS Setup Guide for Facebook SDK

## 🚨 **Problem: HTTPS Keys Not Correctly Configured**

Your current `next.config.js` has `https: true` but Next.js needs proper SSL certificates for this to work. Here are the solutions:

## 🔧 **Solution 1: Use Next.js Built-in HTTPS (Simplest)**

### **Updated next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  
  // HTTPS configuration for local development
  // Next.js will generate self-signed certificates automatically
  server: {
    https: true,
  },
  
  // Handle HTTPS redirects
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        permanent: true,
        destination: 'https://:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

### **Test it:**
```bash
npm run dev:https
# Open https://localhost:3000
```

## 🚀 **Solution 2: Use ngrok (Most Reliable)**

### **Setup ngrok:**
```bash
# Run setup script
npm run setup:ngrok

# Or install manually
npm install -g ngrok
```

### **Usage:**
```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Create HTTPS tunnel
npm run tunnel:ngrok
# or
ngrok http 3000
```

### **Result:**
You'll get a URL like `https://abc123.ngrok.io` - use this to test Facebook SDK!

## 🌐 **Solution 3: Use localtunnel (No Installation)**

### **Setup:**
```bash
npm run setup:localtunnel
```

### **Usage:**
```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Create HTTPS tunnel
npm run tunnel:localtunnel
# or
npx localtunnel --port 3000
```

### **Result:**
You'll get a URL like `https://abc123.loca.lt` - use this to test Facebook SDK!

## 📋 **Step-by-Step Testing**

### **Step 1: Choose Your HTTPS Method**
- **Option A:** Next.js built-in HTTPS (`npm run dev:https`)
- **Option B:** ngrok tunneling (`npm run tunnel:ngrok`)
- **Option C:** localtunnel (`npm run tunnel:localtunnel`)

### **Step 2: Start Your App**
```bash
# For built-in HTTPS
npm run dev:https

# For tunneling (start in separate terminal)
npm run dev
```

### **Step 3: Create HTTPS Tunnel (if using tunneling)**
```bash
# In another terminal
npm run tunnel:ngrok
# or
npm run tunnel:localtunnel
```

### **Step 4: Test Facebook SDK**
- Use the HTTPS URL provided
- Facebook SDK should work without "FB.login() called before FB.init()" error

## 🔍 **Troubleshooting**

### **Issue: "Port already in use"**
```bash
# Kill existing process
npx kill-port 3000
# Then restart
npm run dev:https
```

### **Issue: "Not Secure" warning (built-in HTTPS)**
- This is normal for localhost HTTPS
- Click "Advanced" → "Proceed to localhost (unsafe)"

### **Issue: ngrok/localtunnel not working**
- Ensure your app is running on port 3000
- Check firewall settings
- Try a different port if needed

### **Issue: Facebook SDK still not working**
- Verify you're using an HTTPS URL
- Check browser console for protocol confirmation
- Ensure Facebook App is configured for your domain

## ✅ **Expected Results**

### **With Built-in HTTPS:**
```
🔍 FacebookLogin: Is HTTPS? true
🔍 FacebookLogin: Protocol = https:
🔵 FacebookLogin: Protocol: HTTPS ✅
```

### **With Tunneling:**
- Real HTTPS certificate (no browser warnings)
- Public URL for testing
- Facebook SDK works perfectly

## 🎯 **Recommended Approach**

### **For Quick Testing:**
1. Try `npm run dev:https` first
2. If that doesn't work, use `npm run tunnel:localtunnel`

### **For Reliable Testing:**
1. Use `npm run tunnel:ngrok` (most stable)
2. Keep the tunnel terminal open
3. Use the provided HTTPS URL

## 🚀 **Quick Start Commands**

```bash
# Option 1: Built-in HTTPS
npm run dev:https

# Option 2: ngrok tunneling
npm run dev & npm run tunnel:ngrok

# Option 3: localtunnel
npm run dev & npm run tunnel:localtunnel
```

## 🔒 **Why This Fixes Facebook SDK**

- **Facebook requires HTTPS** for authentication methods
- **`getLoginStatus()`** fails on HTTP
- **`FB.login()`** fails on HTTP
- **HTTPS provides secure connection** that Facebook allows
- **Tunneling services** provide real SSL certificates

---

**Choose the solution that works best for you. The tunneling options (ngrok/localtunnel) are most reliable for Facebook SDK testing.**
