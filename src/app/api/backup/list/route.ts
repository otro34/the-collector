import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/backup/list - List all backups with pagination and sorting
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build orderBy clause
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy]: sortOrder as 'asc' | 'desc',
    }

    // Fetch backups with pagination
    const [backups, totalCount] = await Promise.all([
      prisma.backup.findMany({
        skip,
        take: limit,
        orderBy,
      }),
      prisma.backup.count(),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      backups,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    })
  } catch (error) {
    console.error('Failed to fetch backups:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch backups',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
