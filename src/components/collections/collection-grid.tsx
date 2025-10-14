'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Gamepad2, Music, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Item, CollectionType } from '@prisma/client'

interface CollectionGridProps {
  items: Item[]
  collectionType: CollectionType
  onItemClick?: (item: Item) => void
}

export function CollectionGrid({ items, collectionType, onItemClick }: CollectionGridProps) {
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
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
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                  <p className="text-white text-sm font-medium text-center line-clamp-3">
                    {item.title}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-2">
                <h3 className="font-medium text-sm line-clamp-2 mb-1" title={item.title}>
                  {item.title}
                </h3>
                {item.year && <p className="text-xs text-muted-foreground">{item.year}</p>}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
