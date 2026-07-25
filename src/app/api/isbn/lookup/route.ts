import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isValidISBN, cleanISBN, isbn10ToISBN13 } from '@/lib/isbn'
import type { ISBNLookupResult, ISBNLookupError } from '@/types/isbn'

// Timeout for external API calls (in milliseconds)
const API_TIMEOUT_MS = 10000
// Gemini grounded search is slower (web search + generation), so allow more time
const GEMINI_TIMEOUT_MS = 20000

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
    // Reuse the project's Google API key (same one used for Custom Search image
    // search). The keyless quota is effectively zero, so a key is required for
    // this fallback to work. Falls through gracefully if the key is absent.
    const apiKey = process.env.GOOGLE_API_KEY
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${
      apiKey ? `&key=${apiKey}` : ''
    }`
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
 * Shape we ask Gemini to return. Kept lenient — the model may omit fields or
 * return numbers as strings, so numeric fields are coerced and validation
 * failures fall through to `null` rather than throwing.
 */
const geminiBookSchema = z.object({
  found: z.boolean().optional(),
  title: z.string().optional(),
  authors: z.array(z.string()).optional(),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  year: z.coerce.number().optional().catch(undefined),
  description: z.string().optional(),
  pageCount: z.coerce.number().optional().catch(undefined),
  language: z.string().optional(),
  categories: z.array(z.string()).optional(),
})

/**
 * Fetches book data from Gemini with Google Search grounding.
 *
 * Last-resort fallback for books missing from Open Library and Google Books
 * (e.g. recent or non-English titles). Gemini searches the live web and returns
 * structured JSON, which we validate with Zod before trusting.
 *
 * Requires GEMINI_API_KEY (a separate key from GOOGLE_API_KEY). Returns null
 * gracefully when the key is absent or the lookup fails/does not find a match.
 *
 * Results are AI-sourced and may be imperfect — the client flags them for user
 * verification via `source: 'gemini'`. Cover images are intentionally omitted
 * to avoid hallucinated image URLs.
 */
async function fetchFromGemini(isbn: string): Promise<ISBNLookupResult | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return null
  }

  // Auto-updating Flash alias — avoids breakage when Google retires pinned
  // version IDs (e.g. gemini-2.5-flash) for new keys. Override via GEMINI_MODEL.
  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest'

  try {
    const prompt = [
      `Search the web for the book with ISBN ${isbn}.`,
      'Respond with ONLY a JSON object (no markdown fences, no prose) using these fields:',
      'title (string), authors (string array), publisher (string), publishedDate (string),',
      'year (number), description (string), pageCount (number), language (ISO 639-1 code),',
      'categories (string array).',
      'Only include fields you are confident are correct; omit any you are unsure about.',
      'If you cannot find a real book with this ISBN, respond with exactly {"found": false}.',
    ].join(' ')

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // Ground the answer in live web search instead of parametric memory
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0 },
      }),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const parts: Array<{ text?: string }> = data?.candidates?.[0]?.content?.parts ?? []
    const rawText = parts
      .map((part) => part.text)
      .filter(Boolean)
      .join('')
      .trim()

    if (!rawText) {
      return null
    }

    // Extract the JSON object from the (possibly fenced or prose-wrapped) text
    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) {
      return null
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(rawText.slice(start, end + 1))
    } catch {
      return null
    }

    const validated = geminiBookSchema.safeParse(parsed)
    if (!validated.success) {
      return null
    }

    const book = validated.data
    // Model reported no match, or returned nothing usable
    if (book.found === false || !book.title) {
      return null
    }

    // Sanitize numerics (coercion can yield 0/NaN for null-ish values)
    const pageCount = book.pageCount && book.pageCount > 0 ? Math.trunc(book.pageCount) : undefined
    let year = book.year && book.year > 0 ? Math.trunc(book.year) : undefined
    if (!year && book.publishedDate) {
      const yearMatch = book.publishedDate.match(/\d{4}/)
      if (yearMatch) {
        year = parseInt(yearMatch[0], 10)
      }
    }

    return {
      isbn: cleanISBN(isbn),
      title: book.title,
      authors: book.authors ?? [],
      publisher: book.publisher,
      publishedDate: book.publishedDate,
      year,
      description: book.description,
      // coverUrl intentionally omitted — see function docs
      pageCount,
      language: book.language,
      categories: book.categories,
      source: 'gemini',
    }
  } catch (error) {
    console.error('Gemini ISBN lookup error:', error)
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

    // Last resort: Gemini grounded web search (only runs if GEMINI_API_KEY is
    // set). Covers recent/international books the free databases lack. Results
    // are AI-sourced and flagged for verification on the client.
    if (!result) {
      result = await fetchFromGemini(searchISBN)
    }

    // If all sources fail, return not found
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
