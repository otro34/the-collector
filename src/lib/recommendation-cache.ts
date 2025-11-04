import type { BookType } from '@prisma/client'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class RecommendationCache {
  private cache: Map<string, CacheEntry<unknown>>
  private readonly ttl: number // Time to live in milliseconds

  constructor(ttlMinutes: number = 60) {
    this.cache = new Map()
    this.ttl = ttlMinutes * 60 * 1000
  }

  /**
   * Get cached data if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    const now = Date.now()
    const isExpired = now - entry.timestamp > this.ttl

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Store data in cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear()
  }

  /**
   * Generate cache key for recommendations by book type
   */
  static getRecommendationsKey(bookType?: BookType): string {
    return bookType ? `recommendations:${bookType}` : 'recommendations:all'
  }

  /**
   * Clear all recommendation caches (useful after parsing)
   */
  clearRecommendations(): void {
    const keys = Array.from(this.cache.keys()).filter((key) => key.startsWith('recommendations:'))
    keys.forEach((key) => this.cache.delete(key))
  }
}

// Singleton instance
export const recommendationCache = new RecommendationCache(60) // 60 minutes TTL
