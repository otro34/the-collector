'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, CheckCircle2, TrendingUp, Target, Award, Clock } from 'lucide-react'
import type { BookType } from '@prisma/client'

interface CollectionInsightsProps {
  bookType?: BookType
}

interface SeriesItem {
  id: string
  title: string
  volume: string | null
  isRead: boolean
  coverUrl: string | null
}

interface SeriesInsight {
  series: string
  totalVolumes: number
  ownedVolumes: number
  readVolumes: number
  completionPercentage: number
  isComplete: boolean
  missingVolumes: string[]
  items: SeriesItem[]
}

interface ReadingStats {
  totalBooks: number
  totalRead: number
  totalUnread: number
  readPercentage: number
  totalComics: number
  totalManga: number
  totalGraphicNovels: number
  readComics: number
  readManga: number
  readGraphicNovels: number
  recentlyCompleted: Array<{
    id: string
    title: string
    completedAt: string
    coverUrl: string | null
    type: BookType
  }>
}

interface InsightsResponse {
  success: boolean
  insights: {
    stats: ReadingStats
    completeSeries: SeriesInsight[]
    incompleteSeries: SeriesInsight[]
  }
}

// Fetch insights from API
async function fetchInsights(bookType?: BookType): Promise<InsightsResponse> {
  const params = bookType ? `?bookType=${bookType}` : ''
  const response = await fetch(`/api/insights${params}`)

  if (!response.ok) {
    throw new Error('Failed to fetch insights')
  }

  return response.json()
}

export function CollectionInsights({ bookType }: CollectionInsightsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['insights', bookType],
    queryFn: () => fetchInsights(bookType),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  if (isLoading) {
    return <InsightsSkeleton />
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Insights</CardTitle>
          <CardDescription>
            Failed to load collection insights. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!data?.insights) {
    return null
  }

  const { stats, completeSeries, incompleteSeries } = data.insights

  return (
    <div className="space-y-6">
      {/* Reading Statistics */}
      <StatsCards stats={stats} />

      {/* Recently Completed */}
      {stats.recentlyCompleted.length > 0 && <RecentlyCompleted items={stats.recentlyCompleted} />}

      {/* Complete Series */}
      {completeSeries.length > 0 && (
        <SeriesSection
          title="Complete Series"
          description="Series you've fully collected"
          icon={<Award className="h-5 w-5 text-green-600 dark:text-green-400" />}
          series={completeSeries}
          variant="complete"
        />
      )}

      {/* Incomplete Series */}
      {incompleteSeries.length > 0 && (
        <SeriesSection
          title="Series In Progress"
          description="Series with missing volumes or unread items"
          icon={<Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          series={incompleteSeries}
          variant="incomplete"
        />
      )}

      {/* Empty State */}
      {completeSeries.length === 0 && incompleteSeries.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Series Found</CardTitle>
            <CardDescription>
              Start adding books with series information to see collection insights here.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

function StatsCards({ stats }: { stats: ReadingStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Books */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Books</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBooks}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalComics} comics, {stats.totalManga} manga, {stats.totalGraphicNovels} graphic
            novels
          </p>
        </CardContent>
      </Card>

      {/* Reading Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reading Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.readPercentage}%</div>
          <Progress value={stats.readPercentage} className="mt-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            {stats.totalRead} read, {stats.totalUnread} unread
          </p>
        </CardContent>
      </Card>

      {/* Comics Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comics</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.readComics} / {stats.totalComics}
          </div>
          <Progress
            value={stats.totalComics > 0 ? (stats.readComics / stats.totalComics) * 100 : 0}
            className="mt-2"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {stats.totalComics > 0
              ? `${Math.round((stats.readComics / stats.totalComics) * 100)}% complete`
              : 'No comics'}
          </p>
        </CardContent>
      </Card>

      {/* Manga Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Manga</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.readManga} / {stats.totalManga}
          </div>
          <Progress
            value={stats.totalManga > 0 ? (stats.readManga / stats.totalManga) * 100 : 0}
            className="mt-2"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {stats.totalManga > 0
              ? `${Math.round((stats.readManga / stats.totalManga) * 100)}% complete`
              : 'No manga'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function RecentlyCompleted({ items }: { items: ReadingStats['recentlyCompleted'] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Recently Completed</CardTitle>
        </div>
        <CardDescription>Books you&apos;ve finished reading recently</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
            >
              {item.coverUrl ? (
                <div className="relative h-16 w-12 rounded overflow-hidden">
                  <Image
                    src={item.coverUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-12 items-center justify-center rounded bg-muted">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.completedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SeriesSection({
  title,
  description,
  icon,
  series,
  variant,
}: {
  title: string
  description: string
  icon: React.ReactNode
  series: SeriesInsight[]
  variant: 'complete' | 'incomplete'
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {series.map((seriesItem) => (
            <SeriesCard key={seriesItem.series} series={seriesItem} variant={variant} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SeriesCard({
  series,
  variant,
}: {
  series: SeriesInsight
  variant: 'complete' | 'incomplete'
}) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold">{series.series}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {series.readVolumes} of {series.totalVolumes} read
            {series.missingVolumes.length > 0 &&
              ` • ${series.missingVolumes.length} volumes missing`}
          </p>
        </div>
        <Badge
          variant={variant === 'complete' ? 'default' : 'secondary'}
          className={
            variant === 'complete'
              ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
              : ''
          }
        >
          {series.completionPercentage}%
        </Badge>
      </div>

      <Progress value={series.completionPercentage} className="h-2" />

      {series.missingVolumes.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium text-muted-foreground mb-1">Missing Volumes:</p>
          <div className="flex flex-wrap gap-1">
            {series.missingVolumes.map((vol) => (
              <Badge key={vol} variant="outline" className="text-xs">
                Vol. {vol}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {series.items.map((item) => (
          <div
            key={item.id}
            className={`relative rounded overflow-hidden ${
              item.isRead ? 'ring-2 ring-green-500' : ''
            }`}
          >
            {item.coverUrl ? (
              <div className="relative w-full aspect-[2/3]">
                <Image
                  src={item.coverUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  title={`${item.title}${item.volume ? ` - Vol. ${item.volume}` : ''}`}
                />
              </div>
            ) : (
              <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {item.isRead && (
              <div className="absolute top-1 right-1 bg-green-600 rounded-full p-1">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            )}
            {item.volume && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                Vol. {item.volume}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Series Section Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
