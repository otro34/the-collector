/* eslint-disable no-console */
/**
 * Database Reseeding Script
 *
 * This script clears the database and imports fresh data from CSV files
 * in the original-data directory.
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import {
  parseVideogameCSV,
  parseMusicCSV,
  parseBookCSV,
  getParseResultSummary,
} from '../src/lib/csv-parser'
import { createVideogameItem, createMusicItem, createBookItem } from '../src/lib/db-utils'
import { stringifyArray } from '../src/types/database'

const prisma = new PrismaClient()

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Clear all data from the database
 */
async function clearDatabase() {
  console.log('\n🗑️  Clearing database...')

  try {
    // Delete in correct order due to foreign key constraints
    await prisma.book.deleteMany()
    await prisma.music.deleteMany()
    await prisma.videogame.deleteMany()
    await prisma.item.deleteMany()
    await prisma.backup.deleteMany()
    await prisma.settings.deleteMany()

    console.log('  ✓ All tables cleared')
  } catch (error) {
    console.error('  ✗ Failed to clear database:', error)
    throw error
  }
}

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
 * Import videogames from CSV
 */
async function importVideogames(filePath: string): Promise<{ imported: number; failed: number }> {
  console.log('\n📦 Importing videogames...')

  try {
    const content = await readCSVFile(filePath)
    const parseResult = await parseVideogameCSV(content)

    console.log('  ' + getParseResultSummary(parseResult).replace(/\n/g, '\n  '))

    let imported = 0
    let failed = 0

    for (const [index, game] of parseResult.data.entries()) {
      try {
        await createVideogameItem(
          {
            title: game.title,
            description: game.description || undefined,
            coverUrl: game.coverUrl || undefined,
            tags: stringifyArray([]),
            year: game.year || undefined,
            language: game.language || undefined,
            copies: game.copies || undefined,
            price: game.priceEstimate
              ? parseFloat(game.priceEstimate.replace(/[^0-9.-]/g, '')) || undefined
              : undefined,
            customFields: undefined,
          },
          {
            platform: game.platform || 'Unknown',
            publisher: game.publisher || null,
            developer: game.developer || null,
            region: game.region || null,
            edition: game.edition || null,
            genres: game.genres || '[]',
            metacriticScore: game.metacriticScore || null,
          }
        )
        imported++

        // Progress indicator for large imports
        if ((index + 1) % 100 === 0) {
          console.log(`  ⏳ Progress: ${index + 1}/${parseResult.data.length}`)
        }
      } catch (error) {
        failed++
        console.error(
          `  ✗ Failed to import "${game.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    console.log(`  ✓ Videogames imported: ${imported} successful, ${failed} failed`)
    return { imported, failed }
  } catch (error) {
    console.error(
      `  ✗ Videogame import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    return { imported: 0, failed: 0 }
  }
}

/**
 * Import music from CSV
 */
async function importMusic(filePath: string): Promise<{ imported: number; failed: number }> {
  console.log('\n🎵 Importing music...')

  try {
    const content = await readCSVFile(filePath)
    const parseResult = await parseMusicCSV(content)

    console.log('  ' + getParseResultSummary(parseResult).replace(/\n/g, '\n  '))

    let imported = 0
    let failed = 0

    for (const music of parseResult.data) {
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
            artist: music.artist || 'Unknown Artist',
            publisher: music.publisher || null,
            format: music.format || 'Unknown',
            discCount: music.discCount || null,
            genres: music.genres || '[]',
            tracklist: music.tracklist || null,
          }
        )
        imported++
      } catch (error) {
        failed++
        console.error(
          `  ✗ Failed to import "${music.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    console.log(`  ✓ Music imported: ${imported} successful, ${failed} failed`)
    return { imported, failed }
  } catch (error) {
    console.error(
      `  ✗ Music import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    return { imported: 0, failed: 0 }
  }
}

/**
 * Import books from CSV
 */
async function importBooks(filePath: string): Promise<{ imported: number; failed: number }> {
  console.log('\n📚 Importing books...')

  try {
    const content = await readCSVFile(filePath)
    const parseResult = await parseBookCSV(content)

    console.log('  ' + getParseResultSummary(parseResult).replace(/\n/g, '\n  '))

    let imported = 0
    let failed = 0

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
            type: book.type || 'OTHER',
            author: book.author || 'Unknown Author',
            volume: book.volume ? String(book.volume) : null,
            series: book.series || null,
            publisher: book.publisher || null,
            coverType: book.coverType || null,
            genres: book.genres || '[]',
          }
        )
        imported++

        // Progress indicator for large imports
        if ((index + 1) % 100 === 0) {
          console.log(`  ⏳ Progress: ${index + 1}/${parseResult.data.length}`)
        }
      } catch (error) {
        failed++
        console.error(
          `  ✗ Failed to import "${book.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    console.log(`  ✓ Books imported: ${imported} successful, ${failed} failed`)
    return { imported, failed }
  } catch (error) {
    console.error(
      `  ✗ Book import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    return { imported: 0, failed: 0 }
  }
}

/**
 * Verify database state
 */
async function verifyDatabase() {
  console.log('\n🔍 Verifying database...')

  const videogameCount = await prisma.videogame.count()
  const musicCount = await prisma.music.count()
  const bookCount = await prisma.book.count()
  const itemCount = await prisma.item.count()

  console.log(`  Videogames: ${videogameCount}`)
  console.log(`  Music: ${musicCount}`)
  console.log(`  Books: ${bookCount}`)
  console.log(`  Total Items: ${itemCount}`)

  return { videogameCount, musicCount, bookCount, itemCount }
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🌱 Database Reseeding Script')
  console.log('='.repeat(60))
  console.log(`Start Time: ${new Date().toLocaleString()}`)

  const originalDataDir = path.join(process.cwd(), 'original-data')

  try {
    // Clear database
    await clearDatabase()

    // Import all data
    console.log('\n📥 Importing CSV data...')
    const stats = {
      videogames: { imported: 0, failed: 0 },
      music: { imported: 0, failed: 0 },
      books: { imported: 0, failed: 0 },
    }

    // Import videogames
    const videogamesPath = path.join(originalDataDir, 'videogames_catalog.csv')
    stats.videogames = await importVideogames(videogamesPath)

    // Import music
    const musicPath = path.join(originalDataDir, 'music_catalog.csv')
    stats.music = await importMusic(musicPath)

    // Import books
    const booksPath = path.join(originalDataDir, 'books_manga_comics_catalog.csv')
    stats.books = await importBooks(booksPath)

    // Summary
    const totalImported = stats.videogames.imported + stats.music.imported + stats.books.imported
    const totalFailed = stats.videogames.failed + stats.music.failed + stats.books.failed

    console.log('\n' + '='.repeat(60))
    console.log('📊 Import Summary:')
    console.log(`  Total imported: ${totalImported} items`)
    console.log(`  Total failed: ${totalFailed} items`)
    console.log('='.repeat(60))

    // Verify final state
    await verifyDatabase()

    console.log('\n' + '='.repeat(60))
    console.log('✅ Reseeding completed successfully!')
    console.log(`End Time: ${new Date().toLocaleString()}`)
    console.log('='.repeat(60))
  } catch (error) {
    console.error('\n' + '='.repeat(60))
    console.error('❌ Reseeding failed!')
    console.error('='.repeat(60))
    console.error(error)
    throw error
  }
}

// ============================================================================
// Execute
// ============================================================================

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
