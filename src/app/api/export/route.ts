import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { CollectionType } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * CSV Export API endpoint
 * Exports collection data to CSV format with optional field selection
 * Supports all collection types and maintains original CSV format compatibility
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const collectionType = searchParams.get('type') as CollectionType | null
    const fieldsParam = searchParams.get('fields')

    // Parse search and filter parameters (same as collection pages)
    const searchQuery = searchParams.get('q')?.trim()
    const platforms = searchParams.get('platforms')?.split(',').filter(Boolean)
    const genres = searchParams.get('genres')?.split(',').filter(Boolean)
    const publishers = searchParams.get('publishers')?.split(',').filter(Boolean)
    const formats = searchParams.get('formats')?.split(',').filter(Boolean)
    const artists = searchParams.get('artists')?.split(',').filter(Boolean)
    const bookTypes = searchParams.get('bookTypes')?.split(',').filter(Boolean)
    const authors = searchParams.get('authors')?.split(',').filter(Boolean)
    const series = searchParams.get('series')?.split(',').filter(Boolean)
    const minYear = searchParams.get('minYear')
      ? parseInt(searchParams.get('minYear')!, 10)
      : undefined
    const maxYear = searchParams.get('maxYear')
      ? parseInt(searchParams.get('maxYear')!, 10)
      : undefined

    if (!collectionType) {
      return NextResponse.json({ error: 'Collection type is required' }, { status: 400 })
    }

    // Parse field selection (comma-separated list of field names)
    const selectedFields = fieldsParam ? fieldsParam.split(',').filter(Boolean) : null

    // Build where clause based on collection type and filters
    const where = buildWhereClause(collectionType, searchQuery, {
      platforms,
      genres,
      publishers,
      formats,
      artists,
      bookTypes,
      authors,
      series,
      minYear,
      maxYear,
    })

    // Fetch items with relations
    const items = await prisma.item.findMany({
      where,
      include: {
        videogame: collectionType === CollectionType.VIDEOGAME,
        music: collectionType === CollectionType.MUSIC,
        book: collectionType === CollectionType.BOOK,
      },
      orderBy: { title: 'asc' },
    })

    // Apply genre filtering in-memory (SQLite limitation)
    let filteredItems = items
    if (genres && genres.length > 0) {
      filteredItems = items.filter((item) => {
        let itemGenres: string[] = []

        if (collectionType === CollectionType.VIDEOGAME && item.videogame) {
          itemGenres = parseJsonArray(item.videogame.genres)
        } else if (collectionType === CollectionType.MUSIC && item.music) {
          itemGenres = parseJsonArray(item.music.genres)
        } else if (collectionType === CollectionType.BOOK && item.book) {
          itemGenres = parseJsonArray(item.book.genres)
        }

        return genres.some((genre) => itemGenres.includes(genre))
      })
    }

    // Convert to CSV
    const csv = convertToCSV(filteredItems, collectionType, selectedFields)

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `${collectionType.toLowerCase()}-export-${timestamp}.csv`

    // Return CSV with appropriate headers
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}

/**
 * Build where clause for Prisma query based on collection type and filters
 */
