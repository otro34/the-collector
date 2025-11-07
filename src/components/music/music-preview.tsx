'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Music, Check, X, Disc3 } from 'lucide-react'
import type { DiscogsSearchResult } from '@/types/discogs'
import Image from 'next/image'

interface MusicPreviewProps {
  album: DiscogsSearchResult
  onConfirm: () => void
  onCancel: () => void
}

export function MusicPreview({ album, onConfirm, onCancel }: MusicPreviewProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Review Album Information</CardTitle>
            <CardDescription>
              Review the information from Discogs before adding to your collection
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Album Cover */}
        {album.coverUrl && (
          <div className="flex justify-center">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden shadow-md">
              <Image
                src={album.coverUrl}
                alt={album.title}
                fill
                className="object-cover"
                sizes="192px"
                priority
              />
            </div>
          </div>
        )}

        {!album.coverUrl && (
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
              <Disc3 className="h-20 w-20 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Album Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold">{album.title}</h3>
            <p className="text-lg text-muted-foreground">{album.artist}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {album.year && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Year</p>
                <p className="text-base">{album.year}</p>
              </div>
            )}

            {album.format && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Format</p>
                <p className="text-base">{album.format}</p>
              </div>
            )}

            {album.label && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Label</p>
                <p className="text-base">{album.label}</p>
              </div>
            )}

            {album.country && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Country</p>
                <p className="text-base">{album.country}</p>
              </div>
            )}

            {album.barcode && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Barcode</p>
                <p className="text-base font-mono">{album.barcode}</p>
              </div>
            )}
          </div>

          {/* Genres */}
          {album.genres && album.genres.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Genres</p>
              <div className="flex flex-wrap gap-2">
                {album.genres.map((genre, index) => (
                  <Badge key={index} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Styles */}
          {album.styles && album.styles.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Styles</p>
              <div className="flex flex-wrap gap-2">
                {album.styles.map((style, index) => (
                  <Badge key={index} variant="outline">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <Button onClick={onConfirm} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Use This Information
          </Button>
          <Button onClick={onCancel} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Search Again
          </Button>
        </div>

        {/* Note */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            You'll be able to review and edit all fields before adding the album to your collection.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
