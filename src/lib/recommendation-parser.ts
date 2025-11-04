import fs from 'fs'
import path from 'path'
import type { BookType } from '@prisma/client'

export interface ParsedRecommendation {
  title: string
  series?: string
  author?: string
  volumes?: string
  issues?: string
  priority: number
  tier?: string
  reasoning?: string
  notes?: string
}

export interface ParsedPhase {
  name: string
  description?: string
  order: number
  recommendations: ParsedRecommendation[]
}

export interface ParsedReadingPath {
  bookType: BookType
  name: string
  description?: string
  order: number
  phases: ParsedPhase[]
}

export interface ParsedDocument {
  bookType: BookType
  paths: ParsedReadingPath[]
}

/**
 * Parse a markdown file and extract reading recommendations
 */
export function parseRecommendationMarkdown(filePath: string, bookType: BookType): ParsedDocument {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const paths: ParsedReadingPath[] = []
  let currentPath: ParsedReadingPath | null = null
  let currentPhase: ParsedPhase | null = null
  let phaseCounter = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Match Phase headers (## Phase 1: Gateway Masterpieces)
    const phaseMatch = line.match(/^##\s+Phase\s+(\d+):\s+(.+)$/i)
    if (phaseMatch) {
      // Save previous phase if exists
      if (currentPhase && currentPath) {
        currentPath.phases.push(currentPhase)
      }

      phaseCounter++
      currentPhase = {
        name: phaseMatch[2].trim(),
        description: '',
        order: phaseCounter,
        recommendations: [],
      }
      continue
    }

    // Match Reading Path sections (### Option 1: Character-Focused Reading)
    const pathMatch = line.match(/^###\s+(?:Option\s+\d+:|Reading\s+Order\s+Strategy)\s*(.+)$/i)
    if (pathMatch) {
      // Save previous path if exists
      if (currentPath) {
        if (currentPhase) {
          currentPath.phases.push(currentPhase)
          currentPhase = null
        }
        paths.push(currentPath)
      }

      currentPath = {
        bookType,
        name: pathMatch[1].trim(),
        description: '',
        order: paths.length + 1,
        phases: [],
      }
      phaseCounter = 0
      continue
    }

    // Extract recommendations from series/title mentions
    // Pattern: **Title** or **1. Title** or series mentions
    const recommendationMatch = line.match(
      /^\*\*(\d+\.\s+)?(.+?)\*\*(?:\s+\((\d+(?:-\d+)?)\s+volumes?\))?/i
    )
    if (recommendationMatch && currentPhase) {
      const title = recommendationMatch[2].trim()
      const volumes = recommendationMatch[3]

      // Try to extract additional info from following lines
      let reasoning = ''
      let issues = ''

      // Look ahead for "Issues:", "Why:", "About:" lines
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const nextLine = lines[j].trim()

        if (nextLine.startsWith('##') || nextLine.startsWith('###')) break
        if (nextLine.startsWith('**')) break

        if (nextLine.startsWith('- Issues:') || nextLine.startsWith('Issues:')) {
          issues = nextLine.replace(/^-?\s*Issues:\s*/i, '').trim()
        }
        if (nextLine.startsWith('- Why:') || nextLine.startsWith('Why:')) {
          reasoning = nextLine.replace(/^-?\s*Why:\s*/i, '').trim()
        }
        if (nextLine.startsWith('- About:')) {
          reasoning = nextLine.replace(/^-?\s*About:\s*/i, '').trim()
        }
      }

      currentPhase.recommendations.push({
        title,
        volumes,
        issues: issues || undefined,
        priority: currentPhase.recommendations.length + 1,
        reasoning: reasoning || undefined,
        notes: undefined,
      })
    }

    // Collect phase descriptions
    if (
      currentPhase &&
      !currentPhase.description &&
      line &&
      !line.startsWith('#') &&
      !line.startsWith('**')
    ) {
      if (currentPhase.description) {
        currentPhase.description += ' ' + line
      } else {
        currentPhase.description = line
      }
    }
  }

  // Save last phase and path
  if (currentPhase && currentPath) {
    currentPath.phases.push(currentPhase)
  }
  if (currentPath) {
    paths.push(currentPath)
  }

  // If no paths were found, create a default path with all phases
  if (paths.length === 0 && phaseCounter > 0) {
    const defaultPath: ParsedReadingPath = {
      bookType,
      name: bookType === 'MANGA' ? 'Recommended Reading Order' : 'Classic Reading Order',
      description: `Recommended reading order for ${bookType.toLowerCase()} collection`,
      order: 1,
      phases: [],
    }
    paths.push(defaultPath)
  }

  return {
    bookType,
    paths,
  }
}

/**
 * Parse both comic and manga recommendation files
 */
export function parseAllRecommendations(): ParsedDocument[] {
  const recommendationsDir = path.join(process.cwd(), 'recommendations')
  const documents: ParsedDocument[] = []

  try {
    // Parse comic reading order
    const comicPath = path.join(recommendationsDir, 'COMIC_READING_ORDER.md')
    if (fs.existsSync(comicPath)) {
      const comicDoc = parseRecommendationMarkdown(comicPath, 'COMIC')
      documents.push(comicDoc)
    }

    // Parse manga reading order
    const mangaPath = path.join(recommendationsDir, 'MANGA_READING_ORDER.md')
    if (fs.existsSync(mangaPath)) {
      const mangaDoc = parseRecommendationMarkdown(mangaPath, 'MANGA')
      documents.push(mangaDoc)
    }
  } catch (error) {
    console.error('Error parsing recommendation files:', error)
    throw error
  }

  return documents
}

/**
 * Get the file path for a specific book type
 */
export function getRecommendationFilePath(bookType: BookType): string {
  const recommendationsDir = path.join(process.cwd(), 'recommendations')

  switch (bookType) {
    case 'COMIC':
      return path.join(recommendationsDir, 'COMIC_READING_ORDER.md')
    case 'MANGA':
      return path.join(recommendationsDir, 'MANGA_READING_ORDER.md')
    case 'GRAPHIC_NOVEL':
      // Graphic novels can use comic reading order
      return path.join(recommendationsDir, 'COMIC_READING_ORDER.md')
    default:
      throw new Error(`No recommendation file for book type: ${bookType}`)
  }
}
