'use client'

import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, User, Building, FileText, Globe, Check, X } from 'lucide-react'
import type { ISBNLookupResult } from '@/types/isbn'

interface BookPreviewProps {
  book: ISBNLookupResult
  onConfirm: () => void
  onCancel: () => void
}

export function BookPreview({ book, onConfirm, onCancel }: BookPreviewProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Book Found - Review Details</CardTitle>
        <CardDescription>
          Review the information below and click &quot;Use This Book&quot; to pre-fill the form
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            {book.coverUrl ? (
              <div className="relative w-full md:w-48 h-64 md:h-72 rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={book.coverUrl}
                  alt={`Cover of ${book.title}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-full md:w-48 h-64 md:h-72 rounded-lg border bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">No cover image</p>
                </div>
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="flex-1 space-y-4">
            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold">{book.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {book.source === 'openlibrary' ? 'Open Library' : 'Google Books'}
                </Badge>
                {book.isbn13 && <Badge variant="secondary">ISBN-13: {book.isbn13}</Badge>}
              </div>
            </div>

            {/* Authors */}
            {book.authors.length > 0 && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Author(s)</p>
                  <p className="text-sm text-muted-foreground">{book.authors.join(', ')}</p>
                </div>
              </div>
            )}

            {/* Publisher and Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {book.publisher && (
                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Publisher</p>
                    <p className="text-sm text-muted-foreground">{book.publisher}</p>
                  </div>
                </div>
              )}

              {book.year && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Year</p>
                    <p className="text-sm text-muted-foreground">{book.year}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Page Count and Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {book.pageCount && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Pages</p>
                    <p className="text-sm text-muted-foreground">{book.pageCount}</p>
                  </div>
                </div>
              )}

              {book.language && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Language</p>
                    <p className="text-sm text-muted-foreground">{book.language.toUpperCase()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Categories/Genres */}
            {book.categories && book.categories.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {book.categories.slice(0, 5).map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {book.description && (
              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground line-clamp-4">{book.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onConfirm} size="lg" className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Use This Book
          </Button>
          <Button onClick={onCancel} variant="outline" size="lg" className="flex-1">
            <X className="mr-2 h-4 w-4" />
            Try Different ISBN
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
