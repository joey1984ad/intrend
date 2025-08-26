import MetaDashboard from '../../components/MetaDashboard'
import { DashboardThemeProvider } from '../../contexts/DashboardThemeContext'

export default function DashboardPage() {
  return (
    <DashboardThemeProvider>
      <MetaDashboard />
    </DashboardThemeProvider>
  )
}
