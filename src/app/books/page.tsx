'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Grid, List, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CollectionGrid } from '@/components/collections/collection-grid'
import { CollectionList } from '@/components/collections/collection-list'
import { ItemDetailModal } from '@/components/items/item-detail-modal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { toast } from 'sonner'
import type { Item, Book as BookType } from '@prisma/client'

type ItemWithRelations = Item & {
  book?: BookType | null
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface BooksResponse {
  items: Item[]
  pagination: PaginationInfo
}

export default function BooksPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<ItemWithRelations | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ItemWithRelations | null>(null)

  const { data, isLoading, error } = useQuery<BooksResponse>({
    queryKey: ['books', page],
    queryFn: async () => {
      const res = await fetch(`/api/items/books?page=${page}&limit=50`)
      if (!res.ok) throw new Error('Failed to fetch books')
      return res.json()
    },
  })

  const handleItemClick = (item: ItemWithRelations) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  const handleEdit = (item: ItemWithRelations) => {
    setModalOpen(false)
    router.push(`/books/${item.id}/edit`)
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
      queryClient.invalidateQueries({ queryKey: ['books'] })

      toast.success('Book deleted successfully')

      setItemToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete book')
    }
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">Failed to load books. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books</h1>
          {data && (
            <p className="text-muted-foreground mt-1">
              {data.pagination.total} book{data.pagination.total !== 1 ? 's' : ''} in your
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
            <Link href="/books/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Book
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
            <CollectionGrid
              items={data.items}
              collectionType="BOOK"
              onItemClick={handleItemClick}
            />
          ) : (
            <CollectionList
              items={data.items}
              collectionType="BOOK"
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
        title="Delete Book"
        description={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
