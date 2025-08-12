# 🤖 AI Analysis Debugging & Troubleshooting Guide

## 🚀 Quick Start - Test AI Analysis

### 1. **Environment Check**
```bash
# Verify your .env.local has the webhook URL
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives
```

### 2. **Quick Test Command**
```bash
# Test the AI analysis endpoint directly
curl -X POST "http://localhost:3000/api/ai/analyze-creative" \
  -H "Content-Type: application/json" \
  -d '{
    "creativeId": "test_123",
    "adAccountId": "act_test",
    "imageUrl": "https://example.com/test.jpg",
    "creativeName": "Test Creative",
    "creativeType": "image"
  }'
```

### 3. **Frontend Test**
1. Open browser console (F12)
2. Navigate to Creatives tab
3. Select an image creative
4. Click "🤖 Analyze" button
5. Watch console logs

## 🔍 Diagnostic Tools

### **AI Analysis Health Check**
```bash
# Check if AI analysis API is responding
curl http://localhost:3000/api/ai/analyze-creative -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": "health_check"}'
```

### **Creative Score API Test**
```bash
# Test saving an AI score
curl -X POST "http://localhost:3000/api/ai/creative-score" \
  -H "Content-Type: application/json" \
  -d '{
    "creativeId": "test_123",
    "adAccountId": "act_test",
    "score": 8.5,
    "analysisData": {"test": "data"}
  }'
```

### **Database Connection Test**
```bash
# Check if database is accessible
curl http://localhost:3000/api/init-db
```

## 🚨 Common AI Analysis Issues

### **Issue 1: "n8n webhook URL not configured"**
**Symptoms:**
- Error: `n8n webhook URL not configured`
- Status: 500 Internal Server Error

**Causes:**
- Missing `NEXT_PUBLIC_N8N_WEBHOOK_URL` in environment
- Environment variable not loaded
- Dev server not restarted after env changes

**Solutions:**
```bash
# 1. Add to .env.local
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives

# 2. Restart dev server
npm run dev
# or
yarn dev

# 3. Verify in browser console
console.log('Webhook URL:', process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL);
```

### **Issue 2: "Request timeout" (30s)**
**Symptoms:**
- Error: `Request timeout. Please try again.`
- Status: 500 Internal Server Error
- Long response times

**Causes:**
- n8n workflow taking too long
- Network latency
- ChatGPT API rate limiting
- Large image processing

**Solutions:**
```bash
# 1. Check n8n workflow execution time
# Go to n8n UI → Executions tab → Look for long-running workflows

# 2. Increase timeout in route.ts (if needed)
signal: AbortSignal.timeout(60000) // 60 seconds

# 3. Check ChatGPT API status and rate limits
# 4. Verify image sizes aren't too large
```

### **Issue 3: "Webhook call failed"**
**Symptoms:**
- Error: `Webhook call failed: 404 Not Found`
- Error: `Webhook call failed: 500 Internal Server Error`
- Status: Various HTTP error codes

**Causes:**
- n8n not running
- Wrong webhook URL
- n8n workflow inactive
- CORS issues
- n8n workflow errors

**Solutions:**
```bash
# 1. Verify n8n is running
curl http://localhost:5678/healthz

# 2. Check webhook URL format
# Should be: http://localhost:5678/webhook-test/analyze-creatives

# 3. Activate n8n workflow
# Go to n8n UI → Toggle "Active" switch ON

# 4. Test webhook directly
curl -X POST "http://localhost:5678/webhook-test/analyze-creatives" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### **Issue 4: "Creative has no image URLs"**
**Symptoms:**
- Error: `Creative has no image content available for AI analysis`
- Analysis button disabled or not working

**Causes:**
- Creative missing `imageUrl` or `thumbnailUrl`
- Facebook API not returning image data
- Creative type not supported (video, carousel, etc.)

**Solutions:**
```bash
# 1. Check creative data structure
console.log('Creative data:', creative);

# 2. Verify Facebook API permissions
# Need: ads_read, ads_management

# 3. Check creative type
# Only 'image' type is currently supported

# 4. Verify image URLs are accessible
curl -I "https://example.com/image.jpg"
```

### **Issue 5: "No ad account ID available for this creative"**
**Symptoms:**
- Error: `❌ No ad account ID available for this creative <empty string>`
- AI analysis button fails when clicked
- Creative data missing `adAccountId` field

**Causes:**
- Creative objects missing `adAccountId` property
- Facebook API response not including ad account information
- Data processing pipeline not preserving ad account context

**Solutions:**
```bash
# 1. Check creative data structure in browser console
console.log('Creative for analysis:', creative);
console.log('adAccountId:', creative.adAccountId);

# 2. Verify the fix has been applied
# The adAccountId should now be included in all creative objects

# 3. Restart Next.js dev server after the fix
npm run dev

# 4. Refresh creatives data to get updated objects
# Click refresh button in your app

# 5. Test with the verification script
node scripts/test-ai-analysis-fix.js
```

**Fix Applied:**
The `adAccountId` field is now properly added to all creative objects in the Facebook creatives API route. This ensures that AI analysis can proceed with the required ad account context.

### **Issue 6: "AI score save failed"**
**Symptoms:**
- Error: `Failed to save AI creative score`
- AI analysis completes but score not saved
- Status: 500 Internal Server Error

**Causes:**
- Database connection issues
- Missing required fields
- Database schema mismatch
- Permission issues

**Solutions:**
```bash
# 1. Test database connection
curl http://localhost:3000/api/init-db

# 2. Check required fields
# creativeId, adAccountId, score are required

# 3. Verify database schema
# Check if ai_creative_scores table exists

