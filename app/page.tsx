import SaaSLandingPage from '../components/SaaSLandingPage'
import MetaDashboard from '../components/MetaDashboard'
import { DashboardThemeProvider } from '../contexts/DashboardThemeContext'
import { useState } from 'react'

export default function Home() {
  return (
    <DashboardThemeProvider>
      <SaaSLandingPage />
    </DashboardThemeProvider>
  )
} 