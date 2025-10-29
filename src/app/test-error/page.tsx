'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

/**
 * Test page for error boundary functionality
 * This page should be removed before production deployment
 */
export default function TestErrorPage() {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error('This is a test error thrown intentionally to test the Error Boundary!')
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Error Boundary Test Page</CardTitle>
          <CardDescription>
            This page is for testing the error boundary component. Click the button below to trigger
            an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/10">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Warning:</strong> This page is for development testing only and should be
              removed before production deployment.
            </p>
          </div>

          <Button
            onClick={() => setShouldThrow(true)}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            Trigger Test Error
          </Button>

          <div className="rounded-lg bg-muted p-4">
            <h3 className="mb-2 font-medium text-sm">What will happen:</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>An error will be thrown in this component</li>
              <li>The error boundary will catch it</li>
              <li>A friendly error UI will be displayed</li>
              <li>Error details will be logged to the console</li>
              <li>You&apos;ll be able to reset and try again</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
