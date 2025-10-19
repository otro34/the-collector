import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Fetch all music items with their data
    const musicItems = await prisma.music.findMany({
      include: {
        item: {
          select: {
            year: true,
          },
        },
      },
    })

    // Extract unique formats
    const formats = Array.from(
      new Set(musicItems.map((music) => music.format).filter(Boolean))
    ).sort()

    // Extract unique artists
    const artists = Array.from(
      new Set(musicItems.map((music) => music.artist).filter(Boolean))
    ).sort()

    // Extract unique genres from JSON strings
    const genresSet = new Set<string>()
    musicItems.forEach((music) => {
      if (music.genres) {
        try {
          const genres = JSON.parse(music.genres) as string[]
          genres.forEach((genre) => {
            if (genre && genre.trim()) {
              genresSet.add(genre.trim())
            }
          })
        } catch {
          // Skip invalid JSON
        }
      }
    })
    const genres = Array.from(genresSet).sort()

    // Calculate year range
    const years = musicItems
      .map((music) => music.item.year)
      .filter((year): year is number => year !== null && year !== undefined)

    const yearRange: [number, number] | undefined =
      years.length > 0 ? [Math.min(...years), Math.max(...years)] : undefined

    return NextResponse.json({
      formats,
      genres,
      artists,
      yearRange,
    })
  } catch (error) {
    console.error('Failed to fetch music filters:', error)
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 })
  }
}
