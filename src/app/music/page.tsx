'use client'

import { Suspense, useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Grid, List, Plus, Filter as FilterIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { CollectionGrid } from '@/components/collections/collection-grid'
import { CollectionList } from '@/components/collections/collection-list'
import { ItemDetailModal } from '@/components/items/item-detail-modal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FilterSidebar, type FilterOptions } from '@/components/collections/filter-sidebar'
import {
  SortControl,
  type SortOption,
  type SortField,
  type SortDirection,
} from '@/components/shared/sort-control'
import { CollectionSearch } from '@/components/shared/collection-search'
import { toast } from 'sonner'
import type { Item, Music as MusicType } from '@prisma/client'

type ItemWithRelations = Item & {
  music?: MusicType | null
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface MusicResponse {
  items: Item[]
  pagination: PaginationInfo
}

function MusicPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<ItemWithRelations | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ItemWithRelations | null>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Sort state - use URL params for persistence
  const [sortField, setSortField] = useState<SortField>(
    (searchParams.get('sortField') as SortField) || 'createdAt'
  )
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    (searchParams.get('sortDirection') as SortDirection) || 'desc'
  )

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({})
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Calculate active filters count
  useEffect(() => {
    let count = 0
    if (filters.formats && filters.formats.length > 0) count++
    if (filters.genres && filters.genres.length > 0) count++
    if (filters.artists && filters.artists.length > 0) count++
    if (filters.yearRange) count++
    setActiveFiltersCount(count)
  }, [filters])

  // Fetch available filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['music-filters'],
    queryFn: async () => {
      const res = await fetch('/api/items/music/filters')
      if (!res.ok) throw new Error('Failed to fetch filter options')
      return res.json() as Promise<{
        formats: string[]
        genres: string[]
        artists: string[]
        yearRange: [number, number] | undefined
      }>
    },
  })

  // Build query string from search, filters, and sort
  const buildQueryString = () => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '50')
    params.set('sortField', sortField)
    params.set('sortDirection', sortDirection)

    // Add search query
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    }

    if (filters.formats && filters.formats.length > 0) {
      params.set('formats', filters.formats.join(','))
    }
    if (filters.genres && filters.genres.length > 0) {
      params.set('genres', filters.genres.join(','))
    }
    if (filters.artists && filters.artists.length > 0) {
      params.set('artists', filters.artists.join(','))
    }
    if (filters.yearRange) {
      params.set('minYear', filters.yearRange[0].toString())
      params.set('maxYear', filters.yearRange[1].toString())
    }

    return params.toString()
  }

  const { data, isLoading, error } = useQuery<MusicResponse>({
    queryKey: ['music', page, sortField, sortDirection, searchQuery, filters],
    queryFn: async () => {
      const queryString = buildQueryString()
      const res = await fetch(`/api/items/music?${queryString}`)
      if (!res.ok) throw new Error('Failed to fetch music')
      return res.json()
    },
  })

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setPage(1) // Reset to first page when search changes
  }

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    setSortField(option.field)
    setSortDirection(option.direction)
    setPage(1) // Reset to first page when sorting changes

    // Update URL params for persistence
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortField', option.field)
    params.set('sortDirection', option.direction)
    params.set('page', '1')
    router.push(`/music?${params.toString()}`, { scroll: false })
  }

  // Handle filter change
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
    setFilterSheetOpen(false) // Close mobile sheet
  }

  // Handle opening item from URL query parameter (e.g., from search results)
  useEffect(() => {
    const itemId = searchParams.get('itemId')
    if (itemId && data?.items) {
      const item = data.items.find((i) => i.id === itemId)
      if (item) {
        setSelectedItem(item as ItemWithRelations)
        setModalOpen(true)
        router.replace('/music', { scroll: false })
      } else {
        fetch(`/api/items/${itemId}`)
          .then((res) => res.json())
          .then((item) => {
            if (item && item.collectionType === 'MUSIC') {
              setSelectedItem(item)
              setModalOpen(true)
            }
            router.replace('/music', { scroll: false })
          })
          .catch(() => {
            router.replace('/music', { scroll: false })
          })
      }
    }
  }, [searchParams, data, router])

  const handleItemClick = (item: ItemWithRelations) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  const handleEdit = (item: ItemWithRelations) => {
    setModalOpen(false)
    router.push(`/music/${item.id}/edit`)
  }

  const handleDelete = (item: ItemWithRelations) => {
    setItemToDelete(item)
    setModalOpen(false)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      const response = await fetch(`/api/items/${itemToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['music'] })

      toast.success('Music album deleted successfully')

      setItemToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete music album')
    }
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">Failed to load music. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8 border rounded-lg bg-card">
            {filterOptions && (
              <FilterSidebar
                collectionType="MUSIC"
                filterOptions={filters}
                availableFilters={{
                  formats: filterOptions.formats || [],
                  genres: filterOptions.genres || [],
                  artists: filterOptions.artists || [],
                  yearRange: filterOptions.yearRange,
                }}
                onFilterChange={handleFilterChange}
              />
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Music</h1>
                {data && (
                  <p className="text-muted-foreground mt-1">
                    {data.pagination.total} album{data.pagination.total !== 1 ? 's' : ''} in your
                    collection
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <FilterIcon className="h-4 w-4 mr-2" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="default" className="ml-2 px-1.5 py-0.5 text-xs">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-80">
                    {filterOptions && (
                      <FilterSidebar
                        collectionType="MUSIC"
                        filterOptions={filters}
                        availableFilters={{
                          formats: filterOptions.formats || [],
                          genres: filterOptions.genres || [],
                          artists: filterOptions.artists || [],
                          yearRange: filterOptions.yearRange,
                        }}
                        onFilterChange={handleFilterChange}
                        onClose={() => setFilterSheetOpen(false)}
                      />
                    )}
                  </SheetContent>
                </Sheet>

                {/* Sort Control */}
                <SortControl
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSortChange={handleSortChange}
                  collectionType="MUSIC"
                />

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
                  <Link href="/music/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Album
                  </Link>
                </Button>
              </div>
            </div>

            {/* Search Box */}
            <CollectionSearch
              value={searchQuery}
              onSearchChange={handleSearchChange}
              placeholder="Search by title, artist, publisher, or description..."
              className="w-full"
            />
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
                <CollectionGrid
                  items={data.items}
                  collectionType="MUSIC"
                  onItemClick={handleItemClick}
                />
              ) : (
                <CollectionList
                  items={data.items}
                  collectionType="MUSIC"
                  onItemClick={handleItemClick}
                />
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

          {/* Item Detail Modal */}
          <ItemDetailModal
            item={selectedItem}
            open={modalOpen}
            onOpenChange={setModalOpen}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDelete}
            title="Delete Music Album"
            description={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            variant="destructive"
          />
        </div>
      </div>
    </div>
  )
}

export default function MusicPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg w-1/3" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <MusicPageContent />
    </Suspense>
  )
}
