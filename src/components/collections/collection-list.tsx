'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Gamepad2, Music, BookOpen, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Item, CollectionType, Videogame, Music as MusicType, Book } from '@prisma/client'
import type { ReadingProgress } from '@/hooks/use-reading-progress'

type ItemWithRelations = Item & {
  videogame?: Videogame | null
  music?: MusicType | null
  book?: Book | null
}

interface CollectionListProps {
  items: ItemWithRelations[]
  collectionType: CollectionType
  onItemClick?: (item: ItemWithRelations) => void
  readingProgress?: ReadingProgress[]
}

export function CollectionList({
  items,
  collectionType,
  onItemClick,
  readingProgress = [],
}: CollectionListProps) {
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
        return <Gamepad2 className="h-8 w-8 text-muted-foreground" />
      case 'MUSIC':
        return <Music className="h-8 w-8 text-muted-foreground" />
      case 'BOOK':
        return <BookOpen className="h-8 w-8 text-muted-foreground" />
      default:
        return null
    }
  }

  const isItemRead = (itemId: string): boolean => {
    const progress = readingProgress.find((p) => p.itemId === itemId)
    return progress?.isRead ?? false
  }

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
    <div className="space-y-2">
      {/* Desktop Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg font-medium text-sm">
        <div className="col-span-1">Cover</div>
        <div className="col-span-3">Title</div>
        {collectionType === 'VIDEOGAME' && <div className="col-span-2">Platform</div>}
        <div className={collectionType === 'VIDEOGAME' ? 'col-span-1' : 'col-span-2'}>Year</div>
        <div className="col-span-2">Language</div>
        <div className="col-span-2">Copies</div>
        <div className="col-span-1">Price</div>
      </div>

      {/* Items */}
      {items.map((item, index) => (
        <Link
          key={item.id}
          href={`/${getCollectionPath(collectionType)}/${item.id}`}
          onClick={(e) => {
            if (onItemClick) {
              e.preventDefault()
              onItemClick(item)
            }
          }}
          className="block"
        >
          <div
            className={`
              grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg
              transition-all hover:bg-accent hover:shadow-md
              ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
            `}
          >
            {/* Cover Image - Mobile: Full width, Desktop: First column */}
            <div className="md:col-span-1 flex justify-center md:justify-start">
              <div className="relative w-16 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                {item.coverUrl ? (
                  <Image
                    src={item.coverUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getPlaceholderIcon(collectionType)}
                  </div>
                )}
                {/* Read Status Badge - Only show for BOOK items that are read */}
                {collectionType === 'BOOK' && isItemRead(item.id) && (
                  <div className="absolute top-1 right-1">
                    <Badge
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 text-white shadow-lg px-1 py-0"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: Stacked Layout */}
            <div className="md:hidden space-y-2">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {collectionType === 'VIDEOGAME' && item.videogame?.platform && (
                  <div>
                    <span className="text-muted-foreground">Platform:</span>{' '}
                    <span className="font-medium">{item.videogame.platform}</span>
                  </div>
                )}
                {item.year && (
                  <div>
                    <span className="text-muted-foreground">Year:</span>{' '}
                    <span className="font-medium">{item.year}</span>
                  </div>
                )}
                {item.language && (
                  <div>
                    <span className="text-muted-foreground">Language:</span>{' '}
                    <span className="font-medium">{item.language}</span>
                  </div>
                )}
                {item.copies !== null && item.copies !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Copies:</span>{' '}
                    <span className="font-medium">{item.copies}</span>
                  </div>
                )}
                {item.price !== null && item.price !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Price:</span>{' '}
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: Table Layout */}
            <div
              className={`hidden md:block ${collectionType === 'VIDEOGAME' ? 'md:col-span-3' : 'md:col-span-4'}`}
            >
              <h3 className="font-semibold line-clamp-2">{item.title}</h3>
            </div>
            {collectionType === 'VIDEOGAME' && (
              <div className="hidden md:flex md:col-span-2 items-center">
                <span className="text-sm">{item.videogame?.platform || '—'}</span>
              </div>
            )}
            <div
              className={`hidden md:flex ${collectionType === 'VIDEOGAME' ? 'md:col-span-1' : 'md:col-span-2'} items-center`}
            >
              <span className="text-sm">{item.year || '—'}</span>
            </div>
            <div className="hidden md:flex md:col-span-2 items-center">
              <span className="text-sm">{item.language || '—'}</span>
            </div>
            <div className="hidden md:flex md:col-span-2 items-center">
              <span className="text-sm">{item.copies ?? '—'}</span>
            </div>
            <div className="hidden md:flex md:col-span-1 items-center">
              <span className="text-sm">
                {item.price !== null && item.price !== undefined
                  ? `$${item.price.toFixed(2)}`
                  : '—'}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
