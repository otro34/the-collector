import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

interface CollectionGridSkeletonProps {
  count?: number
}

export function CollectionGridSkeleton({ count = 12 }: CollectionGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          {/* Cover image skeleton */}
          <Skeleton className="aspect-[3/4] w-full" />

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
