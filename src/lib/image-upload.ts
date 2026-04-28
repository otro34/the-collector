import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

const SUPPORTED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export function isImageUploadConfigured(): boolean {
  return !!(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET &&
    process.env.CLOUDFRONT_URL
  )
}

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
}

export async function uploadImageFromUrl(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const baseType = contentType.split(';')[0].trim()

  if (!SUPPORTED_TYPES[baseType]) {
    throw new Error(`Unsupported image type: ${baseType}`)
  }

  const buffer = await response.arrayBuffer()
  if (buffer.byteLength > MAX_SIZE_BYTES) {
    throw new Error(`Image too large: max ${MAX_SIZE_BYTES / 1024 / 1024}MB`)
  }

  const ext = SUPPORTED_TYPES[baseType]
  const key = `images/${randomUUID()}.${ext}`

  const client = getS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: baseType,
    })
  )

  const baseUrl = process.env.CLOUDFRONT_URL!.replace(/\/$/, '')
  return `${baseUrl}/${key}`
}

export async function uploadImageBuffer(
  buffer: Buffer,
  contentType: string,
  folder = 'images'
): Promise<string> {
  const baseType = contentType.split(';')[0].trim()

  if (!SUPPORTED_TYPES[baseType]) {
    throw new Error(`Unsupported image type: ${baseType}`)
  }

  if (buffer.byteLength > MAX_SIZE_BYTES) {
    throw new Error(`Image too large: max ${MAX_SIZE_BYTES / 1024 / 1024}MB`)
  }

  const ext = SUPPORTED_TYPES[baseType]
  const key = `${folder}/${randomUUID()}.${ext}`

  const client = getS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: baseType,
    })
  )

  const baseUrl = process.env.CLOUDFRONT_URL!.replace(/\/$/, '')
  return `${baseUrl}/${key}`
}
