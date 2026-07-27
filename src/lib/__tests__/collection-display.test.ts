import { describe, it, expect } from 'vitest'

import { getCoverAspectClass, getEstimatedRowHeight } from '@/lib/collection-display'

describe('getCoverAspectClass', () => {
  it('returns a square ratio for music, matching vinyl sleeves and jewel cases', () => {
    expect(getCoverAspectClass('MUSIC')).toBe('aspect-square')
  })

  it('returns the portrait ratio for videogames and books', () => {
    expect(getCoverAspectClass('VIDEOGAME')).toBe('aspect-[2/3]')
    expect(getCoverAspectClass('BOOK')).toBe('aspect-[2/3]')
  })

  it('defaults to portrait for collection types added later', () => {
    expect(getCoverAspectClass('ACTIONFIGURE')).toBe('aspect-[2/3]')
  })
})

describe('getEstimatedRowHeight', () => {
  it('estimates a shorter row for square music covers', () => {
    expect(getEstimatedRowHeight('MUSIC')).toBeLessThan(getEstimatedRowHeight('BOOK'))
  })

  it('uses the same estimate for every portrait collection type', () => {
    expect(getEstimatedRowHeight('VIDEOGAME')).toBe(getEstimatedRowHeight('BOOK'))
  })
})
