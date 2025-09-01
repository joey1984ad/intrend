# 🚀 Plan Update System Documentation

## Overview

This document describes the complete plan update system that automatically upgrades users' plans after successful Stripe payments. The system ensures that when a user purchases a plan through Stripe, their account is immediately updated with the new plan details.

## System Architecture

### 1. Database Schema

The `users` table now includes plan-related fields:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(255),
  current_plan_id VARCHAR(100) DEFAULT 'free',
  current_plan_name VARCHAR(100) DEFAULT 'Free',
  current_billing_cycle VARCHAR(20) DEFAULT 'monthly',
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Plan Fields:**
- `current_plan_id`: Plan identifier (free, startup, pro)
- `current_plan_name`: Human-readable plan name (Free, Startup, Pro)
- `current_billing_cycle`: Billing frequency (monthly, annual)
- `subscription_status`: Subscription state (active, canceled, past_due, etc.)

### 2. Flow Diagram

```
User selects plan → Checkout session created → User pays → Stripe webhook → Plan updated
     ↓                    ↓                      ↓           ↓              ↓
Frontend form      Stripe checkout page    Payment success  Webhook handler  User plan updated
```

## Implementation Details

### 1. Checkout Session Creation

**File:** `app/api/stripe/create-checkout-session/route.ts`

- Creates Stripe checkout session with plan metadata
- Handles both new customers and existing customers
- Includes plan information in session metadata

**Key Features:**
- ✅ Fixed Stripe parameter conflict (customer vs customer_email)
- ✅ Proper plan metadata inclusion
- ✅ Support for both monthly and annual billing

### 2. Webhook Handler

**File:** `app/api/stripe/webhook/route.ts`

Handles Stripe webhook events and updates user plans:

#### Supported Events:
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Plan changes/upgrades
- `customer.subscription.deleted` - Subscription cancellation
- `invoice.payment_succeeded` - Successful payments
- `invoice.payment_failed` - Failed payments

#### Plan Update Logic:

```typescript
// When subscription is created
await updateUserPlan(user.id, {
  planId: subscription.metadata.planId,
  planName: subscription.metadata.planName,
  billingCycle: subscription.metadata.billingCycle,
  status: subscription.status
});

// When subscription is updated (plan upgrade)
await updateUserPlan(user.id, {
  planId: planId,
  planName: planName,
  billingCycle: billingCycle,
  status: subscription.status
});

// When subscription is canceled
await updateUserPlan(user.id, {
  planId: 'free',
  planName: 'Free',
  billingCycle: 'monthly',
  status: 'canceled'
});
```

### 3. Database Functions

**File:** `lib/db.ts`

#### New Function: `updateUserPlan()`

```typescript
export async function updateUserPlan(userId: number, planData: {
  planId: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  status: string;
}) {
  // Updates user's plan information in the users table
}
```

## Available Plans

### Free Plan
- **ID:** `free`
- **Name:** `Free`
- **Price:** $0
- **Features:** Basic access, limited accounts

### Startup Plan
- **ID:** `startup`
- **Name:** `Startup`
- **Price:** $10/month or $96/year
- **Features:** Up to 10 ad accounts, advanced analytics

### Pro Plan
- **ID:** `pro`
- **Name:** `Pro`
- **Price:** $20/month or $192/year
- **Features:** Unlimited accounts, enterprise features, API access

## Testing

### 1. Database Migration

Run the migration to add plan fields to existing users:

```bash
node scripts/migrate-add-plan-fields.js
```

### 2. Plan Update Testing

Test the complete plan update flow:

```bash
node scripts/test-plan-update.js
```

### 3. Checkout API Testing

Test the checkout session creation:

```bash
node scripts/test-checkout-api-simple.js
```

## Usage Examples

### 1. Check User's Current Plan

```typescript
const user = await getUserByEmail('user@example.com');
console.log(`User is on ${user.current_plan_name} plan (${user.current_billing_cycle})`);
```

### 2. Check Plan Features

