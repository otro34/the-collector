import type { Prisma } from '@prisma/client'
import { CollectionType } from '@prisma/client'
import { prisma } from './db'

/**
 * Generic CRUD operations for items
 */

// ============================================================================
// CREATE operations
// ============================================================================

/**
 * Create a new item with videogame data
 */
export async function createVideogameItem(
  itemData: Omit<Prisma.ItemCreateInput, 'collectionType' | 'videogame'>,
  videogameData: Omit<Prisma.VideogameCreateWithoutItemInput, 'id'>
) {
  return prisma.item.create({
    data: {
      ...itemData,
      collectionType: CollectionType.VIDEOGAME,
      videogame: {
        create: videogameData,
      },
    },
    include: {
      videogame: true,
    },
  })
}

/**
 * Create a new item with music data
 */
export async function createMusicItem(
  itemData: Omit<Prisma.ItemCreateInput, 'collectionType' | 'music'>,
  musicData: Omit<Prisma.MusicCreateWithoutItemInput, 'id'>
) {
  return prisma.item.create({
    data: {
      ...itemData,
      collectionType: CollectionType.MUSIC,
      music: {
        create: musicData,
      },
    },
    include: {
      music: true,
    },
  })
}

/**
 * Create a new item with book data
 */
export async function createBookItem(
  itemData: Omit<Prisma.ItemCreateInput, 'collectionType' | 'book'>,
  bookData: Omit<Prisma.BookCreateWithoutItemInput, 'id'>
) {
  return prisma.item.create({
    data: {
      ...itemData,
      collectionType: CollectionType.BOOK,
      book: {
        create: bookData,
      },
    },
    include: {
      book: true,
    },
  })
}

// ============================================================================
// READ operations
// ============================================================================

/**
 * Get item by ID with all related data
 */
export async function getItemById(id: string) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      videogame: true,
      music: true,
      book: true,
    },
  })
}

/**
 * Get all items by collection type
 */
export async function getItemsByType(
  collectionType: CollectionType,
  options?: {
    skip?: number
    take?: number
    orderBy?: Prisma.ItemOrderByWithRelationInput
  }
) {
  return prisma.item.findMany({
    where: { collectionType },
    include: {
      videogame: true,
      music: true,
      book: true,
    },
    skip: options?.skip,
    take: options?.take,
    orderBy: options?.orderBy || { createdAt: 'desc' },
  })
}

/**
 * Get all items with pagination
 */
export async function getAllItems(options?: {
  skip?: number
  take?: number
  orderBy?: Prisma.ItemOrderByWithRelationInput
  where?: Prisma.ItemWhereInput
}) {
  return prisma.item.findMany({
    where: options?.where,
    include: {
      videogame: true,
      music: true,
      book: true,
    },
    skip: options?.skip,
    take: options?.take,
    orderBy: options?.orderBy || { createdAt: 'desc' },
  })
}

/**
 * Count items by collection type
 */
export async function countItemsByType(collectionType?: CollectionType) {
  if (collectionType) {
    return prisma.item.count({
      where: { collectionType },
    })
  }
  return prisma.item.count()
}

/**
 * Search items by title, description, or tags
 */
export async function searchItems(searchQuery: string, collectionType?: CollectionType) {
  const where: Prisma.ItemWhereInput = {
    AND: [
      collectionType ? { collectionType } : {},
      {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
          { tags: { contains: searchQuery } },
        ],
      },
    ],
  }

  return prisma.item.findMany({
    where,
    include: {
      videogame: true,
      music: true,
      book: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ============================================================================
// UPDATE operations
// ============================================================================

/**
 * Update item and videogame data
 */
export async function updateVideogameItem(
  id: string,
  itemData: Prisma.ItemUpdateInput,
  videogameData?: Prisma.VideogameUpdateInput
) {
  const updateData: Prisma.ItemUpdateInput = {
    ...itemData,
  }

  if (videogameData) {
    updateData.videogame = {
      update: videogameData,
    }
  }

  return prisma.item.update({
    where: { id },
    data: updateData,
    include: {
      videogame: true,
    },
  })
}

/**
 * Update item and music data
 */
export async function updateMusicItem(
  id: string,
  itemData: Prisma.ItemUpdateInput,
  musicData?: Prisma.MusicUpdateInput
) {
  const updateData: Prisma.ItemUpdateInput = {
    ...itemData,
  }

  if (musicData) {
    updateData.music = {
      update: musicData,
    }
  }

  return prisma.item.update({
    where: { id },
    data: updateData,
    include: {
      music: true,
    },
  })
}

/**
 * Update item and book data
 */
export async function updateBookItem(
  id: string,
  itemData: Prisma.ItemUpdateInput,
  bookData?: Prisma.BookUpdateInput
) {
  const updateData: Prisma.ItemUpdateInput = {
    ...itemData,
  }

  if (bookData) {
    updateData.book = {
      update: bookData,
    }
  }

  return prisma.item.update({
    where: { id },
    data: updateData,
    include: {
      book: true,
    },
  })
}

// ============================================================================
// DELETE operations
// ============================================================================

/**
 * Delete item by ID (cascade deletes related data)
 */
export async function deleteItem(id: string) {
  return prisma.item.delete({
    where: { id },
  })
}

/**
 * Delete multiple items by IDs
 */
export async function deleteItems(ids: string[]) {
  return prisma.item.deleteMany({
    where: {
      id: { in: ids },
    },
  })
}

// ============================================================================
// Backup operations
// ============================================================================

/**
 * Create a backup record
 */
export async function createBackup(data: Prisma.BackupCreateInput) {
  return prisma.backup.create({
    data,
  })
}

/**
 * Get all backups
 */
export async function getAllBackups(options?: {
  skip?: number
  take?: number
  orderBy?: Prisma.BackupOrderByWithRelationInput
}) {
  return prisma.backup.findMany({
    skip: options?.skip,
    take: options?.take,
    orderBy: options?.orderBy || { createdAt: 'desc' },
  })
}

/**
 * Delete backup record
 */
export async function deleteBackup(id: string) {
  return prisma.backup.delete({
    where: { id },
  })
}

// ============================================================================
// Settings operations
// ============================================================================

/**
 * Get setting by key
 */
export async function getSetting(key: string) {
  return prisma.settings.findUnique({
    where: { key },
  })
}

/**
 * Upsert setting (create or update)
 */
export async function upsertSetting(key: string, value: Prisma.InputJsonValue) {
  return prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}

/**
 * Delete setting by key
 */
export async function deleteSetting(key: string) {
  return prisma.settings.delete({
    where: { key },
  })
}
