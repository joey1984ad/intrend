# 🚀 Multi-Account Billing System

## Overview

This document provides a comprehensive guide to the multi-account billing system implemented in your Intrend dashboard. The system allows you to charge clients per ad account (e.g., $10 per account per month) with usage-based billing through Stripe.

## ✨ Features

### ✅ Core Functionality
- **Per-Account Billing**: Charge $10 per ad account per month
- **Usage-Based Billing**: Automatic billing based on active account count
- **Account Management**: Add, remove, and manage ad accounts
- **Billing History**: Track billing cycles and payment history
- **Real-time Updates**: Live billing information and account status
- **Stripe Integration**: Seamless payment processing with metered billing

### ✅ User Experience
- **Account Dashboard**: Visual account management interface
- **Billing Preview**: See upcoming charges before adding accounts
- **Payment History**: Complete billing cycle tracking
- **Responsive Design**: Works on all devices
- **Real-time Feedback**: Success/error messages and loading states

## 🗄️ Database Schema

### Ad Accounts Table
```sql
CREATE TABLE ad_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) UNIQUE,
  platform VARCHAR(50) DEFAULT 'facebook',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Billing Cycles Table
```sql
CREATE TABLE billing_cycles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  total_accounts INTEGER DEFAULT 0,
  amount_charged DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'pending',
  stripe_invoice_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 API Endpoints

### Account Management

#### 1. Get User Accounts
```
GET /api/accounts?userId={email}
```
**Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "id": 1,
      "account_name": "My Business Account",
      "account_id": "act_123456789",
      "platform": "facebook",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "totalAccounts": 1,
  "pricePerAccount": 10,
  "nextCharge": 10
}
```

#### 2. Add New Account
```
POST /api/accounts
```
**Request:**
```json
{
  "userId": "user@example.com",
  "accountName": "New Campaign Account",
  "platform": "facebook"
}
```
**Response:**
```json
{
  "success": true,
  "account": {
    "id": 2,
    "account_name": "New Campaign Account",
    "platform": "facebook",
    "status": "active"
  },
  "totalAccounts": 2,
  "nextCharge": 20,
  "message": "Account \"New Campaign Account\" added successfully. You'll be charged $10 for this account on your next billing cycle."
}
```

#### 3. Delete Account
```
DELETE /api/accounts?accountId={id}&userId={email}
```
**Response:**
```json
{
  "success": true,
  "deletedAccount": {
    "id": 2,
    "account_name": "New Campaign Account"
  },
  "totalAccounts": 1,
  "nextCharge": 10,
  "message": "Account removed successfully. Billing will be adjusted for your next cycle."
}
```

### Billing Information

#### 1. Get Billing Info
```
GET /api/billing/accounts?userId={email}
```
**Response:**
```json
{
  "success": true,
  "activeAccounts": 2,
  "pricePerAccount": 10,
  "nextCharge": 20,
  "nextBillingDate": "2024-02-15T10:30:00Z",
  "latestBillingCycle": {
    "id": 1,
    "period_start": "2024-01-15T10:30:00Z",
    "period_end": "2024-02-15T10:30:00Z",
    "total_accounts": 2,
    "amount_charged": 20.00,
    "status": "pending"
  },
  "billingHistory": [...],
  "accounts": [...]
}
```

#### 2. Report Usage
```
POST /api/billing/accounts
```
**Request:**
```json
{
  "userId": "user@example.com"
}
```
**Purpose**: Reports current account usage to Stripe for metered billing

## 🎨 Frontend Components

### AdAccountManager Component
**Location**: `components/AdAccountManager.tsx`

**Features:**
- Account listing with status indicators
- Add new account with billing preview
- Delete accounts with confirmation
- Real-time billing summary
- Billing history display
- Loading states and error handling

**Key Functions:**
- `loadAccounts()`: Fetch user's ad accounts
- `loadBillingInfo()`: Get billing information
- `addAccount()`: Create new account with billing update
- `deleteAccount()`: Remove account with billing adjustment

### Accounts Page
**Location**: `app/accounts/page.tsx`

**Purpose**: Main page for account management with responsive layout

## 💳 Stripe Integration

### Metered Billing Setup

1. **Create Product in Stripe Dashboard:**
   - Product Name: "Ad Account Management"
   - Pricing Type: "Metered billing"
   - Billing Period: Monthly
   - Price: $10 per unit

2. **Configure Webhook Events:**
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`

