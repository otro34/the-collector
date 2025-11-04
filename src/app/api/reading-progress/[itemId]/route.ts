import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/reading-progress/[itemId] - Fetch progress for a specific item
export async function GET(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params
  try {
    const progress = await prisma.readingProgress.findUnique({
      where: { itemId },
      include: {
        item: {
          include: {
            book: true,
          },
        },
      },
    })

    if (!progress) {
      return NextResponse.json({ error: 'Reading progress not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    console.error('Get reading progress by item ID error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch reading progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/reading-progress/[itemId] - Delete progress for a specific item
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params
  try {
    // Check if progress exists
    const existingProgress = await prisma.readingProgress.findUnique({
      where: { itemId },
    })

    if (!existingProgress) {
      return NextResponse.json({ error: 'Reading progress not found' }, { status: 404 })
    }

    // Delete the progress
    await prisma.readingProgress.delete({
      where: { itemId },
    })

    return NextResponse.json({
      success: true,
      message: 'Reading progress deleted successfully',
    })
  } catch (error) {
    console.error('Delete reading progress error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete reading progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
