# Stripe Annual Pricing Fix

## Issue Description
The annual pricing was working correctly on the billing page but not on the front page. When users selected annual billing on the front page, the Stripe checkout was still using monthly pricing.

## Root Cause
The `PricingSection` component on the front page was not receiving the `billingCycle` state from its parent component (`SaaSLandingPage`). This meant that:

1. The front page had its own `billingCycle` state
2. The `PricingSection` component had its own internal `billingCycle` state
3. These two states were not synchronized
4. When users clicked the annual toggle, it only updated the internal state of `PricingSection`
5. The `handlePlanSelection` function in `SaaSLandingPage` was still using the old `billingCycle` value

## Solution

### 1. Updated PricingSection Component
- Added `billingCycle` and `onBillingCycleChange` props
- Modified the component to use external billing cycle if provided
- Maintained backward compatibility for components that don't pass these props

### 2. Updated SaaSLandingPage Component
- Passed the `billingCycle` state to `PricingSection`
- Passed the `setBillingCycle` function as `onBillingCycleChange`
- This ensures synchronization between parent and child components

## Code Changes

### PricingSection.tsx
```typescript
interface PricingSectionProps {
  // ... existing props
  billingCycle?: 'monthly' | 'annual';
  onBillingCycleChange?: (cycle: 'monthly' | 'annual') => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  // ... existing props
  billingCycle: externalBillingCycle,
  onBillingCycleChange
}) => {
  const [internalBillingCycle, setInternalBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  // Use external billing cycle if provided, otherwise use internal state
  const billingCycle = externalBillingCycle || internalBillingCycle;

  const handleBillingCycleChange = (cycle: 'monthly' | 'annual') => {
    if (onBillingCycleChange) {
      onBillingCycleChange(cycle);
    } else {
      setInternalBillingCycle(cycle);
    }
  };
  
  // ... rest of component
}
```

### SaaSLandingPage.tsx
```typescript
<PricingSection
  onPlanSelect={handlePlanSelection}
  className="text-slate-900"
  billingCycle={billingCycle}
  onBillingCycleChange={setBillingCycle}
/>
```

## Testing

### Before Fix
- ✅ Billing page: Annual pricing worked correctly
- ❌ Front page: Annual pricing did not work (still used monthly)

### After Fix
- ✅ Billing page: Annual pricing works correctly
- ✅ Front page: Annual pricing now works correctly

## Verification Steps

1. **Front Page Test**:
   - Go to the front page
   - Click "Annual" in the pricing section
   - Select a paid plan
   - Verify that the Stripe checkout shows annual pricing

2. **Billing Page Test**:
   - Go to the billing page
   - Click "Annual" in the billing toggle
   - Select a plan to upgrade
   - Verify that the Stripe checkout shows annual pricing

3. **State Synchronization Test**:
   - Toggle between monthly and annual on both pages
   - Verify that the pricing updates correctly
   - Verify that the correct billing cycle is sent to Stripe

## Environment Variables Required

Make sure these environment variables are set for annual pricing to work:

```env
# Annual pricing IDs
STRIPE_STARTUP_ANNUAL_PRICE_ID=price_xxxxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxxxx

# Monthly pricing IDs
STRIPE_STARTUP_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
```

## Related Files

- `components/PricingSection.tsx` - Updated to accept external billing cycle
- `components/SaaSLandingPage.tsx` - Updated to pass billing cycle to PricingSection
- `app/api/stripe/create-checkout-session/route.ts` - Handles the billing cycle in Stripe checkout
- `lib/stripe.ts` - Contains the pricing plan definitions

## Future Considerations

1. **Consistent State Management**: Consider using a global state management solution (like Zustand or Redux) for billing cycle state
2. **URL Parameters**: Consider adding billing cycle to URL parameters for better UX
3. **Persistence**: Consider persisting the user's billing cycle preference in localStorage
4. **Analytics**: Track which billing cycle users prefer for better business insights

---

*Last Updated: December 2024*
*Created by: AI Assistant*
