import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'

// DELETE /api/backup/[id] - Delete a backup file and its database record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find the backup record
    const backup = await prisma.backup.findUnique({
      where: { id },
    })

    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    // Delete the file from disk if it exists
    if (existsSync(backup.location)) {
      await unlink(backup.location)
    }

    // Delete the database record
    await prisma.backup.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete backup:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete backup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
