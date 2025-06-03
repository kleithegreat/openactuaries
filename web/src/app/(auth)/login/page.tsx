import LandingPage from "../../page"
import LoginDialog from '@/components/auth/LoginDialog'

export default async function LoginPage() {
  return (
    <>
      {/* Landing page as background */}
      <LandingPage />
      <LoginDialog />
    </>
  )
}
