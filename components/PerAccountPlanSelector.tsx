'use client';

import React, { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { getPerAccountPlansByBillingCycle, calculatePerAccountTotal } from '@/lib/stripe';

interface AdAccount {
  id: string;
  name: string;
  account_status?: string;
  currency?: string;
  timezone_name?: string;
}

interface PerAccountPlanSelectorProps {
  adAccounts: AdAccount[];
  onConfirm: (planId: string, billingCycle: 'monthly' | 'annual') => void;
  onCancel: () => void;
  isVisible: boolean;
}

export default function PerAccountPlanSelector({ 
  adAccounts, 
  onConfirm, 
  onCancel, 
  isVisible 
}: PerAccountPlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  if (!isVisible) return null;

  const plans = getPerAccountPlansByBillingCycle(billingCycle);
  const totalCost = calculatePerAccountTotal(adAccounts.length, selectedPlan, billingCycle);

  const handleConfirm = () => {
    onConfirm(selectedPlan, billingCycle);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Choose Plan for Your Ad Accounts
              </h2>
              <p className="text-gray-600 mt-2">
                Each Facebook ad account will get its own subscription. You can change plans later.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Ad Accounts Summary */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              {adAccounts.length} Ad Account{adAccounts.length !== 1 ? 's' : ''} Selected
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {adAccounts.map((account) => (
                <div key={account.id} className="text-sm text-blue-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{account.name}</span>
                    <span className="text-blue-600">({account.id})</span>
                  </div>
                  <div className="text-xs text-blue-600">
                    {account.account_status === 'active' ? 'Active' : account.account_status || 'Unknown'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Cycle Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing Cycle</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Annual (20% off)
              </button>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${plan.currentPricing.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        per account / {plan.currentPricing.billingCycle}
                      </div>
                      {plan.savings > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          Save {plan.savings}%
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Summary</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {adAccounts.length} ad account{adAccounts.length !== 1 ? 's' : ''} × ${plans.find(p => p.id === selectedPlan)?.currentPricing.price || 0}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                ${totalCost}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {billingCycle === 'annual' ? 'per year' : 'per month'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Subscriptions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

