# 🚀 Per-Account Pricing as Default Model

## Overview

The Intrend platform has been updated to use **per-account subscription pricing** as the default model for all Plans & Pricing sections. This change provides users with more flexibility and cost control by allowing them to pay only for the Facebook ad accounts they want to manage.

## 🎯 Key Changes Made

### 1. Updated Pricing Components

#### `SimpleBillingPage.tsx`
- **Changed**: Replaced traditional pricing plans with per-account plans
- **New Plans**: 
  - Per Account Basic: $10/month per account (or $96/year with 20% discount)
  - Per Account Pro: $20/month per account (or $192/year with 20% discount)
- **Button Text**: Changed from "Choose Plan" to "Connect Facebook Accounts"
- **Header**: Updated to "Per-Account Subscription Plans"
- **Description**: "Pay only for the Facebook ad accounts you want to manage. Each account gets its own subscription."

#### `SaaSLandingPage.tsx`
- **Changed**: Updated front page pricing to use per-account model
- **New Plans**: Same per-account plans as billing page
- **Header**: Updated to "Per-Account Subscription Plans"
- **Description**: "Pay only for the Facebook ad accounts you want to manage. Each account gets its own subscription."

#### `PricingSection.tsx`
- **Changed**: Updated to use `PER_ACCOUNT_PRICING_PLANS` instead of `PRICING_PLANS`
- **Button Text**: Changed to "Connect Facebook Accounts"
- **Period Display**: Shows "/month per account" or "/year per account"
- **Added**: `popular` property to per-account plans (Basic is popular)

### 2. Updated Plan Selection Flow

#### Before (Traditional Model)
1. User selects plan → Stripe checkout → Payment → Subscription created
2. User manages all ad accounts under single subscription
3. Fixed pricing regardless of number of accounts

#### After (Per-Account Model)
1. User selects plan → Redirects to dashboard → Facebook connection
2. User selects which ad accounts to include → Individual subscriptions created
3. Pay only for selected accounts, add/remove accounts as needed

### 3. Updated Stripe Configuration

#### `lib/stripe.ts`
- **Added**: `popular` property to `PER_ACCOUNT_PRICING_PLANS`
- **Basic Plan**: Marked as popular (most recommended)
- **Pro Plan**: Standard option for advanced features

## 🔄 User Experience Flow

### 1. Plan Selection
1. User visits Plans & Pricing page
2. Sees per-account pricing options:
   - **Per Account Basic**: $10/month per account
   - **Per Account Pro**: $20/month per account
3. User clicks "Connect Facebook Accounts"

### 2. Facebook Connection
1. User is redirected to dashboard
2. Connects Facebook account
3. System fetches all available ad accounts
4. **AdAccountSelector** modal appears

### 3. Account Selection
1. User sees all Facebook ad accounts
2. Can select/deselect which accounts to include
3. Real-time cost calculation shows total
4. User confirms selection

### 4. Subscription Creation
1. **PerAccountPlanSelector** appears with selected accounts
2. User confirms plan and billing cycle
3. Individual Stripe subscriptions created for each selected account
4. User can manage each account independently

## 💰 Pricing Structure

### Per Account Basic ($10/month per account)
- Basic analytics per account
- Campaign management
- Creative gallery access
- Email support
- Account-specific insights
- Individual account billing

### Per Account Pro ($20/month per account)
- Advanced analytics per account
- AI-powered insights
- Custom reporting
- Priority support
- API access
- Account-specific optimizations
- Individual account billing

### Annual Discount
- 20% discount for annual billing
- Basic: $96/year per account (vs $120 monthly)
- Pro: $192/year per account (vs $240 monthly)

## 🎯 Benefits of Per-Account Model

### For Users
- **Cost Control**: Only pay for accounts they want to manage
- **Flexibility**: Start with fewer accounts and scale up
- **Transparency**: Clear understanding of what they're paying for
- **Easy Management**: Add or remove accounts as needed
- **No Waste**: Don't pay for unused account slots

### For Business
- **Lower Barrier to Entry**: Users can start with fewer accounts
- **Higher Conversion**: Less intimidating initial cost
- **Better Retention**: Users can optimize their subscription
- **Scalable Revenue**: Users can add accounts over time
- **Reduced Churn**: Users can remove accounts instead of canceling entire subscription

## 🔧 Technical Implementation

### Environment Variables
```bash
# Per-Account Stripe Price IDs
STRIPE_PER_ACCOUNT_BASIC_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PER_ACCOUNT_BASIC_ANNUAL_PRICE_ID=price_xxxxx
STRIPE_PER_ACCOUNT_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PER_ACCOUNT_PRO_ANNUAL_PRICE_ID=price_xxxxx
```

### API Endpoints
- `/api/create-per-account-subscriptions`: Creates individual subscriptions for selected accounts
- `/api/per-account-subscriptions`: Manages individual subscriptions
- `/api/facebook/auth`: Handles Facebook connection and account fetching

### Database Tables
- `ad_account_subscriptions`: Stores individual subscriptions per account
- `per_account_billing_history`: Tracks billing history per account
- `facebook_sessions`: Manages Facebook access tokens

## 📊 Migration Impact

### Existing Users
- Current subscriptions remain unchanged
- Can upgrade to per-account model by connecting Facebook accounts
- No forced migration required

### New Users
- Default to per-account model
- Must connect Facebook accounts to create subscriptions
- More flexible and cost-effective option

## 🚀 Future Enhancements

### Planned Features
- **Usage-Based Billing**: Charge based on ad spend or impressions
- **Team Management**: Share accounts across team members
- **Custom Plans**: Allow custom pricing for enterprise clients
- **Analytics Dashboard**: Revenue and usage analytics per account
- **Automated Scaling**: Auto-upgrade plans based on usage

### Integration Opportunities
- **CRM Integration**: Sync subscription data with CRM
- **Analytics Platforms**: Export billing data to analytics tools
- **Customer Support**: Enhanced support tools for subscription management

## 📝 Maintenance Notes

### Regular Tasks
- Monitor per-account subscription creation rates
- Review account selection patterns
- Update plan configurations as needed
- Monitor Stripe API usage and costs per account
- Track revenue per account type

### Troubleshooting
- Check Facebook API connection logs
- Verify Stripe product and price configurations
- Monitor database performance for subscription queries
- Review error logs for API failures
- Check account selection modal functionality

---

This per-account pricing model provides a more flexible, cost-effective, and user-friendly approach to Facebook ad account management while maintaining the same high-quality features and support.