3. **Usage Reporting:**
   ```javascript
   // Report usage to Stripe
   await stripe.subscriptionItems.createUsageRecord(subscriptionItem.id, {
     quantity: activeAccounts.length,
     timestamp: Math.floor(Date.now() / 1000),
     action: 'set'
   });
   ```

### Pricing Configuration
```javascript
const PRICE_PER_ACCOUNT = 10.00; // $10 per account per month
```

## 🚀 Setup Instructions

### 1. Database Initialization
```bash
# Run the initialization script
node scripts/init-multi-account-billing.js
```

### 2. Environment Configuration
Add to your `.env.local`:
```bash
# Multi-Account Billing
PRICE_PER_ACCOUNT=10.00
```

### 3. Stripe Configuration
1. Create metered billing product in Stripe Dashboard
2. Set up webhook endpoint for billing events
3. Configure usage reporting

### 4. Testing
1. Navigate to `/accounts` page
2. Add test accounts
3. Verify billing calculations
4. Test account deletion

## 📊 Billing Flow

### Monthly Billing Process
1. **Account Changes**: When accounts are added/removed
2. **Usage Reporting**: Report current account count to Stripe
3. **Monthly Invoice**: Stripe generates invoice based on usage
4. **Payment Processing**: Automatic payment collection
5. **Billing Records**: Store billing cycle information

### Example Billing Scenario
- **User has 3 accounts**: $30/month
- **Adds 2 more accounts**: $50/month (effective next cycle)
- **Removes 1 account**: $40/month (effective next cycle)

## 🔄 Usage Reporting

### Automatic Usage Reporting
The system automatically reports account usage to Stripe when:
- New accounts are added
- Accounts are removed
- Monthly billing cycle starts

### Manual Usage Reporting
```javascript
// Report usage manually
await fetch('/api/billing/accounts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user@example.com' })
});
```

## 📈 Billing Analytics

### Key Metrics
- **Active Accounts**: Number of active ad accounts
- **Monthly Revenue**: Total billing per month
- **Account Growth**: New accounts added over time
- **Churn Rate**: Accounts removed over time

### Billing History
- Complete billing cycle records
- Payment status tracking
- Invoice references
- Period start/end dates

## 🛠️ Database Functions

### Account Management
- `createAdAccount()`: Create new ad account
- `getAdAccounts()`: Get user's accounts
- `updateAdAccount()`: Update account details
- `deleteAdAccount()`: Soft delete account
- `getActiveAdAccounts()`: Get active accounts only

### Billing Management
- `createBillingCycle()`: Create billing period
- `updateBillingCycle()`: Update billing information
- `getLatestBillingCycle()`: Get current billing cycle
- `getBillingHistory()`: Get billing history

## 🔒 Security Considerations

### Data Protection
- User authentication required for all operations
- Account ownership validation
- Soft deletes for data retention
- Audit trail for billing changes

### Payment Security
- Stripe handles all payment processing
- No sensitive payment data stored locally
- Webhook signature verification
- Secure API endpoints

## 🚨 Error Handling

### Common Errors
- **Account Limit Exceeded**: Maximum accounts per user
- **Invalid Account Name**: Duplicate or invalid names
- **Billing Errors**: Stripe payment failures
- **Database Errors**: Connection or constraint issues

### Error Recovery
- Automatic retry for transient errors
- User-friendly error messages
- Fallback mechanisms for billing issues
- Data consistency checks

## 📝 Future Enhancements

### Planned Features
- **Account Templates**: Pre-configured account setups
- **Bulk Operations**: Add/remove multiple accounts
- **Advanced Analytics**: Detailed usage reports
- **Team Management**: Multi-user account access
- **Custom Pricing**: Tiered pricing based on account count

### Integration Opportunities
- **Facebook Business Manager**: Direct account connection
- **Google Ads**: Multi-platform support
- **Analytics Integration**: Performance-based billing
- **API Access**: Third-party integrations

## 🎯 Best Practices

### Account Management
- Use descriptive account names
- Regular account cleanup
- Monitor account status
- Backup account configurations

### Billing Management
- Regular usage monitoring
- Proactive billing notifications
- Clear billing communication
- Flexible payment options

### System Maintenance
- Regular database backups
- Monitor webhook delivery
- Update pricing configurations
- Performance optimization

---

This multi-account billing system provides a scalable solution for charging clients based on their ad account usage, with full Stripe integration and comprehensive management capabilities.
