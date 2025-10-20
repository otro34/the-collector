'use client'

import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ImportProgressProps {
  current: number
  total: number
  status: string
}

export function ImportProgress({ current, total, status }: ImportProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Importing Data...
        </CardTitle>
        <CardDescription>Please wait while we import your data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {current} / {total} items
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="text-center text-sm font-medium">{progress.toFixed(0)}%</div>
        </div>

        {/* Status Message */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{status}</p>
        </div>

        {/* Tips */}
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            This may take a few moments depending on the size of your file.
            <br />
            Please don't close this page.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
