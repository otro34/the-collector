'use client'

import { Suspense, useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Grid, List, Plus, Filter as FilterIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CollectionGrid } from '@/components/collections/collection-grid'
import { CollectionList } from '@/components/collections/collection-list'
import { VirtualizedCollectionGrid } from '@/components/collections/virtualized-collection-grid'
import { CollectionGridSkeleton } from '@/components/collections/collection-grid-skeleton'
import { CollectionListSkeleton } from '@/components/collections/collection-list-skeleton'
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
import { ExportButton } from '@/components/shared/export-button'
import { FloatingActionButton } from '@/components/shared/floating-action-button'
import { toast } from 'sonner'
import type { Item, Videogame } from '@prisma/client'
import { VIRTUAL_SCROLL_LIMIT } from '@/lib/constants'

type ItemWithRelations = Item & {
  videogame?: Videogame | null
}

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

function VideogamesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [useVirtualScroll, setUseVirtualScroll] = useState(false)

  // Always read page from URL - single source of truth
  const page = parseInt(searchParams.get('page') || '1', 10)
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
    if (filters.platforms && filters.platforms.length > 0) count++
    if (filters.genres && filters.genres.length > 0) count++
    if (filters.publishers && filters.publishers.length > 0) count++
    if (filters.yearRange) count++
    setActiveFiltersCount(count)
  }, [filters])

  // Fetch available filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['videogame-filters'],
    queryFn: async () => {
      const res = await fetch('/api/items/videogames/filters')
      if (!res.ok) throw new Error('Failed to fetch filter options')
      return res.json() as Promise<{
        platforms: string[]
        genres: string[]
        publishers: string[]
        yearRange: [number, number] | undefined
      }>
    },
  })

  // Build query string from search, filters, and sort
  const buildQueryString = () => {
    const params = new URLSearchParams()
    params.set('page', useVirtualScroll ? '1' : page.toString())
    params.set('limit', useVirtualScroll ? VIRTUAL_SCROLL_LIMIT.toString() : '50')
    params.set('sortField', sortField)
    params.set('sortDirection', sortDirection)

    // Add search query
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    }

    if (filters.platforms && filters.platforms.length > 0) {
      params.set('platforms', filters.platforms.join(','))
    }
    if (filters.genres && filters.genres.length > 0) {
      params.set('genres', filters.genres.join(','))
    }
    if (filters.publishers && filters.publishers.length > 0) {
      params.set('publishers', filters.publishers.join(','))
    }
    if (filters.yearRange) {
      params.set('minYear', filters.yearRange[0].toString())
      params.set('maxYear', filters.yearRange[1].toString())
    }

    return params.toString()
  }

  const { data, isLoading, error } = useQuery<VideogamesResponse>({
    queryKey: [
      'videogames',
      page,
      sortField,
      sortDirection,
      searchQuery,
      filters,
      useVirtualScroll,
    ],
    queryFn: async () => {
      const queryString = buildQueryString()
      const res = await fetch(`/api/items/videogames?${queryString}`)
      if (!res.ok) throw new Error('Failed to fetch video games')
      return res.json()
    },
    placeholderData: (previousData) => previousData,
  })

  // Handle search change
  const handleSearchChange = (query: string) => {
    // Only reset page if the search query actually changed
    if (query !== searchQuery) {
      setSearchQuery(query)
      // Reset to first page when search changes
      if (page !== 1) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', '1')
        router.push(`/videogames?${params.toString()}`)
      }
    }
  }

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    setSortField(option.field)
    setSortDirection(option.direction)

    // Update URL params for persistence and reset to page 1
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortField', option.field)
    params.set('sortDirection', option.direction)
    params.set('page', '1')
    router.push(`/videogames?${params.toString()}`, { scroll: false })
  }

  // Handle filter change
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    // Reset to first page when filters change
    if (page !== 1) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', '1')
      router.push(`/videogames?${params.toString()}`)
    }
    setFilterSheetOpen(false) // Close mobile sheet
  }

  // Handle opening item from URL query parameter (e.g., from search results)
  useEffect(() => {
    const itemId = searchParams.get('itemId')
    if (itemId && data?.items && Array.isArray(data.items)) {
      const item = data.items.find((i) => i.id === itemId)
      if (item) {
        setSelectedItem(item as ItemWithRelations)
        setModalOpen(true)
        // Clear the query parameter
        router.replace('/videogames', { scroll: false })
      } else {
        // Item not on current page, fetch it directly
        fetch(`/api/items/${itemId}`)
          .then((res) => res.json())
          .then((item) => {
            if (item && item.collectionType === 'VIDEOGAME') {
              setSelectedItem(item)
              setModalOpen(true)
            }
            router.replace('/videogames', { scroll: false })
          })
          .catch(() => {
            router.replace('/videogames', { scroll: false })
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
    router.push(`/videogames/${item.id}/edit`)
  }

  const handleDelete = (item: ItemWithRelations) => {
    setItemToDelete(item)
    setModalOpen(false)
    setDeleteDialogOpen(true)
  }

  const handleImageUpdate = (itemId: string, newCoverUrl: string) => {
    // Update the selected item with the new cover URL
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem({
        ...selectedItem,
        coverUrl: newCoverUrl,
      })
    }

    // Invalidate queries to refresh the list in the background
    queryClient.invalidateQueries({ queryKey: ['videogames'] })
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
      queryClient.invalidateQueries({ queryKey: ['videogames'] })

      toast.success('Video game deleted successfully')

      setItemToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete video game')
    }
  }

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
    <div className="container py-8">
      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8 border rounded-lg bg-card">
            {filterOptions && (
              <FilterSidebar
                collectionType="VIDEOGAME"
                filterOptions={filters}
                availableFilters={{
                  platforms: filterOptions.platforms || [],
                  genres: filterOptions.genres || [],
                  publishers: filterOptions.publishers || [],
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
                <h1 className="text-3xl font-bold tracking-tight">Video Games</h1>
                {data && (
                  <p className="text-muted-foreground mt-1">
                    {data.pagination.total} game{data.pagination.total !== 1 ? 's' : ''} in your
                    collection
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Virtual Scroll Toggle */}
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                  <Checkbox
                    id="virtual-scroll"
                    checked={useVirtualScroll}
                    onCheckedChange={(checked) => setUseVirtualScroll(checked as boolean)}
                  />
                  <Label htmlFor="virtual-scroll" className="text-sm font-medium cursor-pointer">
                    Virtual Scroll
                  </Label>
                </div>

                {/* Export Button */}
                {data && (
                  <ExportButton
                    collectionType="VIDEOGAME"
                    currentFilters={{
                      q: searchQuery || undefined,
                      platforms: filters.platforms,
                      genres: filters.genres,
                      publishers: filters.publishers,
                      minYear: filters.yearRange?.[0],
                      maxYear: filters.yearRange?.[1],
                    }}
                    totalItems={data.pagination.total}
                    className="hidden sm:flex"
                  />
                )}

                {/* Mobile Filter Button */}
                <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden relative">
                      <FilterIcon className="mr-2 h-4 w-4" />
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
                        collectionType="VIDEOGAME"
                        filterOptions={filters}
                        availableFilters={{
                          platforms: filterOptions.platforms || [],
                          genres: filterOptions.genres || [],
                          publishers: filterOptions.publishers || [],
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
                  collectionType="VIDEOGAME"
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
                <Button asChild className="hidden sm:flex">
                  <Link href="/videogames/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Game
                  </Link>
                </Button>
              </div>
            </div>

            {/* Search Box */}
            <CollectionSearch
              value={searchQuery}
              onSearchChange={handleSearchChange}
              placeholder="Search by title, developer, publisher, or description..."
              className="w-full"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {view === 'grid' ? <CollectionGridSkeleton /> : <CollectionListSkeleton />}
            </div>
          )}

          {/* Collection View */}
          {!isLoading && data && (
            <>
              {view === 'grid' ? (
                useVirtualScroll ? (
                  <VirtualizedCollectionGrid
                    items={data.items}
                    collectionType="VIDEOGAME"
                    onItemClick={handleItemClick}
                  />
                ) : (
                  <CollectionGrid
                    items={data.items}
                    collectionType="VIDEOGAME"
                    onItemClick={handleItemClick}
                  />
                )
              ) : (
                <CollectionList
                  items={data.items}
                  collectionType="VIDEOGAME"
                  onItemClick={handleItemClick}
                />
              )}

              {/* Pagination - hide when virtual scrolling is enabled */}
              {!useVirtualScroll && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = Math.max(1, page - 1)
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('page', newPage.toString())
                      router.push(`/videogames?${params.toString()}`)
                    }}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = Math.min(data.pagination.totalPages, page + 1)
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('page', newPage.toString())
                      router.push(`/videogames?${params.toString()}`)
                    }}
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
            onImageUpdate={handleImageUpdate}
          />

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDelete}
            title="Delete Video Game"
            description={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            variant="destructive"
          />

          {/* Floating Action Button - Mobile Only */}
          <FloatingActionButton href="/videogames/new" label="Add new video game" />
        </div>
      </div>
    </div>
  )
}

export default function VideogamesPage() {
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
      <VideogamesPageContent />
    </Suspense>
  )
}
