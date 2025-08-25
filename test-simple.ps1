Write-Host "Testing webhook with correct payload format..."

$payload = @{
    imageUrl = "https://scontent.xx.fbcdn.net/v/t1.0-9/123456_789.jpg"
    creativeId = "test-123"
    adAccountId = "test-account"
    accessToken = "EAA1234567890abcdef"
}

Write-Host "Payload:"
$payload | ConvertTo-Json

Write-Host "Making request..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/analyze-creatives" -Method POST -Body ($payload | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Success: $($response | ConvertTo-Json)"
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
}
