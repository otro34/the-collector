import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

// GET /api/backup/[id]/download - Download a specific backup file
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Find the backup record
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

    // Read the file
    const fileBuffer = await readFile(backup.location)

    // Return file with appropriate headers
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${backup.filename}"`,
        'Content-Length': backup.size.toString(),
      },
    })
  } catch (error) {
    console.error('Failed to download backup:', error)
    return NextResponse.json(
      {
        error: 'Failed to download backup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
