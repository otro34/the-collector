'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, BookOpen, Scan } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ISBNLookup } from '@/components/books/isbn-lookup'
import { BookPreview } from '@/components/books/book-preview'
import type { ISBNLookupResult } from '@/types/isbn'

// Form validation schema
const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  type: z.enum(['MANGA', 'COMIC', 'GRAPHIC_NOVEL', 'OTHER'], {
    message: 'Book type is required',
  }),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  volume: z.string().optional(),
  series: z.string().optional(),
  publisher: z.string().optional(),
  coverType: z.string().optional(),
  genres: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  language: z.string().optional(),
  country: z.string().optional(),
  copies: z.number().int().min(1).optional(),
  price: z.number().min(0).optional().nullable(),
  tags: z.string().optional(),
})

type BookFormData = z.infer<typeof bookSchema>

export default function NewBookPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entryMode, setEntryMode] = useState<'manual' | 'isbn'>('isbn')
  const [bookData, setBookData] = useState<ISBNLookupResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      author: '',
      type: undefined,
      year: null,
      volume: '',
      series: '',
      publisher: '',
      coverType: '',
      genres: '',
      description: '',
      coverUrl: '',
      language: '',
      country: '',
      copies: 1,
      price: null,
      tags: '',
    },
  })

  // Handle ISBN book data found
  const handleBookFound = (data: ISBNLookupResult) => {
    setBookData(data)
    setShowPreview(true)
  }

  // Handle book data confirmation from preview
  const handleConfirmBook = () => {
    if (!bookData) return

    // Map book type from description or default to OTHER
    let bookType: 'MANGA' | 'COMIC' | 'GRAPHIC_NOVEL' | 'OTHER' = 'OTHER'
    const categories = bookData.categories?.join(' ').toLowerCase() || ''
    if (categories.includes('manga')) {
      bookType = 'MANGA'
    } else if (categories.includes('comic')) {
      bookType = 'COMIC'
    } else if (categories.includes('graphic novel')) {
      bookType = 'GRAPHIC_NOVEL'
    }

    // Pre-fill form with book data
    form.reset({
      title: bookData.title,
      author: bookData.authors?.join(', ') || '',
      type: bookType,
      year: bookData.year || null,
      volume: '',
      series: '',
      publisher: bookData.publisher || '',
      coverType: '',
      genres: bookData.categories?.join(', ') || '',
      description: bookData.description || '',
      coverUrl: bookData.coverUrl || '',
      language: bookData.language || '',
      country: '',
      copies: 1,
      price: null,
      tags: '',
    })

    // Switch to manual mode to allow editing
    setEntryMode('manual')
    setShowPreview(false)
  }

  // Handle canceling ISBN lookup
  const handleCancelISBN = () => {
    setShowPreview(false)
    setBookData(null)
  }

  const onSubmit = async (data: BookFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/items/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create book')
      }

      const result = await response.json()

      // Reset form
      form.reset()

      // Redirect to the books collection page
      router.push(`/books?new=${result.item.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show preview modal if book data is available
  if (showPreview && bookData) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="mb-8">
          <Link
            href="/books"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Review Book Information</h1>
          <p className="text-muted-foreground mt-2">
            Review the information fetched from ISBN lookup before adding to your collection
          </p>
        </div>

        <BookPreview book={bookData} onConfirm={handleConfirmBook} onCancel={handleCancelISBN} />
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/books"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add Book</h1>
        <p className="text-muted-foreground mt-2">
          Add a new manga, comic, graphic novel, or book to your collection
        </p>
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
        onValueChange={(v) => setEntryMode(v as 'manual' | 'isbn')}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="isbn" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            ISBN Lookup
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="isbn" className="mt-6">
          <ISBNLookup onBookFound={handleBookFound} onCancel={() => router.push('/books')} />
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
                        <Input placeholder="One Piece" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author *</FormLabel>
                      <FormControl>
                        <Input placeholder="Eiichiro Oda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select book type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MANGA">Manga</SelectItem>
                          <SelectItem value="COMIC">Comic</SelectItem>
                          <SelectItem value="GRAPHIC_NOVEL">Graphic Novel</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
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
                            placeholder="1997"
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
                    name="volume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume</FormLabel>
                        <FormControl>
                          <Input placeholder="Vol. 1, #1, etc." {...field} />
                        </FormControl>
                        <FormDescription>Volume or issue number</FormDescription>
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
                          placeholder="Brief description of the book..."
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

              {/* Publication Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Publication Details</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="series"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Series</FormLabel>
                        <FormControl>
                          <Input placeholder="One Piece" {...field} />
                        </FormControl>
                        <FormDescription>Series name if applicable</FormDescription>
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
                          <Input placeholder="Shueisha, VIZ Media, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="coverType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cover type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Hardcover">Hardcover</SelectItem>
                            <SelectItem value="Softcover">Softcover</SelectItem>
                            <SelectItem value="Paperback">Paperback</SelectItem>
                            <SelectItem value="Trade Paperback">Trade Paperback</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Input
                            placeholder="Shonen, Action, Adventure (comma-separated)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Enter genres separated by commas</FormDescription>
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
                        <Input placeholder="https://example.com/book-cover.jpg" {...field} />
                      </FormControl>
                      <FormDescription>URL to the book's cover image</FormDescription>
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
                            placeholder="9.99"
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
                          <Input placeholder="Japanese, English, etc." {...field} />
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
                          placeholder="favorite, reading, completed (comma-separated)"
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
                  {isSubmitting ? 'Adding...' : 'Add Book'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/books')}
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
