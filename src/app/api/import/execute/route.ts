import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { CollectionType } from '@prisma/client'
import { z } from 'zod'

/**
 * POST /api/import/execute
 *
 * Executes the import of CSV data into the database.
 *
 * Request body (JSON):
 * - collectionType: 'VIDEOGAME' | 'MUSIC' | 'BOOK'
 * - data: Array of mapped CSV rows (already transformed to match database fields)
 * - columnMapping: Record<string, string> - mapping from CSV columns to DB fields
 *
 * Response:
 * - success: boolean
 * - imported: number - count of successfully imported items
 * - failed: number - count of failed items
 * - errors: Array of import errors
 * - duration: number - import duration in ms
 */

interface ImportRequest {
  collectionType: CollectionType
  data: Record<string, unknown>[]
  columnMapping: Record<string, string>
}

interface ImportError {
  row: number
  field?: string
  message: string
  value?: unknown
}

interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: ImportError[]
  duration: number
}

// Zod schemas for validation
const videogameImportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  platform: z.string().min(1, 'Platform is required'),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  developer: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  edition: z.string().optional().nullable(),
  genres: z.string().optional().nullable(),
  metacriticScore: z.coerce.number().int().min(0).max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  language: z.string().optional().nullable(),
  copies: z.coerce.number().int().min(1).optional().nullable(),
  priceEstimate: z.coerce.number().positive().optional().nullable(),
})

const musicImportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  format: z.string().optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  publisher: z.string().optional().nullable(),
  discCount: z.coerce.number().int().min(1).optional().nullable(),
  genres: z.string().optional().nullable(),
  tracklist: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  language: z.string().optional().nullable(),
  copies: z.coerce.number().int().min(1).optional().nullable(),
  priceEstimate: z.coerce.number().positive().optional().nullable(),
})

const bookImportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  type: z.enum(['MANGA', 'COMIC', 'GRAPHIC_NOVEL', 'OTHER']).optional().nullable(),
  volume: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  genres: z.string().optional().nullable(),
  coverType: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  language: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  copies: z.coerce.number().int().min(1).optional().nullable(),
  priceEstimate: z.coerce.number().positive().optional().nullable(),
})

/**
 * Get the appropriate validation schema for the collection type
 */
function getValidationSchema(collectionType: CollectionType) {
  switch (collectionType) {
    case 'VIDEOGAME':
      return videogameImportSchema
    case 'MUSIC':
      return musicImportSchema
    case 'BOOK':
      return bookImportSchema
    default:
      throw new Error(`Unsupported collection type: ${collectionType}`)
  }
}

/**
 * Transform CSV row to database format using column mapping
 */
function transformRow(
  csvRow: Record<string, unknown>,
  columnMapping: Record<string, string>
): Record<string, unknown> {
  const transformed: Record<string, unknown> = {}

  // Apply column mapping
  for (const [csvColumn, dbField] of Object.entries(columnMapping)) {
    if (dbField && csvRow[csvColumn] !== undefined) {
      transformed[dbField] = csvRow[csvColumn]
    }
  }

  return transformed
}

/**
 * Validate and prepare a row for import
 */
function validateRow(
  row: Record<string, unknown>,
  schema: z.ZodSchema,
  rowIndex: number
): { valid: boolean; data?: Record<string, unknown>; errors: ImportError[] } {
  try {
    const validated = schema.parse(row)
    return { valid: true, data: validated as Record<string, unknown>, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ImportError[] = error.issues.map((err: z.ZodIssue) => ({
        row: rowIndex + 1,
        field: err.path.join('.'),
        message: err.message,
        value: row[err.path[0] as string],
      }))
      return { valid: false, errors }
    }
    return {
      valid: false,
      errors: [
        {
          row: rowIndex + 1,
          message: error instanceof Error ? error.message : 'Unknown validation error',
        },
      ],
    }
  }
}

/**
 * Helper to parse genres string to JSON string for database
 */
