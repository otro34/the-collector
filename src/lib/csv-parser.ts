import Papa from 'papaparse'
import { CollectionType, BookType } from '@prisma/client'
import { z } from 'zod'

/**
 * CSV Parser utility for importing collection data
 *
 * Supports multiple CSV formats and provides:
 * - Column mapping (auto-detect and manual)
 * - Data validation with Zod schemas
 * - Error reporting with row/column details
 * - Type-safe parsing results
 */

// ============================================================================
// Types
// ============================================================================

export type CSVRow = Record<string, string | undefined>

export type ParsedCSVData = {
  headers: string[]
  rows: CSVRow[]
  meta: Papa.ParseMeta
}

export type ValidationError = {
  row: number
  field: string
  value: unknown
  message: string
}

export type ParseResult<T> = {
  success: boolean
  data: T[]
  errors: ValidationError[]
  warnings: string[]
  stats: {
    totalRows: number
    validRows: number
    invalidRows: number
    skippedRows: number
  }
}

export type ColumnMapping = {
  [csvColumn: string]: string // Maps CSV column name to database field name
}

// ============================================================================
// Column Mapping Configurations
// ============================================================================

/**
 * Default column mappings for known CSV formats
 */
export const DEFAULT_COLUMN_MAPPINGS: Record<CollectionType, ColumnMapping> = {
  VIDEOGAME: {
    ID: 'id',
    Platform: 'platform',
    Title: 'title',
    Publisher: 'publisher',
    Developer: 'developer',
    Year: 'year',
    Region: 'region',
    Edition: 'edition',
    Language: 'language',
    Copies: 'copies',
    Genres: 'genres',
    Description: 'description',
    'Metacritic Score': 'metacriticScore',
    'Price Estimate': 'priceEstimate',
    'Cover URL': 'coverUrl',
    'Source Images': 'sourceImages',
    'Data Source': 'dataSource',
  },
  MUSIC: {
    ID: 'id',
    Title: 'title',
    Artist: 'artist',
    Publisher: 'publisher',
    Year: 'year',
    Format: 'format',
    'Disc Count': 'discCount',
    Language: 'language',
    Copies: 'copies',
    Genres: 'genres',
    Description: 'description',
    Tracklist: 'tracklist',
    'Price Estimate': 'priceEstimate',
    'Cover URL': 'coverUrl',
    'Source Images': 'sourceImages',
    'Data Source': 'dataSource',
  },
  BOOK: {
    id: 'id',
    type: 'type',
    title: 'title',
    author: 'author',
    volume: 'volume',
    series: 'series',
    publisher: 'publisher',
    year: 'year',
    language: 'language',
    country: 'country',
    copies: 'copies',
    cover_type: 'coverType',
    genre: 'genres',
    description: 'description',
    cover_url: 'coverUrl',
    enrichment_status: 'enrichmentStatus',
    enrichment_date: 'enrichmentDate',
    enrichment_source: 'enrichmentSource',
    search_query: 'searchQuery',
    source_row: 'sourceRow',
    price: 'priceEstimate',
  },
}

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Zod schemas for validating parsed CSV data
 */
const baseItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  year: z
    .union([
      z.coerce.number().int().min(1900).max(2100),
      z.literal('').transform(() => null),
      z.null(),
      z.undefined(),
    ])
    .optional()
    .nullable()
    .catch(null),
  description: z.string().optional().nullable(),
  coverUrl: z.string().url().optional().nullable().or(z.literal('')).catch(null),
  copies: z.coerce.number().int().min(0).optional().nullable().catch(1),
  priceEstimate: z.string().optional().nullable(),
})

export const videogameSchema = baseItemSchema.extend({
  platform: z.string().optional().nullable().default('Unknown'),
  publisher: z.string().optional().nullable(),
  developer: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  edition: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  genres: z.string().optional().nullable(), // CSV string, will be parsed to array
  metacriticScore: z.coerce.number().int().min(0).max(100).optional().nullable().catch(null),
  sourceImages: z.string().optional().nullable(),
  dataSource: z.string().optional().nullable(),
})

export const musicSchema = baseItemSchema.extend({
  artist: z.string().optional().nullable().default('Unknown Artist'),
  publisher: z.string().optional().nullable(),
  format: z.string().optional().nullable(),
  discCount: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  genres: z.string().optional().nullable(), // CSV string, will be parsed to array
  tracklist: z.string().optional().nullable(),
  sourceImages: z.string().optional().nullable(),
  dataSource: z.string().optional().nullable(),
})

