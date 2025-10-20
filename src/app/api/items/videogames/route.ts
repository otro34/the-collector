import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { CollectionType } from '@prisma/client'
import { getAllItems, createVideogameItem } from '@/lib/db-utils'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Parse sort parameters
    const sortField = searchParams.get('sortField') || 'createdAt'
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc'

    // Parse search query
    const searchQuery = searchParams.get('q')?.trim()

    // Parse filter parameters
    const platforms = searchParams.get('platforms')?.split(',').filter(Boolean)
    const genres = searchParams.get('genres')?.split(',').filter(Boolean)
    const publishers = searchParams.get('publishers')?.split(',').filter(Boolean)
    const minYear = searchParams.get('minYear')
      ? parseInt(searchParams.get('minYear')!, 10)
      : undefined
    const maxYear = searchParams.get('maxYear')
      ? parseInt(searchParams.get('maxYear')!, 10)
      : undefined

    // Build where clause with filters and search
    const where: {
      collectionType: CollectionType
      OR?: Array<{
        title?: { contains: string }
        description?: { contains: string }
        videogame?: {
          OR?: Array<{
            developer?: { contains: string }
            publisher?: { contains: string }
          }>
        }
      }>
      videogame?: {
        AND?: Array<{
          platform?: { in: string[] }
          genres?: { contains: string }
          publisher?: { in: string[] }
        }>
      }
      year?: { gte?: number; lte?: number }
    } = {
      collectionType: CollectionType.VIDEOGAME,
    }

    // Apply search query if provided (searches title, description, developer, publisher)
    // Note: SQLite is case-insensitive by default for LIKE operations
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery } },
        { description: { contains: searchQuery } },
        {
          videogame: {
            OR: [
              { developer: { contains: searchQuery } },
              { publisher: { contains: searchQuery } },
            ],
          },
        },
      ]
    }

    // Apply videogame-specific filters
    const videogameFilters: Array<{
      platform?: { in: string[] }
      genres?: { contains: string }
      publisher?: { in: string[] }
    }> = []

    if (platforms && platforms.length > 0) {
      videogameFilters.push({ platform: { in: platforms } })
    }

    if (publishers && publishers.length > 0) {
      videogameFilters.push({ publisher: { in: publishers } })
    }

    if (videogameFilters.length > 0) {
      where.videogame = { AND: videogameFilters }
    }

    // Apply year range filter
    if (minYear !== undefined || maxYear !== undefined) {
      where.year = {}
      if (minYear !== undefined) where.year.gte = minYear
      if (maxYear !== undefined) where.year.lte = maxYear
    }

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
      case 'price':
        orderBy = { price: sortDirection }
        break
    }

    // Check if we need to filter by genres (which requires fetching all items)
    // Genre filtering with JSON strings in SQLite requires in-memory filtering
    const needsGenreFiltering = genres && genres.length > 0

    let items
    let totalCount
    let totalPages

    if (needsGenreFiltering) {
      // Fetch ALL items for genre filtering (in-memory operation)
      let allItems = await getAllItems({
        where,
        orderBy,
      })

      // Filter by genres in memory - must happen BEFORE pagination
      allItems = allItems.filter((item) => {
        if (!item.videogame?.genres) return false
        try {
          const itemGenres = JSON.parse(item.videogame.genres) as string[]
          return genres.some((genre) => itemGenres.includes(genre))
        } catch {
          return false
        }
      })

      // Calculate pagination after filtering
      totalCount = allItems.length
      totalPages = Math.ceil(totalCount / limit)
      const skip = (page - 1) * limit

      // Apply pagination to filtered results
      items = allItems.slice(skip, skip + limit)
    } else {
      // No genre filtering needed - use efficient count() and pagination
      const skip = (page - 1) * limit

      // Fetch paginated items directly from database
      items = await getAllItems({
        where,
        take: limit,
        skip,
        orderBy,
      })

      // Use Prisma's count() for efficient total count
      totalCount = await prisma.item.count({ where })
      totalPages = Math.ceil(totalCount / limit)
    }

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
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
