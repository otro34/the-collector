import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CollectionType } from '@prisma/client'

export async function GET() {
  try {
    // Fetch all books with their related data
    const books = await prisma.item.findMany({
      where: {
        collectionType: CollectionType.BOOK,
      },
      include: {
        book: true,
      },
    })

    // Extract unique book types
    const bookTypes = Array.from(
      new Set(
        books.map((item) => item.book?.type).filter((type) => type !== null && type !== undefined)
      )
    ).sort()

    // Extract unique genres (stored as JSON arrays)
    const genresSet = new Set<string>()
    books.forEach((item) => {
      if (item.book?.genres) {
        try {
          const genres = JSON.parse(item.book.genres)
          if (Array.isArray(genres)) {
            genres.forEach((genre) => {
              if (typeof genre === 'string' && genre.trim()) {
                genresSet.add(genre.trim())
              }
            })
          }
        } catch {
          // Ignore parsing errors
        }
      }
    })
    const genres = Array.from(genresSet).sort()

    // Extract unique authors
    const authors = Array.from(
      new Set(
        books
          .map((item) => item.book?.author)
          .filter((author): author is string => author !== null && author !== undefined)
      )
    ).sort()

    // Extract unique series (filter out null/undefined)
    const series = Array.from(
      new Set(
        books
          .map((item) => item.book?.series)
          .filter((s): s is string => s !== null && s !== undefined && s.trim() !== '')
      )
    ).sort()

    // Extract unique publishers
    const publishers = Array.from(
      new Set(
        books
          .map((item) => item.book?.publisher)
          .filter(
            (publisher): publisher is string =>
              publisher !== null && publisher !== undefined && publisher.trim() !== ''
          )
      )
    ).sort()

    // Calculate year range
    const years = books.map((item) => item.year).filter((year): year is number => year !== null)
    const yearRange: [number, number] | undefined =
      years.length > 0 ? [Math.min(...years), Math.max(...years)] : undefined

    return NextResponse.json({
      bookTypes,
      genres,
      authors,
      series,
      publishers,
      yearRange,
    })
  } catch (error) {
    console.error('Books filters API error:', error)
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 })
  }
}
