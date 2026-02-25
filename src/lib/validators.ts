import { z } from 'zod'
import { BookType, CollectionType, CurrentStatus, PurchaseStatus } from '@prisma/client'

// ============================================================================
// Shared / base schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
})

// ============================================================================
// Enum schemas
// ============================================================================

export const collectionTypeSchema = z.nativeEnum(CollectionType)

export const bookTypeSchema = z.nativeEnum(BookType)

export const purchaseStatusSchema = z.nativeEnum(PurchaseStatus)

export const currentStatusSchema = z.nativeEnum(CurrentStatus)

// ============================================================================
// Item base schema (shared fields across all collection types)
// ============================================================================

export const itemBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  year: z.number().int().min(1800).max(2100).optional().nullable(),
  language: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  copies: z.number().int().min(1).default(1),
  description: z.string().max(5000).optional().nullable(),
  coverUrl: z.string().url('Must be a valid URL').optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  tags: z.array(z.string().max(100)).default([]),
  // Purchase & condition tracking (Phase 2 - Sprint 11)
  purchasePlace: z.string().max(255).optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  purchaseStatus: purchaseStatusSchema.optional().nullable(),
  currentStatus: currentStatusSchema.optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
})

export type ItemBaseInput = z.infer<typeof itemBaseSchema>

// ============================================================================
// Videogame schema
// ============================================================================

export const videogameSchema = z.object({
  platform: z.string().min(1, 'Platform is required').max(100),
  publisher: z.string().max(255).optional().nullable(),
  developer: z.string().max(255).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  edition: z.string().max(255).optional().nullable(),
  genres: z.array(z.string().max(100)).default([]),
  metacriticScore: z.number().int().min(0).max(100).optional().nullable(),
})

export const createVideogameSchema = itemBaseSchema.merge(videogameSchema)
export const updateVideogameSchema = itemBaseSchema.partial().merge(videogameSchema.partial())

export type CreateVideogameInput = z.infer<typeof createVideogameSchema>
export type UpdateVideogameInput = z.infer<typeof updateVideogameSchema>

// ============================================================================
// Music schema
// ============================================================================

export const musicSchema = z.object({
  artist: z.string().min(1, 'Artist is required').max(255),
  publisher: z.string().max(255).optional().nullable(),
  format: z.string().min(1, 'Format is required').max(50),
  discCount: z.string().max(50).optional().nullable(),
  genres: z.array(z.string().max(100)).default([]),
  tracklist: z.string().max(10000).optional().nullable(),
})

export const createMusicSchema = itemBaseSchema.merge(musicSchema)
export const updateMusicSchema = itemBaseSchema.partial().merge(musicSchema.partial())

export type CreateMusicInput = z.infer<typeof createMusicSchema>
export type UpdateMusicInput = z.infer<typeof updateMusicSchema>

// ============================================================================
// Book schema
// ============================================================================

export const bookSchema = z.object({
  type: bookTypeSchema,
  author: z.string().min(1, 'Author is required').max(255),
  volume: z.string().max(50).optional().nullable(),
  series: z.string().max(255).optional().nullable(),
  publisher: z.string().max(255).optional().nullable(),
  coverType: z.string().max(100).optional().nullable(),
  genres: z.array(z.string().max(100)).default([]),
})

export const createBookSchema = itemBaseSchema.merge(bookSchema)
export const updateBookSchema = itemBaseSchema.partial().merge(bookSchema.partial())

export type CreateBookInput = z.infer<typeof createBookSchema>
export type UpdateBookInput = z.infer<typeof updateBookSchema>

// ============================================================================
// Action Figure schema (Phase 2 - Sprint 11)
// ============================================================================

export const actionFigureSchema = z.object({
  manufacturer: z.string().min(1, 'Manufacturer is required').max(255),
  series: z.string().max(255).optional().nullable(),
  characterName: z.string().max(255).optional().nullable(),
  scale: z.string().max(50).optional().nullable(),
  material: z.string().max(255).optional().nullable(),
  height: z.string().max(50).optional().nullable(),
  articulation: z.string().max(255).optional().nullable(),
  accessories: z.array(z.string().max(255)).default([]),
  edition: z.string().max(255).optional().nullable(),
  seriesNumber: z.string().max(50).optional().nullable(),
})

export const createActionFigureSchema = itemBaseSchema.merge(actionFigureSchema)
export const updateActionFigureSchema = itemBaseSchema.partial().merge(actionFigureSchema.partial())

export type CreateActionFigureInput = z.infer<typeof createActionFigureSchema>
export type UpdateActionFigureInput = z.infer<typeof updateActionFigureSchema>
