'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ImageResult {
  url: string
  thumbnail: string
  title: string
  width: number
  height: number
}

interface ImageSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialQuery?: string
  onSelectImage: (imageUrl: string) => void
}

export function ImageSearchDialog({
  open,
  onOpenChange,
  initialQuery = '',
  onSelectImage,
}: ImageSearchDialogProps) {
  const [query, setQuery] = useState(initialQuery)
  const [images, setImages] = useState<ImageResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Reset query and clear state when dialog opens or initialQuery changes
  useEffect(() => {
    if (open) {
      setQuery(initialQuery)
      setImages([])
      setError(null)
      setSelectedImage(null)
    }
  }, [open, initialQuery])

  const searchImages = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setImages([])
    setSelectedImage(null)

    try {
      const response = await fetch(`/api/search-images?query=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error('Failed to search images')
      }

      const data = await response.json()
      setImages(data.images || [])

      if (data.images?.length === 0) {
        setError('No images found. Try a different search term.')
      }
    } catch (err) {
      setError('Failed to search images. Please try again.')
      console.error('Image search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectImage = () => {
    if (selectedImage) {
      onSelectImage(selectedImage)
      onOpenChange(false)
      // State will be reset by useEffect when dialog reopens
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchImages()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search for Cover Image</DialogTitle>
          <DialogDescription>Search Google Images to find a new cover image</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Search for images..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchImages} disabled={loading || !query.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Image Grid */}
          {!loading && images.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image.url)}
                    className={`relative aspect-[2/3] bg-muted rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all ${
                      selectedImage === image.url ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <Image
                      src={image.thumbnail || image.url}
                      alt={image.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSelectImage} disabled={!selectedImage} className="flex-1">
                  Use Selected Image
                </Button>
                <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && !error && images.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Enter a search term and click the search button to find images
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
