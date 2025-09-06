import { Suspense } from 'react'
import SignupPage from '../../components/SignupPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - Start Your Free Trial',
  description: 'Join Intrend and transform your Facebook advertising with AI-powered analytics. Start your free trial today and boost your ROAS by up to 40% with intelligent campaign optimization.',
  keywords: [
    'Facebook Ads Signup',
    'Free Trial Facebook Analytics',
    'Meta Advertising Platform Signup',
    'AI Creative Analysis Trial',
    'Facebook ROI Optimization Tool',
    'Social Media Analytics Signup',
    'Digital Marketing Platform Trial'
  ],
  openGraph: {
    title: 'Sign Up for Intrend - AI-Powered Facebook Ads Analytics',
    description: 'Join thousands of agencies using Intrend to optimize their Meta Ads performance. Start your free trial today.',
    url: 'https://itsintrend.com/signup',
  },
  twitter: {
    title: 'Sign Up for Intrend - AI-Powered Facebook Ads Analytics',
    description: 'Join thousands of agencies using Intrend to optimize their Meta Ads performance. Start your free trial today.',
  },
  alternates: {
    canonical: 'https://itsintrend.com/signup',
  },
}

export default function SignupPageRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPage />
    </Suspense>
  )
}
