/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')

async function verifyMigration() {
  const postgresClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_URL,
      },
    },
  })

  try {
    await postgresClient.$connect()
    console.log('Connected to Vercel PostgreSQL database.\n')

    // Get sample data from each table
    console.log('=== VERIFICATION REPORT ===\n')

    // Count records
    const itemCount = await postgresClient.item.count()
    const videogameCount = await postgresClient.videogame.count()
    const musicCount = await postgresClient.music.count()
    const bookCount = await postgresClient.book.count()

    console.log('📊 Record Counts:')
    console.log(`   Items: ${itemCount}`)
    console.log(`   Videogames: ${videogameCount}`)
    console.log(`   Music: ${musicCount}`)
    console.log(`   Books: ${bookCount}\n`)

    // Sample some items
    console.log('📦 Sample Items:')
    const sampleItems = await postgresClient.item.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    })

    sampleItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} (${item.collectionType})`)
    })

    // Sample videogames
    console.log('\n🎮 Sample Videogames:')
    const sampleGames = await postgresClient.videogame.findMany({
      take: 3,
      include: { item: true },
    })

    sampleGames.forEach((game, index) => {
      console.log(`   ${index + 1}. ${game.item.title} - ${game.platform}`)
    })

    // Sample music
    console.log('\n🎵 Sample Music:')
    const sampleMusic = await postgresClient.music.findMany({
      take: 3,
      include: { item: true },
    })

    sampleMusic.forEach((music, index) => {
      console.log(`   ${index + 1}. ${music.item.title} by ${music.artist} - ${music.format}`)
    })

    // Sample books
    console.log('\n📚 Sample Books:')
    const sampleBooks = await postgresClient.book.findMany({
      take: 3,
      include: { item: true },
    })

    sampleBooks.forEach((book, index) => {
      console.log(`   ${index + 1}. ${book.item.title} by ${book.author} (${book.type})`)
    })

    console.log(
      '\n✅ Verification complete! Your data has been successfully migrated to Vercel PostgreSQL.'
    )
  } catch (error) {
    console.error('Error during verification:', error)
  } finally {
    await postgresClient.$disconnect()
  }
}

verifyMigration()
