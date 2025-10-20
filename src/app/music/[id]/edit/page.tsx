'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  label: z.string().optional(),
  format: z.string().optional(),
  genres: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  language: z.string().optional(),
  country: z.string().optional(),
  copies: z.number().int().min(1).optional(),
  price: z.number().min(0).optional().nullable(),
  tags: z.string().optional(),
  tracklist: z.string().optional(),
  discCount: z.number().int().min(1).optional().nullable(),
})

type MusicFormData = z.infer<typeof musicSchema>

export default function EditMusicPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<MusicFormData>({
    resolver: zodResolver(musicSchema),
    defaultValues: {
      title: '',
      artist: '',
      year: null,
      label: '',
      format: '',
      genres: '',
      description: '',
      coverUrl: '',
      language: '',
      country: '',
      copies: 1,
      price: null,
      tags: '',
      tracklist: '',
      discCount: null,
    },
  })

  useEffect(() => {
    params.then(({ id }) => {
      setId(id)
      fetchItem(id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const fetchItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/items/${itemId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch item')
      }
      const item = await response.json()

      // Helper function to safely parse JSON arrays or return as-is if already a string
      const parseGenresOrTags = (data: string | null | undefined): string => {
        if (!data) return ''
        try {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed)) {
            return parsed.join(', ')
          }
          return String(data) // Return as-is if not an array
        } catch {
          return String(data) // Return as-is if JSON parse fails
        }
      }

      const genres = parseGenresOrTags(item.music?.genres)
      const tags = parseGenresOrTags(item.tags)

      form.reset({
        title: item.title || '',
        artist: item.music?.artist || '',
        year: item.year,
        label: item.music?.label || '',
        format: item.music?.format || '',
        genres,
        description: item.description || '',
        coverUrl: item.coverUrl || '',
        language: item.language || '',
        country: item.country || '',
        copies: item.copies || 1,
        price: item.price,
        tags,
        tracklist: item.music?.tracklist || '',
        discCount: item.music?.discCount,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load item')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: MusicFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update music')
      }

      // Redirect to music collection page
      router.push(`/music`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/music"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Music
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Music</h1>
        <p className="text-muted-foreground mt-2">Update music album information</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

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
                  <FormLabel>Album Title *</FormLabel>
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

              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
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

          {/* Label & Genres */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Label & Genres</h2>

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Record Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Apple Records" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genres</FormLabel>
                  <FormControl>
                    <Input placeholder="Rock, Pop, Psychedelic (comma-separated)" {...field} />
                  </FormControl>
                  <FormDescription>Enter genres separated by commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Tracklist & Disc Count */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Tracklist & Disc Information</h2>

            <FormField
              control={form.control}
              name="tracklist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracklist</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="1. Come Together&#10;2. Something&#10;3. Maxwell's Silver Hammer"
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter tracks, one per line</FormDescription>
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
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseInt(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>Number of discs</FormDescription>
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
                    <Input placeholder="https://example.com/cover.jpg" {...field} />
                  </FormControl>
                  <FormDescription>URL to the album cover image</FormDescription>
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
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
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
                        placeholder="29.99"
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
                    <Input placeholder="favorite, wishlist, classic (comma-separated)" {...field} />
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
              {isSubmitting ? 'Updating...' : 'Update Music'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/music')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
