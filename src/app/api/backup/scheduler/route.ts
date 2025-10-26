/**
 * Backup Scheduler Control API
 *
 * This endpoint allows starting/stopping the background scheduler
 * and checking its status.
 */

import { NextResponse } from 'next/server'
import { startScheduler, stopScheduler, isSchedulerRunning } from '@/lib/backup-scheduler'

/**
 * GET /api/backup/scheduler
 * Get scheduler status
 */
export async function GET() {
  try {
    const isRunning = isSchedulerRunning()

    return NextResponse.json({
      success: true,
      isRunning,
      message: isRunning ? 'Scheduler is running' : 'Scheduler is stopped',
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
 * POST /api/backup/scheduler
 * Start or stop the scheduler
 *
 * Body: { action: 'start' | 'stop' }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'start') {
      startScheduler()
      return NextResponse.json({
        success: true,
        message: 'Scheduler started',
        isRunning: true,
      })
    } else if (action === 'stop') {
      stopScheduler()
      return NextResponse.json({
        success: true,
        message: 'Scheduler stopped',
        isRunning: false,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Use "start" or "stop"',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to control scheduler:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
