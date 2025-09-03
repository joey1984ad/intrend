# 🔧 Payment Methods Not Being Saved Fix

## Issue Description

**Problem**: Payment methods were not being saved to the database, so the "Payment Methods" tab remained empty even after successful payments.

**Root Cause**: Multiple issues with payment method creation and webhook handling.

## Root Causes Identified

### 1. Missing POST Endpoint
The payment methods API only had a GET endpoint to retrieve payment methods, but no POST endpoint to create new ones.

### 2. Webhook Handler Issues
The webhook handler for `payment_method.attached` events was not properly logging or handling errors, making it difficult to debug.

### 3. No Fallback Creation
Payment methods were only created through webhooks, with no fallback mechanism during subscription verification.

## Solution Implemented

### 1. Added POST Endpoint to Payment Methods API

**Updated `app/api/users/payment-methods/route.ts`**:
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, stripePaymentMethodId, type, last4, brand, expMonth, expYear, isDefault } = body;

    if (!userId || !stripePaymentMethodId || !type) {
      return NextResponse.json(
        { error: 'User ID, Stripe Payment Method ID, and type are required' },
        { status: 400 }
      );
    }

    const paymentMethod = await createPaymentMethod({
      userId: parseInt(userId),
      stripePaymentMethodId,
      type,
      last4,
      brand,
      expMonth,
      expYear,
      isDefault
    });

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        stripePaymentMethodId: paymentMethod.stripe_payment_method_id,
        type: paymentMethod.type,
        last4: paymentMethod.last4,
        brand: paymentMethod.brand,
        expMonth: paymentMethod.exp_month,
        expYear: paymentMethod.exp_year,
        isDefault: paymentMethod.is_default,
        createdAt: paymentMethod.created_at
      }
    });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
}
```

### 2. Enhanced Webhook Handler

**Updated `app/api/stripe/webhook/route.ts`**:
```typescript
async function handlePaymentMethodAttached(paymentMethod: any) {
  try {
    console.log('🔍 Handling payment method attached:', paymentMethod.id);
    console.log('Payment method details:', {
      id: paymentMethod.id,
      customer: paymentMethod.customer,
      type: paymentMethod.type,
      card: paymentMethod.card
    });
    
    if (paymentMethod.customer) {
      const customer = await stripe.customers.retrieve(paymentMethod.customer);
      console.log('Customer details:', {
        id: customer.id,
        email: customer.email
      });
      
      const customerEmail = customer.email;
      
      if (customerEmail) {
        const user = await getUserByEmail(customerEmail);
        console.log('User found:', user ? { id: user.id, email: user.email } : 'Not found');
        
        if (user) {
          const createdPaymentMethod = await createPaymentMethod({
            userId: user.id,
            stripePaymentMethodId: paymentMethod.id,
            type: paymentMethod.type,
            last4: paymentMethod.card?.last4,
            brand: paymentMethod.card?.brand,
            expMonth: paymentMethod.card?.exp_month,
            expYear: paymentMethod.card?.exp_year,
            isDefault: false
          });

          console.log('✅ Payment method created successfully in database:', {
            id: createdPaymentMethod.id,
            stripePaymentMethodId: createdPaymentMethod.stripe_payment_method_id,
            type: createdPaymentMethod.type,
            last4: createdPaymentMethod.last4
          });
        } else {
          console.log('❌ User not found for email:', customerEmail);
        }
      } else {
        console.log('❌ No customer email found');
      }
    } else {
      console.log('❌ No customer associated with payment method');
    }
  } catch (error) {
    console.error('❌ Error handling payment method attached:', error);
  }
}
```

### 3. Added Fallback Payment Method Creation

**Updated subscription verification** in `app/api/subscription/verify/route.ts`:
```typescript
// Create payment method record if not already exists
try {
  // Get customer's payment methods from Stripe
  const paymentMethods = await stripe.paymentMethods.list({
    customer: subscription.customer as string,
    type: 'card'
  });

  console.log('Found payment methods:', paymentMethods.data.length);

  for (const stripePaymentMethod of paymentMethods.data) {
    // Check if payment method already exists in database
    const existingPaymentMethods = await getPaymentMethodsByUserId(user.id);
    const alreadyExists = existingPaymentMethods.some(pm => 
      pm.stripe_payment_method_id === stripePaymentMethod.id
    );

    if (!alreadyExists) {
      await createPaymentMethod({
        userId: user.id,
        stripePaymentMethodId: stripePaymentMethod.id,
        type: stripePaymentMethod.type,
        last4: stripePaymentMethod.card?.last4,
        brand: stripePaymentMethod.card?.brand,
        expMonth: stripePaymentMethod.card?.exp_month,
        expYear: stripePaymentMethod.card?.exp_year,
        isDefault: false
      });
      console.log('Created payment method record:', stripePaymentMethod.id);
    } else {
      console.log('Payment method already exists:', stripePaymentMethod.id);
    }
  }
} catch (paymentMethodError) {
  console.log('Failed to create payment method record:', paymentMethodError);
  // Don't fail the whole verification if payment method creation fails
}
```

### 4. Fixed Webhook Invoice Creation

**Fixed webhook handler** to use correct `createInvoice` signature:
```typescript
await createInvoice({
  userId: user.id,
  stripeInvoiceId: invoice.id,
  subscriptionId: parseInt(invoice.subscription),
  amountPaid: invoice.amount_paid,
  status: invoice.status,
  invoicePdfUrl: invoice.invoice_pdf,
  invoiceNumber: invoice.number,
  createdAt: new Date(invoice.created * 1000)  // Added missing parameter
});
```

## Database Schema

The payment_methods table structure:
```sql
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  last4 VARCHAR(4),
  brand VARCHAR(50),
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Testing

### ✅ Now Working:
1. **Payment Method Creation**: Payment methods are created during subscription verification
2. **Webhook Handling**: Enhanced logging for better debugging
3. **Fallback Mechanism**: Payment methods are created even if webhooks fail
4. **API Endpoint**: Manual payment method creation via POST endpoint
5. **Duplicate Prevention**: Checks for existing payment methods before creating

### 🔍 Test Steps:
1. **Purchase a plan** through the billing page
2. **Complete payment** in Stripe with a card
3. **Return to billing page** - verification should run automatically
4. **Check "Payment Methods" tab** - should show the card details
5. **Verify payment method details** - last4, brand, expiry should be correct

## Files Modified

- `app/api/users/payment-methods/route.ts` - Added POST endpoint for manual creation
- `app/api/stripe/webhook/route.ts` - Enhanced payment method webhook handler with better logging
- `app/api/subscription/verify/route.ts` - Added fallback payment method creation
- `docs/04-troubleshooting/PAYMENT_METHODS_FIX.md` - This documentation file

## Benefits

1. **Reliable Payment Method Storage**: Payment methods are now properly saved to the database
2. **Better Debugging**: Enhanced logging helps identify webhook issues
3. **Fallback Mechanism**: Payment methods are created even if webhooks don't trigger
4. **Manual Creation**: API endpoint allows manual payment method creation
5. **Duplicate Prevention**: Prevents duplicate payment method records

## Related Issues

- Fixes the problem where payment methods weren't being saved after payments
- Resolves webhook handling issues for payment method events
- Ensures payment methods are available in the UI for future reference
- Provides better error handling and logging for debugging
