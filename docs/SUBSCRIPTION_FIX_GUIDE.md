# 🔧 Complete Subscription Update Fix Guide

## Issue Description

**Problem**: When users pay for a subscription with Stripe, the subscription status is not being updated on the user's profile page. The profile still shows "Free Plan" even after successful payment.

**Root Cause**: The Stripe webhook secret is not properly configured, preventing webhook events from being processed and user plans from being updated.

## 🚀 Solution Implementation

### Step 1: Environment Configuration

Create a `.env.local` file in your project root with the following configuration:

```bash
# Facebook App Configuration for Localhost Development
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=your_database_url_here

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# n8n Configuration
N8N_HOST=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here

# n8n AI Creative Analyzer Integration - Local Development
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_URL=https://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# NEW ACTIVE Stripe Price IDs with correct pricing (Free, Startup, Pro)
STRIPE_FREE_MONTHLY_PRICE_ID=free
STRIPE_FREE_ANNUAL_PRICE_ID=free
STRIPE_STARTUP_MONTHLY_PRICE_ID=your_startup_monthly_price_id_here
STRIPE_STARTUP_ANNUAL_PRICE_ID=your_startup_annual_price_id_here
STRIPE_PRO_MONTHLY_PRICE_ID=your_pro_monthly_price_id_here
STRIPE_PRO_ANNUAL_PRICE_ID=your_pro_annual_price_id_here
```

### Step 2: Stripe Dashboard Configuration

#### 2.1 Get Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

#### 2.2 Create Products and Prices
1. Go to **Products** in Stripe Dashboard
2. Create three products:
   - **Free Plan** (Free)
   - **Startup Plan** ($10/month, $96/year)
   - **Pro Plan** ($20/month, $192/year)
3. For each product, create monthly and annual recurring prices
4. Copy the **Price IDs** (start with `price_`)

#### 2.3 Configure Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
   - `payment_method.attached`
   - `payment_method.detached`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

### Step 3: Update Environment Variables

Replace the placeholder values in your `.env.local` file:

```bash
# Replace these with your actual Stripe values
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here

# Replace with your actual Stripe price IDs
STRIPE_STARTUP_MONTHLY_PRICE_ID=price_your_startup_monthly_id
STRIPE_STARTUP_ANNUAL_PRICE_ID=price_your_startup_annual_id
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_id
STRIPE_PRO_ANNUAL_PRICE_ID=price_your_pro_annual_id
```

### Step 4: Database Initialization

Run the database initialization script to ensure all required tables exist:

```bash
npm run init:stripe-db
```

### Step 5: Test the Integration

#### 5.1 Test Webhook Endpoint
```bash
node scripts/test-webhook-endpoint.js
```

#### 5.2 Test Local Development
For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# Windows: Download from https://github.com/stripe/stripe-cli/releases
# macOS: brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

#### 5.3 Test Payment Flow
1. Start your development server: `npm run dev`
2. Go to the billing page
3. Select a paid plan
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete the payment
6. Verify the user's plan is updated in the database and UI

## 🔍 How the System Works

### 1. Payment Flow
```
User selects plan → Checkout session created → User pays → Stripe webhook → Plan updated
```

### 2. Webhook Processing
The webhook handler (`app/api/stripe/webhook/route.ts`) processes these events:

- **`customer.subscription.created`**: Creates subscription record and updates user plan
- **`customer.subscription.updated`**: Updates subscription and user plan
- **`customer.subscription.deleted`**: Marks subscription as canceled and resets user to free plan

### 3. User Plan Updates
The `updateUserPlan` function in `lib/db.ts` updates these fields in the users table:
- `current_plan_id`
- `current_plan_name`
- `current_billing_cycle`
- `subscription_status`

### 4. Frontend Display
The session API (`app/api/auth/session/route.ts`) includes subscription information, which is displayed in:
- Header dropdown
- Settings page
- User profile components

## 🐛 Troubleshooting

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
- Check that `STRIPE_WEBHOOK_SECRET` matches the webhook signing secret
- Ensure the webhook secret is not truncated or modified
- Verify the webhook endpoint URL is correct

### Issue 3: User Plan Not Updating
**Symptoms**: Payment succeeds but user plan doesn't change
**Solutions**:
- Check webhook logs for errors
- Verify user email matches between Stripe and database
- Check database connection and permissions
- Ensure `updateUserPlan` function is being called

### Issue 4: Frontend Not Showing Updated Plan
**Symptoms**: Database updated but UI still shows old plan
**Solutions**:
- Check session API response includes subscription fields
- Verify UserContext is properly updated
- Clear browser cache and refresh page
- Check for JavaScript errors in browser console

## 📋 Verification Checklist

- [ ] `.env.local` file created with all Stripe configuration
- [ ] Stripe API keys are valid and working
- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Webhook secret copied to environment variables
- [ ] Database tables created with plan fields
- [ ] Webhook endpoint test passes
- [ ] Payment flow works end-to-end
- [ ] User plan updates correctly after payment
- [ ] Frontend displays updated plan information

## 🚀 Production Deployment

### 1. Update Environment Variables
Replace test keys with live keys:
```bash
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
```

### 2. Update Webhook Endpoint
In Stripe Dashboard, update webhook endpoint URL to your production domain:
```
https://yourdomain.com/api/stripe/webhook
```

### 3. Test with Real Payments
Use real payment methods to test the complete flow in production.

## 📚 Additional Resources

- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Installation](https://stripe.com/docs/stripe-cli)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## 🔄 Maintenance

### Regular Checks
- Monitor webhook delivery in Stripe Dashboard
- Check webhook logs for errors
- Verify subscription status accuracy
- Test payment flow periodically

### Updates
- Keep Stripe SDK updated
- Monitor Stripe API changes
- Update webhook event handling as needed
- Review and update pricing plans

---

**Note**: This guide assumes you have a working Stripe account and basic understanding of webhook concepts. If you need help with Stripe account setup, refer to the [Stripe Documentation](https://stripe.com/docs).

