import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { CollectionType } from '@prisma/client'
import { z } from 'zod'
import { getAllItems } from '@/lib/db-utils'
import { prisma } from '@/lib/db'

// Validation schema for creating music
const createMusicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  format: z.string().min(1, 'Format is required'),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  publisher: z.string().optional(),
  discCount: z.string().optional(),
  genres: z.string().optional(),
  tracklist: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  language: z.string().optional(),
  country: z.string().optional(),
  copies: z.number().int().min(1).default(1),
  price: z.number().min(0).optional().nullable(),
  tags: z.string().optional(),
})

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
    const formats = searchParams.get('formats')?.split(',').filter(Boolean)
    const genres = searchParams.get('genres')?.split(',').filter(Boolean)
    const artists = searchParams.get('artists')?.split(',').filter(Boolean)
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
        music?: {
          OR?: Array<{
            artist?: { contains: string }
            publisher?: { contains: string }
          }>
        }
      }>
      music?: {
        AND?: Array<{
          format?: { in: string[] }
          genres?: { contains: string }
          artist?: { in: string[] }
        }>
      }
      year?: { gte?: number; lte?: number }
    } = {
      collectionType: CollectionType.MUSIC,
    }

    // Apply search query if provided (searches title, description, artist, publisher)
    if (searchQuery) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } as any },
        { description: { contains: searchQuery, mode: 'insensitive' } as any },
        {
          music: {
            OR: [
              { artist: { contains: searchQuery, mode: 'insensitive' } as any },
              { publisher: { contains: searchQuery, mode: 'insensitive' } as any },
            ],
          },
        },
      ]
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }

    // Apply music-specific filters
    const musicFilters: Array<{
      format?: { in: string[] }
      genres?: { contains: string }
      artist?: { in: string[] }
    }> = []

    if (formats && formats.length > 0) {
      musicFilters.push({ format: { in: formats } })
    }

    if (artists && artists.length > 0) {
      musicFilters.push({ artist: { in: artists } })
    }

    if (musicFilters.length > 0) {
      where.music = { AND: musicFilters }
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
        // For genre, we'll sort by the music genres field
        orderBy = { music: { genres: sortDirection } }
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
        if (!item.music?.genres) return false
        try {
          const itemGenres = JSON.parse(item.music.genres) as string[]
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
    console.error('Music API error:', error)
    return NextResponse.json({ error: 'Failed to fetch music' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = createMusicSchema.parse(body)

    // Process genres and tags (convert comma-separated strings to JSON arrays)
    const genresArray = validatedData.genres
      ? validatedData.genres
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean)
      : []
    const tagsArray = validatedData.tags
      ? validatedData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    // Create the music item with related data
    const item = await prisma.item.create({
      data: {
        collectionType: CollectionType.MUSIC,
        title: validatedData.title,
        year: validatedData.year,
        language: validatedData.language || undefined,
        country: validatedData.country || undefined,
        copies: validatedData.copies,
        description: validatedData.description || undefined,
        coverUrl: validatedData.coverUrl || undefined,
        price: validatedData.price,
        tags: JSON.stringify(tagsArray),
        music: {
          create: {
            artist: validatedData.artist,
            format: validatedData.format,
            publisher: validatedData.publisher || undefined,
            discCount: validatedData.discCount || undefined,
            genres: JSON.stringify(genresArray),
            tracklist: validatedData.tracklist || undefined,
          },
        },
      },
      include: {
        music: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        item,
        message: 'Music album added successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Music creation error:', error)

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
        error: 'Failed to create music album',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
