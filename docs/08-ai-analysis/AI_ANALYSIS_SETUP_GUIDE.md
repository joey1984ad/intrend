# 🤖 AI Analysis Setup Guide

This guide will help you set up the AI analysis feature for your Facebook creatives dashboard.

## 🚀 Quick Start

### 1. Run the Setup Script
```bash
npm run setup:env
```

This will create/update your `.env.local` file with all necessary variables.

### 2. Validate Your Configuration
```bash
npm run validate:env
```

This will check that all required environment variables are properly configured.

### 3. Test the AI Analysis
```bash
npm run test:ai
```

This will test all components of the AI analysis system.

## 📋 Required Environment Variables

### Local Development (.env.local)
```bash
# Facebook App Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_ACCESS_TOKEN=your_access_token
NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=localhost

# Database Configuration
DATABASE_URL=your_database_url

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_blob_token

# n8n Configuration
N8N_HOST=http://localhost:5678
N8N_API_KEY=your_n8n_api_key

# AI Analysis Webhook
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives
```

### Production (.env.production)
```bash
# Facebook App Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID=your_production_app_id
FACEBOOK_APP_SECRET=your_production_app_secret
FACEBOOK_ACCESS_TOKEN=your_production_access_token
NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=your-domain.com

# Database Configuration
DATABASE_URL=your_production_database_url

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_production_blob_token

# n8n Configuration
N8N_HOST=https://your-n8n-domain.com
N8N_API_KEY=your_production_n8n_api_key

# AI Analysis Webhook
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/analyze-creatives

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

## 🔧 Prerequisites

### 1. Facebook App Setup
- [ ] Facebook App created at [developers.facebook.com](https://developers.facebook.com)
- [ ] App ID and App Secret obtained
- [ ] Access token generated with required permissions:
  - `ads_read`
  - `ads_management`
  - `read_insights`
  - `pages_read_engagement`

### 2. n8n Workflow Setup
- [ ] n8n instance running (local or hosted)
- [ ] AI analysis workflow created
- [ ] Webhook endpoint configured
- [ ] Workflow accessible via HTTP/HTTPS

### 3. Database Setup
- [ ] Neon PostgreSQL database configured
- [ ] Database URL with proper credentials
- [ ] AI creative score table created

## 🚀 Installation Steps

### Step 1: Environment Configuration
```bash
# Run the automated setup
npm run setup:env

# Or manually create .env.local with the variables above
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start n8n (Local Development)
```bash
# Install n8n globally if not already installed
npm install -g n8n

# Start n8n
n8n start
```

### Step 4: Start Your Application
```bash
npm run dev
```

## 🧪 Testing

### 1. Environment Validation
```bash
npm run validate:env
```

Expected output:
```
🎉 SUCCESS: All required environment variables are properly configured!
```

### 2. AI Analysis Test
```bash
npm run test:ai
```

Expected output:
```
🎉 SUCCESS: All tests passed!
🚀 Your AI analysis should work properly now.
```

### 3. Manual Testing
1. Open your app in the browser
2. Navigate to the Creatives tab
3. Open a creative detail modal
4. Click the "🤖 AI Analysis" button
5. Check the debug panel for detailed logs

## 🔍 Troubleshooting

### Common Issues

#### 1. "Facebook access token not found"
**Cause:** Missing `NEXT_PUBLIC_N8N_WEBHOOK_URL` in environment
**Solution:** Add the webhook URL to your `.env.local` file

#### 2. "n8n server not running"
**Cause:** n8n instance not started
**Solution:** Start n8n with `n8n start`

#### 3. "Connection refused"
**Cause:** Next.js server not running
**Solution:** Start with `npm run dev`

#### 4. "Invalid webhook URL format"
**Cause:** Malformed webhook URL
**Solution:** Check URL format in `.env.local`

### Debug Steps

1. **Check Environment Variables**
   ```bash
   npm run validate:env
   ```

2. **Test n8n Connectivity**
   ```bash
   npm run test:ai
   ```

3. **Check Browser Console**
   - Open Developer Tools
   - Look for error messages
   - Check Network tab for failed requests

4. **Enable Debug Mode**
   - In the AI Analysis tab, click "Show Debug Panel"
   - Enable debug mode for detailed logging

## 📱 Usage

### 1. Access AI Analysis
- Navigate to any image creative
- Click the "🤖 AI Analysis" button
- Wait for analysis to complete

### 2. View Results
- AI Score (1-10 scale)
- Detailed analysis
- Recommendations
- Generated images (if available)

### 3. Debug Information
- Real-time logs
- Performance metrics
- Error details
- Webhook connectivity status

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` or `.env.production` to version control
- Use different tokens for development and production
- Rotate access tokens regularly

### Facebook Permissions
- Only request necessary permissions
- Use short-lived access tokens in production
- Implement proper token refresh logic

### n8n Security
- Use HTTPS in production
- Implement proper authentication
- Restrict webhook access

## 📚 Additional Resources

- [Facebook Marketing API Documentation](https://developers.facebook.com/docs/marketing-apis/)
- [n8n Documentation](https://docs.n8n.io/)
- [Neon Database Documentation](https://neon.tech/docs)
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run the validation scripts
3. Check the debug panel in your app
4. Review the browser console for errors
5. Verify all environment variables are set correctly

## ✨ Success Checklist

- [ ] Environment variables configured
- [ ] n8n instance running
- [ ] Facebook API accessible
- [ ] Database connected
- [ ] AI analysis endpoint responding
- [ ] Webhook connectivity verified
- [ ] AI analysis working in app

---

**🎉 Congratulations!** Once all items are checked, your AI analysis feature should be fully functional.
