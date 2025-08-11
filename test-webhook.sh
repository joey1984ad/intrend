#!/bin/bash

# Test n8n webhook directly
echo "🧪 Testing n8n webhook..."

curl -X POST "http://localhost:5678/webhook-test/analyze-creatives" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "accessToken": "test_token",
    "adAccountId": "act_123456789",
    "dateRange": "last_30d",
    "batchSize": 3,
    "baseUrl": "http://localhost:3000",
    "selectedCreativeIds": ["test_creative_1", "test_creative_2"]
  }' \
  --verbose

echo -e "\n✅ Webhook test completed"
