import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agency Dashboard - Meta Ads',
  description: 'Digital marketing dashboard for agency clients',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 