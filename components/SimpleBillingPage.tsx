'use client'

import React from 'react';

export default function SimpleBillingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Billing & Subscription
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
          <p className="text-gray-600">Starter Plan (Free)</p>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Available Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">Starter</h4>
                <p className="text-2xl font-bold">$0</p>
                <p className="text-sm text-gray-500">Free forever</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">Professional</h4>
                <p className="text-2xl font-bold">$29</p>
                <p className="text-sm text-gray-500">Per month</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">Enterprise</h4>
                <p className="text-2xl font-bold">$99</p>
                <p className="text-sm text-gray-500">Per month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
