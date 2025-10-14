import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Test database connection
 * @returns Promise<boolean> - True if connection successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

/**
 * Disconnect from database
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect()
}

/**
 * Get database health status
 */
export async function getHealthStatus() {
  try {
    const itemCount = await prisma.item.count()
    const videogameCount = await prisma.videogame.count()
    const musicCount = await prisma.music.count()
    const bookCount = await prisma.book.count()

    return {
      status: 'healthy',
      connected: true,
      counts: {
        items: itemCount,
        videogames: videogameCount,
        music: musicCount,
        books: bookCount,
      },
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
