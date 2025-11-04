import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { BookType } from '@prisma/client'
import { recommendationCache } from '@/lib/recommendation-cache'

/**
 * GET /api/recommendations?bookType=MANGA
 * Fetch reading recommendations for a specific book type
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookType = searchParams.get('bookType') as BookType | null

    // Validate bookType
    if (bookType && !['MANGA', 'COMIC', 'GRAPHIC_NOVEL'].includes(bookType)) {
      return NextResponse.json(
        {
          error: 'Invalid book type. Must be MANGA, COMIC, or GRAPHIC_NOVEL',
        },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = bookType ? `recommendations:${bookType}` : 'recommendations:all'
    const cachedData = recommendationCache.get(cacheKey)

    if (cachedData) {
      return NextResponse.json({
        success: true,
        ...(cachedData as object),
        cached: true,
      })
    }

    // Build query
    const where = bookType ? { bookType } : {}

    // Fetch reading paths with phases and recommendations
    const paths = await prisma.readingPath.findMany({
      where,
      include: {
        phases: {
          include: {
            recommendations: {
              orderBy: {
                priority: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    const response = {
      paths,
      count: paths.length,
    }

    // Store in cache
    recommendationCache.set(cacheKey, response)

    return NextResponse.json({
      success: true,
      ...response,
      cached: false,
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recommendations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
