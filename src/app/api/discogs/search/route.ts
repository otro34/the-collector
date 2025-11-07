import { type NextRequest, NextResponse } from 'next/server'
import { cleanBarcode, isValidBarcode, parseDiscogsTitle } from '@/lib/discogs'
import type {
  DiscogsSearchResult,
  DiscogsSearchResponse,
  DiscogsLookupError,
  DiscogsAPISearchResponse,
  DiscogsAPISearchResult,
} from '@/types/discogs'

// Timeout for external API calls (in milliseconds)
const API_TIMEOUT_MS = 10000

// Discogs API credentials from environment variables
const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN || ''
const DISCOGS_KEY = process.env.DISCOGS_KEY || ''
const DISCOGS_SECRET = process.env.DISCOGS_SECRET || ''

/**
 * Transforms Discogs API result to our simplified format
 */
function transformDiscogsResult(result: DiscogsAPISearchResult): DiscogsSearchResult {
  const { artist, title } = parseDiscogsTitle(result.title)

  // Parse year with validation
  let year: number | undefined
  if (result.year) {
    const parsedYear = parseInt(result.year, 10)
    year = !isNaN(parsedYear) ? parsedYear : undefined
  }

  return {
    id: result.id,
    title: title || result.title,
    artist: artist,
    year,
    label: result.label?.[0],
    format: result.format?.join(', '),
    coverUrl: result.cover_image || result.thumb,
    barcode: result.barcode?.[0],
    country: result.country,
    genres: result.genre,
    styles: result.style,
    releaseUrl: result.resource_url,
    source: 'discogs',
  }
}

/**
 * Searches Discogs database by query or barcode
 */
async function searchDiscogs(
  query?: string,
  barcode?: string,
  page: number = 1,
  perPage: number = 10
): Promise<DiscogsSearchResponse | null> {
  try {
    // Build the search URL
    const params = new URLSearchParams()

    if (query) {
      params.append('q', query)
      params.append('type', 'release') // Search only for releases (albums)
    }

    if (barcode) {
      params.append('barcode', cleanBarcode(barcode))
      params.append('type', 'release')
    }

    params.append('page', page.toString())
    params.append('per_page', perPage.toString())

    // Add authentication
    if (DISCOGS_TOKEN) {
      params.append('token', DISCOGS_TOKEN)
    } else if (DISCOGS_KEY && DISCOGS_SECRET) {
      params.append('key', DISCOGS_KEY)
      params.append('secret', DISCOGS_SECRET)
    }

    const url = `https://api.discogs.com/database/search?${params.toString()}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'The-Collector/1.0 +https://github.com/otro34/the-collector',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    })

    if (!response.ok) {
      console.error('Discogs API error:', response.status, response.statusText)

      // Check for rate limiting
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      return null
    }

    const data: DiscogsAPISearchResponse = await response.json()

    if (!data.results || data.results.length === 0) {
      return {
        results: [],
        pagination: {
          page: 1,
          pages: 1,
          perPage,
          items: 0,
        },
      }
    }

    // Transform results to our format
    const transformedResults = data.results.map(transformDiscogsResult)

    return {
      results: transformedResults,
      pagination: {
        page: data.pagination.page,
        pages: data.pagination.pages,
        perPage: data.pagination.per_page,
        items: data.pagination.items,
      },
    }
  } catch (error) {
    console.error('Discogs search error:', error)
    throw error
  }
}

/**
 * GET /api/discogs/search?q={query}&barcode={barcode}&page={page}&perPage={perPage}
 * Searches for music albums on Discogs by title or barcode
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const barcode = searchParams.get('barcode')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const perPage = parseInt(searchParams.get('perPage') || '10', 10)

    // Validate that at least one search parameter is provided
    if (!query && !barcode) {
      return NextResponse.json(
        {
          error: 'Search parameter required',
          query: '',
          details: 'Please provide either a query (q) or barcode parameter',
        } as DiscogsLookupError,
        { status: 400 }
      )
    }

    // Check if Discogs API is configured
    if (!DISCOGS_TOKEN && (!DISCOGS_KEY || !DISCOGS_SECRET)) {
      return NextResponse.json(
        {
          error: 'Discogs API not configured',
          query: query || barcode || '',
          details:
            'Discogs API credentials are not configured. Please add DISCOGS_TOKEN or DISCOGS_KEY and DISCOGS_SECRET to environment variables.',
        } as DiscogsLookupError,
        { status: 500 }
      )
    }

    // Validate barcode if provided
    if (barcode && !isValidBarcode(barcode)) {
      return NextResponse.json(
        {
          error: 'Invalid barcode',
          query: barcode,
          details: 'The provided barcode is not valid. Please check the format (UPC or EAN).',
        } as DiscogsLookupError,
        { status: 400 }
      )
    }

    // Perform the search
    const result = await searchDiscogs(query || undefined, barcode || undefined, page, perPage)

    if (!result) {
      return NextResponse.json(
        {
          error: 'Search failed',
          query: query || barcode || '',
          details: 'Failed to search Discogs database. Please try again.',
        } as DiscogsLookupError,
        { status: 500 }
      )
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Discogs search error:', error)

    // Handle rate limiting
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          query: '',
          details: 'Too many requests to Discogs API. Please try again in a few minutes.',
        } as DiscogsLookupError,
        { status: 429 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        query: '',
        details: 'An unexpected error occurred while searching Discogs.',
      } as DiscogsLookupError,
      { status: 500 }
    )
  }
}
