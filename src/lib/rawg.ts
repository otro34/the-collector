/**
 * RAWG API utilities for videogame lookup
 * Supports game search by title and platform filtering
 */

/**
 * Normalizes game title for better search results
 * Removes special characters and extra spaces
 */
export function normalizeGameTitle(title: string): string {
  return title
    .trim()
    .replace(/[™®©]/g, '') // Remove trademark symbols
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
}

/**
 * Formats platform names from RAWG format to a more readable format
 * Example: "PlayStation 4" -> "PlayStation 4"
 */
export function formatPlatformName(platform: string): string {
  return platform.trim()
}

/**
 * Maps RAWG platform names to common platform categories
 * This helps with platform filtering and mapping to user's platform list
 */
export function mapRAWGPlatformToCategory(platformSlug: string): string | null {
  const platformMap: Record<string, string> = {
    // PlayStation
    'playstation-5': 'PlayStation 5',
    'playstation-4': 'PlayStation 4',
    'playstation-3': 'PlayStation 3',
    'playstation-2': 'PlayStation 2',
    'playstation-1': 'PlayStation',
    'ps-vita': 'PlayStation Vita',
    psp: 'PSP',

    // Xbox
    'xbox-series-x': 'Xbox Series X|S',
    'xbox-one': 'Xbox One',
    'xbox-360': 'Xbox 360',
    'xbox-old': 'Xbox',

    // Nintendo
    'nintendo-switch': 'Nintendo Switch',
    'nintendo-3ds': 'Nintendo 3DS',
    'nintendo-ds': 'Nintendo DS',
    'wii-u': 'Wii U',
    wii: 'Wii',
    gamecube: 'GameCube',
    'nintendo-64': 'Nintendo 64',
    'game-boy-advance': 'Game Boy Advance',
    'game-boy-color': 'Game Boy Color',
    'game-boy': 'Game Boy',

    // PC
    pc: 'PC',
    mac: 'Mac',
    macos: 'Mac',
    linux: 'Linux',

    // Mobile
    ios: 'iOS',
    android: 'Android',

    // Sega
    'sega-genesis': 'Sega Genesis',
    'sega-saturn': 'Sega Saturn',
    dreamcast: 'Dreamcast',

    // Other
    'atari-2600': 'Atari 2600',
    'atari-5200': 'Atari 5200',
    'atari-7800': 'Atari 7800',
    'atari-st': 'Atari ST',
    'commodore-amiga': 'Amiga',
    'neo-geo': 'Neo Geo',
  }

  const normalized = platformSlug.toLowerCase().trim()
  return platformMap[normalized] || null
}

/**
 * Extracts year from release date string
 * @param released - Release date in YYYY-MM-DD format
 * @returns Year as number or undefined
 */
export function extractYear(released?: string): number | undefined {
  if (!released) return undefined

  const yearMatch = released.match(/^(\d{4})/)
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10)
    return !isNaN(year) ? year : undefined
  }

  return undefined
}

/**
 * Formats release date to a more readable format
 * @param released - Release date in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatReleaseDate(released?: string): string | undefined {
  if (!released) return undefined

  try {
    const date = new Date(released)
    if (isNaN(date.getTime())) return undefined

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return undefined
  }
}

/**
 * Validates game title search query
 * @param query - The search query
 * @returns true if valid, false otherwise
 */
export function isValidGameQuery(query: string): boolean {
  const trimmed = query.trim()
  return trimmed.length >= 2 && trimmed.length <= 200
}

/**
 * Filters platforms by a specific platform name or slug
 * @param platforms - Array of platform objects
 * @param platformFilter - Platform name or slug to filter by
 * @returns Filtered array of platforms
 */
export function filterPlatforms(
  platforms: Array<{ platform: { name: string; slug: string } }>,
  platformFilter?: string
): Array<{ platform: { name: string; slug: string } }> {
  if (!platformFilter) return platforms

  const filter = platformFilter.toLowerCase().trim()
  return platforms.filter(
    (p) =>
      p.platform.name.toLowerCase().includes(filter) ||
      p.platform.slug.toLowerCase().includes(filter)
  )
}

/**
 * Gets the primary genre from a game's genre list
 * @param genres - Array of genre objects
 * @returns Primary genre name or undefined
 */
export function getPrimaryGenre(genres?: Array<{ name: string }>): string | undefined {
  return genres && genres.length > 0 ? genres[0].name : undefined
}

/**
 * Formats multiple genres into a comma-separated string
 * @param genres - Array of genre objects
 * @param limit - Maximum number of genres to include
 * @returns Formatted genre string
 */
export function formatGenres(genres?: Array<{ name: string }>, limit: number = 3): string {
  if (!genres || genres.length === 0) return ''

  const genreNames = genres.slice(0, limit).map((g) => g.name)
  return genreNames.join(', ')
}

/**
 * Extracts publisher names from RAWG API response
 * @param publishers - Array of publisher objects
 * @returns Array of publisher names
 */
export function extractPublisherNames(publishers?: Array<{ name: string }>): string[] {
  if (!publishers || publishers.length === 0) return []
  return publishers.map((p) => p.name)
}

/**
 * Gets the first publisher name
 * @param publishers - Array of publisher objects
 * @returns First publisher name or undefined
 */
export function getPrimaryPublisher(publishers?: Array<{ name: string }>): string | undefined {
  return publishers && publishers.length > 0 ? publishers[0].name : undefined
}

/**
 * Builds platform list string for display
 * @param platforms - Array of platform objects
 * @param limit - Maximum number of platforms to include
 * @returns Formatted platform string
 */
export function formatPlatforms(
  platforms?: Array<{ platform: { name: string } }>,
  limit: number = 3
): string {
  if (!platforms || platforms.length === 0) return ''

  const platformNames = platforms.slice(0, limit).map((p) => p.platform.name)
  const formatted = platformNames.join(', ')

  if (platforms.length > limit) {
    return `${formatted} +${platforms.length - limit} more`
  }

  return formatted
}

/**
 * Sanitizes HTML from description (RAWG sometimes includes HTML)
 * @param html - HTML string
 * @returns Plain text string
 */
export function stripHTML(html?: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}
