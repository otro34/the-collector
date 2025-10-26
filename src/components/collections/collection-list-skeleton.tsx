import { Skeleton } from '@/components/ui/skeleton'

interface CollectionListSkeletonProps {
  count?: number
}

export function CollectionListSkeleton({ count = 10 }: CollectionListSkeletonProps) {
  return (
    <div className="space-y-2">
      {/* Desktop table view skeleton */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-lg border">
          {/* Table header */}
          <div className="flex items-center gap-4 border-b bg-muted/50 p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-48 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Table rows */}
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 border-b p-4 last:border-0">
              {/* Cover image */}
              <Skeleton className="h-16 w-12 flex-shrink-0" />

              {/* Title */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>

              {/* Metadata columns */}
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile stacked cards skeleton */}
      <div className="space-y-3 md:hidden">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex gap-3 rounded-lg border bg-card p-3 shadow-sm">
            {/* Cover image */}
            <Skeleton className="h-24 w-16 flex-shrink-0 rounded" />

            {/* Content */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
