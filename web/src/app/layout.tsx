import './globals.css'
import '../components/navbar/shiny-text.css'
import 'katex/dist/katex.min.css'
import { Inter } from 'next/font/google'
import { IBM_Plex_Serif, IBM_Plex_Sans } from 'next/font/google'
import { Navbar } from '@/components/navbar/Navbar'
import AuthProvider from '@/components/AuthProvider'
import { getServerSessionUser } from '@/lib/auth/server'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const ibmPlexSerif = IBM_Plex_Serif({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
})
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
})

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
      <body className={`${inter.variable} ${ibmPlexSerif.variable} ${ibmPlexSans.variable} font-sans bg-background text-foreground`}>
        <AuthProvider>
          <Navbar key={user?.id ?? 'no-user'} user={user} />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}