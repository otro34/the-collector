import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import { CollectionGridSkeleton } from '@/components/collections/collection-grid-skeleton'

/**
 * Sample rendered-component test: no user interaction, just assertions on the
 * markup a component produces for a given set of props.
 */
describe('CollectionGridSkeleton', () => {
  const coverSkeletons = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('.animate-pulse')).filter((element) =>
      element.className.includes('w-full')
    )

  it('renders 12 placeholder cards by default', () => {
    const { container } = render(<CollectionGridSkeleton />)

    expect(coverSkeletons(container)).toHaveLength(12)
  })

  it('renders the requested number of placeholder cards', () => {
    const { container } = render(<CollectionGridSkeleton count={3} />)

    expect(coverSkeletons(container)).toHaveLength(3)
  })

  it('uses the square cover ratio for music so it matches the real cards', () => {
    const { container } = render(<CollectionGridSkeleton count={1} collectionType="MUSIC" />)

    expect(coverSkeletons(container)[0]).toHaveClass('aspect-square')
  })

  it('keeps the portrait cover ratio for books and videogames', () => {
    const { container: books } = render(<CollectionGridSkeleton count={1} collectionType="BOOK" />)
    expect(coverSkeletons(books)[0]).toHaveClass('aspect-[2/3]')

    const { container: games } = render(
      <CollectionGridSkeleton count={1} collectionType="VIDEOGAME" />
    )
    expect(coverSkeletons(games)[0]).toHaveClass('aspect-[2/3]')
  })
})
