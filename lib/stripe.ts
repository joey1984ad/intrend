import Stripe from 'stripe';

// Server-side Stripe instance - only create if secret key exists
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    })
  : null;

// Client-side Stripe instance
export const getStripe = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return require('@stripe/stripe-js').loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return null;
};

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};

// Subscription status constants
export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired'
} as const;

// Plan limits and features
export const PLAN_LIMITS = {
  starter: {
    maxAdAccounts: 3,
    maxTeamMembers: 1,
    features: ['basic_analytics', 'creative_gallery', 'email_support']
  },
  professional: {
    maxAdAccounts: 10,
    maxTeamMembers: 5,
    features: ['advanced_analytics', 'custom_reporting', 'priority_support', 'team_collaboration']
  },
  enterprise: {
    maxAdAccounts: -1, // unlimited
    maxTeamMembers: -1, // unlimited
    features: ['enterprise_analytics', 'api_access', 'custom_integrations', '24_7_support']
  }
} as const;

// Pricing plans configuration with monthly and annual options
// Note: hasStripeIntegration is set to true for paid plans since we have the price IDs configured
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    popular: false,
    monthly: {
      price: 0,
      priceId: 'price_free_monthly',
      stripePriceId: 'free', // Free plan - no Stripe integration needed
      billingCycle: 'monthly' as const,
      hasStripeIntegration: false
    },
    annual: {
      price: 0,
      priceId: 'price_free_annual',
      stripePriceId: 'free', // Free plan - no Stripe integration needed
      billingCycle: 'annual' as const,
      hasStripeIntegration: false
    },
    features: [
      'Up to 3 ad accounts',
      'Basic performance dashboard',
      'Creative gallery access',
      'Email support',
      'Basic analytics'
    ],
    description: 'Perfect for small agencies and freelancers'
  },
  startup: {
    id: 'startup',
    name: 'Startup',
    popular: true,
    monthly: {
      price: 10, // $10/month
      priceId: 'price_startup_monthly',
      stripePriceId: process.env.STRIPE_STARTUP_MONTHLY_PRICE_ID || null,
      billingCycle: 'monthly' as const,
      hasStripeIntegration: !!process.env.STRIPE_STARTUP_MONTHLY_PRICE_ID
    },
    annual: {
      price: 96, // $10 * 12 * 0.8 = $96/year (20% discount)
      priceId: 'price_startup_annual',
      stripePriceId: process.env.STRIPE_STARTUP_ANNUAL_PRICE_ID || null,
      billingCycle: 'annual' as const,
      hasStripeIntegration: !!process.env.STRIPE_STARTUP_ANNUAL_PRICE_ID
    },
    features: [
      'Up to 10 ad accounts',
      'Advanced performance dashboard',
      'Creative gallery access',
      'Priority email support',
      'Advanced analytics',
      'Custom reporting',
      'Team collaboration'
    ],
    description: 'Ideal for growing agencies and marketing teams'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    popular: false,
    monthly: {
      price: 20, // $20/month
      priceId: 'price_pro_monthly',
      stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || null,
      billingCycle: 'monthly' as const,
      hasStripeIntegration: !!process.env.STRIPE_PRO_MONTHLY_PRICE_ID
    },
    annual: {
      price: 192, // $20 * 12 * 0.8 = $192/year (20% discount)
      priceId: 'price_pro_annual',
      stripePriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || null,
      billingCycle: 'annual' as const,
      hasStripeIntegration: !!process.env.STRIPE_PRO_ANNUAL_PRICE_ID
    },
    features: [
      'Unlimited ad accounts',
      'Enterprise dashboard',
      'Creative gallery access',
      '24/7 phone support',
      'Advanced analytics',
      'Custom reporting',
      'Team collaboration',
      'API access',
      'Custom integrations'
    ],
    description: 'Built for large agencies and enterprise teams'
  }
} as const;

// Type definitions for better TypeScript support
type PricingPlan = typeof PRICING_PLANS[keyof typeof PRICING_PLANS];
type BillingCycle = 'monthly' | 'annual';

// Helper function to get plan by ID and billing cycle
export const getPlan = (planId: string, billingCycle: BillingCycle) => {
  const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
  if (!plan) return null;
  
  return {
    ...plan,
    currentPricing: plan[billingCycle],
    savings: billingCycle === 'annual' ? 
      Math.round(((plan.monthly.price * 12 - plan.annual.price) / (plan.monthly.price * 12)) * 100) : 0
  };
};

// Helper function to get all available plans for a billing cycle
export const getPlansByBillingCycle = (billingCycle: BillingCycle) => {
  return Object.entries(PRICING_PLANS).map(([planId, plan]) => ({
    ...plan,
    currentPricing: plan[billingCycle],
    savings: billingCycle === 'annual' ? 
      Math.round(((plan.monthly.price * 12 - plan.annual.price) / (plan.monthly.price * 12)) * 100) : 0
  }));
};
