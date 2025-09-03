# 🔧 Subscription Update Troubleshooting Guide

## Issue: Subscription Plan Not Updating After Stripe Payment

**Problem**: When users pay for a subscription with Stripe, the subscription status is not being updated on the user's profile page. The profile still shows "Free Plan" even after successful payment.

## 🔍 Diagnostic Steps

### Step 1: Verify Database Schema
Run the database migration to ensure plan fields exist:
```bash
npm run init:stripe-db
```

### Step 2: Test Webhook Endpoint
Test if the webhook endpoint is working:
```bash
node scripts/test-webhook-endpoint.js
```

### Step 3: Check Environment Variables
Verify these environment variables are set in `.env.local`:
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 4: Verify Stripe Dashboard Configuration
1. **Webhook Endpoint**: Check if webhook is configured in Stripe Dashboard
2. **Webhook URL**: Should be `https://yourdomain.com/api/stripe/webhook`
3. **Events**: Should include `customer.subscription.created`, `customer.subscription.updated`
4. **Webhook Secret**: Copy the signing secret and add to environment variables

### Step 5: Test Local Development
For local development, use Stripe CLI to forward webhooks:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🐛 Common Issues and Solutions

### Issue 1: Webhook Not Receiving Events
**Symptoms**: No webhook events in server logs
**Solutions**:
- Check webhook endpoint URL in Stripe Dashboard
- Verify webhook secret is correct
- Ensure webhook endpoint is accessible (HTTPS required for production)
- Use Stripe CLI for local testing

### Issue 2: Webhook Signature Verification Failing
**Symptoms**: "Invalid signature" errors in logs
**Solutions**:
- Verify `STRIPE_WEBHOOK_SECRET` environment variable
- Check webhook secret in Stripe Dashboard
- Ensure webhook secret starts with `whsec_`

### Issue 3: Database Update Failing
**Symptoms**: Webhook received but user plan not updated
**Solutions**:
- Check database connection
- Verify `updateUserPlan` function is working
- Check for database migration issues
- Run `npm run init:stripe-db` to ensure tables exist

### Issue 4: Session Not Refreshing
**Symptoms**: Database updated but UI still shows old plan
**Solutions**:
- Check if session API includes subscription fields
- Verify UserContext is updated
- Force page refresh to reload session data
- Check browser cache

### Issue 5: Metadata Missing
**Symptoms**: Webhook received but plan information is "unknown"
**Solutions**:
- Verify checkout session includes plan metadata
- Check `create-checkout-session` route
- Ensure metadata is set in both session and subscription_data

## 🧪 Testing Procedures

### Test 1: Database Migration
```bash
node scripts/test-plan-update.js
```
This should show:
- ✅ Database migration completed
- ✅ Subscription creation works
- ✅ User plan updates work

### Test 2: Webhook Endpoint
```bash
node scripts/test-webhook-endpoint.js
```
This should show:
- ✅ Webhook secret found
- ✅ Webhook endpoint is working correctly

### Test 3: Manual Subscription Test
1. Create a test user in database
2. Manually call `updateUserPlan` function
3. Verify user plan is updated
4. Check session API returns updated plan

### Test 4: Stripe Checkout Flow
1. Start development server: `npm run dev`
2. Start Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Go through checkout process
4. Monitor webhook events in Stripe CLI
5. Check server logs for webhook processing

## 📋 Checklist

### Environment Setup
- [ ] `STRIPE_SECRET_KEY` is set
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- [ ] `STRIPE_WEBHOOK_SECRET` is set
- [ ] Stripe price IDs are configured

### Database Setup
- [ ] Database migration completed
- [ ] `users` table has plan fields
- [ ] `subscriptions` table exists
- [ ] `updateUserPlan` function works

### Webhook Setup
- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Webhook URL is correct
- [ ] Webhook events selected
- [ ] Webhook secret copied to environment

### Code Verification
- [ ] Webhook handler is working
- [ ] Session API includes subscription fields
- [ ] UserContext includes subscription fields
- [ ] UI components display subscription status

## 🔧 Debug Commands

### Check Database Schema
```bash
npm run init:stripe-db
```

### Test Webhook Connectivity
```bash
node scripts/test-webhook-endpoint.js
```

### Test Plan Update Flow
```bash
node scripts/test-plan-update.js
```

### Check Environment Variables
```bash
node scripts/validate-env.js
```

## 📞 Support

If the issue persists after following this guide:

1. **Check Server Logs**: Look for webhook processing errors
2. **Verify Stripe Dashboard**: Check webhook delivery status
3. **Test with Stripe CLI**: Use `stripe listen` for local testing
4. **Check Database**: Verify data is being updated correctly

## 🚀 Quick Fix

If you need a quick fix to test the subscription update:

1. **Manual Database Update**:
```sql
UPDATE users 
SET current_plan_id = 'startup', 
    current_plan_name = 'Startup', 
    current_billing_cycle = 'monthly', 
    subscription_status = 'active' 
WHERE email = 'user@example.com';
```

2. **Force Session Refresh**:
- Log out and log back in
- Or clear browser cache and refresh

3. **Test UI Update**:
- Check if profile page shows updated plan
- Verify header dropdown shows correct plan
- Check settings page subscription section
