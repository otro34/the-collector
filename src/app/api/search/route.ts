import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Item, Videogame, Music, Book } from '@prisma/client'

type ItemWithVideogame = Item & { videogame: Videogame | null }
type ItemWithMusic = Item & { music: Music | null }
type ItemWithBook = Item & { book: Book | null }

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = query.trim()

    // Search across all collections
    const [videogames, music, books] = await Promise.all([
      // Search videogames
      prisma.item.findMany({
        where: {
          collectionType: 'VIDEOGAME',
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            {
              videogame: {
                developer: { contains: searchTerm },
              },
            },
            {
              videogame: {
                publisher: { contains: searchTerm },
              },
            },
          ],
        },
        include: {
          videogame: true,
        },
        take: 5, // Limit results per collection
        orderBy: {
          updatedAt: 'desc',
        },
      }),

      // Search music
      prisma.item.findMany({
        where: {
          collectionType: 'MUSIC',
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            {
              music: {
                artist: { contains: searchTerm },
              },
            },
            {
              music: {
                publisher: { contains: searchTerm },
              },
            },
          ],
        },
        include: {
          music: true,
        },
        take: 5,
        orderBy: {
          updatedAt: 'desc',
        },
      }),

      // Search books
      prisma.item.findMany({
        where: {
          collectionType: 'BOOK',
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            {
              book: {
                author: { contains: searchTerm },
              },
            },
            {
              book: {
                publisher: { contains: searchTerm },
              },
            },
            {
              book: {
                series: { contains: searchTerm },
              },
            },
          ],
        },
        include: {
          book: true,
        },
        take: 5,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ])

    // Combine and format results
    const results = [
      ...(videogames as ItemWithVideogame[]).map((item) => ({
        id: item.id,
        title: item.title,
        collectionType: item.collectionType,
        coverUrl: item.coverUrl,
        year: item.year,
        subtitle: item.videogame?.platform || item.videogame?.developer || 'Video Game',
      })),
      ...(music as ItemWithMusic[]).map((item) => ({
        id: item.id,
        title: item.title,
        collectionType: item.collectionType,
        coverUrl: item.coverUrl,
        year: item.year,
        subtitle: item.music?.artist || 'Music Album',
      })),
      ...(books as ItemWithBook[]).map((item) => ({
        id: item.id,
        title: item.title,
        collectionType: item.collectionType,
        coverUrl: item.coverUrl,
        year: item.year,
        subtitle: item.book?.author || item.book?.series || 'Book',
      })),
    ]

    return NextResponse.json({ results, query: searchTerm })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Failed to search items' }, { status: 500 })
  }
}
