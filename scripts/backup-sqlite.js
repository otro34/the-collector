/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
})

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'backups')
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`)

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  try {
    console.log('Creating backup of local SQLite database...\n')

    // Fetch all data
    const [items, backups, settings] = await Promise.all([
      prisma.item.findMany({
        include: {
          videogame: true,
          music: true,
          book: true,
        },
      }),
      prisma.backup.findMany(),
      prisma.settings.findMany(),
    ])

    const backupData = {
      timestamp,
      counts: {
        items: items.length,
        videogames: items.filter((i) => i.videogame).length,
        music: items.filter((i) => i.music).length,
        books: items.filter((i) => i.book).length,
        backups: backups.length,
        settings: settings.length,
      },
      data: {
        items,
        backups,
        settings,
      },
    }

    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2))

    console.log(`✅ Backup created successfully!`)
    console.log(`📁 Location: ${backupFile}`)
    console.log(`\nBackup statistics:`)
    console.log(`- Items: ${backupData.counts.items}`)
    console.log(`- Videogames: ${backupData.counts.videogames}`)
    console.log(`- Music: ${backupData.counts.music}`)
    console.log(`- Books: ${backupData.counts.books}`)
    console.log(`- Backups: ${backupData.counts.backups}`)
    console.log(`- Settings: ${backupData.counts.settings}`)

    return backupFile
  } catch (error) {
    console.error('Error creating backup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run backup
backupDatabase()
  .then((backupFile) => {
    console.log('\nBackup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nBackup failed:', error)
    process.exit(1)
  })
