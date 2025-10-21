import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string } }) {
  const error = searchParams.error

  const getErrorMessage = () => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message:
            'You are not authorized to access this application. Please contact an administrator to request access.',
        }
      case 'Configuration':
        return {
          title: 'Configuration Error',
          message:
            'There is a problem with the authentication configuration. Please contact an administrator.',
        }
      default:
        return {
          title: 'Authentication Error',
          message: 'An error occurred during authentication. Please try again.',
        }
    }
  }

  const { title, message } = getErrorMessage()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md space-y-6 p-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
