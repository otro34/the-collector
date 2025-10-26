/**
 * Backup Scheduler Service
 *
 * Manages automatic backup scheduling using node-cron.
 * This service:
 * - Runs scheduled backups based on user settings (daily, weekly, monthly)
 * - Cleans up old backups based on retention policy
 * - Logs backup operations
 * - Sends optional email notifications
 */

import * as cron from 'node-cron'
import { prisma } from '@/lib/db'
import { promises as fs } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface BackupSettings {
  automaticBackups: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  backupRetention: number
  cloudStorageEnabled: boolean
  cloudProvider: 'none' | 's3' | 'r2' | 'dropbox'
  // Cloud credentials (optional)
  s3Bucket?: string
  s3Region?: string
  s3AccessKeyId?: string
  s3SecretAccessKey?: string
  r2AccountId?: string
  r2AccessKeyId?: string
  r2SecretAccessKey?: string
  dropboxAccessToken?: string
}

interface BackupLog {
  timestamp: string
  type: 'success' | 'error' | 'info'
  message: string
  details?: unknown
}

// In-memory log storage (last 100 logs)
const logs: BackupLog[] = []
const MAX_LOGS = 100

/**
 * Add a log entry
 */
export function addLog(type: BackupLog['type'], message: string, details?: unknown) {
  const log: BackupLog = {
    timestamp: new Date().toISOString(),
    type,
    message,
    details,
  }

  logs.unshift(log)

  // Keep only the last MAX_LOGS entries
  if (logs.length > MAX_LOGS) {
    logs.pop()
  }

  // Also log to console
  // eslint-disable-next-line no-console
  const logFn = type === 'error' ? console.error : type === 'info' ? console.info : console.log
  logFn(`[Backup Scheduler ${type.toUpperCase()}]`, message, details || '')
}

/**
 * Get all logs
 */
export function getLogs(): BackupLog[] {
  return [...logs]
}

/**
 * Get the most recent backup date
 */
async function getLastBackupDate(): Promise<Date | null> {
  const lastBackup = await prisma.backup.findFirst({
    where: { type: 'scheduled' },
    orderBy: { createdAt: 'desc' },
  })

  return lastBackup?.createdAt || null
}

/**
 * Check if a backup should run based on frequency and last backup date
 */
export function shouldRunBackup(
  frequency: 'daily' | 'weekly' | 'monthly',
  lastBackupDate: Date | null
): boolean {
  if (!lastBackupDate) {
    // No previous backup, should run
    return true
  }

  const now = new Date()
  const timeDiff = now.getTime() - lastBackupDate.getTime()
  const hoursDiff = timeDiff / (1000 * 60 * 60)
  const daysDiff = hoursDiff / 24

  switch (frequency) {
    case 'daily':
      // Run if more than 23 hours since last backup
      return hoursDiff >= 23
    case 'weekly':
      // Run if more than 6.5 days since last backup
      return daysDiff >= 6.5
    case 'monthly':
      // Run if more than 29 days since last backup
      return daysDiff >= 29
    default:
      return false
  }
}

/**
 * Create a database backup
 */
