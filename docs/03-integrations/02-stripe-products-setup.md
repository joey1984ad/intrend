# 🚀 Stripe Products & Prices Setup Guide

This guide will help you set up all the necessary Stripe products and prices for your billing system.

## 📋 **Prerequisites**

- ✅ Stripe account with API access
- ✅ `STRIPE_SECRET_KEY` configured in `.env.local`
- ✅ Development server running

## 🎯 **Option 1: Automated Setup (Recommended)**

Run the automated script to create all products and prices:

```bash
npm run setup:stripe
```

This script will:
- Create 3 products (Free, Startup, Pro)
- Create 6 prices (monthly/annual for each paid plan)
- Output all the price IDs you need to add to `.env.local`

## 🛠️ **Option 2: Manual Setup**

If you prefer to set up manually through the Stripe Dashboard:

### **Step 1: Create Products**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Click **"Add Product"**

#### **Free Plan Product**
- **Name**: `Free Plan`
- **Description**: `Perfect for small agencies and freelancers`
- **Metadata**: 
  - `plan_id`: `free`
  - `features`: `Up to 3 ad accounts, Basic performance dashboard, Creative gallery access, Email support, Basic analytics`

#### **Startup Plan Product**
- **Name**: `Startup Plan`
- **Description**: `Ideal for growing agencies and marketing teams`
- **Metadata**:
  - `plan_id`: `startup`
  - `features`: `Up to 10 ad accounts, Advanced performance dashboard, Creative gallery access, Priority email support, Advanced analytics, Custom reporting, Team collaboration`

#### **Pro Plan Product**
- **Name**: `Pro Plan`
- **Description**: `Built for large agencies and enterprise teams`
- **Metadata**:
  - `plan_id`: `pro`
  - `features`: `Unlimited ad accounts, Enterprise dashboard, Creative gallery access, 24/7 phone support, Advanced analytics, Custom reporting, Team collaboration, API access, Custom integrations`

### **Step 2: Create Prices**

For each product, create two prices:

#### **Startup Plan Prices**
- **Monthly Price**:
  - Amount: `$10.00`
  - Billing: `Recurring monthly`
  - Metadata: `billing_cycle: monthly`
- **Annual Price**:
  - Amount: `$96.00` (20% discount)
  - Billing: `Recurring yearly`
  - Metadata: `billing_cycle: annual`

#### **Pro Plan Prices**
- **Monthly Price**:
  - Amount: `$20.00`
  - Billing: `Recurring monthly`
  - Metadata: `billing_cycle: monthly`
- **Annual Price**:
  - Amount: `$192.00` (20% discount)
  - Billing: `Recurring yearly`
  - Metadata: `billing_cycle: annual`

**Note**: Free Plan is free, so no Stripe price is needed.

### **Step 3: Copy Price IDs**

After creating each price, copy the price ID (starts with `price_`) and add it to your `.env.local` file.

## 🔧 **Environment Configuration**

Add these lines to your `.env.local` file:

```bash
# Stripe Price IDs
STRIPE_FREE_MONTHLY_PRICE_ID=free
STRIPE_FREE_ANNUAL_PRICE_ID=free
STRIPE_STARTUP_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_STARTUP_ANNUAL_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxxxxxxxxxxxx
```

**Important**: Replace `price_xxxxxxxxxxxxx` with the actual price IDs from Stripe.

## ✅ **Verification**

After setup:

1. **Restart your development server**
2. **Test the billing page**: Visit `/billing`
3. **Try upgrading a plan**: Click on Startup or Pro plan
4. **Check checkout flow**: Should redirect to Stripe checkout

## 🚨 **Troubleshooting**

### **"Invalid billing cycle" Error**
- Check that all price IDs are correctly set in `.env.local`
- Ensure price IDs match the billing cycle (monthly/annual)

### **"Stripe price ID not configured" Error**
- Verify all required environment variables are set
- Check that price IDs are valid and active in Stripe

### **Authentication Errors**
- Verify `STRIPE_SECRET_KEY` is correct
- Ensure the key has the right permissions (Products & Prices access)

## 📊 **Price Structure Summary**

| Plan | Monthly | Annual | Savings |
|------|---------|--------|---------|
| Starter | Free | Free | - |
| Professional | $29/month | $290/year | 17% |
| Enterprise | $99/month | $990/year | 17% |

## 🔄 **Next Steps**

After successful setup:
1. Test the complete billing flow
2. Set up webhook endpoints for subscription management
3. Configure customer portal access
4. Test subscription upgrades/downgrades

---

**Need help?** Check the server logs for detailed error messages or run the automated setup script for immediate resolution.