function parseGenresToJSON(genres: string | null | undefined): string {
  if (!genres) return '[]'
  const genreArray = genres
    .split(',')
    .map((g) => g.trim())
    .filter((g) => g.length > 0)
  return JSON.stringify(genreArray)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = (await request.json()) as ImportRequest
    const { collectionType, data, columnMapping } = body

    // Validate collection type
    if (!collectionType || !['VIDEOGAME', 'MUSIC', 'BOOK'].includes(collectionType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid collection type',
        },
        { status: 400 }
      )
    }

    // Validate data exists
    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No data provided for import',
        },
        { status: 400 }
      )
    }

    const schema = getValidationSchema(collectionType)
    const allErrors: ImportError[] = []
    const validRows: Array<{ index: number; data: Record<string, unknown> }> = []

    // Phase 1: Transform and validate all rows
    for (let i = 0; i < data.length; i++) {
      const csvRow = data[i]
      const transformedRow = transformRow(csvRow, columnMapping)
      const validation = validateRow(transformedRow, schema, i)

      if (validation.valid && validation.data) {
        validRows.push({ index: i, data: validation.data })
      } else {
        allErrors.push(...validation.errors)
      }
    }

    // Phase 2: Import valid rows in a transaction
    let imported = 0
    const importErrors: ImportError[] = []

    try {
      await prisma.$transaction(async (tx) => {
        for (const { index, data: rowData } of validRows) {
          try {
            // Prepare item data based on collection type
            const itemData = {
              collectionType,
              title: rowData.title as string,
              year: (rowData.year as number) || null,
              language: (rowData.language as string) || null,
              copies: (rowData.copies as number) || 1,
              price: (rowData.priceEstimate as number) || null,
              description: (rowData.description as string) || null,
              coverUrl: (rowData.coverUrl as string) || null,
              country: (rowData.country as string) || null,
            }

            // Create item using Prisma based on collection type
            if (collectionType === 'VIDEOGAME') {
              await tx.item.create({
                data: {
                  ...itemData,
                  videogame: {
                    create: {
                      platform: rowData.platform as string,
                      developer: (rowData.developer as string) || null,
                      publisher: (rowData.publisher as string) || null,
                      region: (rowData.region as string) || null,
                      edition: (rowData.edition as string) || null,
                      genres: parseGenresToJSON(rowData.genres as string),
                      metacriticScore: (rowData.metacriticScore as number) || null,
                    },
                  },
                },
              })
            } else if (collectionType === 'MUSIC') {
              await tx.item.create({
                data: {
                  ...itemData,
                  music: {
                    create: {
                      artist: rowData.artist as string,
                      format: (rowData.format as string) || 'Unknown',
                      publisher: (rowData.publisher as string) || null,
                      discCount: (rowData.discCount as string) || null,
                      genres: parseGenresToJSON(rowData.genres as string),
                      tracklist: (rowData.tracklist as string) || null,
                    },
                  },
                },
              })
            } else if (collectionType === 'BOOK') {
              await tx.item.create({
                data: {
                  ...itemData,
                  book: {
                    create: {
                      author: rowData.author as string,
                      type:
                        (rowData.type as 'MANGA' | 'COMIC' | 'GRAPHIC_NOVEL' | 'OTHER') || 'OTHER',
                      volume: (rowData.volume as string) || null,
                      series: (rowData.series as string) || null,
                      publisher: (rowData.publisher as string) || null,
                      genres: parseGenresToJSON(rowData.genres as string),
                      coverType: (rowData.coverType as string) || null,
                    },
                  },
                },
              })
            }

            imported++
          } catch (error) {
            importErrors.push({
              row: index + 1,
              message: error instanceof Error ? error.message : 'Failed to import row',
            })
          }
        }
      })
    } catch (error) {
      console.error('Transaction error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Database transaction failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime

    const result: ImportResult = {
      success: true,
      imported,
      failed: allErrors.length + importErrors.length,
      errors: [...allErrors, ...importErrors],
      duration,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
      },
      { status: 500 }
    )
  }
}
