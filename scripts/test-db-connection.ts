import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    console.log('Database URL:', process.env.POSTGRES_URL?.replace(/:[^:@]+@/, ':****@'))

    // Test connection by counting users
    const userCount = await prisma.user.count()
    console.log(`✅ Connected to cloud database successfully!`)
    console.log(`   Found ${userCount} user(s) in the database`)

    // List users (without sensitive data)
    const users = await prisma.user.findMany({
      select: {
        email: true,
        githubUsername: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    console.log('\nAuthorized users:')
    users.forEach((user) => {
      console.log(
        `   - ${user.email} (@${user.githubUsername}) - Role: ${user.role} - Active: ${user.isActive}`
      )
    })
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
