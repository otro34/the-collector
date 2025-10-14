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
