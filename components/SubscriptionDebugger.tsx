'use client'

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, Bug, CreditCard, User, Building2 } from 'lucide-react';

interface SubscriptionDebuggerProps {
  userEmail?: string;
  adAccounts?: any[];
  planId?: string;
  billingCycle?: string;
}

export default function SubscriptionDebugger({ 
  userEmail, 
  adAccounts = [], 
  planId = 'basic', 
  billingCycle = 'monthly' 
}: SubscriptionDebuggerProps) {
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  const [isTestingSubscription, setIsTestingSubscription] = useState(false);
  const [subscriptionResults, setSubscriptionResults] = useState<any>(null);

  const runDebugCheck = async () => {
    setIsDebugging(true);
    setDebugResults(null);

    try {
      const response = await fetch(`/api/test-subscription?userEmail=${encodeURIComponent(userEmail || 'test@example.com')}`);
      const data = await response.json();
      setDebugResults(data);
    } catch (error) {
      setDebugResults({ error: 'Failed to run debug check', details: error });
    } finally {
      setIsDebugging(false);
    }
  };

  const testSubscriptionCreation = async () => {
    setIsTestingSubscription(true);
    setSubscriptionResults(null);

    try {
      // Use sample test data if not provided
      const testAdAccounts = adAccounts.length > 0 ? adAccounts.slice(0, 1) : [
        { id: 'act_123456789', name: 'Test Ad Account' }
      ];

      const response = await fetch('/api/test-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail || 'test@example.com',
          adAccounts: testAdAccounts,
          planId,
          billingCycle
        })
      });

      const data = await response.json();
      setSubscriptionResults(data);
    } catch (error) {
      setSubscriptionResults({ error: 'Failed to test subscription', details: error });
    } finally {
      setIsTestingSubscription(false);
    }
  };

  const createTestPaymentMethod = async () => {
    try {
      const response = await fetch('/api/create-test-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail || 'test@example.com'
        })
      });

      const data = await response.json();
      alert(data.success ? 'Test payment method created!' : `Error: ${data.error}`);
      
      // Refresh debug results
      if (debugResults) {
        runDebugCheck();
      }
    } catch (error) {
      alert('Failed to create test payment method');
    }
  };

  const fixDefaultPaymentMethod = async () => {
    try {
      const response = await fetch('/api/fix-default-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail || 'test@example.com'
        })
      });

      const data = await response.json();
      alert(data.success ? `Fixed! Default payment method: ${data.paymentMethodDetails?.brand} ****${data.paymentMethodDetails?.last4}` : `Error: ${data.error}`);
      
      // Refresh debug results
      if (debugResults) {
        runDebugCheck();
      }
    } catch (error) {
      alert('Failed to fix default payment method');
    }
  };

  return (
    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Bug className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-orange-900">Subscription Debug Tools</h3>
      </div>

      <div className="space-y-4">
        {/* Debug Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">User Email:</span>
            <span className="ml-2 text-gray-600">{userEmail || 'Not provided'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Ad Accounts:</span>
            <span className="ml-2 text-gray-600">{adAccounts.length} selected</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Plan:</span>
            <span className="ml-2 text-gray-600">{planId} ({billingCycle})</span>
          </div>
        </div>

        {/* Debug Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runDebugCheck}
            disabled={isDebugging}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isDebugging ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
            <span>Check Setup</span>
          </button>

          <button
            onClick={createTestPaymentMethod}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CreditCard className="w-4 h-4" />
            <span>Add Test Payment Method</span>
          </button>

          <button
            onClick={fixDefaultPaymentMethod}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Fix Default Payment Method</span>
          </button>

          <button
            onClick={testSubscriptionCreation}
            disabled={isTestingSubscription}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isTestingSubscription ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
            <span>Test Subscription</span>
          </button>
        </div>

        {/* Debug Results */}
        {debugResults && (
          <div className="mt-4 p-4 bg-white border rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center">
              {debugResults.error ? (
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              )}
              Setup Check Results
            </h4>
            
            <div className="space-y-2 text-sm">
              {debugResults.user ? (
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>User found: {debugResults.user.email} (ID: {debugResults.user.id})</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <span>User not found</span>
                </div>
              )}

              {debugResults.stripeCustomer ? (
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Stripe customer: {debugResults.stripeCustomer.id}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                  <span>No Stripe customer (will be created)</span>
                </div>
              )}

              {debugResults.plans && (
                <div>
                  <div className="font-medium">Plans Configuration:</div>
                  <div className="ml-4 space-y-1">
                    {Object.entries(debugResults.plans).map(([key, plan]: [string, any]) => (
                      <div key={key} className="flex items-center">
                        {plan?.stripePriceId ? (
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-red-500 mr-2" />
                        )}
                        <span>{key}: {plan?.stripePriceId || 'Missing Price ID'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {debugResults.error && (
                <div className="text-red-600 bg-red-50 p-2 rounded">
                  <strong>Error:</strong> {debugResults.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription Test Results */}
        {subscriptionResults && (
          <div className="mt-4 p-4 bg-white border rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center">
              {subscriptionResults.success ? (
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              )}
              Subscription Test Results
            </h4>
            
            <div className="text-sm">
              <div className="mb-2">
                <span className="font-medium">Status:</span> {subscriptionResults.status}
              </div>
              
              {subscriptionResults.testData && (
                <div className="mb-2">
                  <span className="font-medium">Test Data:</span>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(subscriptionResults.testData, null, 2)}
                  </pre>
                </div>
              )}

              {subscriptionResults.result && (
                <div>
                  <span className="font-medium">API Response:</span>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto max-h-40">
                    {JSON.stringify(subscriptionResults.result, null, 2)}
                  </pre>
                </div>
              )}

              {subscriptionResults.error && (
                <div className="text-red-600 bg-red-50 p-2 rounded">
                  <strong>Error:</strong> {subscriptionResults.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Common Issues Help */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <h5 className="font-semibold text-blue-900 mb-2">Common Issues:</h5>
          <ul className="space-y-1 text-blue-800">
            <li>• <strong>No payment method:</strong> Use "Add Test Payment Method" button</li>
            <li>• <strong>Payment methods exist but no default:</strong> Use "Fix Default Payment Method" button</li>
            <li>• <strong>Missing Stripe Price IDs:</strong> Check environment variables</li>
            <li>• <strong>User not found:</strong> Make sure you're logged in</li>
            <li>• <strong>Stripe customer missing:</strong> Will be created automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
