import './globals.css'
import '../components/navbar/shiny-text.css'
import 'katex/dist/katex.min.css'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/navbar/Navbar'
import AuthProvider from '@/components/AuthProvider'
import { getServerSessionUser } from '@/lib/auth/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'open/actuaries',
  description: 'Study platform for actuarial exams',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerSessionUser()

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar key={user?.id ?? 'no-user'} user={user} />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}