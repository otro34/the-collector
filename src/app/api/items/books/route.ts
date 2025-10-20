import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { CollectionType } from '@prisma/client'
import type { BookType } from '@prisma/client'
import { z } from 'zod'
import { getAllItems } from '@/lib/db-utils'
import { prisma } from '@/lib/db'

// Validation schema for creating books
const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  type: z.enum(['MANGA', 'COMIC', 'GRAPHIC_NOVEL', 'OTHER'], {
    message: 'Book type is required',
  }),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  volume: z.string().optional(),
  series: z.string().optional(),
  publisher: z.string().optional(),
  coverType: z.string().optional(),
  genres: z.string().optional(),
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
    const skip = (page - 1) * limit

    // Parse sort parameters
    const sortField = searchParams.get('sortField') || 'createdAt'
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc'

    // Parse filter parameters
    const bookTypesParam = searchParams.get('bookTypes')
    const genresParam = searchParams.get('genres')
    const authorsParam = searchParams.get('authors')
    const seriesParam = searchParams.get('series')
    const publishersParam = searchParams.get('publishers')
    const minYear = searchParams.get('minYear')
    const maxYear = searchParams.get('maxYear')

    // Build where clause with filters
    const where: {
      collectionType: CollectionType
      book?: {
        is?: {
          type?: { in: BookType[] }
          author?: { in: string[] }
          series?: { in: string[] }
          publisher?: { in: string[] }
        }
      }
      year?: { gte?: number; lte?: number }
    } = {
      collectionType: CollectionType.BOOK,
    }

    // Book type filter
    if (bookTypesParam) {
      const bookTypes = bookTypesParam.split(',').filter(Boolean) as BookType[]
      if (bookTypes.length > 0) {
        if (!where.book) where.book = {}
        if (!where.book.is) where.book.is = {}
        where.book.is.type = { in: bookTypes }
      }
    }

    // Author filter
    if (authorsParam) {
      const authors = authorsParam.split(',').filter(Boolean)
      if (authors.length > 0) {
        if (!where.book) where.book = {}
        if (!where.book.is) where.book.is = {}
        where.book.is.author = { in: authors }
      }
    }

    // Series filter
    if (seriesParam) {
      const series = seriesParam.split(',').filter(Boolean)
      if (series.length > 0) {
        if (!where.book) where.book = {}
        if (!where.book.is) where.book.is = {}
        where.book.is.series = { in: series }
      }
    }

    // Publisher filter
    if (publishersParam) {
      const publishers = publishersParam.split(',').filter(Boolean)
      if (publishers.length > 0) {
        if (!where.book) where.book = {}
        if (!where.book.is) where.book.is = {}
        where.book.is.publisher = { in: publishers }
      }
    }

    // Year range filter
    if (minYear || maxYear) {
      where.year = {}
      if (minYear) where.year.gte = parseInt(minYear, 10)
      if (maxYear) where.year.lte = parseInt(maxYear, 10)
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
        // For genre, we'll sort by the book genres field
        orderBy = { book: { genres: sortDirection } }
        break
      case 'price':
        orderBy = { price: sortDirection }
        break
    }

    // Fetch all items with database filters (without pagination for genre filtering)
    let allItems = await getAllItems({
      where,
      orderBy,
    })

    // Genre filtering (in-memory, as genres are stored as JSON)
    // Apply genre filter BEFORE pagination to ensure correct page slices
    if (genresParam) {
      const genresFilter = genresParam.split(',').filter(Boolean)
      if (genresFilter.length > 0) {
        allItems = allItems.filter((item) => {
          if (!item.book?.genres) return false
          try {
            const genres = JSON.parse(item.book.genres)
            if (!Array.isArray(genres)) return false
            return genresFilter.some((genre) => genres.includes(genre))
          } catch {
            return false
          }
        })
      }
    }

    // Apply pagination AFTER genre filtering
    const total = allItems.length
    const totalPages = Math.ceil(total / limit)
    const items = allItems.slice(skip, skip + limit)

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Books API error:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = createBookSchema.parse(body)

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

    // Create the book item with related data
    const item = await prisma.item.create({
      data: {
        collectionType: CollectionType.BOOK,
        title: validatedData.title,
        year: validatedData.year,
        language: validatedData.language || undefined,
        country: validatedData.country || undefined,
        copies: validatedData.copies,
        description: validatedData.description || undefined,
        coverUrl: validatedData.coverUrl || undefined,
        price: validatedData.price,
        tags: JSON.stringify(tagsArray),
        book: {
          create: {
            type: validatedData.type as BookType,
            author: validatedData.author,
            volume: validatedData.volume || undefined,
            series: validatedData.series || undefined,
            publisher: validatedData.publisher || undefined,
            coverType: validatedData.coverType || undefined,
            genres: JSON.stringify(genresArray),
          },
        },
      },
      include: {
        book: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        item,
        message: 'Book added successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Book creation error:', error)

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
        error: 'Failed to create book',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
