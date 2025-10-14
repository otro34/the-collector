import { NextResponse } from 'next/server'
import { CollectionType } from '@prisma/client'
import { countItemsByType, getAllItems } from '@/lib/db-utils'

export async function GET() {
  try {
    // Get counts for each collection type
    const [totalItems, videogamesCount, musicCount, booksCount] = await Promise.all([
      countItemsByType(),
      countItemsByType(CollectionType.VIDEOGAME),
      countItemsByType(CollectionType.MUSIC),
      countItemsByType(CollectionType.BOOK),
    ])

    // Get recent additions (last 20 items)
    const recentItems = await getAllItems({
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      stats: {
        total: totalItems,
        videogames: videogamesCount,
        music: musicCount,
        books: booksCount,
      },
      recentItems,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
