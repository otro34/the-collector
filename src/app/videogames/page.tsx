'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Grid, List, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CollectionGrid } from '@/components/collections/collection-grid'
import { CollectionList } from '@/components/collections/collection-list'
import type { Item } from '@prisma/client'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface VideogamesResponse {
  items: Item[]
  pagination: PaginationInfo
}

export default function VideogamesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery<VideogamesResponse>({
    queryKey: ['videogames', page],
    queryFn: async () => {
      const res = await fetch(`/api/items/videogames?page=${page}&limit=50`)
      if (!res.ok) throw new Error('Failed to fetch video games')
      return res.json()
    },
  })

  if (error) {
    return (
      <div className="container py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">Failed to load video games. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Games</h1>
          {data && (
            <p className="text-muted-foreground mt-1">
              {data.pagination.total} game{data.pagination.total !== 1 ? 's' : ''} in your
              collection
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border bg-background p-1">
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
              className="h-8"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Button */}
          <Button asChild>
            <Link href="/videogames/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Game
            </Link>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] animate-pulse bg-muted rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse bg-muted rounded-lg" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collection View */}
      {!isLoading && data && (
        <>
          {view === 'grid' ? (
            <CollectionGrid items={data.items} collectionType="VIDEOGAME" />
          ) : (
            <CollectionList items={data.items} collectionType="VIDEOGAME" />
          )}

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
