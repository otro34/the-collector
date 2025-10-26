/**
 * Cloud Storage Utilities
 * Handles upload and connection testing for S3, R2, and Dropbox
 */

import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3'
import { Dropbox } from 'dropbox'
import { readFile } from 'fs/promises'

// Type definitions
export type CloudProvider = 's3' | 'r2' | 'dropbox'

export interface S3Config {
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
}

export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName?: string
}

export interface DropboxConfig {
  accessToken: string
}

export type CloudConfig = S3Config | R2Config | DropboxConfig

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export interface TestConnectionResult {
  success: boolean
  message?: string
  error?: string
}

/**
 * Test S3 connection by attempting to access the bucket
 */
export async function testS3Connection(config: S3Config): Promise<TestConnectionResult> {
  try {
    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })

    // Test bucket access
    await client.send(new HeadBucketCommand({ Bucket: config.bucket }))

    return {
      success: true,
      message: 'Successfully connected to S3 bucket',
    }
  } catch (error) {
    console.error('S3 connection test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Test R2 connection (uses S3-compatible API)
 */
export async function testR2Connection(config: R2Config): Promise<TestConnectionResult> {
  try {
    const bucketName = config.bucketName || 'the-collector-backups'

    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })

    // Test bucket access
    await client.send(new HeadBucketCommand({ Bucket: bucketName }))

    return {
      success: true,
      message: 'Successfully connected to Cloudflare R2',
    }
  } catch (error) {
    console.error('R2 connection test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Test Dropbox connection by getting account info
 */
export async function testDropboxConnection(config: DropboxConfig): Promise<TestConnectionResult> {
  try {
    const dbx = new Dropbox({ accessToken: config.accessToken })

    // Test connection by getting account info
    await dbx.usersGetCurrentAccount()

    return {
      success: true,
      message: 'Successfully connected to Dropbox',
    }
  } catch (error) {
    console.error('Dropbox connection test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Test connection for any provider
 */
export async function testCloudConnection(
  provider: CloudProvider,
  config: CloudConfig
): Promise<TestConnectionResult> {
  switch (provider) {
    case 's3':
      return testS3Connection(config as S3Config)
    case 'r2':
      return testR2Connection(config as R2Config)
    case 'dropbox':
      return testDropboxConnection(config as DropboxConfig)
    default:
      return {
        success: false,
        error: 'Invalid cloud provider',
      }
  }
}

/**
 * Upload file to S3
 */
export async function uploadToS3(
  filePath: string,
  filename: string,
  config: S3Config
): Promise<UploadResult> {
  try {
    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })

    // Read file content
    const fileContent = await readFile(filePath)

    // Upload to S3
    const key = `backups/${filename}`
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: fileContent,
        ContentType: 'application/sql',
      })
    )

    // Construct the S3 URL
    const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`

    return {
      success: true,
      url,
    }
  } catch (error) {
    console.error('S3 upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Upload file to R2 (uses S3-compatible API)
 */
export async function uploadToR2(
  filePath: string,
  filename: string,
  config: R2Config
): Promise<UploadResult> {
  try {
    const bucketName = config.bucketName || 'the-collector-backups'

    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })

    // Read file content
    const fileContent = await readFile(filePath)

    // Upload to R2
    const key = `backups/${filename}`
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: 'application/sql',
      })
    )

    // Construct the R2 URL
    const url = `https://${config.accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`

    return {
      success: true,
      url,
    }
  } catch (error) {
    console.error('R2 upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Upload file to Dropbox
 */
export async function uploadToDropbox(
  filePath: string,
  filename: string,
  config: DropboxConfig
): Promise<UploadResult> {
  try {
    const dbx = new Dropbox({ accessToken: config.accessToken })

    // Read file content
    const fileContent = await readFile(filePath)

    // Upload to Dropbox
    const path = `/backups/${filename}`
    await dbx.filesUpload({
      path,
      contents: fileContent,
      mode: { '.tag': 'add' },
      autorename: true,
    })

    return {
      success: true,
      url: `dropbox:${path}`,
    }
  } catch (error) {
    console.error('Dropbox upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Upload file to any cloud provider
 */
export async function uploadToCloud(
  provider: CloudProvider,
  filePath: string,
  filename: string,
  config: CloudConfig
): Promise<UploadResult> {
  switch (provider) {
    case 's3':
      return uploadToS3(filePath, filename, config as S3Config)
    case 'r2':
      return uploadToR2(filePath, filename, config as R2Config)
    case 'dropbox':
      return uploadToDropbox(filePath, filename, config as DropboxConfig)
    default:
      return {
        success: false,
        error: 'Invalid cloud provider',
      }
  }
}
