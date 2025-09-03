'use client'

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, CreditCard, Calendar } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface SubscriptionStatusProps {
  className?: string;
  showDetails?: boolean;
}

export default function SubscriptionStatus({ className = '', showDetails = true }: SubscriptionStatusProps) {
  const { user } = useUser();

  if (!user) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500">Please log in to view subscription status</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'past_due':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'trialing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'incomplete':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'incomplete_expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      case 'incomplete':
        return 'text-orange-600 bg-orange-100';
      case 'incomplete_expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'canceled':
        return 'Canceled';
      case 'past_due':
        return 'Past Due';
      case 'trialing':
        return 'Trial';
      case 'incomplete':
        return 'Incomplete';
      case 'incomplete_expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const currentPlan = user.currentPlanName || 'Free';
  const currentPlanId = user.currentPlanId || 'free';
  const subscriptionStatus = user.subscriptionStatus || 'active';
  const billingCycle = user.currentBillingCycle || 'monthly';

  return (
    <div className={`p-6 bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
            <p className="text-sm text-gray-500">Subscription Status</p>
          </div>
        </div>
        {getStatusIcon(subscriptionStatus)}
      </div>

      <div className="space-y-4">
        {/* Plan Information */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">{currentPlan} Plan</p>
              <p className="text-sm text-gray-500">
                {currentPlanId === 'free' ? 'No cost' : `${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}ly billing`}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscriptionStatus)}`}>
            {getStatusText(subscriptionStatus)}
          </span>
        </div>

        {showDetails && (
          <>
            {/* Billing Cycle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Billing Cycle</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}
              </span>
            </div>

            {/* Plan ID */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-sm text-gray-600">Plan ID</span>
              </div>
              <span className="text-sm font-mono text-gray-900">{currentPlanId}</span>
            </div>
          </>
        )}

        {/* Status Summary */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {getStatusIcon(subscriptionStatus)}
            <div>
              <p className="text-sm font-medium text-blue-900">
                {subscriptionStatus === 'active' && 'Your subscription is active and working properly'}
                {subscriptionStatus === 'trialing' && 'You are currently in a trial period'}
                {subscriptionStatus === 'past_due' && 'Payment is overdue - please update your payment method'}
                {subscriptionStatus === 'canceled' && 'Your subscription has been canceled'}
                {subscriptionStatus === 'incomplete' && 'Payment setup is incomplete'}
                {subscriptionStatus === 'incomplete_expired' && 'Payment setup has expired'}
                {!['active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired'].includes(subscriptionStatus) && 
                  'Subscription status is unknown'}
              </p>
              {subscriptionStatus === 'active' && (
                <p className="text-xs text-blue-700 mt-1">
                  You have access to all {currentPlan} plan features
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