# 4. Test score saving manually
curl -X POST "http://localhost:3000/api/ai/creative-score" \
  -H "Content-Type: application/json" \
  -d '{
    "creativeId": "test_123",
    "adAccountId": "act_test",
    "score": 8.5,
    "analysisData": {"test": "data"}
  }'
```

## 🔧 Advanced Debugging

### **Enable Detailed Logging**
```typescript
// In your .env.local, add:
NEXT_PUBLIC_DEBUG_AI_ANALYSIS=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### **Browser Console Debugging**
```javascript
// Test environment variables
console.log('Environment check:', {
  webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
  nodeEnv: process.env.NODE_ENV,
  debugMode: process.env.NEXT_PUBLIC_DEBUG_AI_ANALYSIS
});

// Test creative data structure
console.log('Creative for analysis:', {
  id: creative.id,
  type: creative.creativeType,
  imageUrl: creative.imageUrl,
  thumbnailUrl: creative.thumbnailUrl,
  adAccountId: creative.adAccountId
});

// Test webhook call manually
fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    creativeId: 'test_123',
    adAccountId: 'act_test',
    imageUrl: 'https://example.com/test.jpg',
    creativeName: 'Test',
    creativeType: 'image'
  })
}).then(r => r.json()).then(console.log);
```

### **Network Tab Analysis**
1. Open browser DevTools → Network tab
2. Click "🤖 Analyze" button
3. Look for:
   - Request to `/api/ai/analyze-creative`
   - Request to n8n webhook
   - Response status codes
   - Response times
   - Error messages

### **n8n Workflow Debugging**
1. Go to n8n UI → Executions tab
2. Look for failed executions
3. Click on failed execution to see:
   - Input data received
   - Node that failed
   - Error messages
   - Execution time

## 📊 Expected Data Flow

### **1. Frontend → API Route**
```json
POST /api/ai/analyze-creative
{
  "creativeId": "123",
  "adAccountId": "act_456",
  "imageUrl": "https://...",
  "creativeName": "Ad Name",
  "creativeType": "image",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### **2. API Route → n8n Webhook**
```json
POST http://localhost:5678/webhook-test/analyze-creatives
{
  "creativeId": "123",
  "adAccountId": "act_456",
  "imageUrl": "https://...",
  "creativeName": "Ad Name",
  "creativeType": "image",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### **3. n8n → ChatGPT Vision API**
- Image URL sent to ChatGPT
- Vision analysis performed
- Score and analysis returned

### **4. n8n → Database (via API)**
```json
POST /api/ai/creative-score
{
  "creativeId": "123",
  "adAccountId": "act_456",
  "score": 8.5,
  "analysisData": {
    "description": "Image analysis...",
    "tags": ["professional", "clear"],
    "confidence": 0.95
  }
}
```

## 🧪 Testing Checklist

### **Pre-Test Setup**
- [ ] n8n running on port 5678
- [ ] n8n workflow active
- [ ] Environment variables loaded
- [ ] Next.js dev server restarted
- [ ] Database accessible

### **Basic Functionality Test**
- [ ] AI analysis button visible for image creatives
- [ ] Button disabled for non-image creatives
- [ ] Console logs appear when clicking analyze
- [ ] Webhook call succeeds (200 status)
- [ ] n8n execution appears in executions tab

### **Error Handling Test**
- [ ] Invalid creative data handled gracefully
- [ ] Missing image URLs show appropriate error
- [ ] Network errors show retry message
- [ ] Timeout errors handled properly

### **Integration Test**
- [ ] AI score saved to database
- [ ] Score appears in UI after analysis
- [ ] Multiple creatives can be analyzed
- [ ] Analysis history maintained

## 🚀 Performance Optimization

### **Batch Processing**
- Analyze multiple creatives in one request
- Reduce API calls to n8n
- Implement rate limiting

### **Caching**
- Cache AI scores locally
- Avoid re-analyzing same creatives
- Store analysis results temporarily

### **Error Recovery**
- Retry failed requests
- Fallback to cached results
- Graceful degradation

## 📞 Support & Escalation

### **Level 1: Basic Troubleshooting**
- Check environment variables
- Verify n8n is running
- Test webhook endpoints
- Check browser console logs

### **Level 2: Advanced Debugging**
- Analyze network requests
- Check n8n workflow logs
- Verify database connectivity
- Test individual API endpoints

### **Level 3: System Issues**
- Check server logs
- Verify API keys and permissions
- Check rate limits
- Contact support team

### **Useful Commands for Support**
```bash
# System status
curl http://localhost:3000/api/health
curl http://localhost:5678/healthz

# Environment check
echo $NEXT_PUBLIC_N8N_WEBHOOK_URL

# Process status
netstat -an | grep :5678
netstat -an | grep :3000

# Log files
tail -f /path/to/n8n/logs
tail -f /path/to/nextjs/logs
```

## 🔄 Quick Reset Procedure

If everything is broken, try this reset sequence:

```bash
# 1. Stop all services
# Ctrl+C in n8n terminal
# Ctrl+C in Next.js terminal

# 2. Clear any cached data
rm -rf .next
rm -rf node_modules/.cache

# 3. Restart n8n
cd /path/to/n8n
npm start

# 4. Restart Next.js with fresh env
npm run dev

# 5. Test basic functionality
curl http://localhost:3000/api/ai/analyze-creative -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": "reset"}'
```

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Facebook Marketing API](https://developers.facebook.com/docs/marketing-apis/)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [PostgreSQL with Neon](https://neon.tech/docs)

---

**Last Updated:** January 2024  
**Version:** 1.0  
**Maintainer:** Development Team
