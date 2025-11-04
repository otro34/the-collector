import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

// Validation schema for creating/updating reading progress
const readingProgressSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  isRead: z.boolean().default(false),
  startedAt: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  readingPath: z.string().optional().nullable(),
  currentPhase: z.string().optional().nullable(),
})

// GET /api/reading-progress - Fetch all reading progress
export async function GET() {
  try {
    const progressList = await prisma.readingProgress.findMany({
      include: {
        item: {
          include: {
            book: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      progress: progressList,
    })
  } catch (error) {
    console.error('Get reading progress error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch reading progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST /api/reading-progress - Create or update reading progress
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = readingProgressSchema.parse(body)

    // Convert string dates to Date objects
    const startedAt = validatedData.startedAt ? new Date(validatedData.startedAt) : null
    const completedAt = validatedData.completedAt ? new Date(validatedData.completedAt) : null

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: validatedData.itemId },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if progress already exists
    const existingProgress = await prisma.readingProgress.findUnique({
      where: { itemId: validatedData.itemId },
    })

    let progress
    if (existingProgress) {
      // Update existing progress
      progress = await prisma.readingProgress.update({
        where: { itemId: validatedData.itemId },
        data: {
          isRead: validatedData.isRead,
          startedAt,
          completedAt,
          readingPath: validatedData.readingPath || undefined,
          currentPhase: validatedData.currentPhase || undefined,
        },
        include: {
          item: {
            include: {
              book: true,
            },
          },
        },
      })
    } else {
      // Create new progress
      progress = await prisma.readingProgress.create({
        data: {
          itemId: validatedData.itemId,
          isRead: validatedData.isRead,
          startedAt,
          completedAt,
          readingPath: validatedData.readingPath || undefined,
          currentPhase: validatedData.currentPhase || undefined,
        },
        include: {
          item: {
            include: {
              book: true,
            },
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      progress,
      message: existingProgress ? 'Reading progress updated' : 'Reading progress created',
    })
  } catch (error) {
    console.error('Create/update reading progress error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to save reading progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
