import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { CollectionType } from '@prisma/client'
import { getAllItems, createVideogameItem } from '@/lib/db-utils'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const skip = (page - 1) * limit

    // Parse sort parameters
    const sortField = searchParams.get('sortField') || 'createdAt'
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc'

    // Map sort field to proper orderBy clause
    type OrderByInput = Record<string, 'asc' | 'desc' | Record<string, 'asc' | 'desc'>>
    let orderBy: OrderByInput = { createdAt: sortDirection }

    switch (sortField) {
      case 'title':
        orderBy = { title: sortDirection }
        break
      case 'year':
        orderBy = { year: sortDirection }
        break
      case 'createdAt':
        orderBy = { createdAt: sortDirection }
        break
      case 'genre':
        // For genre, we'll sort by the videogame genres field
        orderBy = { videogame: { genres: sortDirection } }
        break
    }

    const items = await getAllItems({
      where: { collectionType: CollectionType.VIDEOGAME },
      take: limit,
      skip,
      orderBy,
    })

    const totalCount = await getAllItems({
      where: { collectionType: CollectionType.VIDEOGAME },
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
    console.error('Videogames API error:', error)
    return NextResponse.json({ error: 'Failed to fetch video games' }, { status: 500 })
  }
}

// Validation schema for creating videogames
const videogameSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  platform: z.string().min(1, 'Platform is required'),
  year: z.number().int().min(1970).max(2100).optional().nullable(),
  developer: z.string().optional(),
  publisher: z.string().optional(),
  region: z.string().optional(),
  edition: z.string().optional(),
  genres: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().url().optional().or(z.literal('')),
  language: z.string().optional(),
  country: z.string().optional(),
  copies: z.number().int().min(1).default(1),
  price: z.number().min(0).optional().nullable(),
  tags: z.string().optional(),
  metacriticScore: z.number().int().min(0).max(100).optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = videogameSchema.parse(body)

    // Convert comma-separated strings to JSON arrays for Prisma
    const genresArray = validatedData.genres
      ? validatedData.genres
          .split(',')
          .map((g) => g.trim())
          .filter((g) => g)
      : []
    const tagsArray = validatedData.tags
      ? validatedData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t)
      : []

    // Create the videogame
    const item = await createVideogameItem(
      {
        title: validatedData.title,
        year: validatedData.year ?? undefined,
        language: validatedData.language || undefined,
        country: validatedData.country || undefined,
        copies: validatedData.copies,
        description: validatedData.description || undefined,
        coverUrl: validatedData.coverUrl || undefined,
        price: validatedData.price ?? undefined,
        tags: JSON.stringify(tagsArray),
        customFields: {},
      },
      {
        platform: validatedData.platform,
        publisher: validatedData.publisher || undefined,
        developer: validatedData.developer || undefined,
        region: validatedData.region || undefined,
        edition: validatedData.edition || undefined,
        genres: JSON.stringify(genresArray),
        metacriticScore: validatedData.metacriticScore ?? undefined,
      }
    )

    return NextResponse.json(
      {
        success: true,
        item,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create videogame error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create videogame',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