async function createBackup(): Promise<{
  success: boolean
  filename?: string
  size?: number
  error?: string
}> {
  try {
    const backupsDir = path.join(process.cwd(), 'backups')

    // Ensure backups directory exists
    await fs.mkdir(backupsDir, { recursive: true })

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `backup-${timestamp}.sql`
    const filePath = path.join(backupsDir, filename)

    // Get database URL from environment
    const databaseUrl = process.env.POSTGRES_URL
    if (!databaseUrl) {
      throw new Error('POSTGRES_URL environment variable not set')
    }

    // Run pg_dump to create backup
    await execAsync(`pg_dump "${databaseUrl}" > "${filePath}"`, {
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    })

    // Get file size
    const stats = await fs.stat(filePath)
    const size = stats.size

    // Get item count
    const itemCount = await prisma.item.count()

    // Save backup record to database
    await prisma.backup.create({
      data: {
        filename,
        size,
        itemCount,
        location: filePath,
        type: 'scheduled',
      },
    })

    return { success: true, filename, size }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

/**
 * Clean up old backups based on retention policy
 */
async function cleanupOldBackups(
  retention: number
): Promise<{ deleted: number; errors: string[] }> {
  try {
    // Get all backups sorted by creation date (newest first)
    const allBackups = await prisma.backup.findMany({
      where: { type: 'scheduled' },
      orderBy: { createdAt: 'desc' },
    })

    // Keep only the newest 'retention' backups
    const backupsToDelete = allBackups.slice(retention)

    if (backupsToDelete.length === 0) {
      return { deleted: 0, errors: [] }
    }

    addLog('info', `Cleaning up ${backupsToDelete.length} old backup(s)`)

    const errors: string[] = []
    let deleted = 0

    for (const backup of backupsToDelete) {
      try {
        // Delete file if it exists
        const filePath = backup.location
        try {
          await fs.unlink(filePath)
        } catch (fileError) {
          // File might not exist, log but continue
          errors.push(`Failed to delete file ${filePath}: ${fileError}`)
        }

        // Delete database record
        await prisma.backup.delete({
          where: { id: backup.id },
        })

        deleted++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Failed to delete backup ${backup.filename}: ${errorMessage}`)
      }
    }

    return { deleted, errors }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { deleted: 0, errors: [errorMessage] }
  }
}

/**
 * Upload backup to cloud storage
 */
async function uploadToCloud(
  filename: string,
  filePath: string,
  settings: BackupSettings
): Promise<{ success: boolean; error?: string }> {
  if (!settings.cloudStorageEnabled || settings.cloudProvider === 'none') {
    return { success: true }
  }

  try {
    // Import cloud storage utility
    const { uploadToS3, uploadToR2, uploadToDropbox } = await import('@/lib/cloud-storage')

    let uploadResult

    switch (settings.cloudProvider) {
      case 's3':
        if (
          !settings.s3Bucket ||
          !settings.s3Region ||
          !settings.s3AccessKeyId ||
          !settings.s3SecretAccessKey
        ) {
          throw new Error('S3 credentials not configured')
        }
        uploadResult = await uploadToS3(filePath, filename, {
          bucket: settings.s3Bucket,
          region: settings.s3Region,
          accessKeyId: settings.s3AccessKeyId,
          secretAccessKey: settings.s3SecretAccessKey,
        })
        break
      case 'r2':
        if (!settings.r2AccountId || !settings.r2AccessKeyId || !settings.r2SecretAccessKey) {
          throw new Error('R2 credentials not configured')
        }
        uploadResult = await uploadToR2(filePath, filename, {
          accountId: settings.r2AccountId,
          accessKeyId: settings.r2AccessKeyId,
          secretAccessKey: settings.r2SecretAccessKey,
        })
        break
      case 'dropbox':
        if (!settings.dropboxAccessToken) {
          throw new Error('Dropbox access token not configured')
        }
        uploadResult = await uploadToDropbox(filePath, filename, {
          accessToken: settings.dropboxAccessToken,
        })
        break
      default:
        return { success: true }
    }

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed')
    }

    // Update backup record with cloud URL
    if (uploadResult.url) {
      await prisma.backup.updateMany({
        where: { filename },
        data: { location: uploadResult.url },
      })
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

/**
 * Send email notification (basic implementation)
 */
async function sendEmailNotification(
  success: boolean,
  filename?: string,
  error?: string
): Promise<void> {
  // Basic email notification - can be expanded later with nodemailer
  const subject = success ? 'Backup Completed Successfully' : 'Backup Failed'
  const message = success
    ? `Automatic backup completed successfully.\nFilename: ${filename}`
    : `Automatic backup failed.\nError: ${error}`

  addLog('info', `Email notification: ${subject} - ${message}`)

  // TODO: Implement actual email sending with nodemailer when email settings are configured
  // For now, just log the notification
}

/**
 * Run the scheduled backup job
 */
export async function runScheduledBackup(): Promise<void> {
  addLog('info', 'Checking if scheduled backup should run...')

  try {
    // Load backup settings
    const settingsRecord = await prisma.settings.findUnique({
      where: { key: 'backup' },
    })

    if (!settingsRecord) {
      addLog('info', 'No backup settings found, skipping')
      return
    }

    const settings = settingsRecord.value as unknown as BackupSettings

    // Check if automatic backups are enabled
    if (!settings.automaticBackups) {
      addLog('info', 'Automatic backups disabled, skipping')
      return
    }

    // Check if backup should run based on frequency
    const lastBackupDate = await getLastBackupDate()
    const shouldRun = shouldRunBackup(settings.backupFrequency, lastBackupDate)

    if (!shouldRun) {
      addLog(
        'info',
        `Not time for backup yet. Last backup: ${lastBackupDate?.toISOString() || 'never'}, Frequency: ${settings.backupFrequency}`
      )
      return
    }

    addLog('info', `Starting scheduled backup (frequency: ${settings.backupFrequency})`)

    // Create backup
    const backupResult = await createBackup()

    if (!backupResult.success) {
      addLog('error', 'Backup failed', backupResult.error)
      await sendEmailNotification(false, undefined, backupResult.error)
      return
    }

    addLog(
      'success',
      `Backup created successfully: ${backupResult.filename} (${(backupResult.size! / 1024 / 1024).toFixed(2)} MB)`
    )

    // Upload to cloud if enabled
    if (settings.cloudStorageEnabled && backupResult.filename) {
      const filePath = path.join(process.cwd(), 'backups', backupResult.filename)
      const uploadResult = await uploadToCloud(backupResult.filename, filePath, settings)

      if (uploadResult.success) {
        addLog('success', `Backup uploaded to cloud (${settings.cloudProvider})`)
      } else {
        addLog('error', 'Cloud upload failed', uploadResult.error)
      }
    }

    // Clean up old backups
    const cleanupResult = await cleanupOldBackups(settings.backupRetention)

    if (cleanupResult.deleted > 0) {
      addLog('success', `Cleaned up ${cleanupResult.deleted} old backup(s)`)
    }

    if (cleanupResult.errors.length > 0) {
      addLog('error', 'Some cleanup operations failed', cleanupResult.errors)
    }

    // Send success notification
    await sendEmailNotification(true, backupResult.filename)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    addLog('error', 'Scheduled backup failed', errorMessage)
    await sendEmailNotification(false, undefined, errorMessage)
  }
}

/**
 * Initialize the backup scheduler
 * Runs every hour to check if a backup should be created
 */
let cronJob: cron.ScheduledTask | null = null

export function startScheduler(): void {
  if (cronJob) {
    addLog('info', 'Scheduler already running')
    return
  }

  // Run every hour at minute 0
  cronJob = cron.schedule('0 * * * *', async () => {
    await runScheduledBackup()
  })

  addLog('info', 'Backup scheduler started (runs hourly)')
}

export function stopScheduler(): void {
  if (cronJob) {
    cronJob.stop()
    cronJob = null
    addLog('info', 'Backup scheduler stopped')
  }
}

export function isSchedulerRunning(): boolean {
  return cronJob !== null
}
