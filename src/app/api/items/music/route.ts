import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { CollectionType } from '@prisma/client'
import { getAllItems } from '@/lib/db-utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const skip = (page - 1) * limit

    const items = await getAllItems({
      where: { collectionType: CollectionType.MUSIC },
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
    })

    const totalCount = await getAllItems({
      where: { collectionType: CollectionType.MUSIC },
    })

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit),
      },
    })
  } catch (error) {
    console.error('Music API error:', error)
    return NextResponse.json({ error: 'Failed to fetch music' }, { status: 500 })
  }
}
