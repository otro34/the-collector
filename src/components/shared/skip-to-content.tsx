'use client'

/**
 * Skip to Content Link
 *
 * Provides a keyboard-accessible link that allows users to skip directly
 * to the main content, bypassing navigation and header elements.
 * This is a WCAG AAA requirement for accessibility.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to content
    </a>
  )
}