export const bookSchema = baseItemSchema.extend({
  type: z
    .nativeEnum(BookType)
    .or(z.string())
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return BookType.OTHER
      // Map string values to BookType enum
      const typeMap: Record<string, BookType> = {
        Manga: BookType.MANGA,
        Comic: BookType.COMIC,
        'Graphic Novel': BookType.GRAPHIC_NOVEL,
        Other: BookType.OTHER,
      }
      return typeMap[val] || BookType.OTHER
    }),
  author: z.string().optional().nullable().default('Unknown Author'),
  volume: z.coerce.number().int().min(0).optional().nullable().catch(null),
  series: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  coverType: z.string().optional().nullable(),
  genres: z.string().optional().nullable(), // CSV string, will be parsed to array
  enrichmentStatus: z.string().optional().nullable(),
  enrichmentDate: z.string().optional().nullable(),
  enrichmentSource: z.string().optional().nullable(),
  searchQuery: z.string().optional().nullable(),
  sourceRow: z.string().optional().nullable(),
})

export type VideogameData = z.infer<typeof videogameSchema>
export type MusicData = z.infer<typeof musicSchema>
export type BookData = z.infer<typeof bookSchema>

// ============================================================================
// CSV Parsing Functions
// ============================================================================

/**
 * Parse CSV file to raw data
 */
