import NextAuth from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authConfig } from './auth.config'
import type { NextAuthConfig } from 'next-auth'

const prisma = new PrismaClient()

// Extend the edge-compatible config with Prisma operations for Node.js runtime
const config: NextAuthConfig = {
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, profile }) {
      // Check if user is authorized
      if (!user.email) {
        return false
      }

      try {
        // Check if there are any users in the database
        const userCount = await prisma.user.count()

        // If no users exist, make the first user an admin
        if (userCount === 0) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || undefined,
              image: user.image || undefined,
              githubUsername: (profile?.login as string) || undefined,
              role: 'ADMIN',
              isActive: true,
              lastLoginAt: new Date(),
            },
          })
          return true
        }

        // Check if user is in the allowlist
        const authorizedUser = await prisma.user.findFirst({
          where: {
            OR: [{ email: user.email }, { githubUsername: (profile?.login as string) || '' }],
            isActive: true,
          },
        })

        if (!authorizedUser) {
          // User not in allowlist
          return false
        }

        // Update last login and sync profile data
        await prisma.user.update({
          where: { id: authorizedUser.id },
          data: {
            lastLoginAt: new Date(),
            name: user.name || authorizedUser.name,
            image: user.image || authorizedUser.image,
            githubUsername: (profile?.login as string) || authorizedUser.githubUsername,
          },
        })

        return true
      } catch (error) {
        console.error('Error during sign in:', error)
        return false
      }
    },
    async session({ session }) {
      // Add user role to session
      if (session.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true, id: true },
        })

        if (user) {
          session.user.role = user.role
          session.user.id = user.id
        }
      }

      return session
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
