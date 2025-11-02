/**
 * Types for ISBN lookup API responses
 */

export interface ISBNLookupResult {
  isbn: string
  isbn13?: string
  title: string
  authors: string[]
  publisher?: string
  publishedDate?: string
  year?: number
  description?: string
  coverUrl?: string
  pageCount?: number
  language?: string
  categories?: string[]
  source: 'openlibrary' | 'google' | 'manual'
}

export interface OpenLibraryBook {
  title: string
  authors?: Array<{ name: string }>
  publishers?: Array<{ name: string }>
  publish_date?: string
  number_of_pages?: number
  cover?: {
    small?: string
    medium?: string
    large?: string
  }
  subjects?: Array<{ name: string }>
  identifiers?: {
    isbn_10?: string[]
    isbn_13?: string[]
  }
}

export interface GoogleBooksVolume {
  volumeInfo: {
    title: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    pageCount?: number
    categories?: string[]
    language?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
  }
}

export interface ISBNLookupError {
  error: string
  isbn: string
  details?: string
}
