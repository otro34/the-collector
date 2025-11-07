'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search, X, Gamepad2, AlertCircle, Check } from 'lucide-react'
import type { RAWGSearchResult } from '@/types/rawg'
import { toast } from 'sonner'
import Image from 'next/image'
import { formatPlatforms } from '@/lib/rawg'

interface RAWGSearchProps {
  onGameSelected: (game: RAWGSearchResult) => void
  onCancel: () => void
}

export function RAWGSearch({ onGameSelected, onCancel }: RAWGSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<RAWGSearchResult[]>([])

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value)
    setError(null)
  }

  const searchRAWG = async (query: string) => {
    if (!query.trim()) {
      setError('Please enter a game title')
      return
    }

    setIsLoading(true)
    setError(null)
    setSearchResults([])

    try {
      const params = new URLSearchParams()
      params.append('q', query)
      params.append('pageSize', '20')

      const response = await fetch(`/api/rawg/search?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.details || data.error || 'Failed to search RAWG')
        toast.error(data.error || 'Failed to search RAWG')
        return
      }

      if (!data.results || data.results.length === 0) {
        setError('No games found. Try a different search term.')
        toast.info('No results found')
        return
      }

      setSearchResults(data.results)
      toast.success(`Found ${data.results.length} results`)
    } catch (err) {
      console.error('RAWG search error:', err)
      setError('An unexpected error occurred while searching')
      toast.error('Failed to search RAWG')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSearch = () => {
    if (!searchQuery.trim()) {
      setError('Please enter a game title')
      return
    }
    searchRAWG(searchQuery)
  }

  const handleGameClick = (game: RAWGSearchResult) => {
    toast.success(`Selected: ${game.name}`)
    onGameSelected(game)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Search for Video Game</CardTitle>
              <CardDescription>Search by game title</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Title Search */}
        <div className="space-y-2">
          <Label htmlFor="search-input">Game Title</Label>
          <div className="flex gap-2">
            <Input
              id="search-input"
              type="text"
              placeholder="e.g., The Legend of Zelda: Breath of the Wild"
              value={searchQuery}
              onChange={(e) => handleSearchQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleManualSearch()
                }
              }}
              disabled={isLoading}
            />
            <Button onClick={handleManualSearch} disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Search
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select a Game</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              {searchResults.map((game) => (
                <Card
                  key={game.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleGameClick(game)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {game.backgroundImage ? (
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={game.backgroundImage}
                            alt={game.name}
                            fill
                            className="object-cover rounded"
                            sizes="80px"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex-shrink-0 bg-muted rounded flex items-center justify-center">
                          <Gamepad2 className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{game.name}</h4>
                        {game.released && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(game.released).getFullYear()}
                          </p>
                        )}
                        <div className="flex gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                          {game.rating && <span>⭐ {game.rating.toFixed(1)}</span>}
                          {game.metacritic && <span>• MC: {game.metacritic}</span>}
                        </div>
                        {game.platforms && game.platforms.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {formatPlatforms(game.platforms, 2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            <strong>Tips:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              <li>Search by game title for best results</li>
              <li>Results include games from all platforms</li>
              <li>Select a game to view details and platforms</li>
              <li>Game data is provided by RAWG.io</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
