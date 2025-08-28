'use client'

import React, { useState } from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/stripe';

interface PricingSectionProps {
  showBillingToggle?: boolean;
  onPlanSelect?: (planId: string) => void;
  currentPlan?: string;
  className?: string;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  showBillingToggle = true,
  onPlanSelect,
  currentPlan,
  className = ''
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const getPlanPrice = (plan: any) => {
    if (plan.price === 0) return 'FREE';
    if (billingCycle === 'annual') {
      const annualPrice = Math.round(plan.price * 12 * 0.8); // 20% discount
      return `$${annualPrice}`;
    }
    return `$${plan.price}`;
  };

  const getPlanPeriod = (plan: any) => {
    if (plan.price === 0) return '';
    return billingCycle === 'annual' ? '/year' : '/month';
  };

  const handlePlanClick = (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
  };

  return (
    <div className={className}>
      {/* Billing Cycle Toggle */}
      {showBillingToggle && (
        <div className="text-center mb-12">
          <div className="inline-flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Annual
              <span className="ml-1 text-xs text-green-600 font-medium">Save 20%</span>
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(PRICING_PLANS).map(([planId, plan]) => (
          <div
            key={planId}
            className={`relative rounded-2xl p-8 transition-all duration-300 ${
              plan.popular
                ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                : 'border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            } hover:shadow-lg hover:-translate-y-1`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </span>
              </div>
            )}

            {currentPlan === plan.id && (
              <div className="absolute -top-4 right-4">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {getPlanPrice(plan)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {getPlanPeriod(plan)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-200">{feature}</span>
                </li>
              ))}
            </ul>

                                  <button
                        onClick={() => handlePlanClick(planId)}
                        disabled={currentPlan === plan.id || (plan.price > 0 && !plan.hasStripeIntegration)}
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                          currentPlan === plan.id
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : plan.price > 0 && !plan.hasStripeIntegration
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105'
                            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                        }`}
                      >
                        {currentPlan === plan.id
                          ? 'Current Plan'
                          : plan.price === 0
                          ? 'Get Started Free'
                          : plan.price > 0 && !plan.hasStripeIntegration
                          ? 'Contact Sales'
                          : 'Choose Plan'}
                      </button>
                      
                      {plan.price > 0 && !plan.hasStripeIntegration && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
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
