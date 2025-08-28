'use client'

import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Download, AlertCircle, CheckCircle, XCircle, Star, Clock } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';
import { PRICING_PLANS, getPlansByBillingCycle, PLAN_LIMITS } from '@/lib/stripe';

interface Subscription {
  id: string;
  status: string;
  current_period_end: number;
  plan: {
    id: string;
    name: string;
    price: number;
  };
  cancel_at_period_end: boolean;
  billing_cycle: 'monthly' | 'annual';
}

interface Invoice {
  id: string;
  amount_paid: number;
  status: string;
  created: number;
  invoice_pdf?: string;
  invoice_number?: string;
}

interface PaymentMethod {
  id: number;
  type: string;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export default function EnhancedBillingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  // Safe theme handling with fallback
  const [theme, setTheme] = useState<'white' | 'dark'>('white');
  
  useEffect(() => {
    setMounted(true);
    loadSubscriptionData();
  }, []);

  // Try to get theme context safely
  useEffect(() => {
    if (mounted) {
      try {
        const themeContext = useDashboardTheme();
        if (themeContext?.theme) {
          setTheme(themeContext.theme);
        }
      } catch (error) {
        // If theme context is not available, keep default theme
        console.log('Theme context not available, using default theme');
      }
    }
  }, [mounted]);

