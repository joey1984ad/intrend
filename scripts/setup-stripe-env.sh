#!/bin/bash

# 🔧 Stripe Environment Setup Script
# This script helps set up the environment variables for Stripe integration

echo "🔧 Stripe Environment Setup Script"
echo "=================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file already exists"
else
    echo "📝 Creating .env.local file..."
    cp env.local.new .env.local
    echo "✅ .env.local file created from env.local.new"
fi

echo ""
echo "📋 Required Environment Variables:"
echo "==================================="
echo ""
echo "Please update your .env.local file with the following values:"
echo ""
echo "# Stripe Configuration"
echo "STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here"
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here"
echo "STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here"
echo ""
echo "# Stripe Price IDs"
echo "STRIPE_STARTUP_MONTHLY_PRICE_ID=price_your_startup_monthly_id"
echo "STRIPE_STARTUP_ANNUAL_PRICE_ID=price_your_startup_annual_id"
echo "STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_id"
echo "STRIPE_PRO_ANNUAL_PRICE_ID=price_your_pro_annual_id"
echo ""
echo "🔗 Get these values from:"
echo "   - Stripe Dashboard → Developers → API keys"
echo "   - Stripe Dashboard → Developers → Webhooks"
echo "   - Stripe Dashboard → Products → Your Products"
echo ""
echo "🧪 After updating .env.local, test with:"
echo "   node scripts/test-webhook-endpoint.js"
echo ""
echo "📚 For detailed instructions, see: docs/SUBSCRIPTION_FIX_GUIDE.md"

