import MetaDashboard from '../../components/MetaDashboard'
import { DashboardThemeProvider } from '../../contexts/DashboardThemeContext'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Facebook Ads Analytics & Management',
  description: 'Access your comprehensive Facebook ads analytics dashboard. Monitor campaign performance, analyze creative assets, and optimize your Meta advertising with AI-powered insights.',
  keywords: [
    'Facebook Ads Dashboard',
    'Meta Analytics Dashboard',
    'Facebook Campaign Management',
    'Social Media Analytics Dashboard',
    'Facebook ROI Tracking',
    'Meta Advertising Dashboard',
    'Facebook Performance Analytics'
  ],
  openGraph: {
    title: 'Intrend Dashboard - Facebook Ads Analytics & Management',
    description: 'Monitor campaign performance, analyze creative assets, and optimize your Meta advertising with AI-powered insights.',
    url: 'https://itsintrend.com/dashboard',
    images: [
      {
        url: '/og-dashboard.png',
        width: 1200,
        height: 630,
        alt: 'Intrend Dashboard - Facebook Ads Analytics & Management',
      },
    ],
  },
  twitter: {
    title: 'Intrend Dashboard - Facebook Ads Analytics & Management',
    description: 'Monitor campaign performance, analyze creative assets, and optimize your Meta advertising with AI-powered insights.',
    images: ['/og-dashboard.png'],
  },
  alternates: {
    canonical: 'https://itsintrend.com/dashboard',
  },
  robots: {
    index: false, // Dashboard should not be indexed
    follow: false,
  },
}

export default function DashboardPage() {
  return (
    <DashboardThemeProvider>
      <MetaDashboard />
    </DashboardThemeProvider>
  )
}
