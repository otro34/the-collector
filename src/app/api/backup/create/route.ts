import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import {
  uploadToCloud,
  type CloudProvider,
  type S3Config,
  type R2Config,
  type DropboxConfig,
} from '@/lib/cloud-storage'

const execAsync = promisify(exec)

// POST /api/backup/create - Create a manual backup
export async function POST() {
  try {
    // Generate timestamp for filename
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .split('T')
      .join('_')
      .slice(0, -5)
    const filename = `backup-${timestamp}.sql`

    // Ensure backups directory exists
    const backupsDir = path.join(process.cwd(), 'backups')
    if (!existsSync(backupsDir)) {
      await mkdir(backupsDir, { recursive: true })
    }

    const backupPath = path.join(backupsDir, filename)

    // Get database URL from environment
    const databaseUrl = process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 })
    }

    // Parse database URL to extract connection parameters safely
    let dbParams: { host: string; port: string; database: string; user: string; password: string }
    try {
      const url = new URL(databaseUrl)
      dbParams = {
        host: url.hostname,
        port: url.port || '5432',
        database: url.pathname.slice(1), // Remove leading '/'
        user: url.username,
        password: url.password,
      }
    } catch (error) {
      console.error('Failed to parse database URL:', error)
      return NextResponse.json({ error: 'Invalid database URL format' }, { status: 500 })
    }

    // Get item count before backup
    const itemCount = await prisma.item.count()

    // Create database backup using pg_dump with separate parameters (prevents command injection)
    try {
      const { stderr } = await execAsync(
        `PGPASSWORD="${dbParams.password}" pg_dump -h "${dbParams.host}" -p "${dbParams.port}" -U "${dbParams.user}" -d "${dbParams.database}" -f "${backupPath}"`,
        {
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          env: { ...process.env, PGPASSWORD: dbParams.password },
        }
      )

      if (stderr && !stderr.includes('Notice:')) {
        console.error('pg_dump stderr:', stderr)
      }
    } catch (error) {
      console.error('Backup creation failed:', error)
      return NextResponse.json({ error: 'Failed to create database backup' }, { status: 500 })
    }

    // Get file size
    const { size } = await import('fs').then((fs) => fs.promises.stat(backupPath))

    // Store backup record in database
    const backupRecord = await prisma.backup.create({
      data: {
        filename,
        size,
        itemCount,
        location: backupPath,
        type: 'manual',
      },
    })

    // Check if cloud storage is enabled and upload
    let cloudUploadResult: { success: boolean; url?: string; error?: string } | null = null

    try {
      const settingsRecord = await prisma.settings.findUnique({
        where: { key: 'backup' },
      })

      if (settingsRecord) {
        const settings = settingsRecord.value as Record<string, unknown>

        if (settings.cloudStorageEnabled && settings.cloudProvider !== 'none') {
          const provider = settings.cloudProvider as string

          // Type guard to ensure valid provider
          if (provider !== 's3' && provider !== 'r2' && provider !== 'dropbox') {
            throw new Error('Invalid cloud provider')
          }

          // Build cloud config based on provider
          let config: S3Config | R2Config | DropboxConfig

          switch (provider) {
            case 's3':
              config = {
                bucket: settings.s3Bucket as string,
                region: settings.s3Region as string,
                accessKeyId: settings.s3AccessKeyId as string,
                secretAccessKey: settings.s3SecretAccessKey as string,
              }
              break

            case 'r2':
              config = {
                accountId: settings.r2AccountId as string,
                accessKeyId: settings.r2AccessKeyId as string,
                secretAccessKey: settings.r2SecretAccessKey as string,
              }
              break

            case 'dropbox':
              config = {
                accessToken: settings.dropboxAccessToken as string,
              }
              break

            default:
              throw new Error('Invalid cloud provider')
          }

          // Upload to cloud
          cloudUploadResult = await uploadToCloud(
            provider as CloudProvider,
            backupPath,
            filename,
            config
          )

          // Update backup record with cloud URL if upload was successful
          if (cloudUploadResult.success && cloudUploadResult.url) {
            await prisma.backup.update({
              where: { id: backupRecord.id },
              data: { location: cloudUploadResult.url },
            })
          }
        }
      }
    } catch (cloudError) {
      console.error('Cloud upload failed:', cloudError)
      // Don't fail the entire backup if cloud upload fails
      cloudUploadResult = {
        success: false,
        error: cloudError instanceof Error ? cloudError.message : 'Cloud upload failed',
      }
    }

    return NextResponse.json({
      success: true,
      backup: {
        id: backupRecord.id,
        filename: backupRecord.filename,
        size: backupRecord.size,
        itemCount: backupRecord.itemCount,
        location: cloudUploadResult?.url || backupRecord.location,
        createdAt: backupRecord.createdAt,
      },
      cloudUpload: cloudUploadResult
        ? {
            success: cloudUploadResult.success,
            error: cloudUploadResult.error,
          }
        : null,
    })
  } catch (error) {
    console.error('Backup creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create backup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
