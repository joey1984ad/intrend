# Ad Account Pricing and Checkout Fix

This document outlines the fixes implemented for the ad account selection and pricing issues.

## Issues Fixed

### 1. Pricing Display Issues
**Problem**: The monthly price was showing as $0 in the plan selector and billing manager.

**Root Cause**: 
- Missing `stripe_price_id` property handling in `PerAccountBillingManager.tsx`
- Plan lookup was failing due to incorrect key mapping in `getPerAccountPlan` function
- Missing environment variables for Stripe price IDs

**Solution**:
- Fixed plan lookup logic in `lib/stripe.ts` to handle both `basic` and `per_account_basic` plan IDs
- Added fallback handling for missing `stripe_price_id` property
- Added test price IDs as fallbacks to ensure pricing always displays
- Enhanced error logging and debugging

### 2. Monthly/Annual Selection Issues
**Problem**: Users couldn't properly select between monthly and annual billing cycles.

**Solution**:
- Enhanced billing cycle switching in `PerAccountPlanSelector.tsx`
- Fixed cost calculation to properly handle both billing cycles
- Added visual indicators for savings on annual plans
- Improved error handling for pricing calculation failures

### 3. Checkout Flow Issues
**Problem**: Checkout wasn't working properly and subscriptions weren't being created.

**Root Cause**:
- Direct subscription creation was failing due to payment method requirements
- API was trying to create subscriptions without proper Stripe Checkout flow

**Solution**:
- Created new `/api/create-checkout-session` endpoint for proper Stripe Checkout integration
- Updated `MetaDashboard.tsx` to use Stripe Checkout instead of direct subscription creation
- Implemented Stripe webhook handler at `/api/stripe/webhook` to handle successful payments
- Added proper redirection flow from Stripe back to the dashboard

### 4. Add Account Button Not Working
**Problem**: When clicking "Add Account" or per-account buttons, nothing was happening.

**Root Cause**:
- The `PerAccountBillingManager` component only displayed when there was a selected ad account with an existing subscription
- When no subscriptions existed or no account was selected, the interface was completely hidden
- The "Add Account" button was only shown when there were available accounts, but the logic for determining "available" was incorrect

**Solution**:
- Completely redesigned the `PerAccountBillingManager` component to handle three states:
  1. **No selected account**: Shows interface to add first subscription with all available accounts
  2. **Selected account but no subscription**: Shows option to create subscription for that account
  3. **Selected account with subscription**: Shows normal billing management interface
- Updated `MetaDashboard.tsx` to always show the billing manager component
- Added custom event system for account subscription creation
- Enhanced debugging and error messages to help identify issues
- Added proper account filtering and availability detection

## Files Modified

### Core Pricing Logic
- `lib/stripe.ts`: Fixed plan lookup and added fallback price IDs
- `env.example`: Added missing per-account price ID environment variables

### Components
- `components/PerAccountPlanSelector.tsx`: Enhanced pricing display and debugging
- `components/PerAccountBillingManager.tsx`: Fixed plan detection from existing subscriptions
- `components/MetaDashboard.tsx`: Updated to use Stripe Checkout flow

### API Endpoints
- `app/api/create-checkout-session/route.ts`: NEW - Handles Stripe Checkout session creation
- `app/api/stripe/webhook/route.ts`: NEW - Handles Stripe webhook events
- `app/api/facebook/auth/route.ts`: Enhanced error logging for subscription creation

## Configuration Changes

### Environment Variables Added
Add these to your `.env.local` file:

```bash
# Stripe Per-Account Price IDs
STRIPE_PER_ACCOUNT_BASIC_MONTHLY_PRICE_ID=price_1234567890_basic_monthly
STRIPE_PER_ACCOUNT_BASIC_ANNUAL_PRICE_ID=price_1234567890_basic_annual
STRIPE_PER_ACCOUNT_PRO_MONTHLY_PRICE_ID=price_1234567890_pro_monthly
STRIPE_PER_ACCOUNT_PRO_ANNUAL_PRICE_ID=price_1234567890_pro_annual
```

### Stripe Webhook Configuration
1. In your Stripe Dashboard, go to Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## User Flow Improvements

### Before (Broken)
1. User visits dashboard → No "Add Account" interface visible if no subscriptions exist
2. User clicks "Choose Plan & Subscribe" → Account selector appears but may show $0 pricing
3. User selects accounts → Plan selector shows $0 pricing due to plan lookup issues
4. User clicks "Create Subscriptions" → Direct API call fails due to payment method requirements
5. No payment collection, subscriptions fail silently

### After (Fixed)
1. User visits dashboard → Always shows per-account billing interface
2. **If no subscriptions exist**: Shows "Add Your First Ad Account Subscription" with clickable account list
3. **If account selected but no subscription**: Shows "Create Subscription for This Account" button
4. **If accounts with subscriptions exist**: Shows normal billing management with "Add Account" button
5. User clicks account or "Add Account" → Plan selector opens with correct pricing
6. User selects plan and billing cycle → Cost summary updates correctly showing $10/month or $96/year
7. User clicks "Create Subscriptions" → Redirects to Stripe Checkout with proper payment flow
8. User completes payment → Stripe webhook creates database records automatically
9. User returns to dashboard → Subscriptions appear immediately with proper status

## Testing

### Test the Fix
1. Navigate to the dashboard
2. Click "Choose Plan & Subscribe" 
3. Select ad accounts (pricing should show correctly)
4. Choose between monthly/annual plans (prices should update)
5. Click "Create Subscriptions"
6. Should redirect to Stripe Checkout
7. Complete test payment
8. Should return to dashboard with active subscriptions

### Debug Information
- Open browser console to see detailed logging
- Check for pricing calculation errors
- Verify Stripe price IDs are properly configured
- Monitor webhook delivery in Stripe Dashboard

## Fallback Behavior

If Stripe integration fails:
- Pricing still displays correctly using fallback test price IDs
- Error messages guide users to check configuration
- Debug information helps identify missing environment variables

## Security Considerations

- Webhook endpoint validates Stripe signatures
- Customer data is properly associated with user accounts
- Payment processing handled entirely by Stripe
- No sensitive payment data stored locally

## Future Improvements

1. Add subscription management UI for existing customers
2. Implement proration for mid-cycle plan changes
3. Add usage-based billing metrics
4. Implement subscription pause/resume functionality
5. Add team member billing controls
