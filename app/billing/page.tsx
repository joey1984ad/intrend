import React from 'react';
import EnhancedBillingPage from '@/components/EnhancedBillingPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing & Subscription Management',
  description: 'Manage your Intrend subscription and billing. Upgrade your plan to unlock advanced Facebook ads analytics features and AI-powered creative analysis.',
  keywords: [
    'Facebook Ads Subscription',
    'Meta Analytics Billing',
    'Facebook ROI Tool Pricing',
    'Social Media Analytics Plans',
    'Digital Marketing Platform Subscription',
    'Facebook Ads Management Pricing',
    'Meta Advertising Tool Billing'
  ],
  openGraph: {
    title: 'Intrend Billing & Subscription Management',
    description: 'Manage your subscription and unlock advanced Facebook ads analytics features with AI-powered creative analysis.',
    url: 'https://itsintrend.com/billing',
    images: [
      {
        url: '/og-billing.png',
        width: 1200,
        height: 630,
        alt: 'Intrend Billing & Subscription Management',
      },
    ],
  },
  twitter: {
    title: 'Intrend Billing & Subscription Management',
    description: 'Manage your subscription and unlock advanced Facebook ads analytics features with AI-powered creative analysis.',
    images: ['/og-billing.png'],
  },
  alternates: {
    canonical: 'https://itsintrend.com/billing',
  },
  robots: {
    index: false, // Billing page should not be indexed
    follow: false,
  },
}

export default function BillingPage() {
  return <EnhancedBillingPage />;
}
