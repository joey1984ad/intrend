'use client'

import React, { useState, useEffect } from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { PER_ACCOUNT_PRICING_PLANS } from '@/lib/stripe';
import { useStripeIntegration } from '@/hooks/useStripeIntegration';

interface PricingSectionProps {
  showBillingToggle?: boolean;
  onPlanSelect?: (planId: string) => void;
  currentPlan?: string;
  className?: string;
  billingCycle?: 'monthly' | 'annual';
  onBillingCycleChange?: (cycle: 'monthly' | 'annual') => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  showBillingToggle = true,
  onPlanSelect,
  currentPlan,
  className = '',
  billingCycle: externalBillingCycle,
  onBillingCycleChange
}) => {
  const [internalBillingCycle, setInternalBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [mounted, setMounted] = useState(false);
  const { isStripeConfigured, isLoading: isStripeLoading } = useStripeIntegration();

  // Use external billing cycle if provided, otherwise use internal state
  const billingCycle = externalBillingCycle || internalBillingCycle;

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBillingCycleChange = (cycle: 'monthly' | 'annual') => {
    if (onBillingCycleChange) {
      onBillingCycleChange(cycle);
    } else {
      setInternalBillingCycle(cycle);
    }
  };

  const getPlanPrice = (plan: any) => {
    if (billingCycle === 'annual') {
      return plan.annual.price === 0 ? 'FREE' : `$${plan.annual.price}`;
    } else {
      return plan.monthly.price === 0 ? 'FREE' : `$${plan.monthly.price}`;
    }
  };

  const getPlanPeriod = (plan: any) => {
    if (billingCycle === 'annual') {
      return plan.annual.price === 0 ? '' : '/year per account';
    } else {
      return plan.monthly.price === 0 ? '' : '/month per account';
    }
  };

  const getButtonText = (plan: any) => {
    if (currentPlan === plan.id) {
      return 'Current Plan';
    }
    
    if (!isStripeConfigured) return 'Contact Sales';
    return 'Connect Facebook Accounts';
  };

  const isPlanDisabled = (plan: any) => {
    if (currentPlan === plan.id) return true;
    
    if (billingCycle === 'annual') {
      return plan.annual.price > 0 && !isStripeConfigured;
    } else {
      return plan.monthly.price > 0 && !isStripeConfigured;
    }
  };

  const handlePlanClick = (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
  };

  // Don't render until mounted and Stripe status is determined to prevent hydration mismatch
  if (!mounted || isStripeLoading) {
    return (
      <div className={className}>
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
    );
  }

  return (
    <div className={className}>
      {/* Billing Cycle Toggle */}
      {showBillingToggle && (
        <div className="text-center mb-12">
          <div className="inline-flex bg-slate-100/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-1">
            <button
              onClick={() => handleBillingCycleChange('monthly')}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-white/90 backdrop-blur-sm text-slate-900 shadow-lg border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleBillingCycleChange('annual')}
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
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(PER_ACCOUNT_PRICING_PLANS).map(([planId, plan]) => (
          <div
            key={planId}
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

            {currentPlan === plan.id && (
              <div className="absolute -top-4 right-4">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4 text-slate-900">
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {getPlanPrice(plan)}
                </span>
                <span className="text-slate-500 text-lg ml-2">
                  {getPlanPeriod(plan)}
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
              onClick={() => handlePlanClick(planId)}
              disabled={isPlanDisabled(plan)}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                currentPlan === plan.id
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : isPlanDisabled(plan)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-blue-500/25'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-slate-900/25'
              }`}
            >
              {getButtonText(plan)}
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
  );
};

export default PricingSection;
