import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { CollectionType } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * JSON Export API endpoint
 * Exports collection data to JSON format
 * Supports exporting entire database or specific collections
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const collectionType = searchParams.get('type') as CollectionType | null
    const exportAll = searchParams.get('all') === 'true'

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

    let exportData: Record<string, unknown>

    if (exportAll) {
      // Export entire database
      const [videogames, music, books] = await Promise.all([
        fetchItems(CollectionType.VIDEOGAME, searchQuery, {
          platforms,
          genres,
          publishers,
          minYear,
          maxYear,
        }),
        fetchItems(CollectionType.MUSIC, searchQuery, {
          formats,
          genres,
          artists,
          minYear,
          maxYear,
        }),
        fetchItems(CollectionType.BOOK, searchQuery, {
          bookTypes,
          genres,
          authors,
          series,
          publishers,
          minYear,
          maxYear,
        }),
      ])

      exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalItems: videogames.length + music.length + books.length,
          version: '1.0',
        },
        collections: {
          videogames: formatCollection(videogames, CollectionType.VIDEOGAME),
          music: formatCollection(music, CollectionType.MUSIC),
          books: formatCollection(books, CollectionType.BOOK),
        },
      }
    } else {
      // Export specific collection
      if (!collectionType) {
        return NextResponse.json({ error: 'Collection type is required' }, { status: 400 })
      }

      const filters =
        collectionType === CollectionType.VIDEOGAME
          ? { platforms, genres, publishers, minYear, maxYear }
          : collectionType === CollectionType.MUSIC
            ? { formats, genres, artists, minYear, maxYear }
            : { bookTypes, genres, authors, series, publishers, minYear, maxYear }

      const items = await fetchItems(collectionType, searchQuery, filters)

      exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          collectionType,
          totalItems: items.length,
          version: '1.0',
        },
        items: formatCollection(items, collectionType),
      }
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const prefix = exportAll ? 'all-collections' : collectionType?.toLowerCase()
    const filename = `${prefix}-export-${timestamp}.json`

    // Return JSON with appropriate headers
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('JSON export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}

/**
 * Fetch items for a specific collection type with filters
 */
async function fetchItems(
  collectionType: CollectionType,
  searchQuery: string | undefined,
  filters: Record<string, unknown>
) {
  const where = buildWhereClause(collectionType, searchQuery, filters)

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
  if (filters.genres && Array.isArray(filters.genres) && filters.genres.length > 0) {
    return items.filter((item) => {
      let itemGenres: string[] = []

      if (collectionType === CollectionType.VIDEOGAME && item.videogame) {
        itemGenres = parseJsonArray(item.videogame.genres)
      } else if (collectionType === CollectionType.MUSIC && item.music) {
        itemGenres = parseJsonArray(item.music.genres)
      } else if (collectionType === CollectionType.BOOK && item.book) {
        itemGenres = parseJsonArray(item.book.genres)
      }

      return (filters.genres as string[]).some((genre: string) => itemGenres.includes(genre))
    })
  }

  return items
}

/**
 * Build where clause for Prisma query
 */
function buildWhereClause(
  collectionType: CollectionType,
  searchQuery: string | undefined,
  filters: Record<string, unknown>
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

    if (filters.platforms && Array.isArray(filters.platforms) && filters.platforms.length > 0) {
      videogameFilters.push({ platform: { in: filters.platforms } })
    }

    if (filters.publishers && Array.isArray(filters.publishers) && filters.publishers.length > 0) {
      videogameFilters.push({ publisher: { in: filters.publishers } })
    }

    if (videogameFilters.length > 0) {
      where.videogame = { AND: videogameFilters }
    }
  } else if (collectionType === CollectionType.MUSIC) {
    const musicFilters: Record<string, unknown>[] = []

    if (filters.formats && Array.isArray(filters.formats) && filters.formats.length > 0) {
      musicFilters.push({ format: { in: filters.formats } })
    }

    if (filters.artists && Array.isArray(filters.artists) && filters.artists.length > 0) {
      musicFilters.push({ artist: { in: filters.artists } })
    }

    if (musicFilters.length > 0) {
      where.music = { AND: musicFilters }
    }
  } else if (collectionType === CollectionType.BOOK) {
    const bookFilters: Record<string, unknown>[] = []

    if (filters.bookTypes && Array.isArray(filters.bookTypes) && filters.bookTypes.length > 0) {
      bookFilters.push({ type: { in: filters.bookTypes } })
    }

    if (filters.authors && Array.isArray(filters.authors) && filters.authors.length > 0) {
      bookFilters.push({ author: { in: filters.authors } })
    }

    if (filters.series && Array.isArray(filters.series) && filters.series.length > 0) {
      bookFilters.push({ series: { in: filters.series } })
    }

    if (filters.publishers && Array.isArray(filters.publishers) && filters.publishers.length > 0) {
      bookFilters.push({ publisher: { in: filters.publishers } })
    }

    if (bookFilters.length > 0) {
      where.book = { AND: bookFilters }
    }
  }

  // Year range filter
  if (filters.minYear !== undefined || filters.maxYear !== undefined) {
    const yearFilter: Record<string, number> = {}
    if (filters.minYear !== undefined) yearFilter.gte = filters.minYear as number
    if (filters.maxYear !== undefined) yearFilter.lte = filters.maxYear as number
    where.year = yearFilter
  }

  return where
}

/**
 * Format collection for JSON export
 */
function formatCollection(items: Record<string, unknown>[], collectionType: CollectionType) {
  return items.map((item) => {
    const formatted: Record<string, unknown> = {
      id: item.id,
      title: item.title,
      year: item.year,
      language: item.language,
      country: item.country,
      copies: item.copies,
      price: item.price,
      description: item.description,
      coverUrl: item.coverUrl,
      tags: item.tags ? parseJsonArray(item.tags as string) : [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }

    // Add type-specific fields
    if (collectionType === CollectionType.VIDEOGAME && item.videogame) {
      const videogame = item.videogame as Record<string, unknown>
      formatted.platform = videogame.platform
      formatted.publisher = videogame.publisher
      formatted.developer = videogame.developer
      formatted.region = videogame.region
      formatted.edition = videogame.edition
      formatted.genres = videogame.genres ? parseJsonArray(videogame.genres as string) : []
      formatted.metacriticScore = videogame.metacriticScore
    } else if (collectionType === CollectionType.MUSIC && item.music) {
      const music = item.music as Record<string, unknown>
      formatted.artist = music.artist
      formatted.publisher = music.publisher
      formatted.format = music.format
      formatted.discCount = music.discCount
      formatted.genres = music.genres ? parseJsonArray(music.genres as string) : []
      formatted.tracklist = music.tracklist
    } else if (collectionType === CollectionType.BOOK && item.book) {
      const book = item.book as Record<string, unknown>
      formatted.type = book.type
      formatted.author = book.author
      formatted.volume = book.volume
      formatted.series = book.series
      formatted.publisher = book.publisher
      formatted.coverType = book.coverType
      formatted.genres = book.genres ? parseJsonArray(book.genres as string) : []
    }

    return formatted
  })
}

/**
 * Parse JSON array string
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
