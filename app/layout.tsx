import './globals.css'
import type { Metadata } from 'next'
import { DashboardThemeProvider } from '@/contexts/DashboardThemeContext'
import { UserProvider } from '@/contexts/UserContext'

export const metadata: Metadata = {
  title: 'Facebook Ads Dashboard - Intrend',
  description: 'Comprehensive analytics and management for your Facebook advertising campaigns',
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