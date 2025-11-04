import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')

  // Allow access to auth pages without authentication
  if (isAuthPage) {
    return NextResponse.next()
  }

  // Redirect to sign in if not authenticated
  if (!isLoggedIn) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

// Protect all routes except public ones
export const config = {
  matcher: [
    '/((?!api/auth|api/recommendations|api/reading-progress|_next/static|_next/image|favicon.ico).*)',
  ],
}
