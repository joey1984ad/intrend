# 🔧 n8n Webhook Troubleshooting Guide

## ✅ Quick Verification Steps

### 1. **Check Your Environment Variable**
Add this to your `.env.local`:
```bash
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives
```

**Restart your Next.js dev server** after adding this!

### 2. **Test n8n Webhook Directly**
```bash
# Run this in your terminal
./test-webhook.sh
```

Or manually:
```bash
curl -X POST "http://localhost:5678/webhook-test/analyze-creatives" \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "test_token",
    "adAccountId": "act_123456789",
    "dateRange": "last_30d",
    "batchSize": 3,
    "baseUrl": "http://localhost:3000"
  }'
```

### 3. **Check n8n Workflow Status**
- Go to n8n UI (http://localhost:5678)
- Ensure "AI Creative Analyzer" workflow is **ACTIVE**
- Check if webhook trigger is properly configured

### 4. **Test from Frontend with Debug**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Navigate to Creatives tab in your app
4. Select some image creatives
5. Click "🤖 Analyze" button
6. Watch console logs for debug info

## 🚨 Common Issues & Solutions

### Issue: "Failed to fetch" or Network Error
**Cause**: CORS or network connectivity
**Solutions**:
- Ensure n8n is running on port 5678
- Check that webhook URL in .env.local is correct
- Verify no firewall blocking localhost requests

### Issue: 404 Not Found
**Cause**: Wrong webhook path or inactive workflow
**Solutions**:
- Verify webhook path: `/webhook-test/analyze-creatives`
- Ensure n8n workflow is activated
- Check webhook trigger node configuration

### Issue: Environment Variable Not Loading
**Cause**: .env.local not loaded or dev server not restarted
**Solutions**:
```bash
# Stop your Next.js dev server (Ctrl+C)
# Then restart it
npm run dev
# or
yarn dev
```

### Issue: CORS Error in Browser
**Cause**: Cross-origin request blocked
**Solution**: In your n8n webhook trigger node, ensure:
```json
{
  "options": {
    "allowedOrigins": "*"
  }
}
```

## 🔍 Debug Console Logs

When you click "🤖 Analyze", you should see these logs:

**✅ Good logs:**
```
🔗 Webhook URL: http://localhost:5678/webhook-test/analyze-creatives
🌐 Base URL: http://localhost:3000
📦 Webhook payload: {accessToken: "...", adAccountId: "..."}
📡 Webhook response status: 200
✅ n8n workflow triggered successfully: {...}
```

**❌ Bad logs:**
```
❌ Webhook failed: {status: 404, statusText: "Not Found"}
❌ Failed to fetch (CORS/Network error)
❌ Webhook call failed: 500 Internal Server Error
```

## 🧪 Step-by-Step Testing

### Step 1: Verify n8n is Running
```bash
curl http://localhost:5678/healthz
```
Should return n8n health status.

### Step 2: Test Webhook Endpoint
```bash
curl -X POST "http://localhost:5678/webhook-test/analyze-creatives" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```
Should trigger your workflow (check n8n executions).

### Step 3: Test Frontend Environment
Open browser console and run:
```javascript
console.log('Webhook URL:', process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL);
// Should show: http://localhost:5678/webhook-test/analyze-creatives
```

### Step 4: Test Full Integration
1. Select image creatives
2. Click "🤖 Analyze"
3. Check browser console for logs
4. Check n8n executions tab for workflow runs

## 📊 Expected n8n Execution Flow

When webhook is triggered, you should see:
1. **Webhook Trigger** ✅ receives data
2. **Fetch Creatives** ✅ calls your app API
3. **Filter Static Images** ✅ processes creatives
4. **Build Tokenized URLs** ✅ adds access tokens
5. **Split Into Batches** ✅ creates batches
6. **Rate Limit Delay** ✅ waits 500ms
7. **ChatGPT Vision Analysis** ✅ analyzes images
8. **Validate & Normalize** ✅ processes results
9. **Save AI Score** ✅ saves to your database
10. **Aggregate Results** ✅ returns summary

## 🔧 Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop n8n (Ctrl+C)
# Stop Next.js (Ctrl+C)
# Start n8n again
# Start Next.js again with env loaded
npm run dev
```

### Fix 2: Check Webhook URL Format
Ensure your webhook URL is exactly:
```
http://localhost:5678/webhook-test/analyze-creatives
```
- No trailing slash
- Correct port (5678)
- Correct path

### Fix 3: Verify Workflow Active
In n8n:
- Click your workflow
- Toggle "Active" switch ON (should be green)
- Save workflow

## 📞 Still Having Issues?

1. **Check n8n logs** for execution errors
2. **Check browser network tab** for failed requests
3. **Test webhook directly** with curl
4. **Verify all environment variables** are set
5. **Restart both n8n and Next.js** servers

## 💡 Success Indicators

✅ **Frontend**: Console shows successful webhook call
✅ **n8n**: Execution appears in executions list
✅ **Database**: Scores saved via `/api/ai/creative-score`
✅ **UI**: AI scores appear in creatives table
