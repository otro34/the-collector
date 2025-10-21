import { PrismaClient, type UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: 'otro34@hotmail.com' }, { githubUsername: 'otro34' }],
      },
    })

    if (existingUser) {
      console.log('User already exists. Updating to admin...')
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'ADMIN' as UserRole,
          isActive: true,
        },
      })
      console.log('User updated successfully:', updatedUser)
    } else {
      console.log('Creating new admin user...')
      const newUser = await prisma.user.create({
        data: {
          email: 'otro34@hotmail.com',
          githubUsername: 'otro34',
          name: 'otro34',
          role: 'ADMIN' as UserRole,
          isActive: true,
        },
      })
      console.log('Admin user created successfully:', newUser)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
