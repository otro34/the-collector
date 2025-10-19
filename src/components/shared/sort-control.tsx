'use client'

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type SortField = 'title' | 'year' | 'createdAt' | 'genre'
export type SortDirection = 'asc' | 'desc'

export interface SortOption {
  field: SortField
  direction: SortDirection
}

interface SortControlProps {
  sortField: SortField
  sortDirection: SortDirection
  onSortChange: (option: SortOption) => void
  collectionType?: 'VIDEOGAME' | 'MUSIC' | 'BOOK' // Reserved for future collection-specific sort options
}

export function SortControl({
  sortField,
  sortDirection,
  onSortChange,
  collectionType: _collectionType, // Reserved for future use
}: SortControlProps) {
  const getSortLabel = (field: SortField): string => {
    switch (field) {
      case 'title':
        return 'Title'
      case 'year':
        return 'Year'
      case 'createdAt':
        return 'Date Added'
      case 'genre':
        return 'Genre'
      default:
        return field
    }
  }

  const sortOptions: SortField[] = ['title', 'year', 'createdAt', 'genre']

  const toggleDirection = () => {
    onSortChange({
      field: sortField,
      direction: sortDirection === 'asc' ? 'desc' : 'asc',
    })
  }

  const handleSortFieldChange = (field: SortField) => {
    onSortChange({
      field,
      direction: sortDirection,
    })
  }

  return (
    <div className="flex items-center gap-2">
      {/* Sort Field Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort: {getSortLabel(sortField)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sortOptions.map((field) => (
            <DropdownMenuItem
              key={field}
              onClick={() => handleSortFieldChange(field)}
              className={sortField === field ? 'bg-accent' : ''}
            >
              {getSortLabel(field)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Direction Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleDirection}
        className="h-9 px-2"
        title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
      >
        {sortDirection === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
