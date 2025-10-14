import type { Prisma } from '@prisma/client'

/**
 * Export commonly used Prisma types for type safety across the application
 */

// ============================================================================
// Model types (full objects with relations)
// ============================================================================

export type Item = Prisma.ItemGetPayload<{
  include: {
    videogame: true
    music: true
    book: true
  }
}>

export type ItemWithVideogame = Prisma.ItemGetPayload<{
  include: { videogame: true }
}>

export type ItemWithMusic = Prisma.ItemGetPayload<{
  include: { music: true }
}>

export type ItemWithBook = Prisma.ItemGetPayload<{
  include: { book: true }
}>

export type Videogame = Prisma.VideogameGetPayload<{
  include: { item: true }
}>

export type Music = Prisma.MusicGetPayload<{
  include: { item: true }
}>

export type Book = Prisma.BookGetPayload<{
  include: { item: true }
}>

export type Backup = Prisma.BackupGetPayload<true>

export type Settings = Prisma.SettingsGetPayload<true>

// ============================================================================
// Create input types
// ============================================================================

export type CreateItemInput = Omit<
  Prisma.ItemCreateInput,
  'id' | 'createdAt' | 'updatedAt' | 'collectionType'
>

export type CreateVideogameInput = Omit<Prisma.VideogameCreateWithoutItemInput, 'id'>

export type CreateMusicInput = Omit<Prisma.MusicCreateWithoutItemInput, 'id'>

export type CreateBookInput = Omit<Prisma.BookCreateWithoutItemInput, 'id'>

export type CreateBackupInput = Prisma.BackupCreateInput

export type CreateSettingsInput = Prisma.SettingsCreateInput

// ============================================================================
// Update input types
// ============================================================================

export type UpdateItemInput = Prisma.ItemUpdateInput

export type UpdateVideogameInput = Prisma.VideogameUpdateInput

export type UpdateMusicInput = Prisma.MusicUpdateInput

export type UpdateBookInput = Prisma.BookUpdateInput

export type UpdateSettingsInput = Prisma.SettingsUpdateInput

// ============================================================================
// Where input types (for queries)
// ============================================================================

export type ItemWhereInput = Prisma.ItemWhereInput

export type ItemWhereUniqueInput = Prisma.ItemWhereUniqueInput

export type VideogameWhereInput = Prisma.VideogameWhereInput

export type MusicWhereInput = Prisma.MusicWhereInput

export type BookWhereInput = Prisma.BookWhereInput

export type BackupWhereInput = Prisma.BackupWhereInput

export type SettingsWhereInput = Prisma.SettingsWhereInput

// ============================================================================
// OrderBy input types (for sorting)
// ============================================================================

export type ItemOrderByInput = Prisma.ItemOrderByWithRelationInput

export type VideogameOrderByInput = Prisma.VideogameOrderByWithRelationInput

export type MusicOrderByInput = Prisma.MusicOrderByWithRelationInput

export type BookOrderByInput = Prisma.BookOrderByWithRelationInput

export type BackupOrderByInput = Prisma.BackupOrderByWithRelationInput

// ============================================================================
// Enum types
// ============================================================================

export { CollectionType, BookType } from '@prisma/client'

// ============================================================================
// Utility types
// ============================================================================

/**
 * Pagination options
 */
export type PaginationOptions = {
  skip?: number
  take?: number
}

/**
 * Sort options
 */
export type SortOptions<T> = {
  orderBy?: T
}

/**
 * Query options combining pagination and sorting
 */
export type QueryOptions<T> = PaginationOptions & SortOptions<T>

/**
 * Result wrapper for operations that might fail
 */
export type OperationResult<T> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Parse JSON string fields (for genres, tags)
 */
export type ParsedItem = Omit<Item, 'tags'> & {
  tags: string[]
}

export type ParsedVideogame = Omit<Videogame, 'genres' | 'item'> & {
  genres: string[]
  item: Omit<Item, 'tags'> & { tags: string[] }
}

export type ParsedMusic = Omit<Music, 'genres' | 'item'> & {
  genres: string[]
  item: Omit<Item, 'tags'> & { tags: string[] }
}

export type ParsedBook = Omit<Book, 'genres' | 'item'> & {
  genres: string[]
  item: Omit<Item, 'tags'> & { tags: string[] }
}

// ============================================================================
// Helper functions for JSON parsing
// ============================================================================

/**
 * Parse JSON string to array
 */
export function parseJsonArray(jsonString: string): string[] {
  try {
    const parsed = JSON.parse(jsonString)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Stringify array to JSON string
 */
export function stringifyArray(arr: string[]): string {
  return JSON.stringify(arr)
}

/**
 * Parse item with JSON fields
 */
export function parseItem(item: Item): ParsedItem {
  return {
    ...item,
    tags: parseJsonArray(item.tags),
  }
}

/**
 * Parse item with videogame data
 */
export function parseVideogameItem(item: ItemWithVideogame): Omit<Videogame, 'genres' | 'item'> & {
  genres: string[]
  item: ParsedItem
} {
  if (!item.videogame) {
    throw new Error('Item does not have videogame data')
  }

  return {
    ...item.videogame,
    genres: parseJsonArray(item.videogame.genres),
    item: parseItem(item as Item),
  }
}

/**
 * Parse item with music data
 */
export function parseMusicItem(item: ItemWithMusic): Omit<Music, 'genres' | 'item'> & {
  genres: string[]
  item: ParsedItem
} {
  if (!item.music) {
    throw new Error('Item does not have music data')
  }

  return {
    ...item.music,
    genres: parseJsonArray(item.music.genres),
    item: parseItem(item as Item),
  }
}

/**
 * Parse item with book data
 */
export function parseBookItem(item: ItemWithBook): Omit<Book, 'genres' | 'item'> & {
  genres: string[]
  item: ParsedItem
} {
  if (!item.book) {
    throw new Error('Item does not have book data')
  }

  return {
    ...item.book,
    genres: parseJsonArray(item.book.genres),
    item: parseItem(item as Item),
  }
}
