import type { NextAuthConfig } from 'next-auth'
import GitHub from 'next-auth/providers/github'

// Edge-compatible configuration (no Prisma)
export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    authorized: async ({ auth }) => {
      // This is used by middleware to protect routes
      return !!auth
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig
