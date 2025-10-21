import { type UserRole } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: UserRole
    id?: string
  }

  interface Session {
    user: {
      id?: string
      role?: UserRole
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
}
