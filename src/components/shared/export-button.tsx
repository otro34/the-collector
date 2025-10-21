'use client'

import { useState } from 'react'
import { Download, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import type { CollectionType } from '@prisma/client'

interface ExportButtonProps {
  collectionType?: CollectionType
  currentFilters?: Record<string, unknown>
  totalItems: number
  className?: string
  exportAll?: boolean // For exporting entire database
}

// Field definitions for each collection type
const FIELD_OPTIONS: Record<
  CollectionType,
  { value: string; label: string; required?: boolean }[]
> = {
  VIDEOGAME: [
    { value: 'title', label: 'Title', required: true },
    { value: 'year', label: 'Year' },
    { value: 'platform', label: 'Platform', required: true },
    { value: 'publisher', label: 'Publisher' },
    { value: 'developer', label: 'Developer' },
    { value: 'region', label: 'Region' },
    { value: 'edition', label: 'Edition' },
    { value: 'genres', label: 'Genres' },
    { value: 'metacriticScore', label: 'Metacritic Score' },
    { value: 'language', label: 'Language' },
    { value: 'country', label: 'Country' },
    { value: 'copies', label: 'Copies' },
    { value: 'description', label: 'Description' },
    { value: 'coverUrl', label: 'Cover URL' },
    { value: 'price', label: 'Price' },
  ],
  MUSIC: [
    { value: 'title', label: 'Title', required: true },
    { value: 'year', label: 'Year' },
    { value: 'artist', label: 'Artist', required: true },
    { value: 'publisher', label: 'Publisher' },
    { value: 'format', label: 'Format', required: true },
    { value: 'discCount', label: 'Disc Count' },
    { value: 'genres', label: 'Genres' },
    { value: 'tracklist', label: 'Tracklist' },
    { value: 'language', label: 'Language' },
    { value: 'country', label: 'Country' },
    { value: 'copies', label: 'Copies' },
    { value: 'description', label: 'Description' },
    { value: 'coverUrl', label: 'Cover URL' },
    { value: 'price', label: 'Price' },
  ],
  BOOK: [
    { value: 'title', label: 'Title', required: true },
    { value: 'year', label: 'Year' },
    { value: 'type', label: 'Type', required: true },
    { value: 'author', label: 'Author', required: true },
    { value: 'volume', label: 'Volume' },
    { value: 'series', label: 'Series' },
    { value: 'publisher', label: 'Publisher' },
    { value: 'coverType', label: 'Cover Type' },
    { value: 'genres', label: 'Genres' },
    { value: 'language', label: 'Language' },
    { value: 'country', label: 'Country' },
    { value: 'copies', label: 'Copies' },
    { value: 'description', label: 'Description' },
    { value: 'coverUrl', label: 'Cover URL' },
    { value: 'price', label: 'Price' },
  ],
}

export function ExportButton({
  collectionType,
  currentFilters = {},
  totalItems,
  className,
  exportAll: exportAllCollections = false,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [exportAll, setExportAll] = useState(true)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')

  const fields = collectionType ? FIELD_OPTIONS[collectionType] : []
  const requiredFields = fields.filter((f) => f.required).map((f) => f.value)

  // Initialize with all fields selected
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && selectedFields.length === 0) {
      setSelectedFields(fields.map((f) => f.value))
    }
    setOpen(isOpen)
  }

  const toggleField = (fieldValue: string) => {
    if (selectedFields.includes(fieldValue)) {
      // Don't allow deselecting required fields
      if (requiredFields.includes(fieldValue)) {
        toast.error(`${fields.find((f) => f.value === fieldValue)?.label} is required`)
        return
      }
      setSelectedFields(selectedFields.filter((f) => f !== fieldValue))
    } else {
      setSelectedFields([...selectedFields, fieldValue])
    }
  }

  const selectAll = () => {
    setSelectedFields(fields.map((f) => f.value))
  }

  const deselectAll = () => {
    setSelectedFields(requiredFields)
  }

  const handleExport = async () => {
    if (exportFormat === 'csv') {
      if (!collectionType) {
        toast.error('CSV export requires a specific collection type')
        return
      }
      if (selectedFields.length === 0) {
        toast.error('Please select at least one field to export')
        return
      }
    }

    setIsExporting(true)

    try {
      // Build query string
      const params = new URLSearchParams()

      if (exportFormat === 'csv') {
        params.set('type', collectionType!)
        params.set('fields', selectedFields.join(','))
      } else {
        // JSON export
        if (exportAllCollections) {
          params.set('all', 'true')
        } else if (collectionType) {
          params.set('type', collectionType)
        } else {
          params.set('all', 'true')
        }
      }

      // Add current filters if exporting filtered data
      if (!exportAll && collectionType) {
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value) && value.length > 0) {
              params.set(key, value.join(','))
            } else if (!Array.isArray(value)) {
              params.set(key, String(value))
            }
          }
        })
      }

      // Fetch data based on format
      const endpoint = exportFormat === 'csv' ? '/api/export' : '/api/export/json'
      const response = await fetch(`${endpoint}?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const defaultExt = exportFormat === 'csv' ? 'csv' : 'json'
      const filename = filenameMatch ? filenameMatch[1] : `export.${defaultExt}`

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success(`Exported ${totalItems} items to ${filename}`)
      setOpen(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const hasFilters = Object.values(currentFilters).some((value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null && value !== ''
  })

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Collection</DialogTitle>
          <DialogDescription>
            Choose the export format and configure your export options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export format selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup
              value={exportFormat}
              onValueChange={(value) => setExportFormat(value as 'csv' | 'json')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="format-csv" />
                <Label
                  htmlFor="format-csv"
                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV Format
                  <span className="text-xs text-muted-foreground">(Spreadsheet compatible)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="format-json" />
                <Label
                  htmlFor="format-json"
                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                >
                  <FileJson className="h-4 w-4" />
                  JSON Format
                  <span className="text-xs text-muted-foreground">
                    (Well-formatted, structured data)
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          {/* Export scope */}
          {hasFilters && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Export Scope</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export-all"
                    checked={exportAll}
                    onCheckedChange={(checked) => setExportAll(checked === true)}
                  />
                  <Label htmlFor="export-all" className="text-sm font-normal cursor-pointer">
                    Export all items ({totalItems} total)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export-filtered"
                    checked={!exportAll}
                    onCheckedChange={(checked) => setExportAll(checked !== true)}
                  />
                  <Label htmlFor="export-filtered" className="text-sm font-normal cursor-pointer">
                    Export only filtered items
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* CSV export not available for all collections */}
          {exportFormat === 'csv' && !collectionType && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                CSV export is only available for individual collections. Please use JSON format to
                export all collections at once.
              </p>
            </div>
          )}

          {/* Field selection (CSV only) */}
          {exportFormat === 'csv' && collectionType && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Fields to Export</Label>
                <div className="space-x-2">
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                {fields.map((field) => (
                  <div key={field.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.value}
                      checked={selectedFields.includes(field.value)}
                      onCheckedChange={() => toggleField(field.value)}
                    />
                    <Label
                      htmlFor={field.value}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-xs text-muted-foreground">(required)</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                {selectedFields.length} of {fields.length} fields selected
              </p>
            </div>
          )}

          {/* JSON export info */}
          {exportFormat === 'json' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                JSON export includes all fields with proper structure and formatting. Arrays like
                genres and tags will be exported as proper JSON arrays instead of comma-separated
                strings.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
