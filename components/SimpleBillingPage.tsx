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

  // EXACT COPY FROM FRONT PAGE - handlePlanSelection function
  const handlePlanSelection = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/dashboard';
      return;
    }

    const plan = pricingPlans.find(p => p.id === planId);
    if (!plan) {
      alert('Plan not found. Please try again.');
      return;
    }

    if (plan.price !== 'FREE' && plan.stripePriceId === 'free') {
      alert('This plan is not available for online purchase. Please contact sales for more information.');
      return;
    }

    // Check if user is logged in
    if (!email || !email.trim() || !email.includes('@')) {
      // User is not logged in, redirect to signup with checkout intent
      const checkoutIntent = {
        planId,
        billingCycle: billingCycle || 'monthly',
        successUrl: `${window.location.origin}/billing?success=true&plan=${planId}`,
        cancelUrl: `${window.location.origin}/billing?canceled=true`,
        timestamp: Date.now()
      };
      
      const encodedIntent = btoa(JSON.stringify(checkoutIntent));
      window.location.href = `/signup?checkout=${encodedIntent}`;
      return;
    }

    setSelectedPlan(planId);
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingCycle: billingCycle || 'monthly',
          customerEmail: email,
          successUrl: `${window.location.origin}/billing?success=true&plan=${planId}`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.url) {
          window.location.href = data.url;
        } else if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else if (data.development) {
          // Development mode: simulate successful subscription
          alert('Development mode: Subscription simulated successfully! In production, this would redirect to Stripe checkout.');
          window.location.href = '/dashboard';
        } else if (data.sessionId) {
          // Production mode: verify subscription with backend
          try {
            const verifyResponse = await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: data.sessionId })
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              alert(`Successfully upgraded to ${verifyData.planTier} plan!`);
              window.location.href = '/dashboard';
            } else {
              console.error('Subscription verification failed:', verifyData.error);
              alert('Payment successful but subscription verification failed. Please refresh the page.');
            }
          } catch (error) {
            console.error('Error verifying subscription:', error);
            alert('Payment successful but verification failed. Please refresh the page.');
          }
        }
      } else if (data.requiresSignup) {
        // User needs to sign up first
        window.location.href = data.redirectUrl;
      } else {
        console.error('Failed to create checkout session:', data.error);
        alert(data.error || 'Failed to start checkout process. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // EXACT COPY FROM FRONT PAGE - pricingPlans array
  const pricingPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 'FREE',
      period: '',
      description: 'Perfect for small agencies and businesses',
      features: [
        'Up to 3 ad accounts',
        'Basic performance dashboard',
        'Creative gallery access',
        'Email support',
        '7-day data retention',
        'Basic reporting'
      ],
      popular: false,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID || 'free'
    },
    {
      id: 'startup',
      name: 'Startup',
      price: billingCycle === 'monthly' ? '$10' : '$96',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Ideal for growing agencies and businesses',
      features: [
        'Up to 10 ad accounts',
        'Advanced analytics & insights',
        'AI creative analysis',
        'Priority support',
        '30-day data retention',
        'Custom reporting',
        'Campaign optimization tips'
      ],
      popular: true,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTUP_PRICE_ID || 'price_startup_monthly'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? '$20' : '$192',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For large agencies and enterprise clients',
      features: [
        'Unlimited ad accounts',
        'Full API access',
        'White-label solutions',
        'Dedicated account manager',
        '90-day data retention',
        'Custom integrations',
        'Advanced AI insights'
      ],
      popular: false,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_monthly'
    }
  ];

  const getButtonText = (plan: any) => {
    if (plan.price === 'FREE') return 'Get Started Free';
    if (!isStripeConfigured) return 'Contact Sales';
    return 'Choose Plan';
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
            Billing & Subscription
          </h1>
          <p className="text-lg text-gray-600">
            Choose the perfect plan for your business needs
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
