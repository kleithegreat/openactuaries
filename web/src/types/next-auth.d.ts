import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
} 