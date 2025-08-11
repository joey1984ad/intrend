# n8n AI Creative Analyzer - Setup Guide

## 🚀 Complete Setup Instructions

### 1. Environment Variables Setup

#### Frontend (.env.local)
```bash
# Add to your existing .env.local file
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/analyze-creatives
```

#### n8n Environment Variables
```bash
NEXT_APP_BASE_URL=https://your-app.com
SCORE_ALERT_THRESHOLD=60
SLACK_WEBHOOK_URL=https://hooks.slack.com/your/webhook/url
OPENAI_API_KEY=your_openai_api_key
```

### 2. n8n Workflow Fixes

#### Fix 1: Date Range Parameter
In the "Fetch Creatives" node, change line 4 of the JSON body:
```json
"dateRange": {{ $json.dateRange ? '"' + $json.dateRange + '"' : '"last_30d"' }}
```

#### Fix 2: OpenAI Message Structure
In the "ChatGPT Vision Analysis" node, update the messages parameter:
```json
{
  "values": [
    {
      "role": "system",
      "content": "You are an expert ad creative analyst. Analyze images for mobile feed effectiveness. Return ONLY valid JSON matching the exact schema provided."
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "=Analyze this ad creative for social feed placement.\n\nPerformance Context:\n- CTR: {{ $json.analysisContext.metrics.ctr }}%\n- CPC: ${{ $json.analysisContext.metrics.cpc }}\n- CPM: ${{ $json.analysisContext.metrics.cpm }}\n- Campaign: {{ $json.analysisContext.campaignName }}\n\nReturn JSON only:\n{\n  \"score\": {\n    \"overall\": number,\n    \"dimensions\": {\n      \"clarity\": number,\n      \"text_density\": number,\n      \"brand\": number,\n      \"value_prop\": number,\n      \"cta\": number,\n      \"contrast\": number,\n      \"thumbnail\": number\n    }\n  },\n  \"insights\": {\n    \"strengths\": [\"string\"],\n    \"issues\": [\"string\"],\n    \"suggestions\": [\"string\"]\n  },\n  \"flags\": {\n    \"compliance\": [\"string\"]\n  }\n}"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "={{ $json.tokenizedImageUrl }}"
          }
        }
      ]
    }
  ]
}
```

### 3. n8n Credentials Setup

1. **OpenAI API Credentials**
   - Go to n8n → Credentials
   - Add new "OpenAI" credential with ID `openai-credentials`
   - Add your OpenAI API key

2. **Slack Webhook (Optional)**
   - Create Slack webhook URL for alerts
   - Add to n8n environment variables

### 4. Database Migration

The database tables are automatically created when the app starts. To manually trigger:
```bash
# In your Next.js app
curl -X POST http://localhost:3000/api/init-db
```

### 5. Testing the Integration

#### Test 1: Manual Webhook Call
```bash
curl -X POST "https://your-n8n-instance.com/webhook/analyze-creatives" \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "your_facebook_token",
    "adAccountId": "act_123456789",
    "dateRange": "last_30d",
    "batchSize": 5,
    "baseUrl": "https://your-app.com"
  }'
```

#### Test 2: Frontend Integration
1. Go to your app → Creatives tab
2. Select some image creatives
3. Click "🤖 Analyze"
4. Check browser console for logs
5. Wait 1-2 minutes for results

#### Test 3: Verify Database Storage
```bash
# Check if scores are being saved
curl "https://your-app.com/api/ai/creative-score/stats"
```

### 6. Monitoring & Troubleshooting

#### Check n8n Execution Logs
- Go to n8n → Executions
- Look for "AI Creative Analyzer" workflow runs
- Check each node for errors

#### Common Issues & Solutions

**Issue: "Webhook call failed: 404"**
- Verify n8n webhook URL is correct
- Check if workflow is active in n8n
- Ensure webhook path is "analyze-creatives"

**Issue: "OpenAI API error"**
- Verify OpenAI API key is valid
- Check API rate limits
- Ensure gpt-4o-mini model access

**Issue: "No creatives found"**
- Verify Facebook access token is valid
- Check if ad account has image creatives
- Ensure date range has data

**Issue: "Failed to save scores"**
- Check database connection
- Verify API endpoint accessibility
- Check server logs for validation errors

#### View API Statistics
```bash
# Get processing statistics
curl "https://your-app.com/api/ai/creative-score/stats?adAccountId=act_123456789&daysBack=7"
```

### 7. Production Deployment Checklist

- [ ] n8n workflow imported and activated
- [ ] All environment variables configured
- [ ] OpenAI credentials setup in n8n
- [ ] Database tables created
- [ ] Webhook URL accessible from frontend
- [ ] Test analysis on sample creatives
- [ ] Slack alerts configured (optional)
- [ ] Rate limiting tested with large batches
- [ ] Error handling verified

### 8. Usage Instructions

1. **Connect Facebook Account** (if not already done)
2. **Navigate to Creatives Tab**
3. **Select Image Creatives** (video support coming soon)
4. **Click "🤖 Analyze"** button
5. **Wait 1-2 minutes** for analysis to complete
6. **Refresh or check table** for AI scores
7. **Click creative name** to see detailed analysis

### 9. Expected Results

After successful analysis, you'll see:
- **AI Score column** with 0-100 scores and color coding
- **Gallery cards** showing AI scores
- **Detail modal** with full AI analysis tab including:
  - Overall score and dimension breakdown
  - Strengths, issues, and suggestions
  - Compliance flags
  - Analysis timestamp

### 10. Performance Notes

- **Batch size**: 12 creatives per batch (configurable)
- **Rate limiting**: 500ms delay between batches
- **Processing time**: ~5-10 seconds per creative
- **Cost**: ~$0.01-0.02 per image with gpt-4o-mini
- **Caching**: Results cached in database (no re-analysis)

## 🆘 Support

If you encounter issues:
1. Check browser console for frontend errors
2. Check n8n execution logs for workflow errors
3. Check server logs for API errors
4. Verify all environment variables are set
5. Test individual API endpoints manually
