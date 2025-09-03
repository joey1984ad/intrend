# Downgrade Pricing Fix - Proration Credit Implementation

## Problem
When users downgraded from Pro to Startup plans, they were being charged the full amount for the new plan instead of having their remaining balance from the higher-tier plan applied as credit.

## Solution
Implemented a comprehensive downgrade detection and proration credit system that:

1. **Detects Downgrades**: Compares current plan price with new plan price
2. **Calculates Proration Credit**: Based on remaining days in current billing period
3. **Applies Credit**: Creates Stripe coupons to offset the new plan cost
4. **User Communication**: Shows clear messaging about the credit application

## Implementation Details

### Backend Changes (`app/api/stripe/create-checkout-session/route.ts`)

#### 1. Downgrade Detection Logic
```typescript
// Check if this is a downgrade and calculate proration credit
const currentSubscription = await getSubscriptionByUserId(user.id);
if (currentSubscription && currentSubscription.status === 'active') {
  const currentPlan = getPlan(currentSubscription.plan_id, currentSubscription.billing_cycle);
  const newPlan = getPlan(planId, billingCycle);
  
  if (currentPlan && newPlan) {
    // Check if this is a downgrade (new plan is cheaper)
    if (newPlan.currentPricing.price < currentPlan.currentPricing.price) {
      isDowngrade = true;
      
      // Calculate proration credit based on remaining time
      const now = new Date();
      const periodEnd = new Date(currentSubscription.current_period_end);
      const remainingDays = Math.max(0, (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = (periodEnd.getTime() - new Date(currentSubscription.current_period_start).getTime()) / (1000 * 60 * 60 * 24);
      
      if (remainingDays > 0 && totalDays > 0) {
        const dailyRate = currentPlan.currentPricing.price / totalDays;
        prorationCredit = Math.floor(dailyRate * remainingDays);
      }
    }
  }
}
```

#### 2. Proration Coupon Creation
```typescript
async function createProrationCoupon(amountOff: number) {
  try {
    if (!stripe) {
      console.error('Stripe is not configured');
      return null;
    }
    
    const couponId = `proration_${Date.now()}`;
    const coupon = await stripe.coupons.create({
      id: couponId,
      amount_off: amountOff,
      currency: 'usd',
      duration: 'once',
      name: `Proration Credit - $${(amountOff / 100).toFixed(2)}`,
      metadata: {
        type: 'proration_credit',
        amount_off: amountOff.toString()
      }
    });
    return coupon.id;
  } catch (error) {
    console.error('Error creating proration coupon:', error);
    return null;
  }
}
```

#### 3. Checkout Session with Discount
```typescript
// If this is a downgrade with proration credit, add it as a discount
if (isDowngrade && prorationCredit > 0) {
  const couponId = await createProrationCoupon(prorationCredit);
  if (couponId) {
    sessionConfig.discounts = [
      {
        coupon: couponId
      }
    ];
    console.log('Applied proration discount:', prorationCredit);
  } else {
    console.log('Failed to create proration coupon, proceeding without discount');
  }
}
```

### Frontend Changes (`components/EnhancedBillingPage.tsx`)

#### 1. Downgrade Detection in UI
```typescript
// Check if this is a downgrade
const currentPlan = subscription?.plan?.id;
const currentBillingCycle = subscription?.billing_cycle;
const currentPlanPrice = currentPlan && currentBillingCycle ? (getPlan(currentPlan, currentBillingCycle)?.currentPricing.price || 0) : 0;
const newPlanPrice = getPlan(selectedPlan, selectedBillingCycle)?.currentPricing.price || 0;
const isDowngrade = currentPlan && currentBillingCycle && 
  (selectedPlan !== currentPlan || selectedBillingCycle !== currentBillingCycle) &&
  newPlanPrice < currentPlanPrice;

if (isDowngrade) {
  const newPlanName = getPlan(selectedPlan, selectedBillingCycle)?.name || 'Unknown Plan';
  const confirmed = confirm(
    `You're downgrading from ${subscription?.plan?.name} to ${newPlanName}. ` +
    `Your remaining balance will be applied as credit to your new plan. Continue?`
  );
  if (!confirmed) return;
}
```

#### 2. User Communication
```typescript
// Show downgrade information if applicable
if (data.isDowngrade && data.prorationCredit > 0) {
  const creditAmount = (data.prorationCredit / 100).toFixed(2);
  alert(`Downgrade detected! Your remaining balance of $${creditAmount} will be applied as credit to your new plan.`);
}
```

## How It Works

1. **User Selects Lower Tier Plan**: User chooses a plan that costs less than their current plan
2. **System Detects Downgrade**: Backend compares plan prices and identifies downgrade
3. **Calculates Remaining Credit**: Based on days remaining in current billing period
4. **Creates Stripe Coupon**: One-time coupon for the proration amount
5. **Applies to Checkout**: Coupon is applied to the new subscription
6. **User Notification**: Clear messaging about the credit application

## Benefits

- **Fair Billing**: Users only pay for what they use
- **No Double Charging**: Remaining balance is properly applied
- **Clear Communication**: Users understand what's happening
- **Seamless Experience**: Downgrade process is smooth and transparent

## Testing

To test the downgrade functionality:

1. **Subscribe to Pro Plan**: Complete a Pro plan subscription
2. **Wait Some Time**: Let a few days pass in the billing period
3. **Downgrade to Startup**: Select Startup plan
4. **Verify Credit**: Check that the remaining balance is applied as credit
5. **Confirm No Charge**: Verify that the user isn't charged the full Startup price

## Error Handling

- **Stripe Not Configured**: Gracefully handles missing Stripe configuration
- **Coupon Creation Fails**: Proceeds without discount rather than failing
- **Invalid Plan Data**: Handles missing or invalid plan information
- **User Cancellation**: Respects user's decision to cancel downgrade

## Future Enhancements

- **Credit Balance Display**: Show remaining credit in user dashboard
- **Partial Credit Application**: Handle cases where credit exceeds new plan cost
- **Credit Expiration**: Set expiration dates for unused credits
- **Credit History**: Track all credit applications and usage
