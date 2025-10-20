'use client'

import { CheckCircle2, XCircle, Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ImportError {
  row: number
  field?: string
  message: string
  value?: unknown
}

interface ImportSummaryProps {
  imported: number
  failed: number
  errors: ImportError[]
  duration: number
  onDownloadErrors?: () => void
  onFinish: () => void
}

export function ImportSummary({
  imported,
  failed,
  errors,
  duration,
  onDownloadErrors,
  onFinish,
}: ImportSummaryProps) {
  const total = imported + failed
  const successRate = total > 0 ? ((imported / total) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        {failed === 0 ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Import Complete!</h2>
              <p className="text-muted-foreground mt-1">
                All {imported} items were successfully imported
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Import Completed with Errors</h2>
              <p className="text-muted-foreground mt-1">
                {imported} items imported successfully, {failed} failed
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Success Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Imported Successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-3xl font-bold">{imported}</div>
                <div className="text-sm text-muted-foreground">items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Failed Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Failed to Import</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-3xl font-bold">{failed}</div>
                <div className="text-sm text-muted-foreground">items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duration Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Import Duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <span className="text-lg">⏱️</span>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`}
                </div>
                <div className="text-sm text-muted-foreground">time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Import Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{successRate}%</span>
              <Badge variant={failed === 0 ? 'default' : 'secondary'}>
                {imported}/{total} successful
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  failed === 0 ? 'bg-green-600' : 'bg-amber-500'
                }`}
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors List */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Import Errors ({errors.length})
                </CardTitle>
                <CardDescription className="mt-1">
                  Review the errors below and fix them in your CSV file
                </CardDescription>
              </div>
              {onDownloadErrors && (
                <Button variant="outline" size="sm" onClick={onDownloadErrors}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Row</th>
                    <th className="px-4 py-3 text-left font-medium">Field</th>
                    <th className="px-4 py-3 text-left font-medium">Error</th>
                    <th className="px-4 py-3 text-left font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((error, index) => (
                    <tr key={index} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <Badge variant="outline">{error.row}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {error.field || 'N/A'}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-destructive">{error.message}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                        {error.value !== null && error.value !== undefined
                          ? String(error.value)
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button onClick={onFinish} size="lg">
          {failed > 0 ? 'Import More Data' : 'Done'}
        </Button>
      </div>
    </div>
  )
}
