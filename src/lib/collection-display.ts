import type { CollectionType } from '@prisma/client'

/**
 * Display helpers that vary per collection type.
 *
 * Physical media have different shapes: vinyl sleeves and CD jewel cases are
 * square, while book covers and game boxes are portrait. Cover areas derive
 * their aspect ratio from the collection type so album art is not letterboxed.
 */

/** Portrait ratio used by book covers and game boxes. */
const PORTRAIT_ASPECT = 'aspect-[2/3]'

/** Square ratio used by vinyl sleeves and CD jewel cases. */
const SQUARE_ASPECT = 'aspect-square'

/**
 * Tailwind aspect-ratio class for an item's cover area.
 * Defaults to portrait so new collection types keep the existing look.
 */
export function getCoverAspectClass(type: CollectionType): string {
  switch (type) {
    case 'MUSIC':
      return SQUARE_ASPECT
    default:
      return PORTRAIT_ASPECT
  }
}

/**
 * Estimated row height in px for the virtualized grid, including the gap.
 *
 * The virtualizer needs a height before rendering, and it depends on the cover
 * aspect ratio: a square cover is shorter than a portrait one at the same
 * column width, so a single hardcoded value leaves gaps or overlaps rows.
 * Rows are re-measured after mount, so this only has to be close.
 */
export function getEstimatedRowHeight(type: CollectionType): number {
  return type === 'MUSIC' ? 250 : 320
}
