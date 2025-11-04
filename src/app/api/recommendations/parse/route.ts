import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseAllRecommendations } from '@/lib/recommendation-parser'
import { recommendationCache } from '@/lib/recommendation-cache'

/**
 * POST /api/recommendations/parse
 * Parse markdown files and store recommendations in database
 */
export async function POST() {
  try {
    // Parse all recommendation files
    const documents = parseAllRecommendations()

    let totalPaths = 0
    let totalPhases = 0
    let totalRecommendations = 0

    // Process each document
    for (const doc of documents) {
      for (const parsedPath of doc.paths) {
        // Check if path already exists
        let path = await prisma.readingPath.findUnique({
          where: {
            bookType_name: {
              bookType: parsedPath.bookType,
              name: parsedPath.name,
            },
          },
        })

        if (path) {
          // Update existing path
          path = await prisma.readingPath.update({
            where: { id: path.id },
            data: {
              description: parsedPath.description,
              order: parsedPath.order,
            },
          })

          // Delete existing phases and recommendations for this path
          await prisma.readingPhase.deleteMany({
            where: { pathId: path.id },
          })
        } else {
          // Create new path
          path = await prisma.readingPath.create({
            data: {
              bookType: parsedPath.bookType,
              name: parsedPath.name,
              description: parsedPath.description,
              order: parsedPath.order,
            },
          })
        }

        totalPaths++

        // Create phases for this path
        for (const parsedPhase of parsedPath.phases) {
          const phase = await prisma.readingPhase.create({
            data: {
              pathId: path.id,
              name: parsedPhase.name,
              description: parsedPhase.description,
              order: parsedPhase.order,
            },
          })

          totalPhases++

          // Create recommendations for this phase
          for (const recommendation of parsedPhase.recommendations) {
            await prisma.readingRecommendation.create({
              data: {
                phaseId: phase.id,
                title: recommendation.title,
                series: recommendation.series,
                author: recommendation.author,
                volumes: recommendation.volumes,
                issues: recommendation.issues,
                priority: recommendation.priority,
                tier: recommendation.tier,
                reasoning: recommendation.reasoning,
                notes: recommendation.notes,
              },
            })

            totalRecommendations++
          }
        }
      }
    }

    // Clear cache after updating recommendations
    recommendationCache.clearRecommendations()

    return NextResponse.json({
      success: true,
      message: 'Recommendations parsed and stored successfully',
      stats: {
        paths: totalPaths,
        phases: totalPhases,
        recommendations: totalRecommendations,
      },
    })
  } catch (error) {
    console.error('Error parsing recommendations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to parse recommendations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
