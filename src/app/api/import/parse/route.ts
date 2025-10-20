import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { parseCollectionCSV } from '@/lib/csv-parser'
import type { CollectionType } from '@prisma/client'

/**
 * POST /api/import/parse
 *
 * Handles CSV file upload, parses it, and returns a preview of the data.
 *
 * Request body (multipart/form-data):
 * - file: CSV file
 * - collectionType: 'VIDEOGAME' | 'MUSIC' | 'BOOK'
 *
 * Response:
 * - success: boolean
 * - preview: First 10 rows of parsed data
 * - columns: Array of detected column names
 * - totalRows: Total number of rows in the CSV
 * - errors: Array of validation errors (if any)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const collectionType = formData.get('collectionType') as CollectionType | null

    // Validate file exists
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Only CSV files are accepted.',
        },
        { status: 400 }
      )
    }

    // Validate collection type
    if (!collectionType || !['VIDEOGAME', 'MUSIC', 'BOOK'].includes(collectionType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid collection type. Must be VIDEOGAME, MUSIC, or BOOK.',
        },
        { status: 400 }
      )
    }

    // Read file contents
    const fileContents = await file.text()

    // Parse CSV using existing csv-parser utility
    const parseResult = await parseCollectionCSV(fileContents, collectionType)

    // Extract column names from the first valid row or errors
    const columns = parseResult.data.length > 0 ? Object.keys(parseResult.data[0]) : []

    // Get preview (first 10 rows)
    const preview = parseResult.data.slice(0, 10)

    // Format errors for response
    const errors = parseResult.errors.map((err) => ({
      row: err.row,
      field: err.field,
      message: err.message,
      value: err.value,
    }))

    return NextResponse.json({
      success: true,
      preview,
      fullData: parseResult.data, // Include full dataset for import
      columns,
      totalRows: parseResult.stats.totalRows,
      validRows: parseResult.stats.validRows,
      invalidRows: parseResult.stats.invalidRows,
      errors: errors.slice(0, 20), // Limit errors to first 20
    })
  } catch (error) {
    console.error('CSV parse error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse CSV file',
      },
      { status: 500 }
    )
  }
}
