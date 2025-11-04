/* eslint-disable no-console */
/**
 * Seed Reading Recommendations
 *
 * This script populates the database with sample reading recommendations
 * for Comics, Manga, and Graphic Novels.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedComicRecommendations() {
  console.log('\n📚 Seeding Comic recommendations...')

  // Create Character-Focused Reading Path
  const characterPath = await prisma.readingPath.create({
    data: {
      bookType: 'COMIC',
      name: 'Character-Focused Path',
      description: 'Follow iconic DC and Marvel characters through their most essential storylines',
      order: 1,
      phases: {
        create: [
          {
            name: 'Phase 1: Gateway Masterpieces',
            description: 'Essential standalone stories that showcase the best of superhero comics',
            order: 1,
            recommendations: {
              create: [
                {
                  title: 'All-Star Superman',
                  series: 'Superman',
                  author: 'Grant Morrison',
                  issues: '#1-12',
                  priority: 1,
                  tier: 'Must Read',
                  reasoning:
                    'The definitive Superman story that captures everything great about the character',
                },
                {
                  title: 'Batman: Year One',
                  series: 'Batman',
                  author: 'Frank Miller',
                  issues: '#404-407',
                  priority: 2,
                  tier: 'Must Read',
                  reasoning: 'The definitive origin story that redefined Batman for the modern era',
                },
                {
                  title: 'Marvels',
                  series: null,
                  author: 'Kurt Busiek',
                  issues: '#1-4',
                  priority: 3,
                  tier: 'Must Read',
                  reasoning:
                    'A beautiful look at the Marvel Universe through the eyes of ordinary people',
                },
              ],
            },
          },
          {
            name: 'Phase 2: Epic Storylines',
            description: 'Major crossover events and character-defining arcs',
            order: 2,
            recommendations: {
              create: [
                {
                  title: 'The Dark Knight Returns',
                  series: 'Batman',
                  author: 'Frank Miller',
                  issues: '#1-4',
                  priority: 1,
                  tier: 'Essential',
                  reasoning: 'A groundbreaking deconstruction of the Batman mythos',
                },
                {
                  title: 'Watchmen',
                  series: null,
                  author: 'Alan Moore',
                  issues: '#1-12',
                  priority: 2,
                  tier: 'Must Read',
                  reasoning: 'The greatest superhero story ever told, period',
                },
                {
                  title: 'Kingdom Come',
                  series: null,
                  author: 'Mark Waid',
                  issues: '#1-4',
                  priority: 3,
                  tier: 'Essential',
                  reasoning: 'A beautiful meditation on the future of superheroes',
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log(`  ✓ Created reading path: ${characterPath.name}`)

  // Create Publisher-Focused Reading Path
  const publisherPath = await prisma.readingPath.create({
    data: {
      bookType: 'COMIC',
      name: 'Publisher-Focused Path',
      description: 'Explore the unique voices and styles of different publishers',
      order: 2,
      phases: {
        create: [
          {
            name: 'Phase 1: DC Essentials',
            description: 'Key stories from DC Comics',
            order: 1,
            recommendations: {
              create: [
                {
                  title: 'Batman: The Long Halloween',
                  series: 'Batman',
                  author: 'Jeph Loeb',
                  issues: '#1-13',
                  priority: 1,
                  tier: 'Essential',
                  reasoning: 'A perfect blend of detective story and superhero action',
                },
                {
                  title: 'Green Lantern: Rebirth',
                  series: 'Green Lantern',
                  author: 'Geoff Johns',
                  issues: '#1-6',
                  priority: 2,
                  tier: 'Recommended',
                  reasoning: 'The story that revitalized Green Lantern for a new generation',
                },
              ],
            },
          },
          {
            name: 'Phase 2: Marvel Essentials',
            description: 'Key stories from Marvel Comics',
            order: 2,
            recommendations: {
              create: [
                {
                  title: 'Ultimate Spider-Man',
                  series: 'Spider-Man',
                  author: 'Brian Michael Bendis',
                  volumes: '1-3',
                  priority: 1,
                  tier: 'Essential',
                  reasoning: 'A modern retelling that captures the essence of Spider-Man',
                },
                {
                  title: 'Hawkeye',
                  series: 'Hawkeye',
                  author: 'Matt Fraction',
                  volumes: '1-4',
                  priority: 2,
                  tier: 'Recommended',
                  reasoning: 'A stylish, street-level look at what Hawkeye does when not Avenging',
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log(`  ✓ Created reading path: ${publisherPath.name}`)
}

async function seedMangaRecommendations() {
  console.log('\n📚 Seeding Manga recommendations...')

  const shounenPath = await prisma.readingPath.create({
    data: {
      bookType: 'MANGA',
      name: 'Shounen Journey',
      description: 'Classic and modern shounen manga essentials',
      order: 1,
      phases: {
        create: [
          {
            name: 'Phase 1: Gateway Series',
            description: 'Perfect entry points to shounen manga',
            order: 1,
            recommendations: {
              create: [
                {
                  title: 'Fullmetal Alchemist',
                  series: 'Fullmetal Alchemist',
                  author: 'Hiromu Arakawa',
                  volumes: '1-27',
                  priority: 1,
                  tier: 'Must Read',
                  reasoning: 'A perfect blend of action, humor, and emotional storytelling',
                },
                {
                  title: 'My Hero Academia',
                  series: 'My Hero Academia',
                  author: 'Kohei Horikoshi',
                  volumes: '1-10',
                  priority: 2,
                  tier: 'Essential',
                  reasoning: 'A modern take on superhero stories with compelling characters',
                  notes: 'Start with volumes 1-10 to get hooked',
                },
                {
                  title: 'Death Note',
                  series: 'Death Note',
                  author: 'Tsugumi Ohba',
                  volumes: '1-12',
                  priority: 3,
                  tier: 'Must Read',
                  reasoning: 'An intense psychological thriller with brilliant mind games',
                },
              ],
            },
          },
          {
            name: 'Phase 2: Epic Adventures',
            description: 'Long-running series with rich worlds',
            order: 2,
            recommendations: {
              create: [
                {
                  title: 'One Piece',
                  series: 'One Piece',
                  author: 'Eiichiro Oda',
                  volumes: '1-25',
                  priority: 1,
                  tier: 'Recommended',
                  reasoning: 'An epic adventure with incredible world-building',
                  notes: 'Start with the first 25 volumes to see if it clicks',
                },
                {
                  title: 'Hunter x Hunter',
                  series: 'Hunter x Hunter',
                  author: 'Yoshihiro Togashi',
                  volumes: '1-20',
                  priority: 2,
                  tier: 'Essential',
                  reasoning: 'Complex power system and strategic battles',
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log(`  ✓ Created reading path: ${shounenPath.name}`)

  const seinenPath = await prisma.readingPath.create({
    data: {
      bookType: 'MANGA',
      name: 'Seinen Excellence',
      description: 'Mature, sophisticated manga for adult readers',
      order: 2,
      phases: {
        create: [
          {
            name: 'Phase 1: Psychological Thrillers',
            description: 'Dark, thought-provoking narratives',
            order: 1,
            recommendations: {
              create: [
                {
                  title: 'Monster',
                  series: 'Monster',
                  author: 'Naoki Urasawa',
                  volumes: '1-18',
                  priority: 1,
                  tier: 'Must Read',
                  reasoning: 'A masterpiece thriller about morality and the nature of evil',
                },
                {
                  title: 'Berserk',
                  series: 'Berserk',
                  author: 'Kentaro Miura',
                  volumes: '1-10',
                  priority: 2,
                  tier: 'Essential',
                  reasoning: 'Dark fantasy with incredible art and storytelling',
                  notes: 'Very mature content - not for everyone',
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log(`  ✓ Created reading path: ${seinenPath.name}`)
}

async function seedGraphicNovelRecommendations() {
  console.log('\n📚 Seeding Graphic Novel recommendations...')

  const literaryPath = await prisma.readingPath.create({
    data: {
      bookType: 'GRAPHIC_NOVEL',
      name: 'Literary Graphic Novels',
      description: 'Award-winning graphic novels with powerful narratives',
      order: 1,
      phases: {
        create: [
          {
            name: 'Phase 1: Essential Memoirs',
            description: 'Autobiographical graphic novels',
            order: 1,
            recommendations: {
              create: [
                {
                  title: 'Maus',
                  series: null,
                  author: 'Art Spiegelman',
                  volumes: '1-2',
                  priority: 1,
                  tier: 'Must Read',
                  reasoning: 'Pulitzer Prize-winning Holocaust memoir, a landmark work',
                },
                {
                  title: 'Persepolis',
                  series: null,
                  author: 'Marjane Satrapi',
                  volumes: '1-2',
                  priority: 2,
                  tier: 'Must Read',
                  reasoning: 'Powerful memoir of growing up during Iranian Revolution',
                },
                {
                  title: 'Fun Home',
                  series: null,
                  author: 'Alison Bechdel',
                  volumes: '1',
                  priority: 3,
                  tier: 'Essential',
                  reasoning: 'A complex family memoir exploring identity and sexuality',
                },
              ],
            },
          },
          {
            name: 'Phase 2: Fiction Masterworks',
            description: 'Standalone fictional graphic novels',
            order: 2,
            recommendations: {
              create: [
                {
                  title: 'Sandman',
                  series: 'Sandman',
                  author: 'Neil Gaiman',
                  volumes: '1-10',
                  priority: 1,
                  tier: 'Must Read',
                  reasoning: 'A genre-defining fantasy series about dreams and mythology',
                },
                {
                  title: 'Saga',
                  series: 'Saga',
                  author: 'Brian K. Vaughan',
                  volumes: '1-5',
                  priority: 2,
                  tier: 'Essential',
                  reasoning: 'Epic space opera with beautiful art and compelling characters',
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log(`  ✓ Created reading path: ${literaryPath.name}`)
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🌱 Seeding Reading Recommendations')
  console.log('='.repeat(60))
  console.log(`Start Time: ${new Date().toLocaleString()}`)

  try {
    // Clear existing recommendations data
    console.log('\n🗑️  Clearing existing recommendations...')
    await prisma.readingRecommendation.deleteMany()
    await prisma.readingPhase.deleteMany()
    await prisma.readingPath.deleteMany()
    console.log('  ✓ Cleared existing recommendations')

    // Seed all recommendation types
    await seedComicRecommendations()
    await seedMangaRecommendations()
    await seedGraphicNovelRecommendations()

    // Verify counts
    console.log('\n🔍 Verification:')
    const pathCount = await prisma.readingPath.count()
    const phaseCount = await prisma.readingPhase.count()
    const recommendationCount = await prisma.readingRecommendation.count()

    console.log(`  Reading Paths: ${pathCount}`)
    console.log(`  Reading Phases: ${phaseCount}`)
    console.log(`  Recommendations: ${recommendationCount}`)

    console.log('\n' + '='.repeat(60))
    console.log('✅ Recommendation seeding completed successfully!')
    console.log(`End Time: ${new Date().toLocaleString()}`)
    console.log('='.repeat(60))
  } catch (error) {
    console.error('\n' + '='.repeat(60))
    console.error('❌ Recommendation seeding failed!')
    console.error('='.repeat(60))
    console.error(error)
    throw error
  }
}

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
