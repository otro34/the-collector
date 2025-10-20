import type { CollectionType } from '@prisma/client'

/**
 * Database field definitions for each collection type
 * Used for column mapping interface
 */

export interface DatabaseField {
  key: string
  label: string
  required: boolean
  description?: string
}

/**
 * Database fields for each collection type
 */
export const DATABASE_FIELDS: Record<CollectionType, DatabaseField[]> = {
  VIDEOGAME: [
    { key: 'title', label: 'Title', required: true, description: 'Game title' },
    {
      key: 'platform',
      label: 'Platform',
      required: true,
      description: 'Gaming platform (e.g., Nintendo Switch)',
    },
    { key: 'year', label: 'Year', required: false, description: 'Release year' },
    { key: 'developer', label: 'Developer', required: false, description: 'Game developer' },
    { key: 'publisher', label: 'Publisher', required: false, description: 'Game publisher' },
    {
      key: 'region',
      label: 'Region',
      required: false,
      description: 'Region code (e.g., NTSC-U, PAL)',
    },
    {
      key: 'edition',
      label: 'Edition',
      required: false,
      description: "Special edition (e.g., Collector's Edition)",
    },
    { key: 'genres', label: 'Genres', required: false, description: 'Comma-separated genres' },
    {
      key: 'metacriticScore',
      label: 'Metacritic Score',
      required: false,
      description: 'Review score (0-100)',
    },
    { key: 'description', label: 'Description', required: false, description: 'Game description' },
    { key: 'coverUrl', label: 'Cover URL', required: false, description: 'Cover image URL' },
    { key: 'language', label: 'Language', required: false, description: 'Game language' },
    { key: 'copies', label: 'Copies', required: false, description: 'Number of copies owned' },
    { key: 'priceEstimate', label: 'Price', required: false, description: 'Estimated price' },
  ],
  MUSIC: [
    { key: 'title', label: 'Title', required: true, description: 'Album/Track title' },
    { key: 'artist', label: 'Artist', required: true, description: 'Artist or band name' },
    {
      key: 'format',
      label: 'Format',
      required: false,
      description: 'CD, Vinyl, Cassette, or Digital',
    },
    { key: 'year', label: 'Year', required: false, description: 'Release year' },
    { key: 'publisher', label: 'Label/Publisher', required: false, description: 'Record label' },
    { key: 'discCount', label: 'Disc Count', required: false, description: 'Number of discs' },
    { key: 'genres', label: 'Genres', required: false, description: 'Comma-separated genres' },
    { key: 'tracklist', label: 'Tracklist', required: false, description: 'Track listing' },
    { key: 'description', label: 'Description', required: false, description: 'Album description' },
    { key: 'coverUrl', label: 'Cover URL', required: false, description: 'Cover image URL' },
    { key: 'language', label: 'Language', required: false, description: 'Album language' },
    { key: 'copies', label: 'Copies', required: false, description: 'Number of copies owned' },
    { key: 'priceEstimate', label: 'Price', required: false, description: 'Estimated price' },
  ],
  BOOK: [
    { key: 'title', label: 'Title', required: true, description: 'Book title' },
    { key: 'author', label: 'Author', required: true, description: 'Book author' },
    {
      key: 'type',
      label: 'Type',
      required: false,
      description: 'MANGA, COMIC, GRAPHIC_NOVEL, or OTHER',
    },
    {
      key: 'volume',
      label: 'Volume',
      required: false,
      description: 'Volume number (e.g., "Vol. 1")',
    },
    { key: 'series', label: 'Series', required: false, description: 'Series name' },
    { key: 'publisher', label: 'Publisher', required: false, description: 'Book publisher' },
    { key: 'year', label: 'Year', required: false, description: 'Publication year' },
    { key: 'genres', label: 'Genres', required: false, description: 'Comma-separated genres' },
    {
      key: 'coverType',
      label: 'Cover Type',
      required: false,
      description: 'Hardcover, Paperback, etc.',
    },
    { key: 'description', label: 'Description', required: false, description: 'Book description' },
    { key: 'coverUrl', label: 'Cover URL', required: false, description: 'Cover image URL' },
    { key: 'language', label: 'Language', required: false, description: 'Book language' },
    { key: 'country', label: 'Country', required: false, description: 'Country of origin' },
    { key: 'copies', label: 'Copies', required: false, description: 'Number of copies owned' },
    { key: 'priceEstimate', label: 'Price', required: false, description: 'Estimated price' },
  ],
}

/**
 * Auto-detect column mapping based on CSV column names
 * Uses fuzzy matching to map CSV columns to database fields
 */
export function autoDetectColumnMapping(
  csvColumns: string[],
  collectionType: CollectionType
): Record<string, string> {
  const mapping: Record<string, string> = {}
  const dbFields = DATABASE_FIELDS[collectionType]

  csvColumns.forEach((csvColumn) => {
    const csvLower = csvColumn.toLowerCase().trim()

    // Find best matching database field
    for (const field of dbFields) {
      const fieldLower = field.label.toLowerCase()
      const keyLower = field.key.toLowerCase()

      // Exact match on label or key
      if (csvLower === fieldLower || csvLower === keyLower) {
        mapping[csvColumn] = field.key
        return
      }

      // Fuzzy matching
      if (
        csvLower.includes(fieldLower) ||
        fieldLower.includes(csvLower) ||
        csvLower.includes(keyLower) ||
        keyLower.includes(csvLower)
      ) {
        mapping[csvColumn] = field.key
        return
      }

      // Special cases
      if (csvLower === 'game' && field.key === 'title') {
        mapping[csvColumn] = field.key
        return
      }
      if (csvLower === 'album' && field.key === 'title') {
        mapping[csvColumn] = field.key
        return
      }
      if ((csvLower === 'genre' || csvLower === 'tags') && field.key === 'genres') {
        mapping[csvColumn] = field.key
        return
      }
      if (csvLower === 'price' && field.key === 'priceEstimate') {
        mapping[csvColumn] = field.key
        return
      }
      if (csvLower === 'cover' && field.key === 'coverUrl') {
        mapping[csvColumn] = field.key
        return
      }
    }
  })

  return mapping
}

/**
 * Validate that required fields are mapped
 */
export function validateMapping(
  mapping: Record<string, string>,
  collectionType: CollectionType
): { valid: boolean; missingFields: string[] } {
  const dbFields = DATABASE_FIELDS[collectionType]
  const requiredFields = dbFields.filter((f) => f.required)
  const mappedFields = Object.values(mapping)

  const missingFields = requiredFields
    .filter((field) => !mappedFields.includes(field.key))
    .map((field) => field.label)

  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}

/**
 * Save column mapping to localStorage
 */
export function saveColumnMapping(
  collectionType: CollectionType,
  mapping: Record<string, string>
): void {
  const key = `columnMapping_${collectionType}`
  localStorage.setItem(key, JSON.stringify(mapping))
}

/**
 * Load column mapping from localStorage
 */
export function loadColumnMapping(collectionType: CollectionType): Record<string, string> | null {
  const key = `columnMapping_${collectionType}`
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      return JSON.parse(stored) as Record<string, string>
    } catch {
      return null
    }
  }
  return null
}
