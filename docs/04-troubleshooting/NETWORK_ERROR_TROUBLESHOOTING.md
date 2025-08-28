# 🚨 NetworkError Troubleshooting Guide

## 🎯 **Issue Description**
You're experiencing a "NetworkError when attempting to fetch resource" error when trying to use the AI Creative Analysis feature. This error occurs when the frontend tries to call the n8n webhook but cannot establish a network connection.

## 🔍 **Root Cause Analysis**

The error is happening in the `handleAIAnalysis` function in `CreativeDetailModal.tsx` at this specific location:

```typescript
const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(webhookPayload),
  signal: controller.signal
});
```

## 🛠️ **Immediate Solutions**

### **Solution 1: Environment Configuration**
Create or update your `.env.local` file in the project root:

```bash
# n8n AI Creative Analyzer Integration
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives
```

**⚠️ IMPORTANT**: After creating/updating `.env.local`, restart your Next.js development server:
```bash
# Stop the server (Ctrl+C)
npm run dev
# or
yarn dev
```

### **Solution 2: Verify n8n Service**
Ensure your n8n workflow service is running:

```bash
# Check if n8n is running on port 5678
curl http://localhost:5678/healthz

# Expected response: n8n health status
```

If n8n is not running:
```bash
# Navigate to your n8n directory
cd path/to/n8n

# Start n8n
npm run start
# or
n8n start
```

### **Solution 3: Test Webhook Connectivity**
Use the built-in webhook tester in the debug panel:

1. Open a creative detail modal
2. Go to the "🤖 AI Analysis" tab
3. Click "Show Debug Panel"
4. Use the "🔧 Webhook Connection Tester" component
5. Click "🧪 Run Tests" to diagnose connectivity issues

## 🔧 **Advanced Troubleshooting**

### **Step 1: Run Command Line Tests**
Use the provided test script:

```bash
# Make the script executable
chmod +x scripts/test-webhook-connection.js

# Run the test
node scripts/test-webhook-connection.js
```

### **Step 2: Check Network Configuration**
Verify localhost accessibility:

```bash
# Test localhost connectivity
ping localhost

# Test specific port
telnet localhost 5678

# Check if port is in use
netstat -an | grep 5678
```

### **Step 3: Browser Network Tab Analysis**
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to run AI analysis
4. Look for failed requests to the webhook URL
5. Check for CORS errors or connection refused messages

## 🚨 **Common Error Scenarios**

### **Scenario 1: "Failed to fetch" Error**
**Symptoms**: Browser console shows "Failed to fetch" error
**Cause**: n8n service not running or wrong port
**Solution**: 
- Start n8n service on port 5678
- Verify webhook URL in `.env.local`

### **Scenario 2: CORS Error**
**Symptoms**: Browser console shows CORS policy error
**Cause**: n8n webhook not configured for cross-origin requests
**Solution**: In n8n webhook trigger node, add:
```json
{
  "options": {
    "allowedOrigins": "*"
  }
}
```

### **Scenario 3: Connection Refused**
**Symptoms**: "Connection refused" or "ECONNREFUSED" error
**Cause**: No service listening on the specified port
**Solution**: 
- Check if n8n is running
- Verify correct port number
- Check firewall settings

### **Scenario 4: Timeout Error**
**Symptoms**: Request times out after 30 seconds
**Cause**: n8n workflow taking too long or hanging
**Solution**: 
- Check n8n workflow execution logs
- Verify workflow is not stuck in infinite loops
- Check ChatGPT API rate limits

## 📊 **Debug Information Collection**

When reporting issues, collect this information:

### **Environment Details**
```bash
# Check environment variables
echo $NEXT_PUBLIC_N8N_WEBHOOK_URL

# Check if .env.local exists
ls -la .env.local

# Check Next.js version
npm list next
```

### **n8n Status**
```bash
# Check n8n version
n8n --version

# Check n8n status
curl -s http://localhost:5678/healthz | jq .

# Check n8n logs
tail -f ~/.n8n/logs/n8n.log
```

### **Network Diagnostics**
```bash
# Test webhook endpoint
curl -X POST "http://localhost:5678/webhook-test/analyze-creatives" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check port availability
lsof -i :5678
```

## 🔄 **Step-by-Step Recovery**

### **Phase 1: Service Verification**
1. ✅ Verify `.env.local` exists with correct webhook URL
2. ✅ Restart Next.js development server
3. ✅ Ensure n8n service is running on port 5678
4. ✅ Verify n8n workflow is activated

### **Phase 2: Connectivity Testing**
1. ✅ Test localhost connectivity
2. ✅ Test webhook endpoint directly
3. ✅ Use built-in webhook tester component
4. ✅ Check browser network tab for errors

### **Phase 3: Configuration Validation**
1. ✅ Verify webhook URL format
2. ✅ Check CORS settings in n8n
3. ✅ Validate workflow configuration
4. ✅ Test with minimal payload

## 📞 **Getting Help**

If you're still experiencing issues:

1. **Collect Debug Information**: Use the debug panel and webhook tester
2. **Check n8n Logs**: Look for workflow execution errors
3. **Verify Environment**: Ensure all environment variables are set correctly
4. **Test Isolation**: Try the webhook endpoint outside of the app

## 💡 **Prevention Tips**

1. **Always restart Next.js** after changing `.env.local`
2. **Keep n8n running** when testing AI analysis
3. **Use the debug panel** to catch issues early
4. **Test webhook connectivity** before running analysis
5. **Monitor n8n workflow executions** for performance issues

## 🔗 **Related Documentation**

- [Webhook Troubleshooting Guide](./WEBHOOK_TROUBLESHOOTING.md)
- [AI Analysis Debugging README](./AI_ANALYSIS_DEBUGGING_README.md)
- [Facebook API Fix Guide](./FACEBOOK_API_FIX_GUIDE.md)

---

**Last Updated**: $(date)
**Version**: 1.0
**Status**: Active
