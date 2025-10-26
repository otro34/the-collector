/**
 * Scheduled Backup API Endpoint
 *
 * This endpoint can be called by:
 * - Vercel Cron Jobs
 * - External cron services
 * - Manual triggers
 *
 * It checks if a backup should run based on settings and executes it if needed.
 */

import { NextResponse } from 'next/server'
import { runScheduledBackup, getLogs } from '@/lib/backup-scheduler'

/**
 * GET /api/backup/scheduled
 * Returns scheduler status and recent logs
 */
export async function GET() {
  try {
    const logs = getLogs()

    return NextResponse.json({
      success: true,
      logs,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to get scheduler status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/backup/scheduled
 * Trigger a scheduled backup check
 *
 * This endpoint can be called by Vercel Cron or other services.
 * It will check if a backup should run and execute it if needed.
 */
export async function POST() {
  try {
    // Run the scheduled backup check
    await runScheduledBackup()

    // Get updated logs
    const logs = getLogs().slice(0, 10) // Return last 10 logs

    return NextResponse.json({
      success: true,
      message: 'Scheduled backup check completed',
      logs,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Scheduled backup failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
