'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { 
  getPerAccountPlansByBillingCycle, 
  calculatePerAccountTotal,
  PER_ACCOUNT_PRICING_PLANS 
} from '@/lib/stripe';

interface AdAccountSubscription {
  id: number;
  ad_account_id: string;
  ad_account_name: string;
  stripe_subscription_id: string;
  status: string;
  billing_cycle: 'monthly' | 'annual';
  amount_cents: number;
  current_period_start: string;
  current_period_end: string;
}

interface PerAccountBillingManagerProps {
  userId: number;
  adAccounts: AdAccountSubscription[];
  selectedAdAccount?: string;
  onSubscriptionUpdate?: () => void;
  availableAdAccounts?: any[]; // Available ad accounts that can be added
}

export default function PerAccountBillingManager({ 
  userId, 
  adAccounts, 
  selectedAdAccount,
  onSubscriptionUpdate,
  availableAdAccounts = []
}: PerAccountBillingManagerProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  // Define refreshFacebookAccounts function early so it can be used in early returns
  const refreshFacebookAccounts = () => {
    // Trigger a refresh by emitting a custom event that MetaDashboard can listen to
    window.dispatchEvent(new CustomEvent('refreshFacebookAccounts'));
  };

  // Filter out already subscribed accounts - need this early for early returns
  const subscribedAccountIds = new Set(adAccounts.map(account => account.ad_account_id));
  const availableAccounts = availableAdAccounts.filter(account => 
    !subscribedAccountIds.has(account.id)
  );

  // Get plans early for use in early returns
  const plans = getPerAccountPlansByBillingCycle(billingCycle);

  // Filter subscriptions to show only the selected ad account
  const currentAccountSubscription = selectedAdAccount 
    ? adAccounts.find(sub => sub.ad_account_id === selectedAdAccount)
    : null;

  // Initialize plan and billing cycle from current subscription
  useEffect(() => {
    if (currentAccountSubscription) {
      // Extract plan from stripe_price_id (e.g., "price_per_account_basic_monthly" -> "basic")
      const priceId = currentAccountSubscription.stripe_price_id || currentAccountSubscription.stripe_subscription_id;
      if (priceId && priceId.includes('basic')) {
        setSelectedPlan('basic');
      } else if (priceId && priceId.includes('pro')) {
        setSelectedPlan('pro');
      } else {
        // Default to basic if we can't determine the plan
        setSelectedPlan('basic');
      }
      
      // Set billing cycle from subscription
      setBillingCycle(currentAccountSubscription.billing_cycle as 'monthly' | 'annual');
    }
  }, [currentAccountSubscription]);

  // If no selected account, show a different interface for adding accounts
  if (!selectedAdAccount) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Add Your First Ad Account Subscription
          </h2>
          <p className="text-gray-600">
            Select a Facebook ad account to start your subscription.
          </p>
        </div>

        {/* Debug Information */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-yellow-800">🔍 Account Debug Info</h3>
            <button
              onClick={refreshFacebookAccounts}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
            >
              🔄 Refresh Facebook Accounts
            </button>
          </div>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>Total Facebook accounts:</strong> {availableAdAccounts.length}</p>
            <p><strong>Current subscriptions:</strong> {adAccounts.length}</p>
            <p><strong>Available to add:</strong> {availableAccounts.length}</p>
          </div>
        </div>

        {availableAccounts.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Ad Accounts</h3>
            <div className="space-y-3 mb-6">
              {availableAccounts.map((account) => (
                <div
                  key={account.id}
                  className="border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => {
                    console.log('🔵 PerAccountBillingManager: Account clicked:', account.name);
                    console.log('🔵 PerAccountBillingManager: Dispatching startAccountSubscription event');
                    console.log('🔵 PerAccountBillingManager: Event details:', { accounts: [account], planId: selectedPlan, billingCycle });
                    
                    // Trigger a checkout flow for this specific account
                    window.dispatchEvent(new CustomEvent('startAccountSubscription', {
                      detail: { accounts: [account], planId: selectedPlan, billingCycle }
                    }));
                    
                    console.log('🔵 PerAccountBillingManager: Event dispatched successfully');
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">{account.name}</h4>
                      <p className="text-sm text-gray-500">ID: {account.id}</p>
                      {account.account_status && (
                        <p className="text-sm text-gray-500">
                          Status: <span className={`font-medium ${
                            account.account_status === 'active' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {account.account_status}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${plans.find(p => p.id === selectedPlan)?.currentPricing.price || 0}/{billingCycle}
                      </div>
                      <div className="text-xs text-gray-500">per account</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            {availableAdAccounts.length === 0 ? (
              <div className="text-gray-500">
                <p className="mb-2">No Facebook accounts connected.</p>
                <button
                  onClick={refreshFacebookAccounts}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Connect Facebook Account
                </button>
              </div>
            ) : (
              <div className="text-gray-500">
                <p>All your Facebook accounts already have subscriptions.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // If selected account but no subscription, show option to create one
  if (!currentAccountSubscription) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Subscription for Selected Account
          </h2>
          <p className="text-gray-600">
            The selected ad account doesn't have an active subscription. Create one to get started.
          </p>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Selected Account</h3>
          <p className="text-blue-800">Account ID: {selectedAdAccount}</p>
        </div>

        <button
          onClick={() => {
            // Trigger the account selection flow
            const selectedAccount = availableAdAccounts.find(acc => acc.id === selectedAdAccount);
            if (selectedAccount) {
              window.dispatchEvent(new CustomEvent('addAccountSubscription', {
                detail: { account: selectedAccount }
              }));
            }
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Create Subscription for This Account
        </button>
      </div>
    );
  }

  const totalCost = calculatePerAccountTotal(1, selectedPlan, billingCycle); // Only 1 account

  const handlePlanChange = async (planId: string) => {
    if (planId === selectedPlan) return;

    setIsLoading(true);
    setError(null);

    try {
      // Update only the current account's subscription
      const response = await fetch('/api/per-account-subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: currentAccountSubscription.id,
          planId,
          billingCycle
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update subscription for ${currentAccountSubscription.ad_account_name}`);
      }

      setSelectedPlan(planId);
      onSubscriptionUpdate?.();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBillingCycleChange = async (cycle: 'monthly' | 'annual') => {
    if (cycle === billingCycle) return;

    setIsLoading(true);
    setError(null);

    try {
      // Update only the current account's subscription
      const response = await fetch('/api/per-account-subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: currentAccountSubscription.id,
          planId: selectedPlan,
          billingCycle: cycle
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update billing cycle for ${currentAccountSubscription.ad_account_name}`);
      }

      setBillingCycle(cycle);
      onSubscriptionUpdate?.();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update billing cycle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm(`Are you sure you want to cancel the subscription for ${currentAccountSubscription.ad_account_name}?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/per-account-subscriptions?subscriptionId=${currentAccountSubscription.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel subscription for ${currentAccountSubscription.ad_account_name}`);
      }

      onSubscriptionUpdate?.();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async (adAccount: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-per-account-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          adAccounts: [adAccount],
          planId: selectedPlan,
          billingCycle,
          stripeCustomerId: currentAccountSubscription.stripe_customer_id // Use existing customer ID
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add subscription for ${adAccount.name}`);
      }

      onSubscriptionUpdate?.();
      setShowAddAccountModal(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account');
    } finally {
      setIsLoading(false);
    }
  };

  // Debug information
  console.log('🔍 PerAccountBillingManager Debug:');
  console.log('📊 Total Facebook ad accounts:', availableAdAccounts.length);
  console.log('📊 Subscribed account IDs:', Array.from(subscribedAccountIds));
  console.log('📊 Available accounts for adding:', availableAccounts.length);
  console.log('📊 Available accounts:', availableAccounts.map(acc => ({ id: acc.id, name: acc.name })));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Subscription for {currentAccountSubscription.ad_account_name}
        </h2>
        <p className="text-gray-600">
          Manage billing for this Facebook ad account. Each account has its own individual subscription.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Billing Cycle Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing Cycle</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => handleBillingCycleChange('monthly')}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Monthly
          </button>
          <button
            onClick={() => handleBillingCycleChange('annual')}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'annual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isLoading && handlePlanChange(plan.id)}
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
                    <span className="text-green-500 mr-2">✓</span>
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
            1 ad account × ${plans.find(p => p.id === selectedPlan)?.currentPricing.price || 0}
          </span>
          <span className="text-2xl font-bold text-gray-900">
            ${totalCost}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {billingCycle === 'annual' ? 'per year' : 'per month'}
        </div>
      </div>

      {/* Debug Information */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-yellow-800">🔍 Account Debug Info</h3>
          <button
            onClick={refreshFacebookAccounts}
            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
          >
            🔄 Refresh Facebook Accounts
          </button>
        </div>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>Total Facebook accounts:</strong> {availableAdAccounts.length}</p>
          <p><strong>Current subscriptions:</strong> {adAccounts.length}</p>
          <p><strong>Available to add:</strong> {availableAccounts.length}</p>
          {availableAdAccounts.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Show all Facebook accounts</summary>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {availableAdAccounts.map(acc => (
                  <div key={acc.id} className="flex justify-between text-xs">
                    <span>{acc.name}</span>
                    <span className={subscribedAccountIds.has(acc.id) ? 'text-green-600' : 'text-orange-600'}>
                      {subscribedAccountIds.has(acc.id) ? 'Subscribed' : 'Available'}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
          {availableAdAccounts.length === 0 && (
            <div className="mt-2 p-2 bg-yellow-100 rounded text-yellow-800">
              ⚠️ No Facebook accounts found. Try clicking "Refresh Facebook Accounts" or reconnecting your Facebook account.
            </div>
          )}
        </div>
      </div>

      {/* Current Account Subscription */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Current Account Subscription</h3>
          {availableAccounts.length > 0 ? (
            <button
              onClick={() => setShowAddAccountModal(true)}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <span>+</span>
              <span>Add Account</span>
            </button>
          ) : (
            <div className="text-sm text-gray-500">
              {availableAdAccounts.length === 0 ? 'No Facebook accounts connected' : 'All accounts subscribed'}
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{currentAccountSubscription.ad_account_name}</h4>
              <p className="text-sm text-gray-500">ID: {currentAccountSubscription.ad_account_id}</p>
              <p className="text-sm text-gray-500">
                Status: <span className={`font-medium ${
                  currentAccountSubscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentAccountSubscription.status}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                ${(currentAccountSubscription.amount_cents / 100).toFixed(2)} / {currentAccountSubscription.billing_cycle}
              </p>
              <button
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Processing...</span>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Ad Account</h3>
                <button
                  onClick={() => setShowAddAccountModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Select an ad account to add to your subscription. The account will be charged at the current plan rate.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {availableAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => {
                      console.log('🔵 PerAccountBillingManager: Add Account modal - Account clicked:', account.name);
                      console.log('🔵 PerAccountBillingManager: Closing add account modal and triggering plan selector');
                      
                      // Close the add account modal
                      setShowAddAccountModal(false);
                      
                      // Trigger the plan selector flow
                      window.dispatchEvent(new CustomEvent('startAccountSubscription', {
                        detail: { accounts: [account], planId: selectedPlan, billingCycle }
                      }));
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">{account.name}</h4>
                        <p className="text-sm text-gray-500">ID: {account.id}</p>
                        {account.account_status && (
                          <p className="text-sm text-gray-500">
                            Status: <span className={`font-medium ${
                              account.account_status === 'active' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {account.account_status}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${plans.find(p => p.id === selectedPlan)?.currentPricing.price || 0}/{billingCycle}
                        </div>
                        <div className="text-xs text-gray-500">per account</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {availableAccounts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No additional ad accounts available to add.</p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
