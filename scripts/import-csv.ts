/* eslint-disable no-console */
import fs from 'fs/promises'
import path from 'path'
import { CollectionType } from '@prisma/client'
import {
  parseVideogameCSV,
  parseMusicCSV,
  parseBookCSV,
  getParseResultSummary,
  generateErrorReport,
} from '../src/lib/csv-parser'
import { createVideogameItem, createMusicItem, createBookItem } from '../src/lib/db-utils'
import { stringifyArray } from '../src/types/database'
import { prisma } from '../src/lib/db'

/**
 * Import script for existing CSV collection data
 *
 * This script:
 * 1. Reads CSV files from original-data/ directory
 * 2. Parses and validates data using csv-parser utility
 * 3. Imports valid data into the database
 * 4. Generates detailed import reports
 */

// ============================================================================
// Types
// ============================================================================

type ImportReport = {
  collectionType: CollectionType
  fileName: string
  startTime: Date
  endTime: Date
  duration: number // milliseconds
  totalRows: number
  validRows: number
  invalidRows: number
  skippedRows: number
  importedRows: number
  failedRows: number
  errors: string[]
  warnings: string[]
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Read CSV file content
 */
async function readCSVFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    throw new Error(
      `Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Save error report to file
 */
async function saveErrorReport(
  collectionType: CollectionType,
  errorReport: string
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `import-errors-${collectionType.toLowerCase()}-${timestamp}.csv`
  const filePath = path.join(process.cwd(), 'logs', fileName)

  // Ensure logs directory exists
  await fs.mkdir(path.join(process.cwd(), 'logs'), { recursive: true })

  await fs.writeFile(filePath, errorReport, 'utf-8')
  return filePath
}

/**
 * Save import report to file
 */
async function saveImportReport(report: ImportReport): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `import-report-${report.collectionType.toLowerCase()}-${timestamp}.json`
  const filePath = path.join(process.cwd(), 'logs', fileName)

  // Ensure logs directory exists
  await fs.mkdir(path.join(process.cwd(), 'logs'), { recursive: true })

  await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8')
  return filePath
}

// ============================================================================
// Import Functions
// ============================================================================

/**
 * Import videogames from CSV
 */
async function importVideogames(filePath: string): Promise<ImportReport> {
  const startTime = new Date()
  const fileName = path.basename(filePath)
  const errors: string[] = []
  const warnings: string[] = []
  let importedRows = 0
  let failedRows = 0

  console.log(`\n📦 Importing videogames from: ${fileName}`)
  console.log('='.repeat(60))

  try {
    // Read and parse CSV
    const content = await readCSVFile(filePath)
    const parseResult = await parseVideogameCSV(content)

    // Log parse summary
    console.log('\n📊 Parse Results:')
    console.log(getParseResultSummary(parseResult))

    // Save error report if there are validation errors
    if (parseResult.errors.length > 0) {
      const errorReport = generateErrorReport(parseResult.errors)
      const errorFilePath = await saveErrorReport(CollectionType.VIDEOGAME, errorReport)
      warnings.push(`Validation errors saved to: ${errorFilePath}`)
    }

    // Import valid data
    if (parseResult.data.length > 0) {
      console.log(`\n💾 Importing ${parseResult.data.length} videogames...`)

      for (const [index, game] of parseResult.data.entries()) {
        try {
          await createVideogameItem(
            {
              title: game.title,
              description: game.description || undefined,
              coverUrl: game.coverUrl || undefined,
              tags: stringifyArray([]), // No tags in current CSV
              year: game.year || undefined,
              language: game.language || undefined,
              copies: game.copies || undefined,
              price: game.priceEstimate
                ? parseFloat(game.priceEstimate.replace(/[^0-9.-]/g, '')) || undefined
                : undefined,
              customFields: undefined,
            },
            {
              platform: game.platform,
              publisher: game.publisher || null,
              developer: game.developer || null,
              region: game.region || null,
              edition: game.edition || null,
              genres: game.genres || '[]',
              metacriticScore: game.metacriticScore || null,
            }
          )
          importedRows++

          // Progress indicator
          if ((index + 1) % 100 === 0) {
            console.log(`  ✓ Imported ${index + 1}/${parseResult.data.length} videogames`)
          }
        } catch (error) {
          failedRows++
          errors.push(
            `Failed to import "${game.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        }
      }

      console.log(`  ✓ Import complete: ${importedRows}/${parseResult.data.length} successful`)
    }

    const endTime = new Date()
    const report: ImportReport = {
      collectionType: CollectionType.VIDEOGAME,
      fileName,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      totalRows: parseResult.stats.totalRows,
      validRows: parseResult.stats.validRows,
      invalidRows: parseResult.stats.invalidRows,
      skippedRows: parseResult.stats.skippedRows,
      importedRows,
      failedRows,
      errors,
      warnings: [...parseResult.warnings, ...warnings],
    }

    return report
  } catch (error) {
    throw new Error(
      `Videogame import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Import music from CSV
 */
async function importMusic(filePath: string): Promise<ImportReport> {
  const startTime = new Date()
  const fileName = path.basename(filePath)
  const errors: string[] = []
  const warnings: string[] = []
  let importedRows = 0
  let failedRows = 0

  console.log(`\n🎵 Importing music from: ${fileName}`)
  console.log('='.repeat(60))

  try {
    const content = await readCSVFile(filePath)
    const parseResult = await parseMusicCSV(content)

    console.log('\n📊 Parse Results:')
    console.log(getParseResultSummary(parseResult))

    if (parseResult.errors.length > 0) {
      const errorReport = generateErrorReport(parseResult.errors)
      const errorFilePath = await saveErrorReport(CollectionType.MUSIC, errorReport)
      warnings.push(`Validation errors saved to: ${errorFilePath}`)
    }

    if (parseResult.data.length > 0) {
      console.log(`\n💾 Importing ${parseResult.data.length} music items...`)

      for (const [index, music] of parseResult.data.entries()) {
        try {
          await createMusicItem(
            {
              title: music.title,
              description: music.description || undefined,
              coverUrl: music.coverUrl || undefined,
              tags: stringifyArray([]),
              year: music.year || undefined,
              language: music.language || undefined,
              copies: music.copies || undefined,
              price: music.priceEstimate
                ? parseFloat(music.priceEstimate.replace(/[^0-9.-]/g, '')) || undefined
                : undefined,
              customFields: undefined,
            },
            {
              artist: music.artist,
              publisher: music.publisher || null,
              format: music.format || 'Unknown',
              discCount: music.discCount || null,
              genres: music.genres || '[]',
              tracklist: music.tracklist || null,
            }
          )
          importedRows++

          if ((index + 1) % 50 === 0) {
            console.log(`  ✓ Imported ${index + 1}/${parseResult.data.length} music items`)
          }
        } catch (error) {
          failedRows++
          errors.push(
            `Failed to import "${music.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        }
      }

      console.log(`  ✓ Import complete: ${importedRows}/${parseResult.data.length} successful`)
    }

    const endTime = new Date()
    return {
      collectionType: CollectionType.MUSIC,
      fileName,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      totalRows: parseResult.stats.totalRows,
      validRows: parseResult.stats.validRows,
      invalidRows: parseResult.stats.invalidRows,
      skippedRows: parseResult.stats.skippedRows,
      importedRows,
      failedRows,
      errors,
      warnings: [...parseResult.warnings, ...warnings],
    }
  } catch (error) {
    throw new Error(
      `Music import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Import books from CSV
 */
async function importBooks(filePath: string): Promise<ImportReport> {
  const startTime = new Date()
  const fileName = path.basename(filePath)
  const errors: string[] = []
  const warnings: string[] = []
  let importedRows = 0
  let failedRows = 0

  console.log(`\n📚 Importing books from: ${fileName}`)
  console.log('='.repeat(60))

  try {
    const content = await readCSVFile(filePath)
    const parseResult = await parseBookCSV(content)

    console.log('\n📊 Parse Results:')
    console.log(getParseResultSummary(parseResult))

    if (parseResult.errors.length > 0) {
      const errorReport = generateErrorReport(parseResult.errors)
      const errorFilePath = await saveErrorReport(CollectionType.BOOK, errorReport)
      warnings.push(`Validation errors saved to: ${errorFilePath}`)
    }

    if (parseResult.data.length > 0) {
      console.log(`\n💾 Importing ${parseResult.data.length} books...`)

      for (const [index, book] of parseResult.data.entries()) {
        try {
          await createBookItem(
            {
              title: book.title,
              description: book.description || undefined,
              coverUrl: book.coverUrl || undefined,
              tags: stringifyArray([]),
              year: book.year || undefined,
              language: book.language || undefined,
              country: book.country || undefined,
              copies: book.copies || undefined,
              price: book.priceEstimate
                ? parseFloat(book.priceEstimate.replace(/[^0-9.-]/g, '')) || undefined
                : undefined,
              customFields: undefined,
            },
            {
              type: book.type,
              author: book.author,
              volume: book.volume ? String(book.volume) : null,
              series: book.series || null,
              publisher: book.publisher || null,
              coverType: book.coverType || null,
              genres: book.genres || '[]',
            }
          )
          importedRows++

          if ((index + 1) % 100 === 0) {
            console.log(`  ✓ Imported ${index + 1}/${parseResult.data.length} books`)
          }
        } catch (error) {
          failedRows++
          errors.push(
            `Failed to import "${book.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        }
      }

      console.log(`  ✓ Import complete: ${importedRows}/${parseResult.data.length} successful`)
    }

    const endTime = new Date()
    return {
      collectionType: CollectionType.BOOK,
      fileName,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      totalRows: parseResult.stats.totalRows,
      validRows: parseResult.stats.validRows,
      invalidRows: parseResult.stats.invalidRows,
      skippedRows: parseResult.stats.skippedRows,
      importedRows,
      failedRows,
      errors,
      warnings: [...parseResult.warnings, ...warnings],
    }
  } catch (error) {
    throw new Error(
      `Book import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// ============================================================================
// Main Import Process
// ============================================================================

async function main() {
  console.log('\n🚀 Starting CSV Import Process')
  console.log('='.repeat(60))
  console.log(`Start Time: ${new Date().toLocaleString()}`)

  const allReports: ImportReport[] = []
  const originalDataDir = path.join(process.cwd(), 'original-data')

  try {
    // Import videogames
    const videogamesPath = path.join(originalDataDir, 'videogames_catalog.csv')
    const videogamesReport = await importVideogames(videogamesPath)
    allReports.push(videogamesReport)
    await saveImportReport(videogamesReport)

    // Import music
    const musicPath = path.join(originalDataDir, 'music_catalog.csv')
    const musicReport = await importMusic(musicPath)
    allReports.push(musicReport)
    await saveImportReport(musicReport)

    // Import books
    const booksPath = path.join(originalDataDir, 'books_manga_comics_catalog.csv')
    const booksReport = await importBooks(booksPath)
    allReports.push(booksReport)
    await saveImportReport(booksReport)

    // Print final summary
    console.log('\n\n' + '='.repeat(60))
    console.log('📋 FINAL IMPORT SUMMARY')
    console.log('='.repeat(60))

    for (const report of allReports) {
      console.log(`\n${report.collectionType}:`)
      console.log(`  File: ${report.fileName}`)
      console.log(`  Duration: ${(report.duration / 1000).toFixed(2)}s`)
      console.log(`  Total rows: ${report.totalRows}`)
      console.log(`  Valid rows: ${report.validRows}`)
      console.log(`  Invalid rows: ${report.invalidRows}`)
      console.log(`  Skipped rows: ${report.skippedRows}`)
      console.log(`  Imported: ${report.importedRows}`)
      console.log(`  Failed: ${report.failedRows}`)

      if (report.warnings.length > 0) {
        console.log(`  Warnings: ${report.warnings.length}`)
      }

      if (report.errors.length > 0) {
        console.log(`  Errors: ${report.errors.length}`)
      }
    }

    // Overall statistics
    const totalImported = allReports.reduce((sum, r) => sum + r.importedRows, 0)
    const totalFailed = allReports.reduce((sum, r) => sum + r.failedRows, 0)
    const totalDuration = allReports.reduce((sum, r) => sum + r.duration, 0)

    console.log('\n' + '='.repeat(60))
    console.log(`✅ Import Complete!`)
    console.log(`   Total imported: ${totalImported} items`)
    console.log(`   Total failed: ${totalFailed} items`)
    console.log(`   Total duration: ${(totalDuration / 1000).toFixed(2)}s`)
    console.log(`   End Time: ${new Date().toLocaleString()}`)
    console.log('='.repeat(60))

    // Verify database counts
    console.log('\n🔍 Verifying database counts...')
    const videogameCount = await prisma.videogame.count()
    const musicCount = await prisma.music.count()
    const bookCount = await prisma.book.count()
    const itemCount = await prisma.item.count()

    console.log(`   Videogames in DB: ${videogameCount}`)
    console.log(`   Music in DB: ${musicCount}`)
    console.log(`   Books in DB: ${bookCount}`)
    console.log(`   Total Items in DB: ${itemCount}`)

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Import process failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
main()
