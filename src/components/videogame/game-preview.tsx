'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Check, X } from 'lucide-react'
import type { RAWGSearchResult } from '@/types/rawg'
import Image from 'next/image'

interface GamePreviewProps {
  game: RAWGSearchResult
  onConfirm: () => void
  onCancel: () => void
}

export function GamePreview({ game, onConfirm, onCancel }: GamePreviewProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Review Game Information</CardTitle>
            <CardDescription>
              Review the information from RAWG before adding to your collection
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Game Cover */}
        {game.backgroundImage && (
          <div className="flex justify-center">
            <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md">
              <Image
                src={game.backgroundImage}
                alt={game.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 640px"
                priority
              />
            </div>
          </div>
        )}

        {!game.backgroundImage && (
          <div className="flex justify-center">
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
              <Gamepad2 className="h-20 w-20 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Game Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold">{game.name}</h3>
            {game.released && (
              <p className="text-lg text-muted-foreground">
                Released:{' '}
                {new Date(game.released).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {game.rating && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rating</p>
                <p className="text-base">
                  ⭐ {game.rating.toFixed(1)} / {game.ratingTop}
                </p>
              </div>
            )}

            {game.metacritic && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Metacritic Score</p>
                <p className="text-base">{game.metacritic} / 100</p>
              </div>
            )}

            {game.esrbRating && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">ESRB Rating</p>
                <p className="text-base">{game.esrbRating.name}</p>
              </div>
            )}
          </div>

          {/* Platforms */}
          {game.platforms && game.platforms.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {game.platforms.map((platformInfo, index) => (
                  <Badge key={index} variant="secondary">
                    {platformInfo.platform.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Genres */}
          {game.genres && game.genres.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Genres</p>
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre, index) => (
                  <Badge key={index} variant="outline">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Publishers */}
          {game.publishers && game.publishers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Publishers</p>
              <div className="flex flex-wrap gap-2">
                {game.publishers.map((publisher, index) => (
                  <Badge key={index} variant="outline">
                    {publisher.name}
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
            You'll need to select a platform from the available options. You can review and edit all
            fields before adding the game to your collection.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
