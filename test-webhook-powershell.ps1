# PowerShell Webhook Test Script
# Tests the /api/analyze-creatives endpoint with correct payload format

Write-Host "🧪 Testing Webhook with Correct Payload Format..." -ForegroundColor Green
Write-Host ""

# Test payload with all required fields
$testPayload = @{
    imageUrl = "https://scontent.xx.fbcdn.net/v/t1.0-9/123456_789.jpg"
    creativeId = "test-123"
    adAccountId = "test-account"
    accessToken = "EAA1234567890abcdef"
}

Write-Host "📤 Test Payload:" -ForegroundColor Yellow
$testPayload | ConvertTo-Json -Depth 3

Write-Host ""
Write-Host "🌐 Making request to: http://localhost:3000/api/analyze-creatives" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/analyze-creatives" -Method POST -Body ($testPayload | ConvertTo-Json -Depth 3) -ContentType "application/json"
    
    Write-Host ""
    Write-Host "✅ SUCCESS! Response received:" -ForegroundColor Green
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
}
catch {
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
}
