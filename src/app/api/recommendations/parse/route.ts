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

    // Use transaction for all database operations
    await prisma.$transaction(async (tx) => {
      // Process each document
      for (const doc of documents) {
        for (const parsedPath of doc.paths) {
          // Check if path already exists
          const existingPath = await tx.readingPath.findUnique({
            where: {
              bookType_name: {
                bookType: parsedPath.bookType,
                name: parsedPath.name,
              },
            },
          })

          let path

          if (existingPath) {
            // Delete existing phases and recommendations for this path (cascade will handle recommendations)
            await tx.readingPhase.deleteMany({
              where: { pathId: existingPath.id },
            })

            // Update existing path
            path = await tx.readingPath.update({
              where: { id: existingPath.id },
              data: {
                description: parsedPath.description,
                order: parsedPath.order,
              },
            })
          } else {
            // Create new path with nested phases and recommendations in a single operation
            path = await tx.readingPath.create({
              data: {
                bookType: parsedPath.bookType,
                name: parsedPath.name,
                description: parsedPath.description,
                order: parsedPath.order,
                phases: {
                  create: parsedPath.phases.map((phase) => ({
                    name: phase.name,
                    description: phase.description,
                    order: phase.order,
                    recommendations: {
                      create: phase.recommendations.map((rec) => ({
                        title: rec.title,
                        series: rec.series,
                        author: rec.author,
                        volumes: rec.volumes,
                        issues: rec.issues,
                        priority: rec.priority,
                        tier: rec.tier,
                        reasoning: rec.reasoning,
                        notes: rec.notes,
                      })),
                    },
                  })),
                },
              },
            })

            totalPaths++
            totalPhases += parsedPath.phases.length
            totalRecommendations += parsedPath.phases.reduce(
              (sum, phase) => sum + phase.recommendations.length,
              0
            )
            continue
          }

          // For existing paths, batch create phases with their recommendations
          if (parsedPath.phases.length > 0) {
            const phaseCreates = parsedPath.phases.map((phase) =>
              tx.readingPhase.create({
                data: {
                  pathId: path.id,
                  name: phase.name,
                  description: phase.description,
                  order: phase.order,
                  recommendations: {
                    create: phase.recommendations.map((rec) => ({
                      title: rec.title,
                      series: rec.series,
                      author: rec.author,
                      volumes: rec.volumes,
                      issues: rec.issues,
                      priority: rec.priority,
                      tier: rec.tier,
                      reasoning: rec.reasoning,
                      notes: rec.notes,
                    })),
                  },
                },
              })
            )

            // Execute all phase creates in parallel
            await Promise.all(phaseCreates)

            totalPaths++
            totalPhases += parsedPath.phases.length
            totalRecommendations += parsedPath.phases.reduce(
              (sum, phase) => sum + phase.recommendations.length,
              0
            )
          }
        }
      }
    })

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