export function parseCSV(fileContent: string): Promise<ParsedCSVData> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data,
          meta: results.meta,
        })
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`))
      },
    })
  })
}

/**
 * Auto-detect column mapping based on CSV headers
 */
export function detectColumnMapping(
  headers: string[],
  collectionType: CollectionType
): ColumnMapping {
  const defaultMapping = DEFAULT_COLUMN_MAPPINGS[collectionType]
  const detectedMapping: ColumnMapping = {}

  // Try exact match first
  for (const header of headers) {
    if (header in defaultMapping) {
      detectedMapping[header] = defaultMapping[header]
    }
  }

  // Try case-insensitive match
  for (const header of headers) {
    if (!(header in detectedMapping)) {
      const lowerHeader = header.toLowerCase()
      for (const [key, value] of Object.entries(defaultMapping)) {
        if (key.toLowerCase() === lowerHeader) {
          detectedMapping[header] = value
          break
        }
      }
    }
  }

  return detectedMapping
}

/**
 * Apply column mapping to a CSV row
 */
export function applyColumnMapping(row: CSVRow, mapping: ColumnMapping): Record<string, unknown> {
  const mappedRow: Record<string, unknown> = {}

  for (const [csvColumn, dbField] of Object.entries(mapping)) {
    const value = row[csvColumn]
    // Only include non-empty values
    if (value !== undefined && value !== null && value.trim() !== '') {
      mappedRow[dbField] = value.trim()
    }
  }

  return mappedRow
}

/**
 * Validate a single row against schema
 */
function validateRow<T>(
  row: Record<string, unknown>,
  schema: z.ZodSchema<T>,
  rowIndex: number
): { valid: boolean; data?: T; errors: ValidationError[] } {
  try {
    const validatedData = schema.parse(row)
    return { valid: true, data: validatedData, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.issues.map((err) => ({
        row: rowIndex,
        field: err.path.join('.'),
        value: row[String(err.path[0])],
        message: err.message,
      }))
      return { valid: false, errors }
    }
    return {
      valid: false,
      errors: [
        {
          row: rowIndex,
          field: 'unknown',
          value: row,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
    }
  }
}

/**
 * Parse and validate videogame CSV data
 */
export async function parseVideogameCSV(
  fileContent: string,
  columnMapping?: ColumnMapping
): Promise<ParseResult<VideogameData>> {
  const parsed = await parseCSV(fileContent)
  const mapping = columnMapping || detectColumnMapping(parsed.headers, CollectionType.VIDEOGAME)

  const validData: VideogameData[] = []
  const allErrors: ValidationError[] = []
  const warnings: string[] = []

  let validRows = 0
  let invalidRows = 0
  let skippedRows = 0

  for (let i = 0; i < parsed.rows.length; i++) {
    const row = parsed.rows[i]

    // Skip completely empty rows
    if (Object.values(row).every((val) => !val || val.trim() === '')) {
      skippedRows++
      continue
    }

    const mappedRow = applyColumnMapping(row, mapping)
    const validation = validateRow(mappedRow, videogameSchema, i + 2) // +2 for 1-indexed and header row

    if (validation.valid && validation.data) {
      validData.push(validation.data)
      validRows++
    } else {
      allErrors.push(...validation.errors)
      invalidRows++
    }
  }

  // Add warnings for missing optional fields
  if (!mapping.coverUrl && !mapping['Cover URL']) {
    warnings.push('Cover URL column not found - items will be created without cover images')
  }

  return {
    success: invalidRows === 0,
    data: validData,
    errors: allErrors,
    warnings,
    stats: {
      totalRows: parsed.rows.length,
      validRows,
      invalidRows,
      skippedRows,
    },
  }
}

/**
 * Parse and validate music CSV data
 */
export async function parseMusicCSV(
  fileContent: string,
  columnMapping?: ColumnMapping
): Promise<ParseResult<MusicData>> {
  const parsed = await parseCSV(fileContent)
  const mapping = columnMapping || detectColumnMapping(parsed.headers, CollectionType.MUSIC)

  const validData: MusicData[] = []
  const allErrors: ValidationError[] = []
  const warnings: string[] = []

  let validRows = 0
  let invalidRows = 0
  let skippedRows = 0

  for (let i = 0; i < parsed.rows.length; i++) {
    const row = parsed.rows[i]

    if (Object.values(row).every((val) => !val || val.trim() === '')) {
      skippedRows++
      continue
    }

    const mappedRow = applyColumnMapping(row, mapping)
    const validation = validateRow(mappedRow, musicSchema, i + 2)

    if (validation.valid && validation.data) {
      validData.push(validation.data)
      validRows++
    } else {
      allErrors.push(...validation.errors)
      invalidRows++
    }
  }

  if (!mapping.coverUrl && !mapping['Cover URL']) {
    warnings.push('Cover URL column not found - items will be created without cover images')
  }

  return {
    success: invalidRows === 0,
    data: validData,
    errors: allErrors,
    warnings,
    stats: {
      totalRows: parsed.rows.length,
      validRows,
      invalidRows,
      skippedRows,
    },
  }
}

/**
 * Parse and validate book CSV data
 */
export async function parseBookCSV(
  fileContent: string,
  columnMapping?: ColumnMapping
): Promise<ParseResult<BookData>> {
  const parsed = await parseCSV(fileContent)
  const mapping = columnMapping || detectColumnMapping(parsed.headers, CollectionType.BOOK)

  const validData: BookData[] = []
  const allErrors: ValidationError[] = []
  const warnings: string[] = []

  let validRows = 0
  let invalidRows = 0
  let skippedRows = 0

  for (let i = 0; i < parsed.rows.length; i++) {
    const row = parsed.rows[i]

    if (Object.values(row).every((val) => !val || val.trim() === '')) {
      skippedRows++
      continue
    }

    const mappedRow = applyColumnMapping(row, mapping)
    const validation = validateRow(mappedRow, bookSchema, i + 2)

    if (validation.valid && validation.data) {
      validData.push(validation.data)
      validRows++
    } else {
      allErrors.push(...validation.errors)
      invalidRows++
    }
  }

  if (!mapping.coverUrl && !mapping.cover_url) {
    warnings.push('Cover URL column not found - items will be created without cover images')
  }

  return {
    success: invalidRows === 0,
    data: validData,
    errors: allErrors,
    warnings,
    stats: {
      totalRows: parsed.rows.length,
      validRows,
      invalidRows,
      skippedRows,
    },
  }
}

// ============================================================================
// Generic Parse Function
// ============================================================================

/**
 * Parse CSV based on collection type
 */
export async function parseCollectionCSV(
  fileContent: string,
  collectionType: CollectionType,
  columnMapping?: ColumnMapping
): Promise<ParseResult<VideogameData | MusicData | BookData>> {
  switch (collectionType) {
    case CollectionType.VIDEOGAME:
      return parseVideogameCSV(fileContent, columnMapping)
    case CollectionType.MUSIC:
      return parseMusicCSV(fileContent, columnMapping)
    case CollectionType.BOOK:
      return parseBookCSV(fileContent, columnMapping)
    default:
      throw new Error(`Unsupported collection type: ${collectionType}`)
  }
}

// ============================================================================
// Error Reporting Helpers
// ============================================================================

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .map(
      (err) =>
        `Row ${err.row}, Field "${err.field}": ${err.message} (value: ${JSON.stringify(err.value)})`
    )
    .join('\n')
}

/**
 * Generate error report as CSV
 */
export function generateErrorReport(errors: ValidationError[]): string {
  const headers = ['Row', 'Field', 'Value', 'Error Message']
  const rows = errors.map((err) => [
    err.row.toString(),
    err.field,
    JSON.stringify(err.value),
    err.message,
  ])

  return Papa.unparse({
    fields: headers,
    data: rows,
  })
}

/**
 * Get parse result summary
 */
export function getParseResultSummary(result: ParseResult<unknown>): string {
  const { stats, errors, warnings } = result
  const lines: string[] = []

  lines.push(`Total rows processed: ${stats.totalRows}`)
  lines.push(`Valid rows: ${stats.validRows}`)
  lines.push(`Invalid rows: ${stats.invalidRows}`)
  lines.push(`Skipped rows: ${stats.skippedRows}`)

  if (warnings.length > 0) {
    lines.push(`\nWarnings (${warnings.length}):`)
    warnings.forEach((warning) => lines.push(`- ${warning}`))
  }

  if (errors.length > 0) {
    lines.push(`\nErrors (${errors.length}):`)
    errors.slice(0, 10).forEach((error) => {
      lines.push(`- Row ${error.row}: ${error.message}`)
    })
    if (errors.length > 10) {
      lines.push(`... and ${errors.length - 10} more errors`)
    }
  }

  return lines.join('\n')
}
