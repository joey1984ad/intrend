'use client'

import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Download, Plus, X, CheckCircle, Star } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { PER_ACCOUNT_PRICING_PLANS, getPerAccountPlansByBillingCycle, calculatePerAccountTotal } from '@/lib/stripe';

interface PerAccountSubscription {
  id: number;
  ad_account_id: string;
  ad_account_name: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: string;
  billing_cycle: 'monthly' | 'annual';
  amount_cents: number;
  current_period_start: string;
  current_period_end: string;
}

export default function PerAccountBillingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [perAccountSubscriptions, setPerAccountSubscriptions] = useState<PerAccountSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [facebookAdAccounts, setFacebookAdAccounts] = useState<any[]>([]);
  const [hasFacebookSession, setHasFacebookSession] = useState(false);
  const [isCheckingFacebook, setIsCheckingFacebook] = useState(false);
  
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      loadPerAccountSubscriptions();
      checkFacebookSession();
    }
  }, [user?.id]);

  const checkFacebookSession = async () => {
    try {
      setIsCheckingFacebook(true);
      
      // Check if user has existing Facebook session
      const sessionResponse = await fetch(`/api/facebook/session?userId=${user?.id}`);
      const sessionData = await sessionResponse.json();
      
      if (sessionData.success && sessionData.hasSession) {
        setHasFacebookSession(true);
        
        // If user has Facebook session, try to get their ad accounts
        try {
          const adAccountsResponse = await fetch(`/api/facebook/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: sessionData.session.accessToken,
              userId: sessionData.session.userId,
              userEmail: user?.email
            })
          });
          
          const adAccountsData = await adAccountsResponse.json();
          if (adAccountsData.success && adAccountsData.adAccounts) {
            setFacebookAdAccounts(adAccountsData.adAccounts);
          }
        } catch (error) {
          console.log('Could not fetch ad accounts:', error);
        }
      } else {
        setHasFacebookSession(false);
      }
    } catch (error) {
      console.error('Error checking Facebook session:', error);
      setHasFacebookSession(false);
    } finally {
      setIsCheckingFacebook(false);
    }
  };

  const loadPerAccountSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/per-account-subscriptions?userId=${user?.id}&includeHistory=true`);
      const data = await response.json();
      
      if (data.success) {
        setPerAccountSubscriptions(data.subscriptions || []);
      } else {
        setError(data.error || 'Failed to load subscriptions');
      }
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: number, adAccountName: string) => {
    if (!confirm(`Are you sure you want to cancel the subscription for ${adAccountName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/per-account-subscriptions?subscriptionId=${subscriptionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      await loadPerAccountSubscriptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    }
  };

  const handlePlanSelection = async (planId: string) => {
    setSelectedPlan(planId);
    
    // If user has existing Facebook session and ad accounts, show account selection
    if (hasFacebookSession && facebookAdAccounts.length > 0) {
      // Filter out already subscribed accounts
      const subscribedAccountIds = new Set(perAccountSubscriptions.map(sub => sub.ad_account_id));
      const availableAccounts = facebookAdAccounts.filter(account => 
        !subscribedAccountIds.has(account.id)
      );
      
      if (availableAccounts.length > 0) {
        // Show account selection modal
        showAccountSelectionModal(planId, availableAccounts);
      } else {
        // All accounts are already subscribed
        alert('All your Facebook ad accounts are already subscribed. You can manage existing subscriptions in the Overview tab.');
      }
    } else {
      // No existing Facebook session, redirect to dashboard for connection
      const checkoutIntent = {
        planId,
        billingCycle: billingCycle || 'monthly',
        type: 'per_account',
        successUrl: `${window.location.origin}/dashboard?plan=${planId}&billing=${billingCycle}`,
        cancelUrl: `${window.location.origin}/billing?canceled=true`,
        timestamp: Date.now()
      };
      
      const encodedIntent = btoa(JSON.stringify(checkoutIntent));
      window.location.href = `/dashboard?plan=${encodedIntent}`;
    }
  };

  const showAccountSelectionModal = (planId: string, availableAccounts: any[]) => {
    const planName = planId === 'basic' ? 'Basic' : 'Pro';
    const monthlyPrice = planId === 'basic' ? 10 : 20;
    const annualPrice = planId === 'basic' ? 96 : 192;
    const price = billingCycle === 'annual' ? annualPrice : monthlyPrice;
    
    // Create a more comprehensive payment modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">Subscribe to ${planName} Plan</h3>
              <p class="text-gray-600 mt-2">
                Choose which Facebook ad accounts you want to subscribe to the ${planName} plan.
              </p>
            </div>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Plan Summary -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <h4 class="font-semibold text-blue-900">${planName} Plan</h4>
                <p class="text-sm text-blue-700">$${price} / ${billingCycle === 'annual' ? 'year' : 'month'} per account</p>
              </div>
              <div class="text-right">
                <div class="text-sm text-blue-600">
                  Selected: <span id="selected-count">0</span> accounts
                </div>
                <div class="text-lg font-bold text-blue-900">
                  Total: $<span id="total-cost">0</span> / ${billingCycle === 'annual' ? 'year' : 'month'}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Account Selection -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Select Ad Accounts</h4>
            <div class="space-y-3 max-h-60 overflow-y-auto" id="account-list">
              ${availableAccounts.map(account => `
                <div class="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <label class="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" value="${account.id}" class="account-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" onchange="updateTotal()">
                    <div class="flex-1">
                      <h5 class="font-medium text-gray-900">${account.name}</h5>
                      <p class="text-sm text-gray-500">ID: ${account.id}</p>
                      <p class="text-sm text-gray-500">Status: ${account.account_status || 'Active'}</p>
                    </div>
                    <div class="text-right">
                      <span class="text-blue-600 font-semibold">
                        $${price} / ${billingCycle}
                      </span>
                    </div>
                  </label>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Payment Method -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Payment Method</h4>
            <p class="text-sm text-gray-600 mb-3">
              You'll be redirected to Stripe to add a payment method and complete your subscription.
            </p>
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Secure payment processing by Stripe</span>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3">
            <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button onclick="proceedToPayment('${planId}')" id="proceed-btn" disabled class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add global functions
    (window as any).updateTotal = () => {
      const checkboxes = modal.querySelectorAll('.account-checkbox:checked');
      const selectedCount = checkboxes.length;
      const totalCost = selectedCount * price;
      
      modal.querySelector('#selected-count').textContent = selectedCount;
      modal.querySelector('#total-cost').textContent = totalCost;
      
      const proceedBtn = modal.querySelector('#proceed-btn');
      if (selectedCount > 0) {
        proceedBtn.disabled = false;
        proceedBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        proceedBtn.disabled = true;
        proceedBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    };
    
    (window as any).proceedToPayment = async (planId: string) => {
      const checkboxes = modal.querySelectorAll('.account-checkbox:checked');
      const selectedAccounts = Array.from(checkboxes).map(cb => {
        const accountId = (cb as HTMLInputElement).value;
        return facebookAdAccounts.find(acc => acc.id === accountId);
      }).filter(Boolean);
      
      if (selectedAccounts.length === 0) {
        alert('Please select at least one ad account.');
        return;
      }
      
      try {
        // Create Stripe checkout session for the selected accounts
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            adAccounts: selectedAccounts,
            planId,
            billingCycle,
            userEmail: user?.email,
            type: 'per_account'
          })
        });
        
        if (response.ok) {
          const { url } = await response.json();
          window.location.href = url;
        } else {
          throw new Error('Failed to create checkout session');
        }
      } catch (error) {
        console.error('Error creating checkout session:', error);
        alert('Failed to create checkout session. Please try again.');
      }
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'canceled':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      case 'past_due':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading subscriptions...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Per-Account Billing</h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage individual subscriptions for each Facebook ad account
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: CreditCard },
              { id: 'plans', label: 'Plans & Pricing', icon: Calendar },
              { id: 'history', label: 'Billing History', icon: Download },
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Overview</h2>
              
              {perAccountSubscriptions.length > 0 ? (
                <div className="space-y-6">
                  {/* Individual Subscriptions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {perAccountSubscriptions.map((subscription) => (
                      <div key={subscription.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(subscription.status)}
                            <h3 className="font-medium text-gray-900">
                              {subscription.ad_account_name}
                            </h3>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                            {subscription.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Account ID:</span>
                            <span className="font-mono text-gray-900">{subscription.ad_account_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Plan:</span>
                            <span className="font-medium text-gray-900">
                              {subscription.stripe_price_id.includes('basic') ? 'Basic' : 'Pro'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Price:</span>
                            <span className="font-medium text-gray-900">
                              ${(subscription.amount_cents / 100).toFixed(2)} / {subscription.billing_cycle}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Next billing:</span>
                            <span className="text-gray-900">
                              {new Date(subscription.current_period_end).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleCancelSubscription(subscription.id, subscription.ad_account_name)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            Cancel Subscription
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total Cost Summary */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-blue-900">Total Monthly Cost</h3>
                        <p className="text-sm text-blue-700">
                          {perAccountSubscriptions.length} account{perAccountSubscriptions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900">
                          ${perAccountSubscriptions.reduce((total, sub) => {
                            const monthlyPrice = sub.billing_cycle === 'annual' 
                              ? (sub.amount_cents / 100) / 12 
                              : sub.amount_cents / 100;
                            return total + monthlyPrice;
                          }, 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-blue-700">per month</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscriptions</h3>
                  <p className="text-gray-500 mb-4">
                    Connect your Facebook ad accounts to start managing them with individual subscriptions.
                  </p>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Per-Account Subscription Plans</h2>
                <p className="text-gray-600">
                  Pay only for the Facebook ad accounts you want to manage. Each account gets its own subscription.
                </p>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      billingCycle === 'annual'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Annual
                    {billingCycle === 'annual' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Save 20%
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Pricing Plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {Object.entries(PER_ACCOUNT_PRICING_PLANS).map(([planId, plan]) => {
                  const currentPricing = billingCycle === 'annual' ? plan.annual : plan.monthly;
                  const isPopular = plan.popular;
                  
                  return (
                    <div
                      key={planId}
                      className={`relative p-6 rounded-lg border-2 transition-all duration-200 ${
                        isPopular
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-4xl font-bold text-gray-900">${currentPricing.price}</span>
                          <span className="text-gray-600 ml-1">
                            /{billingCycle === 'annual' ? 'year' : 'month'} per account
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{plan.description}</p>
                      </div>
                      
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button
                        onClick={() => handlePlanSelection(planId)}
                        disabled={isCheckingFacebook}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          isPopular
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        } ${isCheckingFacebook ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isCheckingFacebook ? 'Checking...' : 
                         hasFacebookSession && facebookAdAccounts.length > 0 ? 'Subscribe to Plan' : 
                         'Connect Facebook Accounts'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Cost Calculator */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Cost Calculator</h3>
                <div className="text-center">
                  <p className="text-gray-600 mb-2">
                    Each Facebook ad account gets its own individual subscription
                  </p>
                  <div className="text-2xl font-bold text-gray-900">
                    ${Object.values(PER_ACCOUNT_PRICING_PLANS).find(p => p.id === selectedPlan)?.currentPricing?.price || 0}
                    <span className="text-lg text-gray-600 ml-1">
                      /{billingCycle === 'annual' ? 'year' : 'month'} per account
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Choose your plan and connect your Facebook ad accounts to get started
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h2>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Billing History</h3>
                <p className="text-gray-500">
                  Individual billing history for each ad account subscription.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
