import { type NextRequest, NextResponse } from 'next/server'
import { isValidISBN, cleanISBN, isbn10ToISBN13 } from '@/lib/isbn'
import type { ISBNLookupResult, ISBNLookupError } from '@/types/isbn'

// Timeout for external API calls (in milliseconds)
const API_TIMEOUT_MS = 10000

/**
 * Fetches book data from Open Library API
 */
async function fetchFromOpenLibrary(isbn: string): Promise<ISBNLookupResult | null> {
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'The-Collector/1.0 (Collection Management App)',
      },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const bookKey = `ISBN:${isbn}`
    const book = data[bookKey]

    if (!book) {
      return null
    }

    // Extract year from publish_date
    let year: number | undefined
    if (book.publish_date) {
      const yearMatch = book.publish_date.match(/\d{4}/)
      if (yearMatch) {
        year = parseInt(yearMatch[0], 10)
      }
    }

    // Get cover URL (prefer large, fallback to medium, then small)
    let coverUrl: string | undefined
    if (book.cover) {
      coverUrl = book.cover.large || book.cover.medium || book.cover.small
    }

    // Extract authors
    const authors = book.authors?.map((author: { name: string }) => author.name) || []

    // Extract publisher (take first one if multiple)
    const publisher = book.publishers?.[0]?.name

    // Extract categories from subjects
    const categories =
      book.subjects?.slice(0, 5).map((subject: { name: string }) => subject.name) || []

    return {
      isbn: cleanISBN(isbn),
      isbn13: book.identifiers?.isbn_13?.[0],
      title: book.title || '',
      authors,
      publisher,
      publishedDate: book.publish_date,
      year,
      description: book.notes || undefined,
      coverUrl,
      pageCount: book.number_of_pages,
      categories,
      source: 'openlibrary',
    }
  } catch (error) {
    console.error('Open Library API error:', error)
    return null
  }
}

/**
 * Fetches book data from Google Books API
 */
async function fetchFromGoogleBooks(isbn: string): Promise<ISBNLookupResult | null> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    const response = await fetch(url, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const book = data.items[0].volumeInfo

    // Extract year from publishedDate
    let year: number | undefined
    if (book.publishedDate) {
      const yearMatch = book.publishedDate.match(/\d{4}/)
      if (yearMatch) {
        year = parseInt(yearMatch[0], 10)
      }
    }

    // Get cover URL (prefer thumbnail over smallThumbnail)
    let coverUrl: string | undefined
    if (book.imageLinks) {
      coverUrl = book.imageLinks.thumbnail || book.imageLinks.smallThumbnail
      // Google returns http, convert to https
      if (coverUrl) {
        coverUrl = coverUrl.replace('http://', 'https://')
      }
    }

    // Extract ISBN-13 from industry identifiers
    let isbn13: string | undefined
    if (book.industryIdentifiers) {
      const isbn13Identifier = book.industryIdentifiers.find(
        (id: { type: string; identifier: string }) => id.type === 'ISBN_13'
      )
      isbn13 = isbn13Identifier?.identifier
    }

    return {
      isbn: cleanISBN(isbn),
      isbn13,
      title: book.title || '',
      authors: book.authors || [],
      publisher: book.publisher,
      publishedDate: book.publishedDate,
      year,
      description: book.description,
      coverUrl,
      pageCount: book.pageCount,
      language: book.language,
      categories: book.categories,
      source: 'google',
    }
  } catch (error) {
    console.error('Google Books API error:', error)
    return null
  }
}

/**
 * GET /api/isbn/lookup?isbn={isbn}
 * Looks up book information by ISBN from multiple sources
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const isbnParam = searchParams.get('isbn')

    if (!isbnParam) {
      return NextResponse.json(
        {
          error: 'ISBN parameter is required',
          isbn: '',
          details: 'Please provide an ISBN in the query parameter',
        } as ISBNLookupError,
        { status: 400 }
      )
    }

    const isbn = cleanISBN(isbnParam)

    // Validate ISBN
    if (!isValidISBN(isbn)) {
      return NextResponse.json(
        {
          error: 'Invalid ISBN',
          isbn: isbnParam,
          details: 'The provided ISBN is not valid. Please check the format (ISBN-10 or ISBN-13).',
        } as ISBNLookupError,
        { status: 400 }
      )
    }

    // Convert ISBN-10 to ISBN-13 for better API compatibility
    let searchISBN = isbn
    if (isbn.length === 10) {
      const isbn13 = isbn10ToISBN13(isbn)
      if (isbn13) {
        searchISBN = isbn13
      }
    }

    // Try Open Library first
    let result = await fetchFromOpenLibrary(searchISBN)

    // If Open Library fails, try Google Books
    if (!result) {
      result = await fetchFromGoogleBooks(searchISBN)
    }

    // If both fail, return not found
    if (!result) {
      return NextResponse.json(
        {
          error: 'Book not found',
          isbn: isbnParam,
          details: 'No book found with this ISBN in available databases.',
        } as ISBNLookupError,
        { status: 404 }
      )
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('ISBN lookup error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        isbn: '',
        details: 'An unexpected error occurred while looking up the ISBN.',
      } as ISBNLookupError,
      { status: 500 }
    )
  }
}
