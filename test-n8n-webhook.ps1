# Test n8n Webhook with Correct Payload Format
# Replace the webhook URL below with your actual n8n webhook URL

Write-Host "🧪 Testing n8n Webhook with Correct Payload Format..." -ForegroundColor Green
Write-Host ""

# REPLACE THIS URL WITH YOUR ACTUAL N8N WEBHOOK URL
$webhookUrl = "http://localhost:5678/webhook/analyze-creatives"

Write-Host "📝 IMPORTANT: Make sure to update the webhook URL in this script!" -ForegroundColor Yellow
Write-Host "   Current URL: $webhookUrl" -ForegroundColor Cyan
Write-Host ""

# Test payload with all required fields (this matches what your workflow expects)
$testPayload = @{
    imageUrl = "https://scontent.xx.fbcdn.net/v/t1.0-9/123456_789.jpg"
    creativeId = "test-123"
    adAccountId = "test-account"
    accessToken = "EAA1234567890abcdef"
}

Write-Host "📤 Test Payload:" -ForegroundColor Yellow
$testPayload | ConvertTo-Json -Depth 3

Write-Host ""
Write-Host "🌐 Making request to n8n webhook..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body ($testPayload | ConvertTo-Json -Depth 3) -ContentType "application/json"
    
    Write-Host ""
    Write-Host "✅ SUCCESS! n8n webhook response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    
    # Analyze the response
    Write-Host ""
    Write-Host "🔍 Response Analysis:" -ForegroundColor Yellow
    Write-Host "   Success: $($response.success)"
    Write-Host "   Score: $($response.score)/10"
    Write-Host "   Session ID: $($response.sessionId)"
    
    if ($response.tokenizationStatus) {
        Write-Host "   Tokenization Status: $($response.tokenizationStatus)"
    }
    
    Write-Host ""
    Write-Host "🎉 Your n8n workflow is working correctly!" -ForegroundColor Green
    Write-Host "   The 'Missing access token' error should now be resolved." -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Request failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode"
        
        try {
            $errorResponse = $_.ErrorDetails.Message
            if ($errorResponse) {
                Write-Host "   Error Details: $errorResponse"
            }
        }
        catch {
            Write-Host "   Could not parse error details"
        }
    }
    
    Write-Host ""
    Write-Host "💡 Troubleshooting Tips:" -ForegroundColor Yellow
    Write-Host "   1. Make sure your n8n workflow is activated" -ForegroundColor White
    Write-Host "   2. Verify the webhook URL is correct" -ForegroundColor White
    Write-Host "   3. Check that n8n is running and accessible" -ForegroundColor White
    Write-Host "   4. Ensure the webhook trigger node is properly configured" -ForegroundColor White
}

