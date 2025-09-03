# 🔧 Billing History Update Fix

## Issue Description

**Problem**: Billing history was not getting updated when users purchased plans. The "Billing History" tab remained empty even after successful payments.

**Root Cause**: Multiple issues with invoice creation and database schema mismatches.

## Root Causes Identified

### 1. Database Schema Mismatch
The `createInvoice` function was trying to use `stripe_subscription_id` but the actual database table uses `subscription_id` (which references the subscriptions table).

### 2. Duplicate Invoice Creation
The verification process was running twice (normal behavior), but trying to create the same invoice twice, causing duplicate key errors.

### 3. Missing Database Functions
No functions existed to check for existing invoices or update them.

## Solution Implemented

### 1. Fixed Database Schema Alignment

**Updated `createInvoice` function** in `lib/db.ts`:
```typescript
// ✅ AFTER (Fixed)
export async function createInvoice(invoiceData: {
  userId: number;
  stripeInvoiceId: string;
  subscriptionId: number;  // Changed from stripeSubscriptionId
  amountPaid: number;
  status: string;
  invoiceNumber?: string;
  invoicePdfUrl?: string;
  createdAt: Date;
}) {
  // ... implementation
}
```

### 2. Added Duplicate Handling

**Added new functions** in `lib/db.ts`:
```typescript
export async function getInvoiceByStripeId(stripeInvoiceId: string) {
  // Check if invoice already exists
}

export async function updateInvoice(stripeInvoiceId: string, updateData: {
  amountPaid?: number;
  status?: string;
  invoiceNumber?: string;
  invoicePdfUrl?: string;
}) {
  // Update existing invoice
}
```

### 3. Enhanced Invoice Creation Logic

**Updated subscription verification** in `app/api/subscription/verify/route.ts`:
```typescript
// Check if invoice already exists in database
const existingInvoice = await getInvoiceByStripeId(stripeInvoice.id);

if (existingInvoice) {
  // Update existing invoice
  await updateInvoice(stripeInvoice.id, {
    amountPaid: stripeInvoice.amount_paid,
    status: stripeInvoice.status,
    invoiceNumber: stripeInvoice.number,
    invoicePdfUrl: stripeInvoice.invoice_pdf
  });
  console.log('Updated existing invoice record:', stripeInvoice.id);
} else {
  // Get the subscription ID from our database
  const dbSubscription = await getSubscriptionByStripeId(subscription.id);
  if (!dbSubscription) {
    console.log('Subscription not found in database, skipping invoice creation');
    return;
  }
  
  // Create new invoice
  await createInvoice({
    userId: user.id,
    stripeInvoiceId: stripeInvoice.id,
    subscriptionId: dbSubscription.id,  // Use database subscription ID
    amountPaid: stripeInvoice.amount_paid,
    status: stripeInvoice.status,
    invoiceNumber: stripeInvoice.number,
    invoicePdfUrl: stripeInvoice.invoice_pdf,
    createdAt: new Date(stripeInvoice.created * 1000)
  });
  console.log('Created new invoice record:', stripeInvoice.id);
}
```

### 4. Fixed API Response

**Updated invoices API** in `app/api/users/invoices/route.ts`:
```typescript
return NextResponse.json({
  success: true,
  invoices: invoices.map(invoice => ({
    id: invoice.id,
    stripeInvoiceId: invoice.stripe_invoice_id,
    subscriptionId: invoice.subscription_id,  // Fixed field name
    amountPaid: invoice.amount_paid,
    status: invoice.status,
    invoicePdfUrl: invoice.invoice_pdf_url,
    invoiceNumber: invoice.invoice_number,
    createdAt: invoice.created_at
  }))
});
```

## Database Schema

The invoices table structure:
```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount_paid INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL,
  invoice_pdf_url TEXT,
  invoice_number VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Testing

### ✅ Now Working:
1. **Invoice Creation**: Invoices are properly created when subscriptions are verified
2. **Duplicate Handling**: No more duplicate key errors
3. **Billing History**: The "Billing History" tab now shows invoice records
4. **Trial Subscriptions**: Trial subscriptions also create invoice records

### 🔍 Test Steps:
1. **Purchase a plan** through the billing page
2. **Complete payment** in Stripe
3. **Return to billing page** - verification should run automatically
4. **Check "Billing History" tab** - should show the invoice
5. **Verify invoice details** - amount, status, invoice number should be correct

## Files Modified

- `lib/db.ts` - Fixed createInvoice function and added new invoice management functions
- `app/api/subscription/verify/route.ts` - Enhanced invoice creation with duplicate handling
- `app/api/users/invoices/route.ts` - Fixed API response field names
- `scripts/check-database-schema.js` - Added database schema verification script

## Benefits

1. **Reliable Billing History**: Users can now see their complete billing history
2. **No Duplicate Errors**: Proper handling of duplicate invoice creation attempts
3. **Data Integrity**: Correct foreign key relationships between tables
4. **Better Debugging**: Enhanced logging for invoice creation process

## Related Issues

- Fixes the problem where billing history remained empty after payments
- Resolves duplicate key constraint violations
- Ensures proper database relationships between users, subscriptions, and invoices
