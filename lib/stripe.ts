import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
  typescript: true,
});

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

// Pricing plans configuration
export const PRICING_PLANS = {
  starter: {
    id: 'price_starter',
    name: 'Starter',
    price: 0,
    priceId: 'price_starter_monthly',
    features: [
      'Up to 3 ad accounts',
      'Basic performance dashboard',
      'Creative gallery access',
      'Email support',
      'Basic analytics'
    ],
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_monthly'
  },
  professional: {
    id: 'price_professional',
    name: 'Professional',
    price: 10,
    priceId: 'price_professional_monthly',
    features: [
      'Up to 10 ad accounts',
      'Advanced performance dashboard',
      'Creative gallery access',
      'Priority email support',
      'Advanced analytics',
      'Custom reporting',
      'Team collaboration'
    ],
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional_monthly'
  },
  enterprise: {
    id: 'price_enterprise',
    name: 'Enterprise',
    price: 20,
    priceId: 'price_enterprise_monthly',
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
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly'
  }
};
