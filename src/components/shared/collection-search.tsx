'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CollectionSearchProps {
  value: string
  onSearchChange: (query: string) => void
  placeholder?: string
  className?: string
}

export function CollectionSearch({
  value,
  onSearchChange,
  placeholder = 'Search...',
  className = '',
}: CollectionSearchProps) {
  const [localValue, setLocalValue] = useState(value)

  // Debounce search - wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue, onSearchChange])

  // Update local value when prop changes (for URL sync)
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onSearchChange('')
  }, [onSearchChange])

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 h-9"
        aria-label="Search collection"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  )
}
