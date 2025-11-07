/**
 * Types for RAWG API responses
 */

export interface RAWGSearchResult {
  id: number
  slug: string
  name: string
  released?: string
  backgroundImage?: string
  rating?: number
  ratingTop?: number
  platforms?: RAWGPlatformInfo[]
  genres?: RAWGGenre[]
  publishers?: RAWGPublisher[]
  metacritic?: number
  esrbRating?: {
    id: number
    name: string
    slug: string
  }
  source: 'rawg'
}

export interface RAWGPlatformInfo {
  platform: RAWGPlatform
  releasedAt?: string
  requirements?: {
    minimum?: string
    recommended?: string
  }
}

export interface RAWGPlatform {
  id: number
  name: string
  slug: string
}

export interface RAWGGenre {
  id: number
  name: string
  slug: string
}

export interface RAWGPublisher {
  id: number
  name: string
  slug: string
}

export interface RAWGSearchResponse {
  count: number
  next?: string
  previous?: string
  results: RAWGSearchResult[]
}

export interface RAWGAPISearchResult {
  id: number
  slug: string
  name: string
  released?: string
  tba: boolean
  background_image?: string
  rating?: number
  rating_top?: number
  ratings?: Array<{
    id: number
    title: string
    count: number
    percent: number
  }>
  ratings_count?: number
  reviews_text_count?: number
  added?: number
  added_by_status?: {
    yet?: number
    owned?: number
    beaten?: number
    toplay?: number
    dropped?: number
    playing?: number
  }
  metacritic?: number
  playtime?: number
  suggestions_count?: number
  updated?: string
  esrb_rating?: {
    id: number
    name: string
    slug: string
  }
  platforms?: Array<{
    platform: {
      id: number
      name: string
      slug: string
      image?: string
      year_end?: number
      year_start?: number
      games_count?: number
      image_background?: string
    }
    released_at?: string
    requirements_en?: {
      minimum?: string
      recommended?: string
    }
    requirements_ru?: {
      minimum?: string
      recommended?: string
    }
  }>
  parent_platforms?: Array<{
    platform: {
      id: number
      name: string
      slug: string
    }
  }>
  genres?: Array<{
    id: number
    name: string
    slug: string
    games_count?: number
    image_background?: string
  }>
  stores?: Array<{
    id: number
    store: {
      id: number
      name: string
      slug: string
      domain?: string
      games_count?: number
      image_background?: string
    }
  }>
  clip?: string | null
  tags?: Array<{
    id: number
    name: string
    slug: string
    language: string
    games_count?: number
    image_background?: string
  }>
  short_screenshots?: Array<{
    id: number
    image: string
  }>
}

export interface RAWGAPISearchResponse {
  count: number
  next?: string
  previous?: string
  results: RAWGAPISearchResult[]
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
  seo_h1?: string
  noindex?: boolean
  nofollow?: boolean
  description?: string
  filters?: {
    years?: Array<{
      from: number
      to: number
      filter: string
      decade: number
      years: Array<{
        year: number
        count: number
        nofollow: boolean
      }>
      nofollow: boolean
      count: number
    }>
  }
  nofollow_collections?: string[]
}

export interface RAWGGameDetails extends RAWGAPISearchResult {
  name_original?: string
  description?: string
  description_raw?: string
  publishers?: Array<{
    id: number
    name: string
    slug: string
    games_count?: number
    image_background?: string
  }>
  developers?: Array<{
    id: number
    name: string
    slug: string
    games_count?: number
    image_background?: string
  }>
  website?: string
  reddit_url?: string
  reddit_name?: string
  reddit_description?: string
  reddit_logo?: string
  reddit_count?: number
  twitch_count?: number
  youtube_count?: number
  reviews_count?: number
  saturated_color?: string
  dominant_color?: string
  alternative_names?: string[]
  metacritic_url?: string
  parents_count?: number
  additions_count?: number
  game_series_count?: number
  screenshots_count?: number
  movies_count?: number
  creators_count?: number
  achievements_count?: number
  parent_achievements_count?: number
  reddit_count_detailed?: {
    text: string
    number: number
  }
  esrb_rating?: {
    id: number
    name: string
    slug: string
    name_en?: string
    name_ru?: string
  }
}

export interface RAWGLookupError {
  error: string
  query: string
  details?: string
}