function buildWhereClause(
  collectionType: CollectionType,
  searchQuery: string | undefined,
  filters: {
    platforms?: string[]
    genres?: string[]
    publishers?: string[]
    formats?: string[]
    artists?: string[]
    bookTypes?: string[]
    authors?: string[]
    series?: string[]
    minYear?: number
    maxYear?: number
  }
): Record<string, unknown> {
  const where: Record<string, unknown> = {
    collectionType,
  }

  // Search query
  if (searchQuery) {
    if (collectionType === CollectionType.VIDEOGAME) {
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
    } else if (collectionType === CollectionType.MUSIC) {
      where.OR = [
        { title: { contains: searchQuery } },
        { description: { contains: searchQuery } },
        {
          music: {
            OR: [{ artist: { contains: searchQuery } }, { publisher: { contains: searchQuery } }],
          },
        },
      ]
    } else if (collectionType === CollectionType.BOOK) {
      where.OR = [
        { title: { contains: searchQuery } },
        { description: { contains: searchQuery } },
        {
          book: {
            OR: [
              { author: { contains: searchQuery } },
              { series: { contains: searchQuery } },
              { publisher: { contains: searchQuery } },
            ],
          },
        },
      ]
    }
  }

  // Type-specific filters
  if (collectionType === CollectionType.VIDEOGAME) {
    const videogameFilters: Record<string, unknown>[] = []

    if (filters.platforms && filters.platforms.length > 0) {
      videogameFilters.push({ platform: { in: filters.platforms } })
    }

    if (filters.publishers && filters.publishers.length > 0) {
      videogameFilters.push({ publisher: { in: filters.publishers } })
    }

    if (videogameFilters.length > 0) {
      where.videogame = { AND: videogameFilters }
    }
  } else if (collectionType === CollectionType.MUSIC) {
    const musicFilters: Record<string, unknown>[] = []

    if (filters.formats && filters.formats.length > 0) {
      musicFilters.push({ format: { in: filters.formats } })
    }

    if (filters.artists && filters.artists.length > 0) {
      musicFilters.push({ artist: { in: filters.artists } })
    }

    if (musicFilters.length > 0) {
      where.music = { AND: musicFilters }
    }
  } else if (collectionType === CollectionType.BOOK) {
    const bookFilters: Record<string, unknown>[] = []

    if (filters.bookTypes && filters.bookTypes.length > 0) {
      bookFilters.push({ type: { in: filters.bookTypes } })
    }

    if (filters.authors && filters.authors.length > 0) {
      bookFilters.push({ author: { in: filters.authors } })
    }

    if (filters.series && filters.series.length > 0) {
      bookFilters.push({ series: { in: filters.series } })
    }

    if (filters.publishers && filters.publishers.length > 0) {
      bookFilters.push({ publisher: { in: filters.publishers } })
    }

    if (bookFilters.length > 0) {
      where.book = { AND: bookFilters }
    }
  }

  // Year range filter
  if (filters.minYear !== undefined || filters.maxYear !== undefined) {
    const yearFilter: Record<string, number> = {}
    if (filters.minYear !== undefined) yearFilter.gte = filters.minYear
    if (filters.maxYear !== undefined) yearFilter.lte = filters.maxYear
    where.year = yearFilter
  }

  return where
}

/**
 * Convert items to CSV format
 * Maintains compatibility with original CSV format
 */
function convertToCSV(
  items: Record<string, unknown>[],
  collectionType: CollectionType,
  selectedFields: string[] | null
): string {
  if (items.length === 0) {
    return ''
  }

  // Define all available fields for each collection type
  const allFields = getAllFields(collectionType)

  // Use selected fields or all fields
  const fields = selectedFields || allFields

  // Build CSV header
  const header = fields.join(',')

  // Build CSV rows
  const rows = items.map((item) => {
    return fields
      .map((field) => {
        const value = getFieldValue(item, field, collectionType)
        return escapeCsvValue(value)
      })
      .join(',')
  })

  return [header, ...rows].join('\n')
}

/**
 * Get all available fields for a collection type
 * Matches original CSV format
 */
function getAllFields(collectionType: CollectionType): string[] {
  const commonFields = [
    'title',
    'year',
    'language',
    'country',
    'copies',
    'description',
    'coverUrl',
    'price',
  ]

  if (collectionType === CollectionType.VIDEOGAME) {
    return [
      ...commonFields,
      'platform',
      'publisher',
      'developer',
      'region',
      'edition',
      'genres',
      'metacriticScore',
    ]
  } else if (collectionType === CollectionType.MUSIC) {
    return [...commonFields, 'artist', 'publisher', 'format', 'discCount', 'genres', 'tracklist']
  } else if (collectionType === CollectionType.BOOK) {
    return [
      ...commonFields,
      'type',
      'author',
      'volume',
      'series',
      'publisher',
      'coverType',
      'genres',
    ]
  }

  return commonFields
}

/**
 * Get field value from item
 */
function getFieldValue(
  item: Record<string, unknown>,
  field: string,
  collectionType: CollectionType
): string {
  // Common fields from Item model
  if (field in item && item[field] !== null && item[field] !== undefined) {
    const value = item[field]

    // Handle special cases
    if (field === 'tags' && typeof value === 'string') {
      return parseJsonArray(value).join(', ')
    }

    return String(value)
  }

  // Type-specific fields
  let typeData: Record<string, unknown> | null = null
  if (collectionType === CollectionType.VIDEOGAME && item.videogame) {
    typeData = item.videogame as Record<string, unknown>
  } else if (collectionType === CollectionType.MUSIC && item.music) {
    typeData = item.music as Record<string, unknown>
  } else if (collectionType === CollectionType.BOOK && item.book) {
    typeData = item.book as Record<string, unknown>
  }

  if (typeData && field in typeData && typeData[field] !== null && typeData[field] !== undefined) {
    const value = typeData[field]

    // Handle genres array
    if (field === 'genres' && typeof value === 'string') {
      return parseJsonArray(value).join(', ')
    }

    return String(value)
  }

  return ''
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCsvValue(value: string): string {
  if (!value) return ''

  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

/**
 * Parse JSON array string (used for genres, tags)
 */
function parseJsonArray(value: string): string[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
