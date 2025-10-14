'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Gamepad2, Music, BookOpen, Plus, Upload, Database } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Item, CollectionType } from '@prisma/client'

interface DashboardStats {
  total: number
  videogames: number
  music: number
  books: number
}

interface DashboardData {
  stats: DashboardStats
  recentItems: Item[]
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      return res.json()
    },
  })

  if (error) {
    return (
      <div className="container py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to your collection dashboard.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/videogames/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/settings">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/settings">
            <Database className="mr-2 h-4 w-4" />
            Backup
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded" />
              ) : (
                data?.stats.total || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all collections</p>
          </CardContent>
        </Card>

        {/* Video Games */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Games</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded" />
              ) : (
                data?.stats.videogames || 0
              )}
            </div>
            <Link
              href="/videogames"
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              View collection →
            </Link>
          </CardContent>
        </Card>

        {/* Music */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Music</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded" />
              ) : (
                data?.stats.music || 0
              )}
            </div>
            <Link href="/music" className="text-xs text-primary hover:underline mt-1 inline-block">
              View collection →
            </Link>
          </CardContent>
        </Card>

        {/* Books */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded" />
              ) : (
                data?.stats.books || 0
              )}
            </div>
            <Link href="/books" className="text-xs text-primary hover:underline mt-1 inline-block">
              View collection →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Collection Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <CardTitle>Video Games</CardTitle>
            </div>
            <CardDescription>Manage your gaming collection</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track games across all platforms, regions, and formats.
            </p>
            <Button asChild className="w-full">
              <Link href="/videogames">View Collection</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-primary" />
              <CardTitle>Music</CardTitle>
            </div>
            <CardDescription>Organize your music library</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Keep track of vinyl records, CDs, and digital albums.
            </p>
            <Button asChild className="w-full">
              <Link href="/music">View Collection</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>Books</CardTitle>
            </div>
            <CardDescription>Catalog your reading collection</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage manga, comics, and books in one place.
            </p>
            <Button asChild className="w-full">
              <Link href="/books">View Collection</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Additions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Additions</CardTitle>
          <CardDescription>Your last 20 added items</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : data?.recentItems && data.recentItems.length > 0 ? (
            <div className="space-y-2">
              {data.recentItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/${getCollectionPath(item.collectionType)}/${item.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10">
                      {getCollectionIcon(item.collectionType)}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getCollectionLabel(item.collectionType)}
                        {item.year && ` • ${item.year}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items yet. Start adding items to your collection!</p>
              <Button asChild className="mt-4">
                <Link href="/videogames/new">Add Your First Item</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function getCollectionPath(type: CollectionType): string {
  switch (type) {
    case 'VIDEOGAME':
      return 'videogames'
    case 'MUSIC':
      return 'music'
    case 'BOOK':
      return 'books'
    default:
      return 'dashboard'
  }
}

function getCollectionLabel(type: CollectionType): string {
  switch (type) {
    case 'VIDEOGAME':
      return 'Video Game'
    case 'MUSIC':
      return 'Music'
    case 'BOOK':
      return 'Book'
    default:
      return 'Item'
  }
}

function getCollectionIcon(type: CollectionType) {
  switch (type) {
    case 'VIDEOGAME':
      return <Gamepad2 className="h-4 w-4 text-primary" />
    case 'MUSIC':
      return <Music className="h-4 w-4 text-primary" />
    case 'BOOK':
      return <BookOpen className="h-4 w-4 text-primary" />
    default:
      return null
  }
}
