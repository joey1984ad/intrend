'use client'

import React, { useState, useEffect } from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { useStripeIntegration } from '@/hooks/useStripeIntegration';

export default function SimpleBillingPage() {
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [mounted, setMounted] = useState(false);
  const { isStripeConfigured, isLoading: isStripeLoading } = useStripeIntegration();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Per-Account Plan Selection - Redirect to Facebook connection
  const handlePlanSelection = async (planId: string) => {
    // For per-account plans, redirect to dashboard to connect Facebook accounts
    // The actual subscription will be created after Facebook connection
    const checkoutIntent = {
      planId,
      billingCycle: billingCycle || 'monthly',
      type: 'per_account',
      successUrl: `${window.location.origin}/dashboard?plan=${planId}&billing=${billingCycle}`,
      cancelUrl: `${window.location.origin}/billing?canceled=true`,
      timestamp: Date.now()
    };
    
    const encodedIntent = btoa(JSON.stringify(checkoutIntent));
    
    // Redirect to dashboard with plan intent
    window.location.href = `/dashboard?plan=${encodedIntent}`;
  };

  // Per-Account Pricing Plans - Each Facebook ad account gets its own subscription
  const pricingPlans = [
    {
      id: 'per_account_basic',
      name: 'Per Account Basic',
      price: billingCycle === 'monthly' ? '$10' : '$96',
      period: billingCycle === 'monthly' ? '/month per account' : '/year per account',
      description: 'Basic analytics and management for each Facebook ad account',
      features: [
        'Basic analytics per account',
        'Campaign management',
        'Creative gallery access',
        'Email support',
        'Account-specific insights',
        'Individual account billing'
      ],
      popular: true,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PER_ACCOUNT_BASIC_PRICE_ID || 'price_per_account_basic_monthly'
    },
    {
      id: 'per_account_pro',
      name: 'Per Account Pro',
      price: billingCycle === 'monthly' ? '$20' : '$192',
      period: billingCycle === 'monthly' ? '/month per account' : '/year per account',
      description: 'Advanced analytics and AI insights for each Facebook ad account',
      features: [
        'Advanced analytics per account',
        'AI-powered insights',
        'Custom reporting',
        'Priority support',
        'API access',
        'Account-specific optimizations',
        'Individual account billing'
      ],
      popular: false,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PER_ACCOUNT_PRO_PRICE_ID || 'price_per_account_pro_monthly'
    }
  ];

  const getButtonText = (plan: any) => {
    if (!isStripeConfigured) return 'Contact Sales';
    return 'Connect Facebook Accounts';
  };

  const isPlanDisabled = (plan: any) => {
    if (plan.price === 'FREE') return false;
    return !isStripeConfigured;
  };

  // Don't render until mounted and Stripe status is determined to prevent hydration mismatch
  if (!mounted || isStripeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 bg-slate-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Per-Account Subscription Plans
          </h1>
          <p className="text-lg text-gray-600">
            Pay only for the Facebook ad accounts you want to manage. Each account gets its own subscription.
          </p>
        </div>

        {/* Billing Cycle Toggle - EXACT COPY FROM FRONT PAGE */}
        <div className="text-center mb-12">
          <div className="inline-flex bg-slate-100/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-white/90 backdrop-blur-sm text-slate-900 shadow-lg border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                billingCycle === 'annual'
                  ? 'bg-white/90 backdrop-blur-sm text-slate-900 shadow-lg border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 py-1 rounded-full font-medium">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards - EXACT COPY FROM FRONT PAGE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                plan.popular
                  ? 'border-2 border-blue-500/50 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-sm shadow-xl'
                  : 'border border-slate-200/50 bg-white/80 backdrop-blur-sm hover:border-slate-300/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center shadow-lg">
                    <Star className="w-4 h-4 mr-2" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4 text-slate-900">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-slate-500 text-lg ml-2">
                    {plan.period}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelection(plan.id)}
                disabled={isPlanDisabled(plan) || isLoading}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isPlanDisabled(plan) || isLoading
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-blue-500/25'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-slate-900/25'
                }`}
              >
                {isLoading && selectedPlan === plan.id ? 'Processing...' : getButtonText(plan)}
              </button>
              
              {isPlanDisabled(plan) && (
                <p className="text-xs text-slate-500 text-center mt-3">
                  Stripe not configured for this plan
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
