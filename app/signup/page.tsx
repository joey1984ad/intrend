import { Suspense } from 'react'
import SignupPage from '../../components/SignupPage'

export default function SignupPageRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPage />
    </Suspense>
  )
}
