'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Music as MusicIcon, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DiscogsSearch } from '@/components/music/discogs-search'
import { MusicPreview } from '@/components/music/music-preview'
import type { DiscogsSearchResult } from '@/types/discogs'
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
const musicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  format: z.string().min(1, 'Format is required'),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  publisher: z.string().optional(),
  discCount: z.string().optional(),
  genres: z.string().optional(),
  tracklist: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  language: z.string().optional(),
  country: z.string().optional(),
  copies: z.number().int().min(1).optional(),
  price: z.number().min(0).optional().nullable(),
  tags: z.string().optional(),
})

type MusicFormData = z.infer<typeof musicSchema>

function NewMusicPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entryMode, setEntryMode] = useState<'manual' | 'discogs'>('discogs')
  const [albumData, setAlbumData] = useState<DiscogsSearchResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const form = useForm<MusicFormData>({
    resolver: zodResolver(musicSchema),
    defaultValues: {
      title: '',
      artist: '',
      format: '',
      year: null,
      publisher: '',
      discCount: '',
      genres: '',
      tracklist: '',
      description: '',
      coverUrl: '',
      language: '',
      country: '',
      copies: 1,
      price: null,
      tags: '',
    },
  })

  // Handle Discogs album data found
  const handleAlbumSelected = (data: DiscogsSearchResult) => {
    setAlbumData(data)
    setShowPreview(true)
  }

  // Handle album data confirmation from preview
  const handleConfirmAlbum = () => {
    if (!albumData) return

    // Map Discogs format to our format options
    let format = 'CD'
    if (albumData.format) {
      const formatLower = albumData.format.toLowerCase()
      if (formatLower.includes('vinyl') || formatLower.includes('lp')) {
        format = 'Vinyl'
      } else if (formatLower.includes('cassette')) {
        format = 'Cassette'
      } else if (formatLower.includes('cd')) {
        format = 'CD'
      } else if (formatLower.includes('digital')) {
        format = 'Digital'
      } else {
        format = 'Other'
      }
    }

    // Pre-fill form with album data
    form.reset({
      title: albumData.title,
      artist: albumData.artist,
      format,
      year: albumData.year || null,
      publisher: albumData.label || '',
      discCount: '',
      genres: [...new Set([...(albumData.genres || []), ...(albumData.styles || [])])].join(', '),
      tracklist: '',
      description: '',
      coverUrl: albumData.coverUrl || '',
      language: '',
      country: albumData.country || '',
      copies: 1,
      price: null,
      tags: '',
    })

    // Switch to manual mode to allow editing
    setEntryMode('manual')
    setShowPreview(false)
  }

  // Handle canceling Discogs search
  const handleCancelDiscogs = () => {
    setShowPreview(false)
    setAlbumData(null)
  }

  const onSubmit = async (data: MusicFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/items/music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create music item')
      }

      const result = await response.json()

      // Reset form
      form.reset()

      // Redirect to the music collection page
      // Preserve all URL params (search, filters, sort, page) from when user navigated here
      const params = new URLSearchParams(searchParams.toString())
      params.set('itemId', result.item.id)
      router.push(`/music?${params.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show preview modal if album data is available
  if (showPreview && albumData) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="mb-8">
          <Link
            href={`/music?${searchParams.toString()}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Music
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Review Album Information</h1>
          <p className="text-muted-foreground mt-2">
            Review the information fetched from Discogs before adding to your collection
          </p>
        </div>

        <MusicPreview
          album={albumData}
          onConfirm={handleConfirmAlbum}
          onCancel={handleCancelDiscogs}
        />
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/music?${searchParams.toString()}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Music
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add Music Album</h1>
        <p className="text-muted-foreground mt-2">Add a new album or single to your collection</p>
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
        onValueChange={(v) => setEntryMode(v as 'manual' | 'discogs')}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discogs" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Discogs Search
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <MusicIcon className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discogs" className="mt-6">
          <DiscogsSearch
            onAlbumSelected={handleAlbumSelected}
            onCancel={() => router.push(`/music?${searchParams.toString()}`)}
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
                        <Input placeholder="Abbey Road" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="artist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artist *</FormLabel>
                      <FormControl>
                        <Input placeholder="The Beatles" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CD">CD</SelectItem>
                            <SelectItem value="Vinyl">Vinyl</SelectItem>
                            <SelectItem value="Cassette">Cassette</SelectItem>
                            <SelectItem value="Digital">Digital</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1969"
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
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the album..."
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

              {/* Album Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Album Details</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="publisher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publisher / Label</FormLabel>
                        <FormControl>
                          <Input placeholder="Apple Records" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disc Count</FormLabel>
                        <FormControl>
                          <Input placeholder="1, 2, etc." {...field} />
                        </FormControl>
                        <FormDescription>Number of discs/records</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="genres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genres</FormLabel>
                      <FormControl>
                        <Input placeholder="Rock, Pop, Alternative (comma-separated)" {...field} />
                      </FormControl>
                      <FormDescription>Enter genres separated by commas</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tracklist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracklist</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="1. Come Together&#10;2. Something&#10;3. Maxwell's Silver Hammer..."
                          className="resize-none"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        List the tracks (one per line or comma-separated)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        <Input placeholder="https://example.com/album-cover.jpg" {...field} />
                      </FormControl>
                      <FormDescription>URL to the album's cover image</FormDescription>
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
                            placeholder="19.99"
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
                          placeholder="favorite, wishlist, limited-edition (comma-separated)"
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
                  {isSubmitting ? 'Adding...' : 'Add Music Album'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/music?${searchParams.toString()}`)}
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

export default function NewMusicPage() {
  return (
    <Suspense fallback={<div className="container max-w-3xl py-8">Loading...</div>}>
      <NewMusicPageContent />
    </Suspense>
  )
}
