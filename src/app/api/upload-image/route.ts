import { NextResponse } from 'next/server'
import { isImageUploadConfigured, uploadImageFromUrl } from '@/lib/image-upload'

export async function POST(request: Request) {
  let imageUrl: string
  try {
    const body = await request.json()
    imageUrl = body.imageUrl
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!imageUrl || typeof imageUrl !== 'string') {
    return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
  }

  // If S3 is not configured, return the original URL unchanged
  if (!isImageUploadConfigured()) {
    return NextResponse.json({ url: imageUrl, uploaded: false })
  }

  try {
    const url = await uploadImageFromUrl(imageUrl)
    return NextResponse.json({ url, uploaded: true })
  } catch (error) {
    console.error('Image upload failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
