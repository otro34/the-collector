'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, ChevronDown, ChevronRight, CheckCircle2, Circle, BookMarked } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollectionInsights } from '@/components/recommendations/collection-insights'
import type { BookType } from '@prisma/client'

// Types
interface ReadingRecommendation {
  id: string
  title: string
  series: string | null
  author: string | null
  volumes: string | null
  issues: string | null
  priority: number
  tier: string | null
  reasoning: string | null
  notes: string | null
}

interface ReadingPhase {
  id: string
  name: string
  description: string | null
  order: number
  recommendations: ReadingRecommendation[]
}

interface ReadingPath {
  id: string
  bookType: BookType
  name: string
  description: string | null
  order: number
  phases: ReadingPhase[]
}

interface RecommendationsResponse {
  success: boolean
  paths: ReadingPath[]
  count: number
  cached: boolean
}

interface ReadingProgress {
  id: string
  itemId: string
  isRead: boolean
  readingPath: string | null
  currentPhase: string | null
  item: {
    id: string
    title: string
    book?: {
      series: string | null
      volume: string | null
    } | null
  }
}

interface ReadingProgressResponse {
  success: boolean
  progress: ReadingProgress[]
}

// Helper function to match recommendations with user's collection
function matchRecommendationWithCollection(
  recommendation: ReadingRecommendation,
  userItems: ReadingProgress[]
): { owned: boolean; itemId?: string; isRead?: boolean } {
  // Try to match by title or series
  const match = userItems.find((progress) => {
    const itemTitle = progress.item.title.toLowerCase()
    const recTitle = recommendation.title.toLowerCase()
    const recSeries = recommendation.series?.toLowerCase()
    const itemSeries = progress.item.book?.series?.toLowerCase()

    // Match by exact title
    if (itemTitle === recTitle) return true

    // Match by series if both have series
    if (recSeries && itemSeries && recSeries === itemSeries) {
      // If volumes are specified, try to match volume
      if (recommendation.volumes && progress.item.book?.volume) {
        const recVolume = recommendation.volumes.toLowerCase()
        const itemVolume = progress.item.book.volume.toLowerCase()
        if (recVolume.includes(itemVolume) || itemVolume.includes(recVolume)) return true
      }
      return true
    }

    // Match if title contains series name
    if (recSeries && itemTitle.includes(recSeries)) return true
    if (itemSeries && recTitle.includes(itemSeries)) return true

    return false
  })

  if (match) {
    return {
      owned: true,
      itemId: match.itemId,
      isRead: match.isRead,
    }
  }

  return { owned: false }
}

