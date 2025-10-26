'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RefreshCw, Play, Square, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface BackupLog {
  timestamp: string
  type: 'success' | 'error' | 'info'
  message: string
  details?: unknown
}

export default function BackupLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<BackupLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [schedulerRunning, setSchedulerRunning] = useState(false)
  const [isTogglingScheduler, setIsTogglingScheduler] = useState(false)

  async function loadLogs() {
    try {
      const response = await fetch('/api/backup/scheduled')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
      toast.error('Failed to load logs')
    }
  }

  async function checkSchedulerStatus() {
    try {
      const response = await fetch('/api/backup/scheduler')
      if (response.ok) {
        const data = await response.json()
        setSchedulerRunning(data.isRunning)
      }
    } catch (error) {
      console.error('Failed to check scheduler status:', error)
    }
  }

  async function refreshLogs() {
    setIsRefreshing(true)
    await loadLogs()
    await checkSchedulerStatus()
    setIsRefreshing(false)
  }

  async function toggleScheduler() {
    setIsTogglingScheduler(true)
    try {
      const action = schedulerRunning ? 'stop' : 'start'
      const response = await fetch('/api/backup/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const data = await response.json()
        setSchedulerRunning(data.isRunning)
        toast.success(data.message)
      } else {
        toast.error('Failed to toggle scheduler')
      }
    } catch (error) {
      console.error('Failed to toggle scheduler:', error)
      toast.error('Failed to toggle scheduler')
    } finally {
      setIsTogglingScheduler(false)
    }
  }

  useEffect(() => {
    async function initialize() {
      await loadLogs()
      await checkSchedulerStatus()
      setIsLoading(false)
    }
    initialize()
  }, [])

  const getLogBadgeVariant = (type: BackupLog['type']) => {
    switch (type) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'info':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/settings/backup')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Backup Settings
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Backup Scheduler Logs</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              View automatic backup activity and manage the scheduler
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshLogs} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant={schedulerRunning ? 'destructive' : 'default'}
              onClick={toggleScheduler}
              disabled={isTogglingScheduler}
            >
              {isTogglingScheduler ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : schedulerRunning ? (
                <Square className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {schedulerRunning ? 'Stop Scheduler' : 'Start Scheduler'}
            </Button>
          </div>
        </div>
      </div>

      {/* Scheduler Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Scheduler Status
            <Badge variant={schedulerRunning ? 'default' : 'secondary'}>
              {schedulerRunning ? 'Running' : 'Stopped'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {schedulerRunning
              ? 'The backup scheduler is running and checking for scheduled backups every hour'
              : 'The backup scheduler is currently stopped. Automatic backups will not run.'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Logs Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last {logs.length} log entries</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <p>No logs available yet</p>
              <p className="text-sm mt-2">Logs will appear here when the scheduler runs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getLogBadgeVariant(log.type)}>
                          {log.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{log.message}</p>
                      {log.details !== undefined && (
                        <pre className="text-xs text-slate-600 dark:text-slate-400 mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded overflow-x-auto">
                          {typeof log.details === 'string'
                            ? log.details
                            : JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
          <p>
            <strong>Scheduler:</strong> The backup scheduler checks every hour if a backup should be
            created based on your backup frequency settings (daily, weekly, or monthly).
          </p>
          <p>
            <strong>Automatic Cleanup:</strong> Old backups are automatically deleted based on your
            backup retention setting to free up disk space.
          </p>
          <p>
            <strong>Cloud Upload:</strong> If cloud storage is enabled, backups are automatically
            uploaded to your configured cloud provider after creation.
          </p>
          <p>
            <strong>Vercel Cron:</strong> When deployed on Vercel, the scheduler runs via Vercel
            Cron Jobs. Locally, you can start/stop the scheduler manually using the button above.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
