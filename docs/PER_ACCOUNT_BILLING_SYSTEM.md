# 🚀 Per-Account Billing System Implementation (DEFAULT MODEL)

## Overview

This document outlines the complete implementation of the per-account billing system for Intrend, which is now the **DEFAULT** pricing model for all Plans & Pricing sections. Each Facebook ad account connected to the dashboard gets its own individual Stripe subscription, allowing for granular billing and management. Users can now select which ad accounts to include in their subscription when they have multiple Facebook ad accounts.

## ✨ New Features

### Ad Account Selection (DEFAULT MODEL)
- **Selective Subscription**: Users can choose which Facebook ad accounts to include in their subscription
- **Account Management**: Add or remove ad accounts from existing subscriptions
- **Visual Interface**: Clear account selection modal with status indicators
- **Cost Preview**: Real-time cost calculation based on selected accounts
- **Flexible Management**: Manage subscriptions per account independently
- **DEFAULT PRICING**: All Plans & Pricing sections now use per-account model by default

## 🏗️ System Architecture

### Database Schema

#### `ad_account_subscriptions` Table
- **Purpose**: Stores individual subscriptions for each Facebook ad account
- **Key Fields**:
  - `user_id`: Links to the user who owns the account
  - `ad_account_id`: Facebook ad account ID
  - `ad_account_name`: Human-readable account name
  - `stripe_subscription_id`: Stripe subscription ID
  - `stripe_price_id`: Stripe price ID for the plan
  - `billing_cycle`: Monthly or annual billing
  - `amount_cents`: Amount charged in cents
  - `status`: Subscription status (active, canceled, etc.)

#### `per_account_billing_history` Table
- **Purpose**: Tracks billing history for each ad account subscription
- **Key Fields**:
  - `subscription_id`: Links to ad_account_subscriptions
  - `stripe_invoice_id`: Stripe invoice ID
  - `amount_cents`: Amount charged
  - `billing_period_start/end`: Billing period dates
  - `status`: Payment status

#### `per_account_plan_configs` Table
- **Purpose**: Stores available per-account plan configurations
- **Key Fields**:
  - `plan_name`: Plan name (e.g., "Per Account Basic")
  - `monthly_price_cents`: Monthly price in cents
  - `annual_price_cents`: Annual price in cents
  - `stripe_monthly_price_id`: Stripe price ID for monthly billing
  - `stripe_annual_price_id`: Stripe price ID for annual billing
  - `features`: JSON array of plan features

### Pricing Structure

#### Per Account Basic
- **Monthly**: $10.00 per account
- **Annual**: $96.00 per account (20% discount)
- **Features**:
  - Basic analytics per account
  - Campaign management
  - Creative gallery access
  - Email support
  - Account-specific insights

#### Per Account Pro
- **Monthly**: $20.00 per account
- **Annual**: $192.00 per account (20% discount)
- **Features**:
  - Advanced analytics per account
  - AI-powered insights
  - Custom reporting
  - Priority support
  - API access
  - Account-specific optimizations

## 🔧 Implementation Details

### API Endpoints

#### `/api/per-account-subscriptions`
- **GET**: Retrieve all per-account subscriptions for a user
- **POST**: Create a new per-account subscription
- **PUT**: Update subscription (change plan, billing cycle)
- **DELETE**: Cancel a subscription

#### `/api/create-per-account-subscriptions`
- **POST**: Bulk create subscriptions for multiple Facebook ad accounts
- **Purpose**: Called when user connects Facebook account with multiple ad accounts

### Database Functions

#### Core Functions (`lib/db.ts`)
- `createAdAccountSubscription()`: Create new subscription
- `getAdAccountSubscriptions()`: Get all user subscriptions
- `getAdAccountSubscriptionByAccountId()`: Get specific subscription
- `updateAdAccountSubscriptionStatus()`: Update subscription status
- `cancelAdAccountSubscription()`: Cancel subscription
- `addPerAccountBillingHistory()`: Add billing history record
- `getPerAccountBillingHistory()`: Get billing history

### Stripe Integration

#### Configuration (`lib/stripe.ts`)
- `PER_ACCOUNT_PRICING_PLANS`: Plan configurations
- `getPerAccountPlan()`: Get plan details
- `getPerAccountPlansByBillingCycle()`: Get plans by billing cycle
- `calculatePerAccountTotal()`: Calculate total cost for multiple accounts

#### Webhook Handling (`app/api/stripe/webhook/route.ts`)
- Enhanced to handle per-account subscription events
- Separate handling for per-account vs regular subscriptions
- Automatic billing history tracking

### UI Components