export default function RecommendationsPage() {
  const [selectedBookType, setSelectedBookType] = useState<BookType>('COMIC')
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())

  // Fetch recommendations
  const {
    data: recommendationsData,
    isLoading: isLoadingRecommendations,
    error: recommendationsError,
  } = useQuery<RecommendationsResponse>({
    queryKey: ['recommendations', selectedBookType],
    queryFn: async () => {
      const res = await fetch(`/api/recommendations?bookType=${selectedBookType}`)
      if (!res.ok) throw new Error('Failed to fetch recommendations')
      return res.json()
    },
  })

  // Fetch reading progress
  const { data: progressData, isLoading: isLoadingProgress } = useQuery<ReadingProgressResponse>({
    queryKey: ['reading-progress'],
    queryFn: async () => {
      const res = await fetch('/api/reading-progress')
      if (!res.ok) throw new Error('Failed to fetch reading progress')
      return res.json()
    },
  })

  // Get current selected path
  const selectedPath = useMemo(() => {
    if (!recommendationsData?.paths) return null
    if (!selectedPathId && recommendationsData.paths.length > 0) {
      // Auto-select first path
      return recommendationsData.paths[0]
    }
    return recommendationsData.paths.find((path) => path.id === selectedPathId) || null
  }, [recommendationsData, selectedPathId])

  // Calculate phase progress
  const phaseProgress = useMemo(() => {
    if (!selectedPath || !progressData?.progress) return new Map()

    const progressMap = new Map<string, { total: number; read: number; owned: number }>()

    selectedPath.phases.forEach((phase) => {
      const total = phase.recommendations.length
      let read = 0
      let owned = 0

      phase.recommendations.forEach((rec) => {
        const match = matchRecommendationWithCollection(rec, progressData.progress)
        if (match.owned) {
          owned++
          if (match.isRead) read++
        }
      })

      progressMap.set(phase.id, { total, read, owned })
    })

    return progressMap
  }, [selectedPath, progressData])

  // Get next recommendation to read
  const nextToRead = useMemo(() => {
    if (!selectedPath || !progressData?.progress) return null

    for (const phase of selectedPath.phases) {
      for (const rec of phase.recommendations) {
        const match = matchRecommendationWithCollection(rec, progressData.progress)
        if (match.owned && !match.isRead) {
          return { recommendation: rec, phase, match }
        }
      }
    }

    return null
  }, [selectedPath, progressData])

  // Toggle phase expansion
  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phaseId)) {
        next.delete(phaseId)
      } else {
        next.add(phaseId)
      }
      return next
    })
  }

  const isLoading = isLoadingRecommendations || isLoadingProgress

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reading Recommendations</h1>
        <p className="text-muted-foreground">
          Discover personalized reading paths based on your collection
        </p>
      </div>

      {/* Collection Type Filter */}
      <div className="mb-6">
        <Tabs
          value={selectedBookType}
          onValueChange={(value) => setSelectedBookType(value as BookType)}
        >
          <TabsList>
            <TabsTrigger value="COMIC">Comics</TabsTrigger>
            <TabsTrigger value="MANGA">Manga</TabsTrigger>
            <TabsTrigger value="GRAPHIC_NOVEL">Graphic Novels</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Collection Insights Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Collection Insights</h2>
        <CollectionInsights bookType={selectedBookType} />
      </div>

      {/* Divider */}
      <div className="mb-8 border-t" />

      {/* Reading Recommendations Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Reading Paths</h2>
        <p className="text-muted-foreground">
          Follow curated reading guides to enhance your collection experience
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : recommendationsError ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Failed to load recommendations. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      ) : !recommendationsData?.paths || recommendationsData.paths.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
              <p>There are no reading recommendations for {selectedBookType.toLowerCase()}s yet.</p>
              <p className="mt-2 text-sm">Check back later or try a different collection type.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Reading Path Selector */}
          {recommendationsData.paths.length > 1 && (
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Choose Your Reading Path</label>
              <Select
                value={selectedPath?.id || ''}
                onValueChange={(value) => setSelectedPathId(value)}
              >
                <SelectTrigger className="w-full md:w-[400px]">
                  <SelectValue placeholder="Select a reading path" />
                </SelectTrigger>
                <SelectContent>
                  {recommendationsData.paths.map((path) => (
                    <SelectItem key={path.id} value={path.id}>
                      {path.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPath?.description && (
                <p className="text-sm text-muted-foreground mt-2">{selectedPath.description}</p>
              )}
            </div>
          )}

          {selectedPath && (
            <>
              {/* What to Read Next */}
              {nextToRead && (
                <Card className="mb-6 border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookMarked className="h-5 w-5" />
                      What to Read Next
                    </CardTitle>
                    <CardDescription>Based on your progress in {selectedPath.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">{nextToRead.recommendation.title}</h4>
                          {nextToRead.recommendation.series && (
                            <p className="text-sm text-muted-foreground">
                              Series: {nextToRead.recommendation.series}
                            </p>
                          )}
                          {nextToRead.recommendation.author && (
                            <p className="text-sm text-muted-foreground">
                              Author: {nextToRead.recommendation.author}
                            </p>
                          )}
                          {(nextToRead.recommendation.volumes ||
                            nextToRead.recommendation.issues) && (
                            <p className="text-sm text-muted-foreground">
                              {nextToRead.recommendation.volumes &&
                                `Volumes: ${nextToRead.recommendation.volumes}`}
                              {nextToRead.recommendation.issues &&
                                `Issues: ${nextToRead.recommendation.issues}`}
                            </p>
                          )}
                        </div>
                        {nextToRead.recommendation.tier && (
                          <Badge variant="secondary">{nextToRead.recommendation.tier}</Badge>
                        )}
                      </div>
                      {nextToRead.recommendation.reasoning && (
                        <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                          {nextToRead.recommendation.reasoning}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <span>From:</span>
                        <Badge variant="outline">{nextToRead.phase.name}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Overall Progress */}
              {selectedPath.phases.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                    <CardDescription>
                      Track your journey through {selectedPath.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedPath.phases.map((phase) => {
                        const progress = phaseProgress.get(phase.id) || {
                          total: 0,
                          read: 0,
                          owned: 0,
                        }
                        const percentage =
                          progress.total > 0 ? (progress.read / progress.total) * 100 : 0

                        return (
                          <div key={phase.id} className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{phase.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {progress.read}/{progress.total} read
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <Badge
                              variant={progress.read === progress.total ? 'default' : 'secondary'}
                            >
                              {progress.owned}/{progress.total} owned
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Phases with Recommendations */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Reading Phases</h2>
                {selectedPath.phases.map((phase) => {
                  const isExpanded = expandedPhases.has(phase.id)
                  const progress = phaseProgress.get(phase.id) || { total: 0, read: 0, owned: 0 }

                  return (
                    <Card key={phase.id}>
                      <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => togglePhase(phase.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <CardTitle>{phase.name}</CardTitle>
                              {phase.description && (
                                <CardDescription className="mt-1">
                                  {phase.description}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {progress.read}/{progress.total} read
                            </Badge>
                            <Badge variant="secondary">
                              {phase.recommendations.length}{' '}
                              {phase.recommendations.length === 1 ? 'book' : 'books'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      {isExpanded && (
                        <CardContent>
                          <div className="space-y-3">
                            {phase.recommendations.map((rec) => {
                              const match = progressData?.progress
                                ? matchRecommendationWithCollection(rec, progressData.progress)
                                : { owned: false }

                              return (
                                <div
                                  key={rec.id}
                                  className={`p-4 rounded-lg border ${
                                    match.owned
                                      ? match.isRead
                                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                                        : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                                      : 'bg-muted/30'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                      {match.owned ? (
                                        match.isRead ? (
                                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                        ) : (
                                          <Circle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                        )
                                      ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                      )}
                                      <div className="flex-1">
                                        <h4 className="font-semibold">{rec.title}</h4>
                                        {rec.series && (
                                          <p className="text-sm text-muted-foreground">
                                            Series: {rec.series}
                                          </p>
                                        )}
                                        {rec.author && (
                                          <p className="text-sm text-muted-foreground">
                                            Author: {rec.author}
                                          </p>
                                        )}
                                        {(rec.volumes || rec.issues) && (
                                          <p className="text-sm text-muted-foreground">
                                            {rec.volumes && `Volumes: ${rec.volumes}`}
                                            {rec.issues && `Issues: ${rec.issues}`}
                                          </p>
                                        )}
                                        {rec.reasoning && (
                                          <p className="text-sm mt-2 p-2 bg-background rounded border">
                                            {rec.reasoning}
                                          </p>
                                        )}
                                        {rec.notes && (
                                          <p className="text-xs text-muted-foreground mt-1 italic">
                                            {rec.notes}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end shrink-0">
                                      {rec.tier && <Badge variant="secondary">{rec.tier}</Badge>}
                                      {match.owned && (
                                        <Badge variant={match.isRead ? 'default' : 'outline'}>
                                          {match.isRead ? 'Read' : 'In Collection'}
                                        </Badge>
                                      )}
                                      {!match.owned && (
                                        <Badge variant="outline" className="text-muted-foreground">
                                          Not Owned
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
