# 🔧 Stripe Checkout Debugging Guide

## Issue Description

**Problem**: Users are getting "Failed to create checkout session" error when trying to purchase plans through the frontend.

**Error Message**: "Failed to create checkout session: Failed to create checkout session"

## Debugging Process

### 1. Environment Variables Check ✅
All required environment variables are properly configured:
- ✅ `STRIPE_SECRET_KEY`: Configured
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Configured  
- ✅ `STRIPE_WEBHOOK_SECRET`: Configured
- ✅ `DATABASE_URL`: Configured

### 2. Stripe Price IDs Check ✅
All Stripe price IDs are properly configured:
- ✅ `STRIPE_STARTUP_MONTHLY_PRICE_ID`: price_1S1kVxANcZDuq721EO3W2fSK
- ✅ `STRIPE_STARTUP_ANNUAL_PRICE_ID`: price_1S1kVxANcZDuq721CYF9o7GO
- ✅ `STRIPE_PRO_MONTHLY_PRICE_ID`: price_1S1kVxANcZDuq721dYSk9ZzN
- ✅ `STRIPE_PRO_ANNUAL_PRICE_ID`: price_1S1kVyANcZDuq721xW6iWmvo

### 3. Stripe API Connection Test ✅
- ✅ Stripe API connection successful
- ✅ Account ID: acct_1S0sKYANcZDuq721
- ✅ Account Type: standard

### 4. Products and Prices Verification ✅
Found 10 products in Stripe dashboard with correct pricing:
- ✅ Pro Plan: $20/month, $192/year
- ✅ Startup Plan: $10/month, $96/year
- ✅ Free Plan: $0 (no Stripe price needed)

### 5. Checkout Session Creation Test ✅
Direct API tests show checkout sessions are created successfully:
- ✅ Startup Monthly: Session created with URL
- ✅ Pro Annual: Session created with URL

### 6. Database Connection Test ✅
- ✅ Database connection successful

## Root Cause Analysis

The issue is **NOT** with the Stripe configuration or API. The problem appears to be in the **frontend-to-backend communication** or **plan ID mapping**.

### Potential Issues Identified:

1. **Plan ID Mismatch**: Frontend and backend might be using different plan IDs
2. **Request Format**: Frontend might not be sending the correct request format
3. **CORS/Network Issues**: Frontend requests might be failing due to network issues
4. **Error Handling**: The error message might be generic and not showing the real issue

## Solution Steps

### 1. Enhanced Logging ✅
Added comprehensive logging to the checkout API route:
```typescript
console.log('Checkout session request:', { planId, billingCycle, customerEmail, successUrl, cancelUrl });
console.log('Plan lookup result:', { planId, billingCycle, plan: plan ? { id: plan.id, name: plan.name, price: plan.currentPricing.price } : null });
```

### 2. Fixed Plan ID Reference ✅
Fixed the trial period check in the API route:
```typescript
// Before (causing linter error)
trial_period_days: plan.id === 'professional' ? 7 : undefined

// After (correct)
trial_period_days: plan.id === 'pro' ? 7 : undefined
```

### 3. Plan Structure Verification ✅
Verified that both frontend and backend use the same plan IDs:
- Frontend (`SaaSLandingPage.tsx`): `'free'`, `'startup'`, `'pro'`
- Backend (`lib/stripe.ts`): `'free'`, `'startup'`, `'pro'`

## Testing Instructions

### 1. Test the Frontend
1. Start the development server: `npm run dev`
2. Navigate to the front page
3. Try to select a paid plan (Startup or Pro)
4. Check the browser console for any errors
5. Check the server console for the enhanced logging

### 2. Test the API Directly
Use the debug script to test the API directly:
```bash
node scripts/debug-stripe-checkout.js
```

### 3. Monitor Server Logs
When a user tries to purchase a plan, you should see logs like:
```
Checkout session request: { planId: 'startup', billingCycle: 'monthly', customerEmail: 'user@example.com', ... }
Plan lookup result: { planId: 'startup', billingCycle: 'monthly', plan: { id: 'startup', name: 'Startup', price: 10 } }
```

## Common Fixes

### 1. If Plan Not Found
- Check that the plan ID in the frontend matches the backend
- Verify the `PRICING_PLANS` configuration in `lib/stripe.ts`

### 2. If Stripe Price ID Missing
- Run the setup script: `node scripts/setup-stripe-products.js`
- Add the generated price IDs to `.env.local`

### 3. If Database Connection Fails
- Check the `DATABASE_URL` environment variable
- Ensure the database is accessible

### 4. If Network Issues
- Check if the development server is running on the correct port
- Verify HTTPS/HTTP configuration
- Check for CORS issues

## Prevention

1. **Always test checkout flow** after making changes to pricing or plans
2. **Use the debug script** to verify Stripe configuration
3. **Monitor server logs** for checkout requests
4. **Test with different browsers** to ensure compatibility
5. **Verify environment variables** are properly set

## Related Files

- `app/api/stripe/create-checkout-session/route.ts` - Checkout API endpoint
- `lib/stripe.ts` - Stripe configuration and pricing plans
- `components/SaaSLandingPage.tsx` - Frontend pricing component
- `scripts/debug-stripe-checkout.js` - Debug script
- `scripts/setup-stripe-products.js` - Setup script

## Next Steps

1. **Deploy the enhanced logging** to production
2. **Monitor real user checkout attempts** to identify the exact issue
3. **Test the checkout flow** in a production-like environment
4. **Set up error monitoring** for checkout failures
