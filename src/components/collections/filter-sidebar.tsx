'use client'

import { useState, useEffect } from 'react'
import { X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { CollectionType } from '@prisma/client'

export interface FilterOptions {
  platforms?: string[]
  genres?: string[]
  publishers?: string[]
  yearRange?: [number, number]
  // For music
  formats?: string[]
  artists?: string[]
  // For books
  bookTypes?: string[]
  authors?: string[]
  series?: string[]
  // Reading status
  readingStatus?: 'all' | 'read' | 'unread'
}

interface FilterSidebarProps {
  collectionType: CollectionType
  filterOptions: FilterOptions
  availableFilters: {
    platforms?: string[]
    genres?: string[]
    publishers?: string[]
    yearRange?: [number, number]
    formats?: string[]
    artists?: string[]
    bookTypes?: string[]
    authors?: string[]
    series?: string[]
  }
  onFilterChange: (filters: FilterOptions) => void
  onClose?: () => void
  className?: string
}

export function FilterSidebar({
  collectionType,
  filterOptions,
  availableFilters,
  onFilterChange,
  onClose,
  className = '',
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filterOptions)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Calculate active filters count
  useEffect(() => {
    let count = 0
    if (localFilters.platforms && localFilters.platforms.length > 0) count++
    if (localFilters.genres && localFilters.genres.length > 0) count++
    if (localFilters.publishers && localFilters.publishers.length > 0) count++
    if (localFilters.yearRange) count++
    if (localFilters.formats && localFilters.formats.length > 0) count++
    if (localFilters.artists && localFilters.artists.length > 0) count++
    if (localFilters.bookTypes && localFilters.bookTypes.length > 0) count++
    if (localFilters.authors && localFilters.authors.length > 0) count++
    if (localFilters.series && localFilters.series.length > 0) count++
    if (localFilters.readingStatus && localFilters.readingStatus !== 'all') count++
    setActiveFiltersCount(count)
  }, [localFilters])

  const handleCheckboxChange = (category: keyof FilterOptions, value: string, checked: boolean) => {
    setLocalFilters((prev) => {
      const currentValues = (prev[category] as string[]) || []
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value)
      return { ...prev, [category]: newValues }
    })
  }

  const handleYearRangeChange = (range: number[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      yearRange: [range[0], range[1]] as [number, number],
    }))
  }

  const handleReadingStatusChange = (status: 'all' | 'read' | 'unread') => {
    setLocalFilters((prev) => ({
      ...prev,
      readingStatus: status,
    }))
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
  }

  const handleClearFilters = () => {
    const emptyFilters: FilterOptions = {}
    setLocalFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const renderCheckboxGroup = (
    title: string,
    category: keyof FilterOptions,
    options: string[] = []
  ) => {
    const selectedValues = (localFilters[category] as string[]) || []

    return (
      <AccordionItem value={category}>
        <AccordionTrigger className="text-sm font-medium">
          <div className="flex items-center justify-between w-full pr-4">
            <span>{title}</span>
            {selectedValues.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedValues.length}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 pt-2">
            {options.length === 0 ? (
              <p className="text-sm text-muted-foreground">No options available</p>
            ) : (
              options.slice(0, 20).map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${category}-${option}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(category, option, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`${category}-${option}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {option}
                  </Label>
                </div>
              ))
            )}
            {options.length > 20 && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing first 20 of {options.length} options
              </p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    )
  }

  const renderYearSlider = () => {
    if (!availableFilters.yearRange) return null

    const [minYear, maxYear] = availableFilters.yearRange
    const currentRange = localFilters.yearRange || [minYear, maxYear]

    return (
      <AccordionItem value="yearRange">
        <AccordionTrigger className="text-sm font-medium">
          <div className="flex items-center justify-between w-full pr-4">
            <span>Year Range</span>
            {localFilters.yearRange && (
              <Badge variant="secondary" className="ml-2">
                {currentRange[0]} - {currentRange[1]}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-4 px-2">
            <Slider
              min={minYear}
              max={maxYear}
              step={1}
              value={currentRange}
              onValueChange={handleYearRangeChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentRange[0]}</span>
              <span>{currentRange[1]}</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Options */}
      <div className="flex-1 overflow-y-auto p-4">
        <Accordion type="multiple" className="w-full">
          {collectionType === 'VIDEOGAME' && (
            <>
              {renderCheckboxGroup('Platform', 'platforms', availableFilters.platforms)}
              {renderCheckboxGroup('Genre', 'genres', availableFilters.genres)}
              {renderCheckboxGroup('Publisher', 'publishers', availableFilters.publishers)}
              {renderYearSlider()}
            </>
          )}

          {collectionType === 'MUSIC' && (
            <>
              {renderCheckboxGroup('Format', 'formats', availableFilters.formats)}
              {renderCheckboxGroup('Genre', 'genres', availableFilters.genres)}
              {renderCheckboxGroup('Artist', 'artists', availableFilters.artists)}
              {renderYearSlider()}
            </>
          )}

          {collectionType === 'BOOK' && (
            <>
              {/* Reading Status Filter */}
              <AccordionItem value="readingStatus">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>Reading Status</span>
                    {localFilters.readingStatus && localFilters.readingStatus !== 'all' && (
                      <Badge variant="secondary" className="ml-2">
                        {localFilters.readingStatus}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    <RadioGroup
                      value={localFilters.readingStatus ?? 'all'}
                      onValueChange={(value) =>
                        handleReadingStatusChange(value as 'all' | 'read' | 'unread')
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="status-all" />
                        <Label htmlFor="status-all" className="text-sm cursor-pointer flex-1">
                          All
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="read" id="status-read" />
                        <Label htmlFor="status-read" className="text-sm cursor-pointer flex-1">
                          Read
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unread" id="status-unread" />
                        <Label htmlFor="status-unread" className="text-sm cursor-pointer flex-1">
                          Not Yet Read
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {renderCheckboxGroup('Book Type', 'bookTypes', availableFilters.bookTypes)}
              {renderCheckboxGroup('Genre', 'genres', availableFilters.genres)}
              {renderCheckboxGroup('Author', 'authors', availableFilters.authors)}
              {renderCheckboxGroup('Series', 'series', availableFilters.series)}
              {renderCheckboxGroup('Publisher', 'publishers', availableFilters.publishers)}
              {renderYearSlider()}
            </>
          )}
        </Accordion>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <Button onClick={handleApplyFilters} className="w-full">
          Apply Filters
        </Button>
        <Button
          onClick={handleClearFilters}
          variant="outline"
          className="w-full"
          disabled={activeFiltersCount === 0}
        >
          Clear All
        </Button>
      </div>
    </div>
  )
}
