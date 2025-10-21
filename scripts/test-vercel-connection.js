/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()

  try {
    console.log('Testing connection to Vercel PostgreSQL database...\n')

    // Test connection
    await prisma.$connect()
    console.log('✅ Successfully connected to database!\n')

    // Test query
    const itemCount = await prisma.item.count()
    console.log(`📊 Found ${itemCount} items in the database.\n`)

    // Get a sample item
    const sampleItem = await prisma.item.findFirst({
      include: {
        videogame: true,
        music: true,
        book: true,
      },
    })

    if (sampleItem) {
      console.log('📦 Sample item:')
      console.log(`   Title: ${sampleItem.title}`)
      console.log(`   Type: ${sampleItem.collectionType}`)
      console.log(`   Year: ${sampleItem.year || 'N/A'}`)
    }

    console.log('\n✅ All tests passed! The application is ready to use PostgreSQL in production.')
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
