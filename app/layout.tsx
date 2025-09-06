import './globals.css'
import type { Metadata } from 'next'
import { DashboardThemeProvider } from '@/contexts/DashboardThemeContext'
import { UserProvider } from '@/contexts/UserContext'

export const metadata: Metadata = {
  title: {
    default: 'Intrend - AI-Powered Facebook Ads Analytics & Management Platform',
    template: '%s | Intrend'
  },
  description: 'Transform your Facebook advertising with Intrend\'s AI-powered analytics platform. Get comprehensive insights, creative analysis, and campaign optimization for Meta ads. Boost ROAS by up to 40% with intelligent recommendations.',
  keywords: [
    'Facebook Ads',
    'Instagram Ads', 
    'Meta Advertising',
    'Facebook Analytics',
    'Ad Campaign Management',
    'AI Creative Analysis',
    'Facebook Ads Library',
    'Social Media Advertising',
    'Digital Marketing Analytics',
    'Facebook ROI Optimization'
  ],
  authors: [{ name: 'Intrend Team' }],
  creator: 'Intrend',
  publisher: 'Intrend',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://itsintrend.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://itsintrend.com',
    siteName: 'Intrend',
    title: 'Intrend - AI-Powered Facebook Ads Analytics & Management Platform',
    description: 'Transform your Facebook advertising with Intrend\'s AI-powered analytics platform. Get comprehensive insights, creative analysis, and campaign optimization for Meta ads.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Intrend - AI-Powered Facebook Ads Analytics Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@intrend',
    creator: '@intrend',
    title: 'Intrend - AI-Powered Facebook Ads Analytics & Management Platform',
    description: 'Transform your Facebook advertising with AI-powered analytics. Boost ROAS by up to 40% with intelligent campaign optimization.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-verification-code-needed',
    yandex: 'yandex-verification-code-needed',
    yahoo: 'yahoo-verification-code-needed',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          <DashboardThemeProvider>
            {children}
          </DashboardThemeProvider>
        </UserProvider>
      </body>
    </html>
  )
} 