#### `AdAccountSelector.tsx`
- **Purpose**: Allow users to select which ad accounts to include in subscription
- **Features**:
  - Display all available Facebook ad accounts
  - Account status indicators (Active, Disabled, Pending Review)
  - Select all/deselect all functionality
  - Real-time cost calculation
  - Account details (ID, currency, timezone)
  - Visual selection interface with checkboxes

#### `PerAccountPlanSelector.tsx`
- **Purpose**: Select plan and billing cycle for selected ad accounts
- **Features**:
  - Plan selection (Basic/Pro)
  - Billing cycle selection (Monthly/Annual)
  - Cost calculation and display
  - Selected accounts summary
  - Plan features comparison

#### `PerAccountBillingManager.tsx`
- **Purpose**: Manage per-account subscriptions
- **Features**:
  - Plan selection (Basic/Pro)
  - Billing cycle selection (Monthly/Annual)
  - Cost calculation and display
  - Individual subscription management
  - Bulk operations
  - **Add Account Modal**: Add new ad accounts to existing subscriptions
  - **Remove Account**: Cancel individual subscriptions

## 🚀 Setup Instructions

### 1. Database Initialization
```bash
# Initialize per-account billing database tables
npm run init:per-account-billing
```

### 2. Stripe Products Setup
```bash
# Create Stripe products and prices for per-account billing
npm run setup:per-account-stripe
```

### 3. Environment Variables
Add the following to your `.env.local`:
```bash
# Per-Account Stripe Price IDs
STRIPE_PER_ACCOUNT_BASIC_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PER_ACCOUNT_BASIC_ANNUAL_PRICE_ID=price_xxxxx
STRIPE_PER_ACCOUNT_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PER_ACCOUNT_PRO_ANNUAL_PRICE_ID=price_xxxxx
```

### 4. Webhook Configuration
Ensure your Stripe webhook endpoint includes these events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## 📊 Usage Examples

### Creating Subscriptions for Connected Ad Accounts
```typescript
// When user connects Facebook account
const response = await fetch('/api/create-per-account-subscriptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    adAccounts: facebookAdAccounts,
    stripeCustomerId: stripeCustomer.id,
    planId: 'basic',
    billingCycle: 'monthly'
  })
});
```

### Managing Individual Subscriptions
```typescript
// Update subscription plan
const response = await fetch('/api/per-account-subscriptions', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriptionId: subscription.id,
    planId: 'pro',
    billingCycle: 'annual'
  })
});
```

### Calculating Total Costs
```typescript
import { calculatePerAccountTotal } from '@/lib/stripe';

const totalCost = calculatePerAccountTotal(
  adAccounts.length, // number of accounts
  'pro',           // plan ID
  'annual'         // billing cycle
);
```

## 🔄 Workflow

### 1. User Connects Facebook Account
1. User authenticates with Facebook
2. System fetches user's ad accounts
3. **NEW**: User selects which ad accounts to include in subscription
4. **NEW**: User sees account selection modal with all available accounts
5. **NEW**: User can select/deselect accounts with real-time cost preview
6. User selects plan and billing cycle for selected accounts
7. For each selected ad account, create individual Stripe subscription
8. Store subscription details in database
9. User can manage each subscription independently

### 2. Account Management
1. **NEW**: User can add additional ad accounts to existing subscriptions
2. **NEW**: User can remove ad accounts from subscriptions (cancel individual subscriptions)
3. **NEW**: Available accounts are filtered to show only unsubscribed accounts
4. User selects plan (Basic/Pro) for all accounts
5. User selects billing cycle (Monthly/Annual)
6. System updates all subscriptions simultaneously
7. Stripe handles proration automatically
8. Webhooks update database with new status

### 3. Payment Processing
1. Stripe processes payment for each subscription
2. Webhook receives `invoice.payment_succeeded` event
3. System adds billing history record
4. User receives confirmation

## 🎯 Benefits

### For Users
- **Granular Control**: Manage each ad account independently
- **Flexible Pricing**: Choose different plans for different accounts
- **Transparent Billing**: Clear cost breakdown per account
- **Easy Management**: Centralized billing dashboard
- **NEW**: **Selective Subscription**: Choose which accounts to include in subscription
- **NEW**: **Cost Optimization**: Only pay for accounts you want to manage
- **NEW**: **Flexible Management**: Add or remove accounts as needed

### For Business
- **Scalable Revenue**: Revenue scales with number of connected accounts
- **Higher Value**: Users pay per account, increasing total revenue
- **Better Retention**: Users can optimize costs by managing individual accounts
- **Clear Metrics**: Track revenue per account type
- **NEW**: **Improved Conversion**: Users can start with fewer accounts and scale up
- **NEW**: **Reduced Churn**: Users can remove accounts instead of canceling entire subscription

## 🎛️ Ad Account Selection Feature

