'use client'

import { useState, useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type SearchResult = {
  id: string
  title: string
  collectionType: 'VIDEOGAME' | 'MUSIC' | 'BOOK'
  coverUrl: string | null
  year: number | null
  subtitle: string
}

type SearchResponse = {
  results: SearchResult[]
  query: string
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Fetch search results
  const { data, isLoading } = useQuery<SearchResponse>({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      if (!res.ok) throw new Error('Search failed')
      return res.json()
    },
    enabled: debouncedQuery.length > 0,
  })

  const results = data?.results || []

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show results when query exists
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setIsOpen(true)
      setSelectedIndex(-1)
    } else {
      setIsOpen(false)
    }
  }, [debouncedQuery])

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToItem(results[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Navigate to item detail
  const navigateToItem = (result: SearchResult) => {
    const pathMap = { VIDEOGAME: 'videogames', MUSIC: 'music', BOOK: 'books' }
    router.push(`/${pathMap[result.collectionType]}?itemId=${result.id}`)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  // Get collection badge color
  const getCollectionBadgeClass = (type: string) => {
    switch (type) {
      case 'VIDEOGAME':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
      case 'MUSIC':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
      case 'BOOK':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  // Format collection type for display
  const formatCollectionType = (type: string) => {
    switch (type) {
      case 'VIDEOGAME':
        return 'Game'
      case 'MUSIC':
        return 'Music'
      case 'BOOK':
        return 'Book'
      default:
        return type
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search collections..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-9 py-2 rounded-md border bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && results.length === 0 && debouncedQuery && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found for &quot;{debouncedQuery}&quot;
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => navigateToItem(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors',
                    selectedIndex === index && 'bg-accent'
                  )}
                >
                  {/* Cover Image */}
                  <div className="flex-shrink-0 w-12 h-12 bg-muted rounded overflow-hidden">
                    {result.coverUrl ? (
                      <Image
                        src={result.coverUrl}
                        alt={result.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Search className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{result.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {result.subtitle}
                      {result.year && ` • ${result.year}`}
                    </div>
                  </div>

                  {/* Collection Badge */}
                  <div
                    className={cn(
                      'flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium',
                      getCollectionBadgeClass(result.collectionType)
                    )}
                  >
                    {formatCollectionType(result.collectionType)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
