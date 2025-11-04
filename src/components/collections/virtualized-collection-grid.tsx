'use client'

import { useRef, useEffect, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import Link from 'next/link'
import Image from 'next/image'
import { Gamepad2, Music, BookOpen, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Item, CollectionType, Videogame, Music as MusicType, Book } from '@prisma/client'
import type { ReadingProgress } from '@/hooks/use-reading-progress'

type ItemWithRelations = Item & {
  videogame?: Videogame | null
  music?: MusicType | null
  book?: Book | null
}

interface VirtualizedCollectionGridProps {
  items: ItemWithRelations[]
  collectionType: CollectionType
  onItemClick?: (item: ItemWithRelations) => void
  readingProgress?: ReadingProgress[]
}

export function VirtualizedCollectionGrid({
  items,
  collectionType,
  onItemClick,
  readingProgress = [],
}: VirtualizedCollectionGridProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const getCollectionPath = (type: CollectionType): string => {
    switch (type) {
      case 'VIDEOGAME':
        return 'videogames'
      case 'MUSIC':
        return 'music'
      case 'BOOK':
        return 'books'
      default:
        return 'items'
    }
  }

  const getPlaceholderIcon = (type: CollectionType) => {
    switch (type) {
      case 'VIDEOGAME':
        return <Gamepad2 className="h-16 w-16 text-muted-foreground" />
      case 'MUSIC':
        return <Music className="h-16 w-16 text-muted-foreground" />
      case 'BOOK':
        return <BookOpen className="h-16 w-16 text-muted-foreground" />
      default:
        return null
    }
  }

  const isItemRead = (itemId: string): boolean => {
    const progress = readingProgress.find((p) => p.itemId === itemId)
    return progress?.isRead ?? false
  }

  // Calculate columns based on window width (matches CollectionGrid responsive grid)
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 6 // SSR default

    const width = window.innerWidth
    if (width < 640) return 2 // sm
    if (width < 768) return 3 // md
    if (width < 1024) return 4 // lg
    if (width < 1280) return 5 // xl
    return 6 // 2xl+
  }

  // Use state to track column count for responsive updates
  const [columnCount, setColumnCount] = useState(getColumnCount)

  // Group items into rows based on current column count
  const rows: ItemWithRelations[][] = []
  for (let i = 0; i < items.length; i += columnCount) {
    rows.push(items.slice(i, i + columnCount))
  }

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320, // Approximate row height (card height + gap)
    overscan: 2, // Render 2 extra rows above and below viewport
  })

  // Handle window resize to recalculate columns and re-group items
  useEffect(() => {
    const handleResize = () => {
      const newColumnCount = getColumnCount()
      if (newColumnCount !== columnCount) {
        setColumnCount(newColumnCount)
      }
      rowVirtualizer.measure()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [columnCount, rowVirtualizer])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">{getPlaceholderIcon(collectionType)}</div>
        <h3 className="text-lg font-semibold mb-2">No items yet</h3>
        <p className="text-muted-foreground mb-4">
          Start building your collection by adding your first item.
        </p>
      </div>
    )
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-16rem)] overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-4">
                {row.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${getCollectionPath(collectionType)}/${item.id}`}
                    onClick={(e) => {
                      if (onItemClick) {
                        e.preventDefault()
                        onItemClick(item)
                      }
                    }}
                    className="group"
                  >
                    <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-105">
                      <CardContent className="p-0">
                        {/* Cover Image */}
                        <div className="relative aspect-[2/3] bg-muted">
                          {item.coverUrl ? (
                            <Image
                              src={item.coverUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              {getPlaceholderIcon(collectionType)}
                            </div>
                          )}
                          {/* Read Status Badge - Only show for BOOK items that are read */}
                          {collectionType === 'BOOK' && isItemRead(item.id) && (
                            <div className="absolute top-2 right-2">
                              <Badge
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Read
                              </Badge>
                            </div>
                          )}
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                            <p className="text-white text-sm font-medium text-center line-clamp-3">
                              {item.title}
                            </p>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="p-2">
                          <h3
                            className="font-medium text-sm line-clamp-2 min-h-10 mb-1"
                            title={item.title}
                          >
                            {item.title}
                          </h3>
                          <div className="space-y-0.5">
                            {collectionType === 'VIDEOGAME' && item.videogame?.platform && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.videogame.platform}
                              </p>
                            )}
                            {item.year && (
                              <p className="text-xs text-muted-foreground">{item.year}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
