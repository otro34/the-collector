import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface ReadingProgress {
  id: string
  itemId: string
  isRead: boolean
  startedAt: Date | null
  completedAt: Date | null
  readingPath: string | null
  currentPhase: string | null
  createdAt: Date
  updatedAt: Date
}

interface CreateReadingProgressData {
  itemId: string
  isRead: boolean
  startedAt?: Date
  completedAt?: Date
  readingPath?: string
  currentPhase?: string
}

/**
 * Hook to fetch reading progress for a specific item
 */
export function useReadingProgress(itemId: string | null) {
  return useQuery({
    queryKey: ['reading-progress', itemId],
    queryFn: async () => {
      if (!itemId) return null

      const response = await fetch(`/api/reading-progress/${itemId}`)
      if (!response.ok) {
        if (response.status === 404) {
          return null // No reading progress exists yet
        }
        throw new Error('Failed to fetch reading progress')
      }
      const data = await response.json()
      return data.progress as ReadingProgress
    },
    enabled: !!itemId,
  })
}

/**
 * Hook to fetch all reading progress records
 */
export function useAllReadingProgress() {
  return useQuery({
    queryKey: ['reading-progress'],
    queryFn: async () => {
      const response = await fetch('/api/reading-progress')
      if (!response.ok) {
        throw new Error('Failed to fetch reading progress')
      }
      const data = await response.json()
      return data.progress as ReadingProgress[]
    },
  })
}

/**
 * Hook to toggle read/unread status with optimistic updates
 */
export function useToggleReadStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      itemId,
      isRead,
      itemTitle: _itemTitle,
    }: {
      itemId: string
      isRead: boolean
      itemTitle: string
    }) => {
      const data: CreateReadingProgressData = {
        itemId,
        isRead,
      }

      // Set completedAt if marking as read
      if (isRead) {
        data.completedAt = new Date()
      }

      const response = await fetch('/api/reading-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update reading status')
      }

      const result = await response.json()
      return result.progress as ReadingProgress
    },
    onMutate: async ({ itemId, isRead }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reading-progress', itemId] })

      // Snapshot the previous value
      const previousProgress = queryClient.getQueryData<ReadingProgress | null>([
        'reading-progress',
        itemId,
      ])

      // Optimistically update to the new value
      queryClient.setQueryData<ReadingProgress | null>(['reading-progress', itemId], (old) => {
        if (!old) {
          return {
            id: 'temp-id',
            itemId,
            isRead,
            startedAt: null,
            completedAt: isRead ? new Date() : null,
            readingPath: null,
            currentPhase: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        }
        return {
          ...old,
          isRead,
          completedAt: isRead ? new Date() : null,
          updatedAt: new Date(),
        }
      })

      return { previousProgress }
    },
    onError: (err, { itemId }, context) => {
      // Rollback to the previous value
      if (context?.previousProgress !== undefined) {
        queryClient.setQueryData(['reading-progress', itemId], context.previousProgress)
      }
      toast.error('Failed to update reading status', {
        description: 'Please try again.',
      })
    },
    onSuccess: (data, { isRead, itemTitle }) => {
      toast.success(isRead ? 'Marked as read' : 'Marked as unread', {
        description: `${itemTitle} has been ${isRead ? 'marked as read' : 'marked as unread'}.`,
      })
    },
    onSettled: (data, error, { itemId }) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reading-progress', itemId] })
      queryClient.invalidateQueries({ queryKey: ['reading-progress'] })
      // Also invalidate items queries to update read counts
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

/**
 * Hook to delete reading progress
 */
export function useDeleteReadingProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/reading-progress/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete reading progress')
      }

      return response.json()
    },
    onSuccess: (data, itemId) => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', itemId] })
      queryClient.invalidateQueries({ queryKey: ['reading-progress'] })
      toast.success('Reading progress cleared')
    },
    onError: () => {
      toast.error('Failed to clear reading progress', {
        description: 'Please try again.',
      })
    },
  })
}
