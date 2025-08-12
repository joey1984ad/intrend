# 🤖 AI Analysis Debugging Tools

This directory contains comprehensive debugging and troubleshooting tools for the AI analysis system.

## 📁 Files Overview

| File | Purpose | Usage |
|------|---------|-------|
| `AI_ANALYSIS_TROUBLESHOOTING.md` | Complete troubleshooting guide | Reference for all issues |
| `AI_ANALYSIS_QUICK_REFERENCE.md` | Quick fixes and commands | Fast problem resolution |
| `scripts/debug-ai-analysis.js` | Automated debugging script | Comprehensive system testing |
| `scripts/debug-ai-analysis.bat` | Windows batch file | Easy Windows execution |
| `scripts/debug-ai-analysis.sh` | Unix shell script | Easy Unix/Linux/macOS execution |

## 🚀 Quick Start

### **Option 1: Automated Debugging (Recommended)**
```bash
# Run the comprehensive debugging script
node scripts/debug-ai-analysis.js

# Windows users
scripts\debug-ai-analysis.bat

# Unix/Linux/macOS users
./scripts/debug-ai-analysis.sh
```

### **Option 2: Manual Testing**
```bash
# 1. Test environment variables
echo $NEXT_PUBLIC_N8N_WEBHOOK_URL

# 2. Test n8n connectivity
curl http://localhost:5678/healthz

# 3. Test AI analysis API
curl -X POST "http://localhost:3000/api/ai/analyze-creative" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 🔧 What the Debugging Script Tests

The automated debugging script (`debug-ai-analysis.js`) performs these tests:

### **1. Environment Variables**
- ✅ `NEXT_PUBLIC_N8N_WEBHOOK_URL`
- ✅ `DATABASE_URL`
- ✅ `NEXT_PUBLIC_FACEBOOK_APP_ID`
- ✅ Development mode detection

### **2. API Endpoints**
- ✅ `/api/ai/analyze-creative` (AI analysis endpoint)
- ✅ `/api/ai/creative-score` (Score saving endpoint)
- ✅ `/api/init-db` (Database connection)

### **3. n8n Connectivity**
- ✅ n8n health endpoint (`/healthz`)
- ✅ Webhook endpoint accessibility
- ✅ Webhook response validation

### **4. Creative Data Validation**
- ✅ Image creative validation
- ✅ URL accessibility testing
- ✅ Data structure verification

### **5. Full AI Analysis Flow**
- ✅ End-to-end webhook testing
- ✅ Response parsing
- ✅ Workflow execution verification

## 📊 Sample Output

```
============================================================
 ENVIRONMENT VARIABLES CHECK
============================================================

✅ NEXT_PUBLIC_N8N_WEBHOOK_URL: http://localhost:5678/webhook-test/analyze-creatives
✅ DATABASE_URL: postgresql://...
✅ NEXT_PUBLIC_FACEBOOK_APP_ID: your_facebook_app_id_here
ℹ️ Running in development mode

============================================================
 NEXT.JS API ENDPOINTS TEST
============================================================

ℹ️ Testing AI analyze creative endpoint...
⚠️ AI analyze endpoint: n8n webhook not configured (expected in dev)
ℹ️ Testing AI creative score endpoint...
✅ AI creative score endpoint: Working correctly
ℹ️ Testing database connection...
✅ Database connection: Working correctly
```

## 🚨 Common Issues & Solutions

### **Issue: Script won't run**
```bash
# Check Node.js installation
node --version

# Make script executable (Unix/Linux/macOS)
chmod +x scripts/debug-ai-analysis.sh

# Run from project root directory
cd /path/to/your/project
node scripts/debug-ai-analysis.js
```

### **Issue: Environment variables not found**
```bash
# Create .env.local file
cp env.example .env.local

# Edit .env.local with your values
nano .env.local

# Restart your terminal/shell
```

### **Issue: Permission denied (Unix/Linux/macOS)**
```bash
# Make script executable
chmod +x scripts/debug-ai-analysis.sh

# Run with proper permissions
./scripts/debug-ai-analysis.sh
```

## 🧪 Testing Scenarios

### **Scenario 1: Fresh Installation**
```bash
# 1. Run debugging script
node scripts/debug-ai-analysis.js

# 2. Fix any issues found
# 3. Run again to verify fixes
```

### **Scenario 2: After Configuration Changes**
```bash
# 1. Update .env.local
# 2. Restart Next.js dev server
npm run dev

# 3. Run debugging script
node scripts/debug-ai-analysis.js
```

### **Scenario 3: Production Deployment**
```bash
# 1. Set production environment variables
# 2. Run debugging script with production config
NODE_ENV=production node scripts/debug-ai-analysis.js
```

## 🔍 Advanced Debugging

### **Custom Test Payloads**
```javascript
// Modify the script to test specific scenarios
const customPayload = {
  creativeId: 'your_creative_id',
  adAccountId: 'your_ad_account_id',
  imageUrl: 'your_image_url',
  // ... other fields
};
```

### **Integration with CI/CD**
```bash
# Add to your CI/CD pipeline
npm install
node scripts/debug-ai-analysis.js

# Exit with error code if tests fail
if [ $? -ne 0 ]; then
  echo "AI analysis system tests failed"
  exit 1
fi
```

### **Logging and Monitoring**
```bash
# Enable detailed logging
NEXT_PUBLIC_DEBUG_AI_ANALYSIS=true node scripts/debug-ai-analysis.js

# Save output to file
node scripts/debug-ai-analysis.js > debug-output.log 2>&1
```

## 📚 Related Documentation

- **Main Troubleshooting Guide**: `AI_ANALYSIS_TROUBLESHOOTING.md`
- **Quick Reference**: `AI_ANALYSIS_QUICK_REFERENCE.md`
- **Webhook Troubleshooting**: `WEBHOOK_TROUBLESHOOTING.md`
- **Facebook API Issues**: `META_SDK_TROUBLESHOOTING.md`

## 🆘 Getting Help

### **Before Asking for Help**
1. ✅ Run the debugging script
2. ✅ Check the troubleshooting guide
3. ✅ Verify environment variables
4. ✅ Test basic connectivity

### **When Reporting Issues**
Include:
- Debug script output
- Environment details
- Error messages
- Steps to reproduce
- Expected vs actual behavior

### **Support Channels**
- Check existing documentation
- Review troubleshooting guides
- Run debugging scripts
- Contact development team

## 🔄 Maintenance

### **Keeping Scripts Updated**
```bash
# Update scripts when API changes
git pull origin main

# Test scripts after updates
node scripts/debug-ai-analysis.js
```

### **Adding New Tests**
```javascript
// Add new test functions to debug-ai-analysis.js
async function testNewFeature() {
  logHeader('NEW FEATURE TEST');
  // ... test implementation
}

// Add to main() function
await testNewFeature();
```

---

**Last Updated:** January 2024  
**Version:** 1.0  
**Maintainer:** Development Team
