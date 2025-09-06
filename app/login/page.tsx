import LoginPage from '../../components/LoginPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Access Your Facebook Ads Dashboard',
  description: 'Login to your Intrend account and access your AI-powered Facebook ads analytics dashboard. Manage campaigns, analyze performance, and optimize your Meta advertising.',
  keywords: [
    'Facebook Ads Login',
    'Meta Analytics Login',
    'Facebook Dashboard Access',
    'Social Media Analytics Login',
    'Digital Marketing Platform Login',
    'Facebook ROI Dashboard',
    'Meta Advertising Login'
  ],
  openGraph: {
    title: 'Login to Intrend - Facebook Ads Analytics Dashboard',
    description: 'Access your AI-powered Facebook ads analytics dashboard. Manage campaigns and optimize your Meta advertising performance.',
    url: 'https://itsintrend.com/login',
  },
  twitter: {
    title: 'Login to Intrend - Facebook Ads Analytics Dashboard',
    description: 'Access your AI-powered Facebook ads analytics dashboard. Manage campaigns and optimize your Meta advertising performance.',
  },
  alternates: {
    canonical: 'https://itsintrend.com/login',
  },
}

export default function LoginPageRoute() {
  return <LoginPage />
}
