# HTTPS Localhost Setup Guide

## Overview
This guide will help you set up HTTPS on localhost for secure development with Google OAuth integration.

## Why HTTPS for Localhost?

1. **Google OAuth Requirement**: Google OAuth requires HTTPS for production and recommends it for development
2. **Security**: Prevents man-in-the-middle attacks during development
3. **Production Parity**: Matches production environment more closely
4. **Modern Browser Features**: Some browser APIs require HTTPS

## Your Project Configuration

Your project is already configured with HTTPS support in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --experimental-https --port 3000",
    "dev-https": "next dev --experimental-https"
  }
}
```

## Quick Start

### Option 1: Use Existing HTTPS Support (Recommended)
```bash
# Start with HTTPS enabled
npm run dev

# Or explicitly use HTTPS
npm run dev-https
```

Your app will be available at:
- **HTTP**: `http://localhost:3000`
- **HTTPS**: `https://localhost:3000`

### Option 2: Custom SSL Certificates (Advanced)

If you want to use custom SSL certificates:

1. **Install mkcert**:
   ```bash
   # Windows (using Chocolatey)
   choco install mkcert
   
   # macOS
   brew install mkcert
   
   # Linux
   sudo apt install mkcert
   ```

2. **Generate certificates**:
   ```bash
   mkcert -install
   mkcert localhost 127.0.0.1 ::1
   ```

3. **Create custom server** (optional):
   ```javascript
   // server.js
   const https = require('https');
   const { parse } = require('url');
   const next = require('next');
   const fs = require('fs');
   
   const dev = process.env.NODE_ENV !== 'production';
   const app = next({ dev });
   const handle = app.getRequestHandler();
   
   const httpsOptions = {
     key: fs.readFileSync('./localhost-key.pem'),
     cert: fs.readFileSync('./localhost.pem')
   };
   
   app.prepare().then(() => {
     https.createServer(httpsOptions, (req, res) => {
       const parsedUrl = parse(req.url, true);
       handle(req, res, parsedUrl);
     }).listen(3000, (err) => {
       if (err) throw err;
       console.log('> Ready on https://localhost:3000');
     });
   });
   ```

## Google OAuth Configuration

### 1. Update Google Cloud Console
Add these redirect URIs to your Google OAuth credentials:

```
https://localhost:3000/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
```

### 2. Environment Variables
Ensure your `.env.local` includes:

```bash
# For HTTPS localhost
NEXTAUTH_URL=https://localhost:3000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Testing HTTPS Setup

### 1. Start Development Server
```bash
npm run dev
```

### 2. Verify HTTPS
- Navigate to `https://localhost:3000`
- Check browser address bar for 🔒 lock icon
- Accept any security warnings (development only)

### 3. Test Google OAuth
1. Go to `/signup` or `/login`
2. Click "Continue with Google"
3. Complete OAuth flow
4. Verify redirect back to dashboard

## Troubleshooting

### Common HTTPS Issues

#### 1. **"Your connection is not private"**
- Click "Advanced" → "Proceed to localhost (unsafe)"
- This is normal for development with self-signed certificates

#### 2. **Google OAuth "Invalid redirect URI"**
- Verify redirect URI in Google Cloud Console includes `https://localhost:3000`
- Check for typos or extra slashes

#### 3. **Mixed Content Warnings**
- Ensure all resources (images, scripts) use HTTPS
- Check for hardcoded HTTP URLs

#### 4. **Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Debug Steps

1. **Check Console Logs**:
   ```bash
   npm run dev
   # Look for HTTPS-related messages
   ```

2. **Verify Certificate**:
   - Open `https://localhost:3000` in browser
   - Click lock icon in address bar
   - Check certificate details

3. **Test OAuth Flow**:
   - Use browser developer tools
   - Check Network tab for OAuth requests
   - Verify redirect URIs match exactly

## Production Considerations

When deploying to production:

1. **Remove `--experimental-https`** flag
2. **Use proper SSL certificates** (Let's Encrypt, etc.)
3. **Update Google OAuth redirect URIs** to production domain
4. **Set `NEXTAUTH_URL`** to production URL

## Security Notes

⚠️ **Development Only**: Self-signed certificates are for development only
⚠️ **Never use in production**: Always use proper SSL certificates in production
⚠️ **Local network**: HTTPS localhost only secures local development

## Next Steps

1. ✅ Start development server with HTTPS: `npm run dev`
2. ✅ Test Google OAuth flow
3. ✅ Verify redirect URIs in Google Cloud Console
4. ✅ Update environment variables if needed

Your project is now ready for secure local development with Google OAuth!
