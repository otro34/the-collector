'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Gamepad2, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RAWGSearch } from '@/components/videogame/rawg-search'
import { GamePreview } from '@/components/videogame/game-preview'
import type { RAWGSearchResult } from '@/types/rawg'
import { extractYear, formatGenres, getPrimaryPublisher } from '@/lib/rawg'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Form validation schema
const videogameSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  platform: z.string().min(1, 'Platform is required'),
  year: z.number().int().min(1970).max(2100).optional().nullable(),
  developer: z.string().optional(),
  publisher: z.string().optional(),
  region: z.string().optional(),
  edition: z.string().optional(),
  genres: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  language: z.string().optional(),
  country: z.string().optional(),
  copies: z.number().int().min(1).optional(),
  price: z.number().min(0).optional().nullable(),
  tags: z.string().optional(),
  metacriticScore: z.number().int().min(0).max(100).optional().nullable(),
})

type VideogameFormData = z.infer<typeof videogameSchema>

function NewVideogamePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entryMode, setEntryMode] = useState<'manual' | 'rawg'>('rawg')
  const [gameData, setGameData] = useState<RAWGSearchResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const form = useForm<VideogameFormData>({
    resolver: zodResolver(videogameSchema),
    defaultValues: {
      title: '',
      platform: '',
      year: null,
      developer: '',
      publisher: '',
      region: '',
      edition: '',
      genres: '',
      description: '',
      coverUrl: '',
      language: '',
      country: '',
      copies: 1,
      price: null,
      tags: '',
      metacriticScore: null,
    },
  })

  // Handle RAWG game data found
  const handleGameSelected = (data: RAWGSearchResult) => {
    setGameData(data)
    setShowPreview(true)
  }

  // Handle game data confirmation from preview
  const handleConfirmGame = () => {
    if (!gameData) return

    // Extract year from release date
    const year = extractYear(gameData.released)

    // Format genres
    const genres = formatGenres(gameData.genres)

    // Get publisher
    const publisher = getPrimaryPublisher(gameData.publishers)

    // Pre-fill form with game data
    // Note: User will need to select a specific platform from the dropdown
    form.reset({
      title: gameData.name,
      platform: '', // User must select from dropdown
      year: year || null,
      developer: '',
      publisher: publisher || '',
      region: '',
      edition: '',
      genres: genres,
      description: '',
      coverUrl: gameData.backgroundImage || '',
      language: '',
      country: '',
      copies: 1,
      price: null,
      tags: '',
      metacriticScore: gameData.metacritic || null,
    })

    // Switch to manual mode to allow editing
    setEntryMode('manual')
    setShowPreview(false)
  }

  // Handle canceling RAWG search
  const handleCancelRAWG = () => {
    setShowPreview(false)
    setGameData(null)
  }

  const onSubmit = async (data: VideogameFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/items/videogames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create videogame')
      }

      const result = await response.json()

      // Reset form
      form.reset()

      // Redirect to the videogame detail page
      // Preserve all URL params (search, filters, sort, page) from when user navigated here
      const params = new URLSearchParams(searchParams.toString())
      params.set('itemId', result.item.id)
      router.push(`/videogames?${params.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show preview modal if game data is available
  if (showPreview && gameData) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="mb-8">
          <Link
            href={`/videogames?${searchParams.toString()}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Video Games
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Review Game Information</h1>
          <p className="text-muted-foreground mt-2">
            Review the information fetched from RAWG before adding to your collection
          </p>
        </div>

        <GamePreview game={gameData} onConfirm={handleConfirmGame} onCancel={handleCancelRAWG} />
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/videogames?${searchParams.toString()}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Video Games
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add Video Game</h1>
        <p className="text-muted-foreground mt-2">Add a new video game to your collection</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Entry Mode Tabs */}
      <Tabs
        value={entryMode}
        onValueChange={(v) => setEntryMode(v as 'manual' | 'rawg')}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rawg" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            RAWG Search
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rawg" className="mt-6">
          <RAWGSearch
            onGameSelected={handleGameSelected}
            onCancel={() => router.push(`/videogames?${searchParams.toString()}`)}
          />
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="The Legend of Zelda: Breath of the Wild" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PC">PC</SelectItem>
                          <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
                          <SelectItem value="Nintendo Wii U">Nintendo Wii U</SelectItem>
                          <SelectItem value="Nintendo Wii">Nintendo Wii</SelectItem>
                          <SelectItem value="Nintendo GameCube">Nintendo GameCube</SelectItem>
                          <SelectItem value="Nintendo 64">Nintendo 64</SelectItem>
                          <SelectItem value="Super Nintendo (SNES)">
                            Super Nintendo (SNES)
                          </SelectItem>
                          <SelectItem value="Nintendo (NES)">Nintendo (NES)</SelectItem>
                          <SelectItem value="Nintendo 3DS">Nintendo 3DS</SelectItem>
                          <SelectItem value="Nintendo DS">Nintendo DS</SelectItem>
                          <SelectItem value="Game Boy Advance">Game Boy Advance</SelectItem>
                          <SelectItem value="Game Boy Color">Game Boy Color</SelectItem>
                          <SelectItem value="Game Boy">Game Boy</SelectItem>
                          <SelectItem value="PlayStation 5">PlayStation 5</SelectItem>
                          <SelectItem value="PlayStation 4">PlayStation 4</SelectItem>
                          <SelectItem value="PlayStation 3">PlayStation 3</SelectItem>
                          <SelectItem value="PlayStation 2">PlayStation 2</SelectItem>
                          <SelectItem value="PlayStation">PlayStation</SelectItem>
                          <SelectItem value="PlayStation Vita">PlayStation Vita</SelectItem>
                          <SelectItem value="PlayStation Portable (PSP)">
                            PlayStation Portable (PSP)
                          </SelectItem>
                          <SelectItem value="Xbox Series X|S">Xbox Series X|S</SelectItem>
                          <SelectItem value="Xbox One">Xbox One</SelectItem>
                          <SelectItem value="Xbox 360">Xbox 360</SelectItem>
                          <SelectItem value="Xbox">Xbox</SelectItem>
                          <SelectItem value="Sega Dreamcast">Sega Dreamcast</SelectItem>
                          <SelectItem value="Sega Saturn">Sega Saturn</SelectItem>
                          <SelectItem value="Sega Genesis">Sega Genesis</SelectItem>
                          <SelectItem value="Sega Master System">Sega Master System</SelectItem>
                          <SelectItem value="Sega Game Gear">Sega Game Gear</SelectItem>
                          <SelectItem value="Atari 2600">Atari 2600</SelectItem>
                          <SelectItem value="Atari 7800">Atari 7800</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2017"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NTSC-U">NTSC-U (North America)</SelectItem>
                            <SelectItem value="PAL">PAL (Europe)</SelectItem>
                            <SelectItem value="NTSC-J">NTSC-J (Japan)</SelectItem>
                            <SelectItem value="Region Free">Region Free</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the game..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Publisher & Developer */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Publisher & Developer</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="developer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Developer</FormLabel>
                        <FormControl>
                          <Input placeholder="Nintendo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="publisher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publisher</FormLabel>
                        <FormControl>
                          <Input placeholder="Nintendo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Genre & Edition */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Genre & Edition</h2>

                <FormField
                  control={form.control}
                  name="genres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genres</FormLabel>
                      <FormControl>
                        <Input placeholder="Action, Adventure, RPG (comma-separated)" {...field} />
                      </FormControl>
                      <FormDescription>Enter genres separated by commas</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="edition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edition</FormLabel>
                        <FormControl>
                          <Input placeholder="Standard, Deluxe, Collector's..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metacriticScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metacritic Score</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="97"
                            min="0"
                            max="100"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormDescription>Score from 0-100</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Collection Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Collection Details</h2>

                <FormField
                  control={form.control}
                  name="coverUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/cover.jpg" {...field} />
                      </FormControl>
                      <FormDescription>URL to the game's cover image</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="copies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Copies</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="59.99"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <Input placeholder="English" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="favorite, wishlist, completed (comma-separated)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Enter tags separated by commas</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Adding...' : 'Add Video Game'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/videogames?${searchParams.toString()}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function NewVideogamePage() {
  return (
    <Suspense fallback={<div className="container max-w-3xl py-8">Loading...</div>}>
      <NewVideogamePageContent />
    </Suspense>
  )
}