  const loadSubscriptionData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setTimeout(() => {
        setSubscription({
          id: 'sub_123',
          status: 'active',
          current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
          plan: {
            id: 'starter',
            name: 'Starter',
            price: 0
          },
          cancel_at_period_end: false,
          billing_cycle: 'monthly'
        });
        
        setInvoices([
          {
            id: 'inv_123',
            amount_paid: 0,
            status: 'paid',
            created: Date.now() - 7 * 24 * 60 * 60 * 1000,
            invoice_pdf: 'https://example.com/invoice.pdf',
            invoice_number: 'INV-001'
          }
        ]);
        
        setPaymentMethods([
          {
            id: 1,
            type: 'card',
            last4: '4242',
            brand: 'visa',
            expMonth: 12,
            expYear: 2025,
            isDefault: true
          }
        ]);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: string, cycle: 'monthly' | 'annual') => {
    setSelectedPlan(planId);
    setSelectedBillingCycle(cycle);
    setShowUpgradeModal(true);
  };

  const handleCustomerPortal = async () => {
    try {
      // For now, use a placeholder email - in production this should come from user context
      const customerEmail = subscription?.plan.id === 'starter' ? null : 'user@example.com';
      
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: customerEmail,
          returnUrl: `${window.location.origin}/billing`,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Customer portal error:', data.error);
        alert(data.error || 'Failed to access customer portal. Please try again.');
      }
    } catch (error) {
      console.error('Customer portal error:', error);
      alert('Failed to access customer portal. Please try again.');
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle: selectedBillingCycle,
          customerEmail: 'user@example.com', // Replace with actual user email
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.url) {
          window.location.href = data.url;
        } else if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } else {
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create checkout session. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'past_due':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'trialing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlansForCurrentCycle = () => {
    return getPlansByBillingCycle(billingCycle);
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'white' ? 'bg-gray-50' : 'bg-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
          }`}>Billing & Subscription</h1>
          <p className={`text-lg transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-600' : 'text-gray-400'
          }`}>Manage your subscription, billing information, and payment methods</p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="mb-8">
          <div className={`inline-flex rounded-lg p-1 transition-colors duration-300 ${
            theme === 'white' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'
          }`}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : theme === 'white'
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-300 hover:text-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : theme === 'white'
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-300 hover:text-gray-100'
              }`}
            >
              Annual
              {billingCycle === 'annual' && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Save up to 17%
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className={`space-y-1 rounded-lg p-4 transition-colors duration-300 ${
              theme === 'white' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'
            }`}>
              {[
                { id: 'overview', label: 'Overview', icon: CreditCard },
                { id: 'plans', label: 'Plans & Pricing', icon: Calendar },
                { id: 'invoices', label: 'Billing History', icon: Download },
                { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? theme === 'white'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-blue-900/20 text-blue-300'
                        : theme === 'white'
                          ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          : 'text-gray-300 hover:text-gray-100 hover:bg-slate-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className={`rounded-lg p-6 transition-colors duration-300 ${
                theme === 'white' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'
              }`}>
                <div className="mb-6">
                  <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                  }`}>Current Subscription</h2>
                  
                  {subscription && (
                    <div className={`p-4 rounded-lg border transition-colors duration-300 ${
                      theme === 'white' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(subscription.status)}
                          <div>
                            <h3 className={`font-medium transition-colors duration-300 ${
                              theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                            }`}>{subscription.plan.name} Plan</h3>
                            <p className={`text-sm transition-colors duration-300 ${
                              theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {subscription.plan.price === 0 ? 'Free' : `$${subscription.plan.price}/${subscription.billing_cycle === 'annual' ? 'year' : 'month'}`}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className={`transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                          }`}>Next billing date</p>
                          <p className={`font-medium transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                          }`}>
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className={`transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                          }`}>Billing cycle</p>
                          <p className={`font-medium transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                          }`}>
                            {subscription.billing_cycle.charAt(0).toUpperCase() + subscription.billing_cycle.slice(1)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-3">
                        <button
                          onClick={handleCustomerPortal}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Manage Subscription
                        </button>
                        <button
                          onClick={() => setActiveTab('plans')}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Change Plan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div className={`rounded-lg p-6 transition-colors duration-300 ${
                theme === 'white' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'
              }`}>
                <h2 className={`text-xl font-semibold mb-6 transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                }`}>Available Plans</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getPlansForCurrentCycle().map((plan) => (
                    <div 
                      key={plan.id}
                      className={`relative p-6 rounded-xl border transition-all duration-300 ${
                        subscription?.plan.id === plan.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      {subscription?.plan.id === plan.id && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Current Plan
                          </span>
                        </div>
                      )}
                      
                      {plan.savings > 0 && (
                        <div className="absolute -top-3 -right-3">
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Save {plan.savings}%
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-3xl font-bold">
                            {plan.currentPricing.price === 0 ? 'Free' : `$${plan.currentPricing.price}`}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {plan.currentPricing.price === 0 ? '' : billingCycle === 'annual' ? '/year' : '/month'}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{plan.description}</p>
                      </div>
                      
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-200">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="text-center">
                        {subscription?.plan.id === plan.id ? (
                          <button
                            disabled
                            className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                          >
                            Current Plan
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpgrade(plan.id, billingCycle)}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {plan.currentPricing.price === 0 ? 'Downgrade to Free' : 'Upgrade Plan'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className={`rounded-lg p-6 transition-colors duration-300 ${
                theme === 'white' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'
              }`}>
                <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                }`}>Billing History</h2>
                
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className={`p-4 rounded-lg border transition-colors duration-300 ${
                      theme === 'white' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                          }`}>
                            {invoice.invoice_number || `Invoice #${invoice.id}`}
                          </p>
                          <p className={`text-sm transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {new Date(invoice.created).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                          <span className={`font-medium transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                          }`}>
                            ${(invoice.amount_paid / 100).toFixed(2)}
                          </span>
                          {invoice.invoice_pdf && (
                            <a
                              href={invoice.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payment-methods' && (
              <div className={`rounded-lg p-6 transition-colors duration-300 ${
                theme === 'white' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'
              }`}>
                <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                }`}>Payment Methods</h2>
                
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className={`p-4 rounded-lg border transition-colors duration-300 ${
                      theme === 'white' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className={`font-medium transition-colors duration-300 ${
                              theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                            }`}>
                              {method.brand?.toUpperCase()} •••• {method.last4}
                            </p>
                            <p className={`text-sm transition-colors duration-300 ${
                              theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              Expires {method.expMonth}/{method.expYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Default
                            </span>
                          )}
                          <button className="text-red-600 hover:text-red-700 text-sm">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors">
                    + Add Payment Method
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-md mx-4 transition-colors duration-300 ${
            theme === 'white' ? 'bg-white' : 'bg-slate-800'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-gray-100'
            }`}>
              Upgrade to {PRICING_PLANS[selectedPlan as keyof typeof PRICING_PLANS]?.name}
            </h3>
            
            <p className={`mb-2 transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {selectedBillingCycle === 'annual' ? 'Annual billing (save up to 17%)' : 'Monthly billing'}
            </p>
            
            <p className={`mb-6 transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              You'll be redirected to our secure payment processor to complete your subscription.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCheckout}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Payment
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
