/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const sqlite3 = require('sqlite3').verbose()
const { open } = require('sqlite')

async function migrateData() {
  console.log('Starting migration from SQLite to PostgreSQL...\n')

  // Initialize PostgreSQL client for Vercel database
  const postgresClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_URL,
      },
    },
  })

  // Open SQLite database directly
  const db = await open({
    filename: './prisma/dev.db',
    driver: sqlite3.Database,
  })

  try {
    await postgresClient.$connect()
    console.log('Connected to PostgreSQL database successfully.\n')

    // Get data counts from SQLite
    const itemCount = await db.get('SELECT COUNT(*) as count FROM Item')
    const videogameCount = await db.get('SELECT COUNT(*) as count FROM Videogame')
    const musicCount = await db.get('SELECT COUNT(*) as count FROM Music')
    const bookCount = await db.get('SELECT COUNT(*) as count FROM Book')
    const backupCount = await db.get('SELECT COUNT(*) as count FROM Backup')
    const settingsCount = await db.get('SELECT COUNT(*) as count FROM Settings')

    console.log('Local SQLite database statistics:')
    console.log(`- Items: ${itemCount.count}`)
    console.log(`- Videogames: ${videogameCount.count}`)
    console.log(`- Music: ${musicCount.count}`)
    console.log(`- Books: ${bookCount.count}`)
    console.log(`- Backups: ${backupCount.count}`)
    console.log(`- Settings: ${settingsCount.count}`)
    console.log('\n')

    // Clear existing data in PostgreSQL (optional)
    console.log('Clearing existing data in PostgreSQL...')
    await postgresClient.videogame.deleteMany({})
    await postgresClient.music.deleteMany({})
    await postgresClient.book.deleteMany({})
    await postgresClient.item.deleteMany({})
    await postgresClient.backup.deleteMany({})
    await postgresClient.settings.deleteMany({})

    // Migrate Items
    console.log('Migrating Items...')
    const items = await db.all('SELECT * FROM Item')

    for (const item of items) {
      // Parse JSON fields
      const itemData = {
        id: item.id,
        collectionType: item.collectionType,
        title: item.title,
        year: item.year,
        language: item.language,
        country: item.country,
        copies: item.copies,
        description: item.description,
        coverUrl: item.coverUrl,
        price: item.price,
        tags: item.tags || '[]',
        customFields: item.customFields ? JSON.parse(item.customFields) : null,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }

      await postgresClient.item.create({
        data: itemData,
      })
    }
    console.log(`  Migrated ${items.length} items.\n`)

    // Migrate Videogames
    console.log('Migrating Videogames...')
    const videogames = await db.all('SELECT * FROM Videogame')

    for (const videogame of videogames) {
      await postgresClient.videogame.create({
        data: {
          id: videogame.id,
          itemId: videogame.itemId,
          platform: videogame.platform,
          publisher: videogame.publisher,
          developer: videogame.developer,
          region: videogame.region,
          edition: videogame.edition,
          genres: videogame.genres || '[]',
          metacriticScore: videogame.metacriticScore,
        },
      })
    }
    console.log(`  Migrated ${videogames.length} videogames.\n`)

    // Migrate Music
    console.log('Migrating Music...')
    const musicItems = await db.all('SELECT * FROM Music')

    for (const music of musicItems) {
      await postgresClient.music.create({
        data: {
          id: music.id,
          itemId: music.itemId,
          artist: music.artist,
          publisher: music.publisher,
          format: music.format,
          discCount: music.discCount,
          genres: music.genres || '[]',
          tracklist: music.tracklist,
        },
      })
    }
    console.log(`  Migrated ${musicItems.length} music items.\n`)

    // Migrate Books
    console.log('Migrating Books...')
    const books = await db.all('SELECT * FROM Book')

    for (const book of books) {
      await postgresClient.book.create({
        data: {
          id: book.id,
          itemId: book.itemId,
          type: book.type,
          author: book.author,
          volume: book.volume,
          series: book.series,
          publisher: book.publisher,
          coverType: book.coverType,
          genres: book.genres || '[]',
        },
      })
    }
    console.log(`  Migrated ${books.length} books.\n`)

    // Migrate Backups
    console.log('Migrating Backups...')
    const backups = await db.all('SELECT * FROM Backup')

    for (const backup of backups) {
      await postgresClient.backup.create({
        data: {
          id: backup.id,
          filename: backup.filename,
          size: backup.size,
          itemCount: backup.itemCount,
          location: backup.location,
          type: backup.type,
          createdAt: new Date(backup.createdAt),
        },
      })
    }
    console.log(`  Migrated ${backups.length} backups.\n`)

    // Migrate Settings
    console.log('Migrating Settings...')
    const settings = await db.all('SELECT * FROM Settings')

    for (const setting of settings) {
      await postgresClient.settings.create({
        data: {
          id: setting.id,
          key: setting.key,
          value: JSON.parse(setting.value),
          updatedAt: new Date(setting.updatedAt),
        },
      })
    }
    console.log(`  Migrated ${settings.length} settings.\n`)

    // Verify migration
    console.log('Verifying migration...')
    const pgItemCount = await postgresClient.item.count()
    const pgVideogameCount = await postgresClient.videogame.count()
    const pgMusicCount = await postgresClient.music.count()
    const pgBookCount = await postgresClient.book.count()
    const pgBackupCount = await postgresClient.backup.count()
    const pgSettingsCount = await postgresClient.settings.count()

    console.log('\nPostgreSQL database statistics:')
    console.log(`- Items: ${pgItemCount} (expected: ${itemCount.count})`)
    console.log(`- Videogames: ${pgVideogameCount} (expected: ${videogameCount.count})`)
    console.log(`- Music: ${pgMusicCount} (expected: ${musicCount.count})`)
    console.log(`- Books: ${pgBookCount} (expected: ${bookCount.count})`)
    console.log(`- Backups: ${pgBackupCount} (expected: ${backupCount.count})`)
    console.log(`- Settings: ${pgSettingsCount} (expected: ${settingsCount.count})`)

    if (
      pgItemCount === itemCount.count &&
      pgVideogameCount === videogameCount.count &&
      pgMusicCount === musicCount.count &&
      pgBookCount === bookCount.count &&
      pgBackupCount === backupCount.count &&
      pgSettingsCount === settingsCount.count
    ) {
      console.log('\n✅ Migration completed successfully! All data transferred.')
    } else {
      console.log('\n⚠️  Migration completed with discrepancies. Please review the counts above.')
    }
  } catch (error) {
    console.error('Error during migration:', error)
    throw error
  } finally {
    await db.close()
    await postgresClient.$disconnect()
  }
}

// Run the migration
migrateData()
  .then(() => {
    console.log('\nMigration process finished.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nMigration failed:', error)
    process.exit(1)
  })
