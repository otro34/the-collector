'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>
}

interface ErrorBoundaryFallbackProps {
  error: Error
  resetError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child component tree.
 * Displays a fallback UI with error details and recovery options.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error)
    console.error('Error Info:', errorInfo)

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo)
      this.logError(error, errorInfo)
    }
  }

  logError(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with timestamp and component stack
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
    }

    console.error('[Error Boundary Log]', JSON.stringify(errorLog, null, 2))
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

/**
 * Default error fallback component with a friendly error message and recovery options
 */
function DefaultErrorFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
              <CardDescription className="mt-1">
                We encountered an unexpected error. Don&apos;t worry, your data is safe.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
            <h3 className="mb-2 font-semibold text-red-900 dark:text-red-200">Error Details</h3>
            <p className="text-sm text-red-800 dark:text-red-300">
              {error.message || 'An unknown error occurred'}
            </p>
          </div>

          {isDevelopment && error.stack && (
            <details className="rounded-lg border bg-muted p-4">
              <summary className="cursor-pointer font-medium text-sm">
                Stack Trace (Development Only)
              </summary>
              <pre className="mt-3 overflow-auto text-xs">
                <code>{error.stack}</code>
              </pre>
            </details>
          )}

          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium text-sm">What you can do:</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Try refreshing the page using the button below</li>
              <li>Go back to the home page and try again</li>
              <li>If the problem persists, try clearing your browser cache</li>
              <li>Check your internet connection</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button onClick={resetError} className="w-full sm:w-auto" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

/**
 * Hook to use error boundary in functional components
 * Throws an error that will be caught by the nearest error boundary
 */
export function useErrorBoundary() {
  const [, setError] = React.useState()

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}
