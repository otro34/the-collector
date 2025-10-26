import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  uploadToCloud,
  type CloudProvider,
  type S3Config,
  type R2Config,
  type DropboxConfig,
} from '@/lib/cloud-storage'
import { existsSync } from 'fs'

// POST /api/backup/[id]/upload - Upload backup to cloud storage
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get backup from database
    const backup = await prisma.backup.findUnique({
      where: { id },
    })

    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    // Check if file exists
    if (!existsSync(backup.location)) {
      return NextResponse.json({ error: 'Backup file not found on disk' }, { status: 404 })
    }

    // Load cloud storage settings
    const settingsRecord = await prisma.settings.findUnique({
      where: { key: 'backup' },
    })

    if (!settingsRecord) {
      return NextResponse.json({ error: 'Backup settings not found' }, { status: 400 })
    }

    const settings = settingsRecord.value as Record<string, unknown>

    // Validate cloud storage is enabled
    if (!settings.cloudStorageEnabled) {
      return NextResponse.json({ error: 'Cloud storage is not enabled' }, { status: 400 })
    }

    const provider = settings.cloudProvider as string

    if (!provider || provider === 'none') {
      return NextResponse.json({ error: 'No cloud provider configured' }, { status: 400 })
    }

    // Type guard to ensure valid provider
    if (provider !== 's3' && provider !== 'r2' && provider !== 'dropbox') {
      return NextResponse.json({ error: 'Invalid cloud provider' }, { status: 400 })
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
        return NextResponse.json({ error: 'Invalid cloud provider' }, { status: 400 })
    }

    // Upload to cloud
    const uploadResult = await uploadToCloud(
      provider as CloudProvider,
      backup.location,
      backup.filename,
      config
    )

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error || 'Upload failed' }, { status: 500 })
    }

    // Update backup record with cloud URL
    const updatedBackup = await prisma.backup.update({
      where: { id },
      data: {
        location: uploadResult.url || backup.location,
      },
    })

    return NextResponse.json({
      success: true,
      backup: updatedBackup,
      message: `Backup uploaded to ${provider.toUpperCase()} successfully`,
    })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    )
  }
}
