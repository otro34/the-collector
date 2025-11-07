/**
 * Types for Discogs API responses
 */

export interface DiscogsSearchResult {
  id: number
  title: string
  artist: string
  year?: number
  label?: string
  format?: string
  coverUrl?: string
  barcode?: string
  country?: string
  genres?: string[]
  styles?: string[]
  releaseUrl?: string
  source: 'discogs'
}

export interface DiscogsLookupResult {
  title: string
  artist: string
  year?: number
  label?: string
  format?: string
  coverUrl?: string
  barcode?: string
  country?: string
  genres?: string[]
  styles?: string[]
  tracks?: string[]
  source: 'discogs'
}

export interface DiscogsSearchResponse {
  results: DiscogsSearchResult[]
  pagination: {
    page: number
    pages: number
    perPage: number
    items: number
  }
}

export interface DiscogsAPISearchResult {
  id: number
  type: string
  title: string
  year?: string
  format?: string[]
  label?: string[]
  country?: string
  genre?: string[]
  style?: string[]
  cover_image?: string
  thumb?: string
  resource_url: string
  barcode?: string[]
}

export interface DiscogsAPISearchResponse {
  results: DiscogsAPISearchResult[]
  pagination: {
    page: number
    pages: number
    per_page: number
    items: number
    urls: {
      last?: string
      next?: string
    }
  }
}

export interface DiscogsLookupError {
  error: string
  query: string
  details?: string
}
