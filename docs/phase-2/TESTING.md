# Testing Guide

**Stack**: [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react) + jsdom
**Added**: 2026-07-27 (US-13.0)

---

## Running tests

```bash
npm test              # run the suite once (what CI runs)
npm run test:watch    # re-run on change while developing
npm run test:coverage # run once and print/emit a coverage report
```

Filter to a subset the usual Vitest way:

```bash
npm test -- searchable-select          # files matching a substring
npm test -- -t "multi select"          # tests matching a name
```

---

## Why Vitest

Jest needs a Babel or SWC transform layer, a separate ESM story and a manual `moduleNameMapper`
for the `@/` alias. Vitest reads `tsconfig.json` directly (`resolve.tsconfigPaths`), handles TS +
ESM natively, and shares its config format with the Vite-based tooling Next 15 already uses.

---

## Layout and naming

Tests live in a `__tests__/` folder next to the code under test:

```
src/lib/collection-display.ts
src/lib/__tests__/collection-display.test.ts

src/components/ui/searchable-select.tsx
src/components/ui/__tests__/searchable-select.test.tsx
```

- File name: `<subject>.test.ts` for plain TS, `<subject>.test.tsx` when it renders JSX
- Only `src/**/*.{test,spec}.{ts,tsx}` is collected — nothing outside `src/` is picked up

---

## The three layers

Each layer has a worked example in the repo; copy the closest one.

| Layer                    | Target coverage | Example                                                                  |
| ------------------------ | --------------- | ------------------------------------------------------------------------ |
| Utilities / helpers      | 90%             | `src/lib/__tests__/collection-display.test.ts`                           |
| Components (render)      | 70%             | `src/components/collections/__tests__/collection-grid-skeleton.test.tsx` |
| Components (interaction) | 70%             | `src/components/ui/__tests__/searchable-select.test.tsx`                 |
| Services / API routes    | 80%             | —                                                                        |

Project-wide floor: **70%**.

### 1. Utility test

Pure input → output. No renderer, no mocks.

```ts
import { describe, it, expect } from 'vitest'
import { getCoverAspectClass } from '@/lib/collection-display'

describe('getCoverAspectClass', () => {
  it('returns a square ratio for music', () => {
    expect(getCoverAspectClass('MUSIC')).toBe('aspect-square')
  })
})
```

### 2. Rendered component test

Assert on the markup produced for a set of props.

```tsx
import { render, screen } from '@testing-library/react'
import { CollectionGridSkeleton } from '@/components/collections/collection-grid-skeleton'

it('uses the square cover ratio for music', () => {
  const { container } = render(<CollectionGridSkeleton count={1} collectionType="MUSIC" />)
  expect(container.querySelector('.animate-pulse')).toHaveClass('aspect-square')
})
```

### 3. Interaction test

Drive the component through `@testing-library/user-event`, never by calling handlers directly.

```tsx
import userEvent from '@testing-library/user-event'

it('narrows the list as the user types', async () => {
  const user = userEvent.setup()
  render(<SingleHarness />)

  await user.click(screen.getByRole('button', { name: 'Platform' }))
  await user.type(screen.getByRole('combobox'), 'playstation')

  expect(screen.getByRole('option', { name: /PlayStation 5/ })).toBeInTheDocument()
})
```

---

## Conventions

**Query by role and accessible name.** `getByRole('option', { name: /PlayStation 5/ })` fails when
the component stops being accessible; `container.querySelector('.cmdk-item')` does not. Fall back to
`container.querySelector` only for presentational markup with no role (skeletons, decorative wrappers).

**Give a trigger a stable `aria-label` in tests.** A dropdown trigger's visible text changes the
moment something is selected, so a text-based query silently stops matching halfway through a test.

**Wrap controlled components in a local harness.** Components like `SearchableSelect` are fully
controlled; without a harness holding state, a selection never appears in the trigger:

```tsx
function SingleHarness({ onValueChange }: { onValueChange?: (value: string) => void }) {
  const [value, setValue] = React.useState('')
  return (
    <SearchableSelect
      options={OPTIONS}
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onValueChange?.(next)
      }}
    />
  )
}
```

List extra harness props explicitly rather than spreading a `Partial<ComponentProps<…>>` —
a partial spread collapses discriminated unions like `SearchableSelect`'s single/multiple props.

**Prefer behaviour over implementation.** Assert what a user or a screen reader perceives, not
internal state or class names that carry no meaning.

**No database access.** Nothing in the suite may touch Prisma. `src/test/setup.ts` overwrites
`DATABASE_URL` with an unroutable value, so a stray client fails loudly instead of quietly hitting
the dev or cloud database. Mock the data layer at the module boundary:

```ts
vi.mock('@/lib/db', () => ({ prisma: { item: { findMany: vi.fn().mockResolvedValue([]) } } }))
```

---

## Global setup

`src/test/setup.ts` runs before every test file and provides:

### jest-dom matchers

`toBeInTheDocument`, `toHaveClass`, `toHaveValue`, … are registered globally. Types come along
with the `@testing-library/jest-dom/vitest` import — no `tsconfig.json` change needed.

### jsdom gaps

jsdom has no layout engine, so Radix and cmdk call APIs that do not exist there. Stubbed:
`ResizeObserver`, `IntersectionObserver`, `Element.scrollIntoView`, the pointer-capture methods
(`hasPointerCapture` / `setPointerCapture` / `releasePointerCapture`) and `window.matchMedia`.
Without these, **every test that opens a popover throws before it can assert anything**.

### Next.js mocks

| Module            | Behaviour                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `next/navigation` | `useRouter()` returns the exported `mockRouter` spies; `usePathname` → `/`                                         |
| `next/image`      | Renders a plain `<img>`, dropping `fill`/`priority`/`loader`/… so React does not warn about unknown DOM attributes |
| `next-themes`     | `ThemeProvider` is a pass-through; `useTheme()` reports `light` and exposes the `mockSetTheme` spy                 |

Assert on navigation or theme switching by importing the spies:

```ts
import { mockRouter } from '@/test/setup'

expect(mockRouter.push).toHaveBeenCalledWith('/videogames')
```

`restoreMocks: true` resets them between tests, and RTL `cleanup()` runs after each test.

---

## Coverage

```bash
npm run test:coverage      # text summary + HTML report in ./coverage
```

Thresholds are defined in `vitest.config.ts` using the `docs/CLAUDE.md` targets, but they are
**only enforced when `ENFORCE_COVERAGE=true`**:

```bash
ENFORCE_COVERAGE=true npm run test:coverage   # fails below threshold
```

The suite starts from ~3% coverage, so enforcing immediately would block every PR. Once the
backfill brings the numbers up, drop the env guard in `vitest.config.ts` and add
`npm run test:coverage` to `.github/workflows/ci.yml`.

Excluded from coverage: test files, `src/test/**`, `src/types/**`, and the App Router
`layout`/`page`/`loading`/`error`/`not-found` files (routing wiring, not units).

---

## CI

`.github/workflows/ci.yml` runs `npm test` on every push to `main` and every PR, after lint,
type-check and build. It previously ran a placeholder `echo`; as of US-13.0 it runs the real suite.
