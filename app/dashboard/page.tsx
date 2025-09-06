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
  },
  twitter: {
    title: 'Intrend Dashboard - Facebook Ads Analytics & Management',
    description: 'Monitor campaign performance, analyze creative assets, and optimize your Meta advertising with AI-powered insights.',
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
