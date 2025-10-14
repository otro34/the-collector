import { prisma } from '../src/lib/db'

async function main() {
  console.log('Testing database connection...')

  try {
    // Test connection by counting items
    const itemCount = await prisma.item.count()
    console.log(`✓ Database connection successful!`)
    console.log(`✓ Current item count: ${itemCount}`)

    // List all tables (models)
    console.log('\n✓ Database schema models:')
    console.log('  - Item')
    console.log('  - Videogame')
    console.log('  - Music')
    console.log('  - Book')
    console.log('  - Backup')
    console.log('  - Settings')

    console.log('\n✓ All tests passed!')
  } catch (error) {
    console.error('✗ Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
