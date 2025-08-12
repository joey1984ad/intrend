# 🚀 AI Analysis Quick Reference

## ⚡ Quick Fixes

### **Issue: "n8n webhook URL not configured"**
```bash
# Add to .env.local
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives

# Restart dev server
npm run dev
```

### **Issue: "Request timeout"**
```bash
# Check n8n workflow execution time
# Go to n8n UI → Executions tab

# Increase timeout in route.ts (if needed)
signal: AbortSignal.timeout(60000) // 60 seconds
```

### **Issue: "Webhook call failed"**
```bash
# Verify n8n is running
curl http://localhost:5678/healthz

# Test webhook directly
curl -X POST "http://localhost:5678/webhook-test/analyze-creatives" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### **Issue: "Creative has no image URLs"**
```javascript
// Check creative data in browser console
console.log('Creative data:', creative);

// Verify creative type is 'image'
// Check imageUrl and thumbnailUrl exist
```

### **Issue: "No ad account ID available for this creative"**
```javascript
// Check creative data in browser console
console.log('Creative data:', creative);
console.log('adAccountId:', creative.adAccountId);

// Verify the fix has been applied
// Restart dev server and refresh creatives data
```

### **Issue: "AI score save failed"**
```bash
# Test database connection
curl http://localhost:3000/api/init-db

# Test score saving manually
curl -X POST "http://localhost:3000/api/ai/creative-score" \
  -H "Content-Type: application/json" \
  -d '{"creativeId": "test", "adAccountId": "act_test", "score": 8.5}'
```

## 🔧 Debug Commands

### **Environment Check**
```bash
# Check environment variables
echo $NEXT_PUBLIC_N8N_WEBHOOK_URL
echo $DATABASE_URL

# Test in browser console
console.log('Webhook URL:', process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL);
```

### **API Testing**
```bash
# Test AI analysis endpoint
curl -X POST "http://localhost:3000/api/ai/analyze-creative" \
  -H "Content-Type: application/json" \
  -d '{"creativeId": "test", "adAccountId": "act_test", "imageUrl": "https://example.com/test.jpg"}'

# Test creative score endpoint
curl -X POST "http://localhost:3000/api/ai/creative-score" \
  -H "Content-Type: application/json" \
  -d '{"creativeId": "test", "adAccountId": "act_test", "score": 8.5}'
```

### **n8n Testing**
```bash
# Check n8n health
curl http://localhost:5678/healthz

# Test webhook
curl -X POST "http://localhost:5678/webhook-test/analyze-creatives" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 📊 Expected Data Flow

1. **Frontend** → `/api/ai/analyze-creative`
2. **API Route** → n8n webhook
3. **n8n** → ChatGPT Vision API
4. **n8n** → `/api/ai/creative-score` (save to DB)

## 🧪 Testing Checklist

- [ ] Environment variables loaded
- [ ] n8n running on port 5678
- [ ] n8n workflow active
- [ ] Next.js dev server restarted
- [ ] Database accessible
- [ ] AI analysis button visible for image creatives
- [ ] Console logs appear when clicking analyze
- [ ] Webhook call succeeds (200 status)
- [ ] n8n execution appears in executions tab

## 🚨 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `n8n webhook URL not configured` | Missing env var | Add `NEXT_PUBLIC_N8N_WEBHOOK_URL` to `.env.local` |
| `Request timeout` | n8n workflow slow | Check n8n executions, increase timeout |
| `Webhook call failed: 404` | n8n not running | Start n8n, check webhook URL |
| `Creative has no image URLs` | Missing image data | Check Facebook API permissions |
| `No ad account ID available` | Missing adAccountId | Restart dev server, refresh data |
| `Failed to save AI score` | Database issue | Test DB connection, check schema |

## 🔄 Reset Procedure

```bash
# 1. Stop all services (Ctrl+C)
# 2. Clear cache
rm -rf .next
rm -rf node_modules/.cache
# 3. Restart n8n
# 4. Restart Next.js
npm run dev
# 5. Test functionality
```

## 📞 Support Levels

- **Level 1**: Environment variables, basic connectivity
- **Level 2**: API endpoints, n8n workflow issues
- **Level 3**: Database, system-level problems

## 🛠️ Debugging Script

```bash
# Run comprehensive debugging
node scripts/debug-ai-analysis.js

# Windows
scripts\debug-ai-analysis.bat

# Unix/Linux/macOS
./scripts/debug-ai-analysis.sh
```

---

**For detailed troubleshooting, see:** `AI_ANALYSIS_TROUBLESHOOTING.md`
