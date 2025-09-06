import SaaSLandingPage from '../components/SaaSLandingPage'
import MetaDashboard from '../components/MetaDashboard'
import { DashboardThemeProvider } from '../contexts/DashboardThemeContext'
import { useState } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI-Powered Facebook Ads Analytics & Management Platform',
  description: 'Transform your Facebook advertising with Intrend\'s AI-powered analytics platform. Get comprehensive insights, creative analysis, and campaign optimization for Meta ads. Boost ROAS by up to 40% with intelligent recommendations.',
  keywords: [
    'Facebook Ads Analytics',
    'Instagram Ads Management',
    'Meta Advertising Platform',
    'AI Creative Analysis',
    'Facebook ROI Optimization',
    'Social Media Analytics',
    'Digital Marketing Tools',
    'Facebook Ads Library',
    'Campaign Performance Tracking',
    'Advertising Intelligence'
  ],
  openGraph: {
    title: 'Intrend - AI-Powered Facebook Ads Analytics & Management Platform',
    description: 'Transform your Facebook advertising with AI-powered analytics. Get comprehensive insights, creative analysis, and campaign optimization for Meta ads.',
    url: 'https://itsintrend.com',
    images: [
      {
        url: '/images/intrend-dashboard-og.png',
        width: 1200,
        height: 630,
        alt: 'Intrend Dashboard - AI-Powered Facebook Ads Analytics Platform',
      },
    ],
  },
  twitter: {
    title: 'Intrend - AI-Powered Facebook Ads Analytics Platform',
    description: 'Transform your Facebook advertising with AI-powered analytics. Boost ROAS by up to 40% with intelligent campaign optimization.',
    images: ['/images/intrend-dashboard-og.png'],
  },
  alternates: {
    canonical: 'https://itsintrend.com',
  },
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Intrend",
    "description": "AI-powered Facebook Ads analytics and management platform that helps businesses optimize their Meta advertising campaigns",
    "url": "https://itsintrend.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free trial available"
    },
    "creator": {
      "@type": "Organization",
      "name": "Intrend",
      "url": "https://itsintrend.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "6303 Owensmouth Ave",
        "addressLocality": "Los Angeles",
        "addressRegion": "CA",
        "addressCountry": "US"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-424-208-2521",
        "contactType": "customer service"
      }
    },
    "featureList": [
      "AI-powered creative analysis",
      "Facebook Ads performance tracking",
      "Multi-account management",
      "Campaign optimization recommendations",
      "Real-time analytics dashboard",
      "Meta platform integration"
    ],
    "screenshot": "https://itsintrend.com/images/intrend-dashboard-og.png"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <DashboardThemeProvider>
        <SaaSLandingPage />
      </DashboardThemeProvider>
    </>
  )
} 