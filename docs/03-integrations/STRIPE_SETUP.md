# 🚀 Stripe Integration Setup Guide

## Overview
This guide will help you set up Stripe payment processing for your Intrend dashboard with subscription management.

## 📋 Prerequisites
- Stripe account (https://stripe.com)
- Node.js and npm installed
- Environment variables configured

## 🔑 Step 1: Get Stripe API Keys

### 1.1 Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in to your account
3. Complete account verification

### 1.2 Get API Keys
1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
4. Keep these keys secure and never commit them to version control

## 💳 Step 2: Create Products and Prices

### 2.1 Create Products
1. Go to **Products** in Stripe Dashboard
2. Click **Add Product**
3. Create three products:
   - **Starter** (Free plan)
   - **Professional** ($10/month)
   - **Enterprise** ($20/month)

### 2.2 Create Prices
1. For each product, click **Add pricing**
2. Set pricing type to **Recurring price**
3. Set billing period to **Monthly**
4. Set amount (0 for Starter, 1000 for Professional, 2000 for Enterprise)
5. Copy the **Price ID** (starts with `price_`)

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Update .env.local
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (replace with your actual Stripe price IDs)
STRIPE_STARTER_PRICE_ID=price_starter_monthly
STRIPE_PROFESSIONAL_PRICE_ID=price_professional_monthly
STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_monthly
```

### 3.2 Update .env (production)
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs
STRIPE_STARTER_PRICE_ID=price_starter_monthly
STRIPE_PROFESSIONAL_PRICE_ID=price_professional_monthly
STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_monthly
```

## 🔗 Step 4: Configure Webhooks

### 4.1 Create Webhook Endpoint
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

### 4.2 Update Webhook Secret
Add the webhook secret to your environment variables:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

## 🧪 Step 5: Test the Integration

### 5.1 Test Mode
- Use Stripe test cards for testing
- Test card number: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

### 5.2 Test Scenarios
1. **Free Plan**: Should redirect to success page
2. **Paid Plans**: Should redirect to Stripe Checkout
3. **Payment Success**: Should redirect to success page
4. **Payment Failure**: Should redirect to cancel page

## 🚀 Step 6: Go Live

### 6.1 Switch to Live Mode
1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Update environment variables with live keys
3. Update webhook endpoint URL to production domain
4. Test with real payment methods

### 6.2 Security Checklist
- [ ] API keys are secure and not in version control
- [ ] Webhook endpoint is HTTPS
- [ ] Webhook signature verification is enabled
- [ ] Error handling is implemented
- [ ] Logging is configured for debugging

## 🔧 Troubleshooting

### Common Issues

#### 1. "Invalid API key" Error
- Check that your API keys are correct
- Ensure you're using the right mode (test vs live)
- Verify environment variables are loaded

#### 2. Webhook Not Receiving Events
- Check webhook endpoint URL is accessible
- Verify webhook secret is correct
- Check server logs for errors
- Test webhook endpoint manually

#### 3. Checkout Not Redirecting
- Verify publishable key is correct
- Check browser console for JavaScript errors
- Ensure checkout session is created successfully

#### 4. Subscription Not Updating
- Check webhook handler is working
- Verify database updates are implemented
- Check Stripe Dashboard for subscription status

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)

## 🆘 Support

If you encounter issues:
1. Check Stripe Dashboard for error logs
2. Review server logs for API errors
3. Test with Stripe CLI for local development
4. Contact Stripe support for account issues

---

**Note**: This integration is set up for subscription-based billing. For one-time payments or other payment flows, additional configuration may be required.
