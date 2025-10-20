'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Gamepad2,
  Music,
  BookOpen,
  Calendar,
  Tag,
  User,
  Building2,
  Disc,
  DollarSign,
  ImageIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageSearchDialog } from './image-search-dialog'
import type { Item, CollectionType, Videogame, Music as MusicType, Book } from '@prisma/client'

type ItemWithRelations = Item & {
  videogame?: Videogame | null
  music?: MusicType | null
  book?: Book | null
}

interface ItemDetailModalProps {
  item: ItemWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (item: ItemWithRelations) => void
  onDelete?: (item: ItemWithRelations) => void
  onImageUpdate?: (itemId: string, newCoverUrl: string) => void
}

export function ItemDetailModal({
  item,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onImageUpdate,
}: ItemDetailModalProps) {
  const [imageSearchOpen, setImageSearchOpen] = useState(false)
  const [updatingImage, setUpdatingImage] = useState(false)

  if (!item) return null

  const handleImageSelect = async (imageUrl: string) => {
    setUpdatingImage(true)
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverUrl: imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update cover image')
      }

      // Update the item in the parent component
      if (onImageUpdate) {
        onImageUpdate(item.id, imageUrl)
      }

      // Close the image search dialog
      setImageSearchOpen(false)
    } catch (error) {
      console.error('Error updating cover image:', error)
      alert('Failed to update cover image. Please try again.')
    } finally {
      setUpdatingImage(false)
    }
  }

  const getShortDescription = (description: string | null) => {
    if (!description) return null
    const firstSentenceEnd = description.indexOf('.')
    if (firstSentenceEnd === -1) return description
    return description.substring(0, firstSentenceEnd + 1)
  }

  const getPlaceholderIcon = (type: CollectionType) => {
    switch (type) {
      case 'VIDEOGAME':
        return <Gamepad2 className="h-32 w-32 text-muted-foreground" />
      case 'MUSIC':
        return <Music className="h-32 w-32 text-muted-foreground" />
      case 'BOOK':
        return <BookOpen className="h-32 w-32 text-muted-foreground" />
      default:
        return null
    }
  }

  const renderMetadata = () => {
    switch (item.collectionType) {
      case 'VIDEOGAME':
        return item.videogame ? (
          <div className="space-y-3">
            {item.videogame.platform && (
              <div className="flex items-start gap-2">
                <Gamepad2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Platform</p>
                  <p className="text-sm text-muted-foreground">{item.videogame.platform}</p>
                </div>
              </div>
            )}
            {item.videogame.developer && (
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Developer</p>
                  <p className="text-sm text-muted-foreground">{item.videogame.developer}</p>
                </div>
              </div>
            )}
            {item.videogame.publisher && (
              <div className="flex items-start gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Publisher</p>
                  <p className="text-sm text-muted-foreground">{item.videogame.publisher}</p>
                </div>
              </div>
            )}
          </div>
        ) : null

      case 'MUSIC':
        return item.music ? (
          <div className="space-y-3">
            {item.music.artist && (
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Artist</p>
                  <p className="text-sm text-muted-foreground">{item.music.artist}</p>
                </div>
              </div>
            )}
            {item.music.format && (
              <div className="flex items-start gap-2">
                <Disc className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Format</p>
                  <p className="text-sm text-muted-foreground">{item.music.format}</p>
                </div>
              </div>
            )}
            {item.music.publisher && (
              <div className="flex items-start gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Publisher</p>
                  <p className="text-sm text-muted-foreground">{item.music.publisher}</p>
                </div>
              </div>
            )}
          </div>
        ) : null

      case 'BOOK':
        return item.book ? (
          <div className="space-y-3">
            {item.book.author && (
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Author</p>
                  <p className="text-sm text-muted-foreground">{item.book.author}</p>
                </div>
              </div>
            )}
            {item.book.type && (
              <div className="flex items-start gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm text-muted-foreground">{item.book.type}</p>
                </div>
              </div>
            )}
            {item.book.publisher && (
              <div className="flex items-start gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Publisher</p>
                  <p className="text-sm text-muted-foreground">{item.book.publisher}</p>
                </div>
              </div>
            )}
            {item.book.series && (
              <div className="flex items-start gap-2">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Series</p>
                  <p className="text-sm text-muted-foreground">
                    {item.book.series}
                    {item.book.volume && ` - Volume ${item.book.volume}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.title}</DialogTitle>
          {item.description && (
            <DialogDescription className="text-base">
              {getShortDescription(item.description)}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Cover Image */}
          <div className="space-y-2">
            <div className="relative aspect-[2/3] bg-muted rounded-lg overflow-hidden">
              {item.coverUrl ? (
                <Image
                  src={item.coverUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {getPlaceholderIcon(item.collectionType)}
                </div>
              )}
            </div>
            <Button
              onClick={() => setImageSearchOpen(true)}
              variant="outline"
              className="w-full"
              disabled={updatingImage}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {updatingImage ? 'Updating...' : 'Change Cover Image'}
            </Button>
          </div>

          {/* Metadata */}
          <div className="space-y-6">
            {/* General Info */}
            <div className="space-y-3">
              {item.year && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Year</p>
                    <p className="text-sm text-muted-foreground">{item.year}</p>
                  </div>
                </div>
              )}
              {item.price !== null && item.price !== undefined && (
                <div className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Estimated Price</p>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              )}
              {item.tags && (
                <div className="flex items-start gap-2">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tags</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {JSON.parse(item.tags).map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Type-specific metadata */}
            {renderMetadata()}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {onEdit && (
                <Button onClick={() => onEdit(item)} className="flex-1">
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button onClick={() => onDelete(item)} variant="destructive" className="flex-1">
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        {item.description && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>
          </div>
        )}
      </DialogContent>

      {/* Image Search Dialog */}
      <ImageSearchDialog
        open={imageSearchOpen}
        onOpenChange={setImageSearchOpen}
        initialQuery={item.title}
        onSelectImage={handleImageSelect}
      />
    </Dialog>
  )
}
