import { type NextRequest, NextResponse } from 'next/server'
import { normalizeGameTitle } from '@/lib/rawg'
import type {
  RAWGSearchResult,
  RAWGSearchResponse,
  RAWGLookupError,
  RAWGAPISearchResponse,
  RAWGAPISearchResult,
} from '@/types/rawg'

// Timeout for external API calls (in milliseconds)
const API_TIMEOUT_MS = 10000

// RAWG API key from environment variables
const RAWG_API_KEY = process.env.RAWG_API_KEY || ''

/**
 * Transforms RAWG API result to our simplified format
 */
function transformRAWGResult(result: RAWGAPISearchResult): RAWGSearchResult {
  return {
    id: result.id,
    slug: result.slug,
    name: result.name,
    released: result.released,
    backgroundImage: result.background_image,
    rating: result.rating,
    ratingTop: result.rating_top,
    platforms: result.platforms?.map((p) => ({
      platform: {
        id: p.platform.id,
        name: p.platform.name,
        slug: p.platform.slug,
      },
      releasedAt: p.released_at,
      requirements: {
        minimum: p.requirements_en?.minimum,
        recommended: p.requirements_en?.recommended,
      },
    })),
    genres: result.genres?.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
    })),
    publishers: undefined, // Publishers are not included in search results, need separate API call
    metacritic: result.metacritic,
    esrbRating: result.esrb_rating
      ? {
          id: result.esrb_rating.id,
          name: result.esrb_rating.name,
          slug: result.esrb_rating.slug,
        }
      : undefined,
    source: 'rawg',
  }
}

/**
 * Searches RAWG database by query
 */
async function searchRAWG(
  query: string,
  platform?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<RAWGSearchResponse | null> {
  try {
    // Build the search URL
    const params = new URLSearchParams()

    const normalizedQuery = normalizeGameTitle(query)
    params.append('search', normalizedQuery)
    params.append('page', page.toString())
    params.append('page_size', pageSize.toString())
    params.append('key', RAWG_API_KEY)

    // Add platform filter if provided
    if (platform) {
      params.append('platforms', platform)
    }

    const url = `https://api.rawg.io/api/games?${params.toString()}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'The-Collector/1.0 +https://github.com/otro34/the-collector',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    })

    if (!response.ok) {
      console.error('RAWG API error:', response.status, response.statusText)

      // Check for rate limiting
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      // Check for invalid API key
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key or unauthorized access.')
      }

      return null
    }

    const data: RAWGAPISearchResponse = await response.json()

    if (!data.results || data.results.length === 0) {
      return {
        count: 0,
        results: [],
      }
    }

    // Transform results to our format
    const transformedResults = data.results.map(transformRAWGResult)

    return {
      count: data.count,
      next: data.next,
      previous: data.previous,
      results: transformedResults,
    }
  } catch (error) {
    console.error('RAWG search error:', error)
    throw error
  }
}

/**
 * GET /api/rawg/search?q={query}&platform={platform}&page={page}&pageSize={pageSize}
 * Searches for videogames on RAWG by title
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const platform = searchParams.get('platform')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)

    // Validate that query is provided
    if (!query) {
      return NextResponse.json(
        {
          error: 'Search query required',
          query: '',
          details: 'Please provide a search query (q) parameter',
        } as RAWGLookupError,
        { status: 400 }
      )
    }

    // Validate query length
    if (query.trim().length < 2) {
      return NextResponse.json(
        {
          error: 'Query too short',
          query,
          details: 'Search query must be at least 2 characters long',
        } as RAWGLookupError,
        { status: 400 }
      )
    }

    // Check if RAWG API is configured
    if (!RAWG_API_KEY) {
      return NextResponse.json(
        {
          error: 'RAWG API not configured',
          query,
          details:
            'RAWG API key is not configured. Please add RAWG_API_KEY to environment variables.',
        } as RAWGLookupError,
        { status: 500 }
      )
    }

    // Perform the search
    const result = await searchRAWG(query, platform || undefined, page, pageSize)

    if (!result) {
      return NextResponse.json(
        {
          error: 'Search failed',
          query,
          details: 'Failed to search RAWG database. Please try again.',
        } as RAWGLookupError,
        { status: 500 }
      )
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('RAWG search error:', error)

    // Handle rate limiting
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          query: '',
          details: 'Too many requests to RAWG API. Please try again in a few minutes.',
        } as RAWGLookupError,
        { status: 429 }
      )
    }

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Invalid API key')) {
      return NextResponse.json(
        {
          error: 'API authentication failed',
          query: '',
          details: 'Invalid RAWG API key. Please check your configuration.',
        } as RAWGLookupError,
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        query: '',
        details: 'An unexpected error occurred while searching RAWG.',
      } as RAWGLookupError,
      { status: 500 }
    )
  }
}
