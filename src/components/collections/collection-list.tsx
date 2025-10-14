'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Gamepad2, Music, BookOpen } from 'lucide-react'
import type { Item, CollectionType } from '@prisma/client'

interface CollectionListProps {
  items: Item[]
  collectionType: CollectionType
  onItemClick?: (item: Item) => void
}

export function CollectionList({ items, collectionType, onItemClick }: CollectionListProps) {
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
        <div className="col-span-4">Title</div>
        <div className="col-span-2">Year</div>
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
              </div>
            </div>

            {/* Mobile: Stacked Layout */}
            <div className="md:hidden space-y-2">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
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
            <div className="hidden md:block md:col-span-4">
              <h3 className="font-semibold line-clamp-2">{item.title}</h3>
            </div>
            <div className="hidden md:block md:col-span-2 flex items-center">
              <span className="text-sm">{item.year || '—'}</span>
            </div>
            <div className="hidden md:block md:col-span-2 flex items-center">
              <span className="text-sm">{item.language || '—'}</span>
            </div>
            <div className="hidden md:block md:col-span-2 flex items-center">
              <span className="text-sm">{item.copies ?? '—'}</span>
            </div>
            <div className="hidden md:block md:col-span-1 flex items-center">
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
