# 🔧 Stripe Environment Setup Script (PowerShell)
# This script helps set up the environment variables for Stripe integration

Write-Host "🔧 Stripe Environment Setup Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file already exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item "env.local.new" ".env.local"
    Write-Host "✅ .env.local file created from env.local.new" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Required Environment Variables:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please update your .env.local file with the following values:" -ForegroundColor White
Write-Host ""
Write-Host "# Stripe Configuration" -ForegroundColor Yellow
Write-Host "STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here" -ForegroundColor Gray
Write-Host "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here" -ForegroundColor Gray
Write-Host "STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here" -ForegroundColor Gray
Write-Host ""
Write-Host "# Stripe Price IDs" -ForegroundColor Yellow
Write-Host "STRIPE_STARTUP_MONTHLY_PRICE_ID=price_your_startup_monthly_id" -ForegroundColor Gray
Write-Host "STRIPE_STARTUP_ANNUAL_PRICE_ID=price_your_startup_annual_id" -ForegroundColor Gray
Write-Host "STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_id" -ForegroundColor Gray
Write-Host "STRIPE_PRO_ANNUAL_PRICE_ID=price_your_pro_annual_id" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Get these values from:" -ForegroundColor Cyan
Write-Host "   - Stripe Dashboard → Developers → API keys" -ForegroundColor White
Write-Host "   - Stripe Dashboard → Developers → Webhooks" -ForegroundColor White
Write-Host "   - Stripe Dashboard → Products → Your Products" -ForegroundColor White
Write-Host ""
Write-Host "🧪 After updating .env.local, test with:" -ForegroundColor Cyan
Write-Host "   node scripts/test-webhook-endpoint.js" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see: docs/SUBSCRIPTION_FIX_GUIDE.md" -ForegroundColor Cyan

