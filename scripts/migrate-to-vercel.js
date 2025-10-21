/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient: SqliteClient } = require('@prisma/client')
const { PrismaClient: PostgresClient } = require('@prisma/client')

async function migrateData() {
  console.log('Starting migration from SQLite to PostgreSQL...\n')

  // Initialize SQLite client (local database)
  const sqliteClient = new SqliteClient({
    datasources: {
      db: {
        url: 'file:./prisma/dev.db',
      },
    },
  })

  // Initialize PostgreSQL client (Vercel database)
  const postgresClient = new PostgresClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_URL,
      },
    },
  })

  try {
    // Connect to both databases
    await sqliteClient.$connect()
    await postgresClient.$connect()

    console.log('Connected to both databases successfully.\n')

    // Get counts from SQLite
    const itemCount = await sqliteClient.item.count()
    const videogameCount = await sqliteClient.videogame.count()
    const musicCount = await sqliteClient.music.count()
    const bookCount = await sqliteClient.book.count()
    const backupCount = await sqliteClient.backup.count()
    const settingsCount = await sqliteClient.settings.count()

    console.log('Local database statistics:')
    console.log(`- Items: ${itemCount}`)
    console.log(`- Videogames: ${videogameCount}`)
    console.log(`- Music: ${musicCount}`)
    console.log(`- Books: ${bookCount}`)
    console.log(`- Backups: ${backupCount}`)
    console.log(`- Settings: ${settingsCount}`)
    console.log('\n')

    // Clear existing data in PostgreSQL (optional - remove if you want to append)
    console.log('Clearing existing data in PostgreSQL...')
    await postgresClient.videogame.deleteMany({})
    await postgresClient.music.deleteMany({})
    await postgresClient.book.deleteMany({})
    await postgresClient.item.deleteMany({})
    await postgresClient.backup.deleteMany({})
    await postgresClient.settings.deleteMany({})

    // Migrate Items and related data
    console.log('Migrating Items...')
    const items = await sqliteClient.item.findMany({
      include: {
        videogame: true,
        music: true,
        book: true,
      },
    })

    let migratedItems = 0
    for (const item of items) {
      const { videogame, music, book, ...itemData } = item

      // Create the item first
      await postgresClient.item.create({
        data: itemData,
      })

      // Create related records
      if (videogame) {
        await postgresClient.videogame.create({
          data: videogame,
        })
      }
      if (music) {
        await postgresClient.music.create({
          data: music,
        })
      }
      if (book) {
        await postgresClient.book.create({
          data: book,
        })
      }

      migratedItems++
      if (migratedItems % 10 === 0) {
        process.stdout.write(`  Migrated ${migratedItems}/${itemCount} items...\r`)
      }
    }
    console.log(`  Migrated ${migratedItems}/${itemCount} items... Done!\n`)

    // Migrate Backups
    console.log('Migrating Backups...')
    const backups = await sqliteClient.backup.findMany()
    for (const backup of backups) {
      await postgresClient.backup.create({
        data: backup,
      })
    }
    console.log(`  Migrated ${backups.length} backups.\n`)

    // Migrate Settings
    console.log('Migrating Settings...')
    const settings = await sqliteClient.settings.findMany()
    for (const setting of settings) {
      await postgresClient.settings.create({
        data: setting,
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
    console.log(`- Items: ${pgItemCount} (expected: ${itemCount})`)
    console.log(`- Videogames: ${pgVideogameCount} (expected: ${videogameCount})`)
    console.log(`- Music: ${pgMusicCount} (expected: ${musicCount})`)
    console.log(`- Books: ${pgBookCount} (expected: ${bookCount})`)
    console.log(`- Backups: ${pgBackupCount} (expected: ${backupCount})`)
    console.log(`- Settings: ${pgSettingsCount} (expected: ${settingsCount})`)

    if (
      pgItemCount === itemCount &&
      pgVideogameCount === videogameCount &&
      pgMusicCount === musicCount &&
      pgBookCount === bookCount &&
      pgBackupCount === backupCount &&
      pgSettingsCount === settingsCount
    ) {
      console.log('\n✅ Migration completed successfully! All data transferred.')
    } else {
      console.log('\n⚠️  Migration completed with discrepancies. Please review the counts above.')
    }
  } catch (error) {
    console.error('Error during migration:', error)
    throw error
  } finally {
    await sqliteClient.$disconnect()
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