### Overview
The ad account selection feature allows users to choose which Facebook ad accounts to include in their subscription when they have multiple accounts. This provides flexibility and cost optimization.

### User Experience Flow

#### 1. Initial Connection
1. User connects Facebook account
2. System fetches all available ad accounts
3. **AdAccountSelector** modal appears showing all accounts
4. User can:
   - Select/deselect individual accounts
   - Use "Select All" / "Deselect All" buttons
   - See real-time cost calculation
   - View account status (Active, Disabled, Pending Review)
   - See account details (ID, currency, timezone)

#### 2. Account Selection Interface
- **Visual Indicators**: Checkboxes and status badges
- **Cost Preview**: Real-time calculation as user selects accounts
- **Account Details**: Full account information display
- **Bulk Actions**: Select all or deselect all functionality
- **Status Indicators**: Clear visual status for each account

#### 3. Plan Selection
1. After account selection, **PerAccountPlanSelector** appears
2. Shows only selected accounts in summary
3. User selects plan and billing cycle
4. Cost calculation based on selected accounts only

#### 4. Ongoing Management
1. **PerAccountBillingManager** shows current subscriptions
2. **Add Account** button appears if more accounts are available
3. User can add additional accounts to existing subscription
4. User can remove accounts (cancel individual subscriptions)

### Technical Implementation

#### Components
- **AdAccountSelector**: Account selection modal
- **PerAccountPlanSelector**: Plan selection for selected accounts
- **PerAccountBillingManager**: Ongoing subscription management

#### State Management
```typescript
// MetaDashboard state
const [showAccountSelector, setShowAccountSelector] = useState(false);
const [allAdAccounts, setAllAdAccounts] = useState<any[]>([]);
const [pendingAdAccounts, setPendingAdAccounts] = useState<any[]>([]);
```

#### API Integration
- Uses existing `/api/create-per-account-subscriptions` endpoint
- Only creates subscriptions for selected accounts
- Maintains existing Stripe customer for consistency

### Benefits of Account Selection

#### For Users
- **Cost Control**: Only pay for accounts they want to manage
- **Flexibility**: Start small and scale up as needed
- **Transparency**: Clear understanding of what they're paying for
- **Easy Management**: Simple interface for account selection

#### For Business
- **Lower Barrier to Entry**: Users can start with fewer accounts
- **Higher Conversion**: Less intimidating initial cost
- **Better Retention**: Users can optimize their subscription
- **Scalable Revenue**: Users can add accounts over time

## 🔍 Monitoring & Analytics

### Key Metrics to Track
- Number of active subscriptions per user
- Average revenue per user (ARPU)
- Subscription churn rate per account
- Plan upgrade/downgrade patterns
- Billing cycle preferences

### Database Queries
```sql
-- Total revenue by plan
SELECT 
  plan_name,
  COUNT(*) as subscription_count,
  SUM(amount_cents) as total_revenue_cents
FROM ad_account_subscriptions 
WHERE status = 'active'
GROUP BY plan_name;

-- Revenue per user
SELECT 
  user_id,
  COUNT(*) as account_count,
  SUM(amount_cents) as total_revenue_cents
FROM ad_account_subscriptions 
WHERE status = 'active'
GROUP BY user_id;
```

## 🚨 Error Handling

### Common Scenarios
- **Failed Payment**: Subscription status updated to `past_due`
- **Account Disconnection**: Subscription canceled, user notified
- **Plan Downgrade**: Proration handled by Stripe
- **Billing Cycle Change**: New subscription created, old one canceled

### Error Recovery
- Retry failed webhook events
- Manual subscription status updates
- Customer support tools for subscription management

## 🔮 Future Enhancements

### Planned Features
- **Usage-Based Billing**: Charge based on ad spend or impressions
- **Team Management**: Share accounts across team members
- **Custom Plans**: Allow custom pricing for enterprise clients
- **Analytics Dashboard**: Revenue and usage analytics
- **Automated Scaling**: Auto-upgrade plans based on usage

### Integration Opportunities
- **CRM Integration**: Sync subscription data with CRM
- **Analytics Platforms**: Export billing data to analytics tools
- **Customer Support**: Enhanced support tools for subscription management

## 📝 Maintenance

### Regular Tasks
- Monitor webhook delivery success rates
- Review failed payment patterns
- Update plan configurations as needed
- Clean up old billing history records
- Monitor Stripe API usage and costs

### Troubleshooting
- Check webhook endpoint logs for failed events
- Verify Stripe product and price configurations
- Monitor database performance for subscription queries
- Review error logs for API failures

---

This per-account billing system provides a scalable, flexible solution for monetizing Facebook ad account management while giving users granular control over their subscriptions.
