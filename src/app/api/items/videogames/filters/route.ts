import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Fetch all videogames with their data
    const videogames = await prisma.videogame.findMany({
      include: {
        item: {
          select: {
            year: true,
          },
        },
      },
    })

    // Extract unique platforms
    const platforms = Array.from(
      new Set(videogames.map((vg) => vg.platform).filter(Boolean))
    ).sort()

    // Extract unique publishers
    const publishers = Array.from(
      new Set(
        videogames
          .map((vg) => vg.publisher)
          .filter(Boolean)
          .filter((p): p is string => p !== null)
      )
    ).sort()

    // Extract unique genres from JSON strings
    const genresSet = new Set<string>()
    videogames.forEach((vg) => {
      if (vg.genres) {
        try {
          const genres = JSON.parse(vg.genres) as string[]
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
    const years = videogames
      .map((vg) => vg.item.year)
      .filter((year): year is number => year !== null && year !== undefined)

    const yearRange: [number, number] | undefined =
      years.length > 0 ? [Math.min(...years), Math.max(...years)] : undefined

    return NextResponse.json({
      platforms,
      genres,
      publishers,
      yearRange,
    })
  } catch (error) {
    console.error('Failed to fetch videogame filters:', error)
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 })
  }
}
