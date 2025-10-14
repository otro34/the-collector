import { NextResponse } from 'next/server'
import { CollectionType } from '@prisma/client'
import type { BookType } from '@prisma/client'
import { z } from 'zod'
import { getItemById } from '@/lib/db-utils'
import { prisma } from '@/lib/db'

// Validation schemas
const updateVideogameSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  platform: z.string().min(1, 'Platform is required'),
  year: z.number().int().min(1970).max(2100).optional().nullable(),
  developer: z.string().optional(),
  publisher: z.string().optional(),
  region: z.string().optional(),
  edition: z.string().optional(),
  genres: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  language: z.string().optional(),
  country: z.string().optional(),
  copies: z.number().int().min(1).default(1),
  price: z.number().min(0).optional().nullable(),
  tags: z.string().optional(),
  metacriticScore: z.number().int().min(0).max(100).optional().nullable(),
})

const updateMusicSchema = z.object({
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

const updateBookSchema = z.object({
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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const item = await getItemById(id)

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Get item by ID error:', error)
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await request.json()

    // Get existing item to determine collection type
    const existingItem = await getItemById(id)
    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Validate based on collection type
    let validatedData
    if (existingItem.collectionType === CollectionType.VIDEOGAME) {
      validatedData = updateVideogameSchema.parse(body)
    } else if (existingItem.collectionType === CollectionType.MUSIC) {
      validatedData = updateMusicSchema.parse(body)
    } else if (existingItem.collectionType === CollectionType.BOOK) {
      validatedData = updateBookSchema.parse(body)
    } else {
      return NextResponse.json({ error: 'Unknown collection type' }, { status: 400 })
    }

    // Process genres and tags
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

    // Update the item
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        title: validatedData.title,
        year: validatedData.year,
        language: validatedData.language || undefined,
        country: validatedData.country || undefined,
        copies: validatedData.copies,
        description: validatedData.description || undefined,
        coverUrl: validatedData.coverUrl || undefined,
        price: validatedData.price,
        tags: JSON.stringify(tagsArray),
        ...(existingItem.collectionType === CollectionType.VIDEOGAME && {
          videogame: {
            update: {
              platform: (validatedData as z.infer<typeof updateVideogameSchema>).platform,
              publisher:
                (validatedData as z.infer<typeof updateVideogameSchema>).publisher || undefined,
              developer:
                (validatedData as z.infer<typeof updateVideogameSchema>).developer || undefined,
              region: (validatedData as z.infer<typeof updateVideogameSchema>).region || undefined,
              edition:
                (validatedData as z.infer<typeof updateVideogameSchema>).edition || undefined,
              genres: JSON.stringify(genresArray),
              metacriticScore: (validatedData as z.infer<typeof updateVideogameSchema>)
                .metacriticScore,
            },
          },
        }),
        ...(existingItem.collectionType === CollectionType.MUSIC && {
          music: {
            update: {
              artist: (validatedData as z.infer<typeof updateMusicSchema>).artist,
              format: (validatedData as z.infer<typeof updateMusicSchema>).format,
              publisher:
                (validatedData as z.infer<typeof updateMusicSchema>).publisher || undefined,
              discCount:
                (validatedData as z.infer<typeof updateMusicSchema>).discCount || undefined,
              genres: JSON.stringify(genresArray),
              tracklist:
                (validatedData as z.infer<typeof updateMusicSchema>).tracklist || undefined,
            },
          },
        }),
        ...(existingItem.collectionType === CollectionType.BOOK && {
          book: {
            update: {
              type: (validatedData as z.infer<typeof updateBookSchema>).type as BookType,
              author: (validatedData as z.infer<typeof updateBookSchema>).author,
              volume: (validatedData as z.infer<typeof updateBookSchema>).volume || undefined,
              series: (validatedData as z.infer<typeof updateBookSchema>).series || undefined,
              publisher: (validatedData as z.infer<typeof updateBookSchema>).publisher || undefined,
              coverType: (validatedData as z.infer<typeof updateBookSchema>).coverType || undefined,
              genres: JSON.stringify(genresArray),
            },
          },
        }),
      },
      include: {
        videogame: true,
        music: true,
        book: true,
      },
    })

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Item updated successfully',
    })
  } catch (error) {
    console.error('Update item error:', error)

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
        error: 'Failed to update item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    // TODO: Implement delete logic in US-4.6
    console.log('Delete request for item:', id)
    return NextResponse.json({ message: 'Delete not yet implemented' }, { status: 501 })
  } catch (error) {
    console.error('Delete item error:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
