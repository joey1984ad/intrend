'use client'

import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';
import { PRICING_PLANS } from '@/lib/stripe';

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
}

interface Invoice {
  id: string;
  amount_paid: number;
  status: string;
  created: number;
  invoice_pdf?: string;
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);
  
  // Get theme context only after component mounts, with fallback
  let theme = 'white';
  try {
    const themeContext = useDashboardTheme();
    theme = themeContext?.theme || 'white';
  } catch (error) {
    // If theme context is not available, use default theme
    theme = 'white';
    console.log('Theme context not available, using default theme');
  }
  
  useEffect(() => {
    setMounted(true);
    
    // Debug: Log available environment variables
    console.log('Available env vars:', {
      stripeKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      nodeEnv: process.env.NODE_ENV
    });
  }, []);
  
  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Mock data - replace with real API calls
  useEffect(() => {
    // Simulate loading subscription data
    setTimeout(() => {
      setSubscription({
        id: 'sub_123',
        status: 'active',
        current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        plan: {
          id: 'price_starter',
          name: 'Starter',
          price: 0
        },
        cancel_at_period_end: false
      });
      
      setInvoices([
        {
          id: 'inv_123',
          amount_paid: 0,
          status: 'paid',
          created: Date.now() - 7 * 24 * 60 * 60 * 1000,
          invoice_pdf: 'https://example.com/invoice.pdf'
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeModal(true);
  };

  const handleCheckout = async () => {
    try {
      // Check if Stripe is configured
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey) {
        console.warn('Stripe publishable key not found');
        alert('Stripe is not configured. Please contact support.');
        return;
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
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

  const handleCustomerPortal = async () => {
    try {
      // Check if Stripe is configured
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey) {
        console.warn('Stripe publishable key not found');
        alert('Stripe is not configured. Please contact support.');
        return;
      }

      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: 'cus_123', // Replace with actual customer ID
          returnUrl: `${window.location.origin}/billing`,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to access customer portal. Please try again.');
      }
    } catch (error) {
      console.error('Customer portal error:', error);
      alert('Failed to access customer portal. Please try again.');
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
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === 'white' ? 'bg-gray-50' : 'bg-slate-900'
      }`}>
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

        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className={`space-y-1 rounded-lg p-4 transition-colors duration-300 ${
              theme === 'white' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'
            }`}>
              {[
                { id: 'overview', label: 'Overview', icon: CreditCard },
                { id: 'invoices', label: 'Invoices', icon: Download },
                { id: 'plans', label: 'Plans', icon: Calendar },
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
                              {subscription.plan.price === 0 ? 'Free' : `$${subscription.plan.price}/month`}
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
                          }`}>Subscription ID</p>
                          <p className={`font-medium transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                          }`}>{subscription.id}</p>
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
                          }`}>Invoice #{invoice.id}</p>
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
                            ${invoice.amount_paid}
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

            {activeTab === 'plans' && (
              <div className={`rounded-lg p-6 transition-colors duration-300 ${
                theme === 'white' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'
              }`}>
                <h2 className={`text-xl font-semibold mb-6 transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                }`}>Available Plans</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(PRICING_PLANS).map(([planId, plan]) => (
                    <div
                      key={planId}
                      className={`rounded-lg p-6 border transition-colors duration-300 ${
                        theme === 'white' ? 'border-gray-200 bg-white' : 'border-slate-700 bg-slate-800'
                      } ${subscription?.plan.id === plan.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="text-center mb-6">
                        <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                          theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                        }`}>{plan.name}</h3>
                        <div className="mb-4">
                          <span className={`text-3xl font-bold transition-colors duration-300 ${
                            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                          }`}>
                            {plan.price === 0 ? 'FREE' : `$${plan.price}`}
                          </span>
                          {plan.price > 0 && (
                            <span className={`text-sm transition-colors duration-300 ${
                              theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                            }`}>/month</span>
                          )}
                        </div>
                      </div>
                      
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className={`text-sm transition-colors duration-300 ${
                              theme === 'white' ? 'text-gray-600' : 'text-gray-300'
                            }`}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button
                        onClick={() => handleUpgrade(planId)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          subscription?.plan.id === plan.id
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : plan.price === 0
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        disabled={subscription?.plan.id === plan.id}
                      >
                        {subscription?.plan.id === plan.id ? 'Current Plan' : 'Choose Plan'}
                      </button>
                    </div>
                  ))}
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
            }`}>Upgrade to {PRICING_PLANS[selectedPlan as keyof typeof PRICING_PLANS]?.name}</h3>
            
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