```typescript
const PLAN_LIMITS = {
  free: { maxAdAccounts: 3, maxTeamMembers: 1 },
  startup: { maxAdAccounts: 10, maxTeamMembers: 5 },
  pro: { maxAdAccounts: -1, maxTeamMembers: -1 } // unlimited
};

const userLimits = PLAN_LIMITS[user.current_plan_id];
```

### 3. Plan Upgrade Flow

1. User selects new plan on frontend
2. Checkout session created with plan metadata
3. User completes payment on Stripe
4. Stripe sends webhook to `/api/stripe/webhook`
5. Webhook handler updates user's plan
6. User immediately has access to new plan features

## Error Handling

### 1. Webhook Failures

- All webhook handlers include try-catch blocks
- Errors are logged for debugging
- Failed webhooks don't break the application

### 2. Database Errors

- Database functions include error handling
- Failed updates are logged
- Graceful fallbacks for missing data

### 3. Stripe Errors

- Invalid webhook signatures are rejected
- Missing required data is handled gracefully
- Customer not found scenarios are handled

## Monitoring

### 1. Server Logs

Monitor these log messages for plan updates:

```
✅ Subscription created successfully in database and user plan updated
✅ User plan updated in users table
✅ User plan reset to free after subscription cancellation
```

### 2. Database Queries

Check user plan status:

```sql
SELECT id, email, current_plan_id, current_plan_name, 
       current_billing_cycle, subscription_status 
FROM users 
WHERE email = 'user@example.com';
```

### 3. Stripe Dashboard

Monitor webhook deliveries in Stripe Dashboard:
- Go to Developers → Webhooks
- Check delivery status and response codes
- Review webhook logs for errors

## Security Considerations

### 1. Webhook Verification

- All webhooks are verified using `STRIPE_WEBHOOK_SECRET`
- Invalid signatures are rejected immediately
- Webhook endpoint is protected

### 2. Data Validation

- Plan IDs are validated against allowed values
- Billing cycles are restricted to monthly/annual
- User existence is verified before updates

### 3. Access Control

- Only Stripe can trigger plan updates via webhooks
- Direct API access is not allowed for plan changes
- All changes are logged for audit purposes

## Troubleshooting

### Common Issues

1. **User plan not updating after payment**
   - Check webhook delivery status in Stripe Dashboard
   - Verify webhook secret is correct
   - Check server logs for webhook errors

2. **Wrong plan assigned**
   - Verify plan metadata in checkout session
   - Check webhook payload for correct plan information
   - Review database migration status

3. **Subscription created but user not updated**
   - Check if user exists in database
   - Verify email matching between Stripe and database
   - Review webhook handler logs

### Debug Commands

```bash
# Check current user plans
node scripts/test-plan-update.js

# Test checkout API
node scripts/test-checkout-api-simple.js

# Verify database migration
node scripts/migrate-add-plan-fields.js
```

## Future Enhancements

### 1. Plan Downgrades

- Handle plan downgrades with proration
- Update billing cycle changes
- Manage feature access during transitions

### 2. Trial Periods

- Support for trial periods
- Trial-to-paid conversion handling
- Trial expiration notifications

### 3. Usage Tracking

- Track feature usage per plan
- Implement usage-based billing
- Monitor plan utilization

### 4. Notifications

- Email notifications for plan changes
- In-app notifications for upgrades
- Billing reminder notifications

## Related Files

- `app/api/stripe/create-checkout-session/route.ts` - Checkout session creation
- `app/api/stripe/webhook/route.ts` - Webhook handler for plan updates
- `lib/db.ts` - Database functions including `updateUserPlan()`
- `lib/stripe.ts` - Stripe configuration and plan definitions
- `scripts/migrate-add-plan-fields.js` - Database migration script
- `scripts/test-plan-update.js` - Plan update testing script

## Support

For issues with the plan update system:

1. Check server logs for error messages
2. Verify webhook delivery in Stripe Dashboard
3. Run test scripts to isolate issues
4. Review this documentation for troubleshooting steps

---

**Last Updated:** September 1, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
