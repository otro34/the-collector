import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { getCoverAspectClass } from '@/lib/collection-display'
import { cn } from '@/lib/utils'
import type { CollectionType } from '@prisma/client'

interface CollectionGridSkeletonProps {
  count?: number
  collectionType?: CollectionType
}

export function CollectionGridSkeleton({
  count = 12,
  collectionType = 'BOOK',
}: CollectionGridSkeletonProps) {
  const coverAspect = getCoverAspectClass(collectionType)

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          {/* Cover image skeleton - matches the real card ratio per collection */}
          <Skeleton className={cn('w-full', coverAspect)} />

          {/* Content skeleton */}
          <div className="space-y-2 p-3">
            {/* Title skeleton */}
            <Skeleton className="h-4 w-3/4" />

            {/* Metadata skeleton */}
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  )
}
