import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { BookType } from '@prisma/client'

// Types for insights response
interface SeriesInsight {
  series: string
  totalVolumes: number
  ownedVolumes: number
  readVolumes: number
  completionPercentage: number
  isComplete: boolean
  missingVolumes: string[]
  items: Array<{
    id: string
    title: string
    volume: string | null
    isRead: boolean
    coverUrl: string | null
  }>
}

interface ReadingStats {
  totalBooks: number
  totalRead: number
  totalUnread: number
  readPercentage: number
  totalComics: number
  totalManga: number
  totalGraphicNovels: number
  readComics: number
  readManga: number
  readGraphicNovels: number
  recentlyCompleted: Array<{
    id: string
    title: string
    completedAt: Date
    coverUrl: string | null
    type: BookType
  }>
}

interface CollectionInsights {
  stats: ReadingStats
  completeSeries: SeriesInsight[]
  incompleteSeries: SeriesInsight[]
}

// Helper function to extract volume number from various formats
function extractVolumeNumber(volumeStr: string | null): number | null {
  if (!volumeStr) return null

  // Try to extract number from patterns like:
  // "1", "Vol. 1", "Volume 1", "#1", "01", etc.
  const match = volumeStr.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

// Helper function to determine missing volumes in a series
function findMissingVolumes(volumes: number[]): string[] {
  if (volumes.length === 0) return []

  const sortedVolumes = [...volumes].sort((a, b) => a - b)
  const min = sortedVolumes[0]
  const max = sortedVolumes[sortedVolumes.length - 1]

  const missing: string[] = []
  for (let i = min; i <= max; i++) {
    if (!sortedVolumes.includes(i)) {
      missing.push(i.toString())
    }
  }

  return missing
}

// GET /api/insights?bookType=MANGA (optional filter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookTypeParam = searchParams.get('bookType')

    // Validate bookType if provided
    let bookTypeFilter: BookType | undefined
    if (bookTypeParam) {
      if (!['MANGA', 'COMIC', 'GRAPHIC_NOVEL'].includes(bookTypeParam)) {
        return NextResponse.json(
          { error: 'Invalid bookType. Must be one of: MANGA, COMIC, GRAPHIC_NOVEL' },
          { status: 400 }
        )
      }
      bookTypeFilter = bookTypeParam as BookType
    }

    // Fetch all books with their reading progress
    const books = await prisma.item.findMany({
      where: {
        collectionType: 'BOOK',
        ...(bookTypeFilter && {
          book: {
            type: bookTypeFilter,
          },
        }),
      },
      include: {
        book: true,
        readingProgress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate reading statistics
    const stats: ReadingStats = {
      totalBooks: books.length,
      totalRead: books.filter((b) => b.readingProgress?.isRead).length,
      totalUnread: books.filter((b) => !b.readingProgress?.isRead).length,
      readPercentage:
        books.length > 0
          ? Math.round((books.filter((b) => b.readingProgress?.isRead).length / books.length) * 100)
          : 0,
      totalComics: books.filter((b) => b.book?.type === 'COMIC').length,
      totalManga: books.filter((b) => b.book?.type === 'MANGA').length,
      totalGraphicNovels: books.filter((b) => b.book?.type === 'GRAPHIC_NOVEL').length,
      readComics: books.filter((b) => b.book?.type === 'COMIC' && b.readingProgress?.isRead).length,
      readManga: books.filter((b) => b.book?.type === 'MANGA' && b.readingProgress?.isRead).length,
      readGraphicNovels: books.filter(
        (b) => b.book?.type === 'GRAPHIC_NOVEL' && b.readingProgress?.isRead
      ).length,
      recentlyCompleted: books
        .filter((b) => b.readingProgress?.isRead && b.readingProgress?.completedAt)
        .sort((a, b) => {
          const dateA = a.readingProgress!.completedAt!
          const dateB = b.readingProgress!.completedAt!
          return dateB.getTime() - dateA.getTime()
        })
        .slice(0, 5)
        .map((b) => ({
          id: b.id,
          title: b.title,
          completedAt: b.readingProgress!.completedAt!,
          coverUrl: b.coverUrl,
          type: b.book!.type,
        })),
    }

    // Group books by series
    const seriesMap = new Map<string, typeof books>()

    books.forEach((book) => {
      const series = book.book?.series
      if (series && series.trim() !== '') {
        const existing = seriesMap.get(series) || []
        seriesMap.set(series, [...existing, book])
      }
    })

    // Analyze each series for completion
    const seriesInsights: SeriesInsight[] = []

    seriesMap.forEach((seriesBooks, seriesName) => {
      const volumeNumbers = seriesBooks
        .map((b) => extractVolumeNumber(b.book?.volume || null))
        .filter((v): v is number => v !== null)

      const totalVolumes = seriesBooks.length
      const readVolumes = seriesBooks.filter((b) => b.readingProgress?.isRead).length
      const completionPercentage =
        totalVolumes > 0 ? Math.round((readVolumes / totalVolumes) * 100) : 0

      const missingVolumes = findMissingVolumes(volumeNumbers)
      // A series is complete if:
      // 1. It has volume numbers and no gaps in the sequence, OR
      // 2. It has no volume numbers but all items are read
      const isComplete =
        volumeNumbers.length > 0
          ? missingVolumes.length === 0
          : readVolumes === totalVolumes && totalVolumes > 0

      const insight: SeriesInsight = {
        series: seriesName,
        totalVolumes,
        ownedVolumes: totalVolumes,
        readVolumes,
        completionPercentage,
        isComplete,
        missingVolumes,
        items: seriesBooks
          .sort((a, b) => {
            const volA = extractVolumeNumber(a.book?.volume || null) || 0
            const volB = extractVolumeNumber(b.book?.volume || null) || 0
            return volA - volB
          })
          .map((b) => ({
            id: b.id,
            title: b.title,
            volume: b.book?.volume || null,
            isRead: b.readingProgress?.isRead || false,
            coverUrl: b.coverUrl,
          })),
      }

      seriesInsights.push(insight)
    })

    // Sort series by completion percentage (descending) and then by name
    seriesInsights.sort((a, b) => {
      if (b.completionPercentage !== a.completionPercentage) {
        return b.completionPercentage - a.completionPercentage
      }
      return a.series.localeCompare(b.series)
    })

    // Separate complete and incomplete series
    const completeSeries = seriesInsights.filter((s) => s.isComplete)
    const incompleteSeries = seriesInsights.filter((s) => !s.isComplete)

    const insights: CollectionInsights = {
      stats,
      completeSeries,
      incompleteSeries,
    }

    return NextResponse.json({
      success: true,
      insights,
    })
  } catch (error) {
    console.error('Get insights error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch collection insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
