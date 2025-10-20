import { redirect } from 'next/navigation'
import { auth, signIn } from '@/auth'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  const session = await auth()

  // If already logged in, redirect to callback URL or home
  if (session) {
    redirect(searchParams.callbackUrl || '/')
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to The Collector</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in with your GitHub account to access your collections
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <form
            action={async () => {
              'use server'
              await signIn('github', {
                redirectTo: searchParams.callbackUrl || '/',
              })
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              <Github className="mr-2 h-5 w-5" />
              Sign in with GitHub
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  )
}
