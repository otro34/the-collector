import * as React from 'react'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

/**
 * Global test setup: jest-dom matchers, jsdom gaps that Radix/cmdk rely on, and
 * the Next.js modules that blow up outside of a real app runtime.
 *
 * See `docs/phase-2/TESTING.md` for the conventions this file implements.
 */

// ---------------------------------------------------------------------------
// Database safety net
// ---------------------------------------------------------------------------

// Tests must never reach a real database. If something constructs a Prisma client
// anyway, it fails on connect instead of silently hitting the dev or cloud DB.
process.env.DATABASE_URL = 'postgresql://tests:tests@127.0.0.1:1/tests-must-not-connect'

// ---------------------------------------------------------------------------
// jsdom gaps
// ---------------------------------------------------------------------------

// jsdom implements no layout engine, so Radix's positioning and cmdk's list
// virtualisation call APIs that simply do not exist. Without these, every test
// that opens a popover throws before it can assert anything.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: readonly number[] = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}
globalThis.IntersectionObserver ??=
  IntersectionObserverStub as unknown as typeof IntersectionObserver

Element.prototype.scrollIntoView ??= function scrollIntoView() {}
Element.prototype.hasPointerCapture ??= function hasPointerCapture() {
  return false
}
Element.prototype.setPointerCapture ??= function setPointerCapture() {}
Element.prototype.releasePointerCapture ??= function releasePointerCapture() {}

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

// ---------------------------------------------------------------------------
// Next.js mocks
// ---------------------------------------------------------------------------

/** Router spies, so tests can assert on navigation without an app runtime. */
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// `next/image` needs the Next build pipeline for its loader, and its extra props
// are not valid DOM attributes — render a plain <img> and drop them.
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    quality: _quality,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    unoptimized: _unoptimized,
    loader: _loader,
    ...props
  }: Record<string, unknown>) =>
    React.createElement('img', {
      src: typeof src === 'string' ? src : ((src as { src?: string })?.src ?? ''),
      alt: (alt as string) ?? '',
      ...props,
    }),
}))

/** Theme spies, so tests can assert on theme switching. */
export const mockSetTheme = vi.fn()

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    themes: ['light', 'dark', 'system'],
    systemTheme: 'light',
    setTheme: mockSetTheme,
  }),
}))

// ---------------------------------------------------------------------------
// Per-test cleanup
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup()
})
