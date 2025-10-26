import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
  testCloudConnection,
  type CloudProvider,
  type S3Config,
  type R2Config,
  type DropboxConfig,
} from '@/lib/cloud-storage'

// POST /api/settings/backup/test - Test cloud storage connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider } = body

    if (!provider || provider === 'none') {
      return NextResponse.json({ error: 'No provider selected' }, { status: 400 })
    }

    // Validate required fields
    let config: S3Config | R2Config | DropboxConfig | null = null
    const missingFields: string[] = []

    switch (provider) {
      case 's3':
        if (!body.bucket) missingFields.push('bucket')
        if (!body.region) missingFields.push('region')
        if (!body.accessKeyId) missingFields.push('accessKeyId')
        if (!body.secretAccessKey) missingFields.push('secretAccessKey')

        if (missingFields.length === 0) {
          config = {
            bucket: body.bucket,
            region: body.region,
            accessKeyId: body.accessKeyId,
            secretAccessKey: body.secretAccessKey,
          }
        }
        break

      case 'r2':
        if (!body.accountId) missingFields.push('accountId')
        if (!body.accessKeyId) missingFields.push('accessKeyId')
        if (!body.secretAccessKey) missingFields.push('secretAccessKey')

        if (missingFields.length === 0) {
          config = {
            accountId: body.accountId,
            accessKeyId: body.accessKeyId,
            secretAccessKey: body.secretAccessKey,
            bucketName: body.bucketName,
          }
        }
        break

      case 'dropbox':
        if (!body.accessToken) missingFields.push('accessToken')

        if (missingFields.length === 0) {
          config = {
            accessToken: body.accessToken,
          }
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to configure cloud storage',
        },
        { status: 400 }
      )
    }

    // Test the actual connection
    const result = await testCloudConnection(provider as CloudProvider, config)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Connection test failed',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      },
      { status: 500 }
    )
  }
}
