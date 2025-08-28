'use client'

import React, { useState } from 'react';
import { PRICING_PLANS } from '@/lib/stripe';

const PricingTest: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const getPlanPrice = (plan: any) => {
    if (billingCycle === 'annual') {
      return plan.annual.price === 0 ? 'FREE' : `$${plan.annual.price}`;
    } else {
      return plan.monthly.price === 0 ? 'FREE' : `$${plan.monthly.price}`;
    }
  };

  const getPlanPeriod = (plan: any) => {
    if (billingCycle === 'annual') {
      return plan.annual.price === 0 ? '' : '/year';
    } else {
      return plan.monthly.price === 0 ? '' : '/month';
    }
  };

  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold mb-6">Pricing Test Component</h1>
      
      {/* Billing Cycle Toggle */}
      <div className="mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              billingCycle === 'annual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual (Save 20%)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(PRICING_PLANS).map(([planId, plan]) => (
          <div
            key={planId}
            className="border border-gray-200 rounded-lg p-6"
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold">
                  {getPlanPrice(plan)}
                </span>
                <span className="text-gray-500">
                  {getPlanPeriod(plan)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{plan.description}</p>
            </div>

            <ul className="space-y-2 mb-4">
              {plan.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-700">• {feature}</li>
              ))}
            </ul>

            <div className="text-center">
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {plan.monthly.price === 0 ? 'Get Started Free' : 'Choose Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <p>Billing Cycle: {billingCycle}</p>
        <p>Current Plan Prices:</p>
        <ul className="ml-4">
          {Object.entries(PRICING_PLANS).map(([planId, plan]) => (
            <li key={planId}>
              {plan.name}: {billingCycle === 'monthly' ? plan.monthly.price : plan.annual.price}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PricingTest;
