import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/login',
    }
  }
)

export const config = {
  matcher: [
    '/home/:path*',
    '/setup/:path*',
    '/analytics/:path*',
    '/guided-practice/:path*',
    '/questions/:path*',
  ]
} 