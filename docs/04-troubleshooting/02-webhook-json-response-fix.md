# 🔧 Webhook JSON Response Fix Guide

## 🚨 **Issue Description**
The webhook is returning an empty response, causing a JSON parsing error:
```
"response": "",
"parseError": "JSON.parse: unexpected end of data at line 1 column 1 of the JSON data"
```

## 🔍 **Root Causes & Solutions**

### **1. API Endpoint Not Responding**
**Symptoms:** Empty response body, no error messages
**Solutions:**
- Check if the Next.js server is running
- Verify the endpoint URL is correct
- Check server logs for errors

### **2. Function Execution Error**
**Symptoms:** Function starts but doesn't complete
**Solutions:**
- Check for syntax errors in the route file
- Verify all required functions are defined
- Check for infinite loops or blocking operations

### **3. Response Not Being Sent**
**Symptoms:** Function completes but no response
**Solutions:**
- Ensure `NextResponse.json()` is called
- Check for early returns or exceptions
- Verify the response object structure

## 🛠️ **Immediate Fixes Applied**

### **Enhanced Logging**
Added comprehensive logging to track execution:
```typescript
console.log('🚀 [ANALYZE-CREATIVES] Starting webhook processing...');
console.log(`📤 [${sessionId}] Sending response...`);
console.log(`✅ [${sessionId}] Response sent successfully`);
```

### **Error Handling**
Improved error handling with proper type checking:
```typescript
} catch (error) {
  console.error('❌ Webhook processing error:', error);
  return NextResponse.json({
    error: "Webhook processing failed",
    message: error instanceof Error ? error.message : 'Unknown error',
    timestamp: new Date().toISOString(),
    workflowVersion: '2.0-enhanced'
  }, { status: 500 });
}
```

### **Response Validation**
Added response validation before sending:
```typescript
console.log(`📤 [${sessionId}] Sending response...`);
const jsonResponse = NextResponse.json(response);
console.log(`✅ [${sessionId}] Response sent successfully`);

return jsonResponse;
```

## 🧪 **Testing & Debugging**

### **1. Test the Basic Endpoint**
```bash
# Test the simple endpoint
curl -X GET http://localhost:3000/api/test-webhook

# Test POST with data
curl -X POST http://localhost:3000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### **2. Test the Main Webhook**
```bash
# Test with minimal data
curl -X POST http://localhost:3000/api/analyze-creatives \
  -H "Content-Type: application/json" \
  -d '{
    "test": true,
    "webhookUrl": "http://localhost:3000/api/analyze-creatives"
  }'
```

### **3. Run the Debug Script**
```bash
# Set the webhook URL
export WEBHOOK_URL="http://localhost:3000/api/analyze-creatives"

# Run the debug script
node scripts/test-webhook-debug.js
```

## 📋 **Checklist for Resolution**

### **Server Status**
- [ ] Next.js server is running (`npm run dev`)
- [ ] No compilation errors in terminal
- [ ] Server accessible at expected URL

### **Endpoint Accessibility**
- [ ] `/api/test-webhook` responds correctly
- [ ] `/api/analyze-creatives` is accessible
- [ ] No 404 or 500 errors

### **Function Execution**
- [ ] Logs show "Starting webhook processing"
- [ ] Logs show "Webhook received"
- [ ] Logs show "Enhanced analysis completed"
- [ ] Logs show "Sending response"
- [ ] Logs show "Response sent successfully"

### **Response Structure**
- [ ] Response object is properly constructed
- [ ] All required fields are present
- [ ] No undefined or null values
- [ ] `NextResponse.json()` is called

## 🐛 **Common Issues & Fixes**

### **Issue: Function Not Defined**
**Error:** `ReferenceError: performEnhancedAIAnalysis is not defined`
**Fix:** Ensure all helper functions are defined before use

### **Issue: Syntax Error**
**Error:** `SyntaxError: Unexpected token`
**Fix:** Check for missing brackets, semicolons, or quotes

### **Issue: Import Error**
**Error:** `Module not found`
**Fix:** Verify import paths and file structure

### **Issue: Database Connection**
**Error:** Database connection failed
**Fix:** Check DATABASE_URL and database server status

## 📊 **Monitoring & Logs**

### **Enable Debug Mode**
```typescript
// Add to environment variables
DEBUG=true
NODE_ENV=development
```

### **Check Server Logs**
Look for these log messages:
```
🚀 [ANALYZE-CREATIVES] Starting webhook processing...
🔍 [session_xxx] Webhook received: {...}
🤖 [session_xxx] Starting enhanced AI analysis...
✅ [session_xxx] Enhanced analysis completed successfully
📤 [session_xxx] Sending response...
✅ [session_xxx] Response sent successfully
```

### **Check Network Tab**
In browser dev tools:
- Verify request is sent
- Check response status code
- Examine response headers
- Look for response body

## 🚀 **Quick Fix Commands**

### **Restart Server**
```bash
# Stop server (Ctrl+C)
# Then restart
npm run dev
```

### **Clear Cache**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### **Check Dependencies**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📞 **Next Steps**

1. **Run the debug script** to identify the exact issue
2. **Check server logs** for error messages
3. **Test basic endpoints** to isolate the problem
4. **Verify function definitions** are complete
5. **Test with minimal payload** to rule out data issues

## 🔗 **Related Files**

- `app/api/analyze-creatives/route.ts` - Main webhook endpoint
- `app/api/test-webhook/route.ts` - Test endpoint
- `scripts/test-webhook-debug.js` - Debug script
- `ENHANCED_AI_ANALYSIS_README.md` - System documentation

---

**Last Updated:** December 2024  
**Status:** Under Investigation  
**Priority:** High
