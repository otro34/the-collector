# The Collector - Phase 2 Project Tracker

**Last Updated**: 2026-07-27
**Phase**: 2 - Enhanced Features, Analytics & Intelligence
**Status**: 🟡 In Progress

---

## Current Sprint: Sprint 13 - Enhanced UI Components & Forms

**Sprint Status**: 🟡 In Progress
**Start Date**: 2026-07-26
**End Date**: TBD
**Goal**: Add searchable dropdowns, update forms with new fields, and adapt card layout per collection type

---

## Phase 2 Overview

**Total Story Points**: 238 (base) + 8 (stretch)
**Completed Story Points**: 65/238 (27%)
**Estimated Duration**: 10-14 weeks

### Phase 2 Goals

1. Add comprehensive metadata fields to all items (purchase info, condition, notes)
2. Implement searchable dropdowns for better UX
3. Migrate to S3/CloudFront cloud storage for images
4. Add Action Figures as a new collection type
5. Add videogame completion tracking
6. Implement deep linking across the application
7. Build analytics engine with daily configurable processing
8. Create collection-specific dashboards with rich visualizations
9. Implement intelligent recommendation algorithms
10. Build collector personality profiling system
11. Add notification and insight system
12. Enhance reading recommendations with analytics data

---

## Sprint Progress Overview

| Sprint    | Status         | Start Date | End Date   | Completed Stories | Total Stories  | Story Points |
| --------- | -------------- | ---------- | ---------- | ----------------- | -------------- | ------------ |
| Sprint 11 | 🟢 Completed   | 2026-02-25 | 2026-02-25 | 3                 | 3              | 18/18        |
| Sprint 12 | 🟢 Completed   | 2026-04-28 | 2026-07-24 | 4                 | 4              | 26/26        |
| Sprint 13 | 🟡 In Progress | 2026-07-26 | TBD        | 3                 | 5              | 21/37        |
| Sprint 14 | ⚪ Planned     | TBD        | TBD        | 0                 | 4              | 0/32         |
| Sprint 15 | ⚪ Planned     | TBD        | TBD        | 0                 | 2              | 0/21         |
| Sprint 16 | ⚪ Planned     | TBD        | TBD        | 0                 | 3              | 0/34         |
| Sprint 17 | ⚪ Planned     | TBD        | TBD        | 0                 | 4 (+1 stretch) | 0/44 (+8)    |
| Sprint 18 | ⚪ Planned     | TBD        | TBD        | 0                 | 4              | 0/40         |

**Legend**: 🔴 Not Started | 🟡 In Progress | 🟢 Completed | ⚪ Planned

---

## Sprint 11: Database & Model Updates

**Goal**: Extend the database schema with new fields and Action Figures collection type
**Duration**: 1 week
**Story Points**: 0/18

### User Stories

#### US-11.1: Add Purchase & Status Fields to Item Model

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 8
- **PR**: [#64](https://github.com/otro34/the-collector/pull/64)
- **Acceptance Criteria**:
  - [x] Database schema updated with new optional fields
  - [x] `purchasePlace` (String, optional)
  - [x] `purchaseDate` (DateTime, optional)
  - [x] `purchaseStatus` enum (NEW_SEALED, NEW_OPENED, USED)
  - [x] `currentStatus` enum (SEALED, AS_NEW, NORMAL_USE, WEARED_DOWN, DAMAGED, BROKEN)
  - [x] `notes` (Text, optional)
  - [x] Migration created and tested (non-destructive)
  - [x] Existing data preserved and validated
  - [x] TypeScript types updated
  - [x] Prisma client regenerated
  - [x] Database utilities updated to handle new fields

**Notes**:

- ⚠️ **CRITICAL**: Migration must be non-destructive - no data loss allowed
- Test migration on development database first
- Verify data integrity after migration

---

#### US-11.2: Add Action Figures Collection Type

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 5
- **PR**: [#64](https://github.com/otro34/the-collector/pull/64)
- **Acceptance Criteria**:
  - [x] `ACTIONFIGURE` added to `CollectionType` enum
  - [x] `ActionFigure` model created with fields:
    - manufacturer (String)
    - series (String, optional)
    - characterName (String, optional)
    - scale (String, optional)
    - material (String, optional)
    - height (String, optional)
    - articulation (String, optional)
    - accessories (JSON array)
    - edition (String, optional)
    - seriesNumber (String, optional)
  - [x] Database migration created and tested
  - [x] TypeScript types exported
  - [x] Relationships configured correctly
  - [x] Indexes added for performance

**Notes**:

- Define properties based on common action figure attributes
- Consider what collectors typically track

---

#### US-11.3: Update Validation Schemas

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 5
- **PR**: [#64](https://github.com/otro34/the-collector/pull/64)
- **Acceptance Criteria**:
  - [x] Zod schemas updated for new Item fields
  - [x] Zod schema created for Action Figures
  - [x] Validation rules defined for all new fields
  - [x] Error messages configured
  - [x] TypeScript types inferred from schemas
  - [x] All existing validations still work

**Notes**:

- Update `src/lib/validators.ts`
- Test all validation rules thoroughly

---

**Sprint 11 Velocity**: 18 pts/day
**Sprint 11 Notes**:

- Completed in a single session (2026-02-25)
- Pre-migration backup created: `backups/pre-sprint11-backup-20260224-220250.sql`
- Migration confirmed non-destructive (only ADD statements)
- TypeScript strict mode passed with zero errors

---

## Sprint 12: Cloud Image Storage Integration

**Goal**: Implement S3 bucket storage for images with CloudFront CDN
**Duration**: 1-2 weeks
**Story Points**: 26/26
**Status**: 🟢 Completed

### User Stories

#### US-12.1: Set Up AWS S3 Integration

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 5
- **PR**: TBD
- **Acceptance Criteria**:
  - [x] AWS SDK installed and configured (`@aws-sdk/client-s3` already in dependencies)
  - [x] S3 bucket credentials added to environment variables (`.env.example` updated)
  - [x] CloudFront distribution URL configured (env var documented)
  - [x] Bucket permissions configured correctly (private bucket + CloudFront OAC, IAM user with `s3:PutObject`)
  - [x] CORS not required (uploads are server-side via API route; images served through CloudFront)
  - [x] Connection tested successfully (real upload verified end-to-end)

**Environment Variables Needed**:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_BUCKET=<bucket-name>
CLOUDFRONT_URL=https://<distribution-id>.cloudfront.net
```

**Notes**:

- User needs to provide AWS credentials and configure the S3 bucket in AWS console
- Bucket policy and CORS must be configured manually
- App gracefully falls back to original URL when credentials are not set

---

#### US-12.2: Create Image Upload Service

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 8
- **PR**: TBD
- **Acceptance Criteria**:
  - [x] Image upload utility created (`src/lib/image-upload.ts`)
  - [x] Supports JPEG, PNG, WebP, GIF formats
  - [x] Generates unique filenames (UUID-based)
  - [x] Returns CloudFront URL after upload
  - [x] Handles upload errors gracefully
  - [x] Validates image size (max 10MB)
  - [x] API route created (`src/app/api/upload-image/route.ts`)

**Notes**:

- `isImageUploadConfigured()` check lets code degrade gracefully when S3 is not set up
- `uploadImageBuffer()` helper available for future direct buffer uploads

---

#### US-12.3: Update Image Selection Flow

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 8
- **PR**: TBD
- **Acceptance Criteria**:
  - [x] Image search results trigger upload to S3
  - [x] Selected image URL saved as CloudFront URL
  - [x] Upload progress indicator shown ("Uploading…" with spinner)
  - [x] Upload errors handled with error message shown in dialog
  - [x] Works for all collection types (via shared `ImageSearchDialog`)
  - [x] Existing URL-based images still work (falls back when S3 not configured)

**Notes**:

- Cancel button disabled while uploading to prevent accidental dismissal
- Retry is possible by clicking "Use Selected Image" again after an error

---

#### US-12.4: Image Migration Strategy (Optional)

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 5
- **PR**: TBD
- **Acceptance Criteria**:
  - [x] Migration script created (`scripts/migrate-images.ts`)
  - [x] Script downloads images from existing URLs
  - [x] Script uploads images to S3
  - [x] Script updates database with new URLs
  - [x] Script handles failures gracefully (per-item try/catch, continues on error)
  - [x] Script provides progress report (per-item status + final summary)
  - [x] Can be run multiple times safely (skips items already on CloudFront)

**Notes**:

- Run with `--dry-run` flag to preview without making changes
- Usage: `npm run db:migrate-images -- --dry-run` (preview) / `npm run db:migrate-images` (execute)
- `tsx` does NOT auto-load `.env`; the npm script passes `--env-file=.env` so it connects to the cloud DB (`db.prisma.io`). Running `npx tsx scripts/migrate-images.ts` directly fails to reach the database.

---

**Sprint 12 Notes**:

- Completed 2026-04-28: US-12.2, US-12.3, US-12.4 fully implemented
- Completed 2026-07-24: US-12.1 — AWS S3 bucket + CloudFront (OAC) configured, IAM upload user set up, real upload verified end-to-end
- Architecture: private bucket, uploads server-side via API route, images served through CloudFront (no CORS needed)
- All code gracefully degrades when AWS credentials are absent (original URL used as fallback)
- Migration script must be run with env loaded: `npm run db:migrate-images` (wraps `tsx --env-file=.env`); 1207/1208 items still on external URLs and pending migration

---

## Sprint 13: Enhanced UI Components & Forms

**Goal**: Add searchable dropdowns, update forms with new fields, and adapt card layout per collection type
**Duration**: 1-2 weeks
**Story Points**: 21/37
**Status**: 🟡 In Progress

### User Stories

#### US-13.0: Set Up Test Infrastructure

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 8
- **PR**: TBD
- **Blocks**: ~~US-13.1, US-13.2, US-13.3, US-13.4~~ — unblocked 2026-07-27
- **Acceptance Criteria**:
  - [x] Vitest installed and configured for Next.js 15 + React 19 + TypeScript
        (`vitest` 4.1 + `@vitejs/plugin-react`)
  - [x] `vitest.config.ts` with the `@/` alias resolving like `tsconfig.json`
        (`resolve.tsconfigPaths`, so the two cannot drift)
  - [x] jsdom environment configured for component tests
  - [x] React Testing Library + `@testing-library/jest-dom` + `@testing-library/user-event` installed
  - [x] Global setup file registers the jest-dom matchers (`src/test/setup.ts`)
  - [x] `npm test` runs the suite (replaces the placeholder echo); `test:watch` and
        `test:coverage` scripts added
  - [x] Coverage reporting configured with the `docs/CLAUDE.md` thresholds
        (utilities 90%, components 70%, services/API 80%, overall 70%)
  - [x] Thresholds do not fail the build until a baseline exists — gated behind
        `ENFORCE_COVERAGE=true`; verified they do fire when the flag is on
  - [x] Sample tests for all three layers: a utility
        (`src/lib/__tests__/collection-display.test.ts`), a rendered component
        (`src/components/collections/__tests__/collection-grid-skeleton.test.tsx`) and an
        interaction test (`src/components/ui/__tests__/searchable-select.test.tsx`)
  - [x] Next.js mocks provided where needed (`next/navigation`, `next/image`, `next-themes`)
  - [x] Tests run without touching the database
  - [x] Conventions documented (`docs/phase-2/TESTING.md`)
  - [x] Backfill tests for `SearchableSelect` (deferred from US-13.1) — 21 tests covering
        open/filter/keyboard/multi-select/clear/a11y/hidden-input behaviour

**Notes**:

- Added 2026-07-26 after US-13.1 hit the same wall US-13.4 did: `npm test` was
  `echo "Tests will be added in later sprints"`, so no story in this sprint could satisfy its
  testing criterion
- Vitest over Jest: much less config for TS + ESM, and the project already leans on
  Vite-compatible tooling through Next 15
- ⚠️ **jsdom has no layout engine**, so Radix and cmdk call APIs that do not exist there.
  `src/test/setup.ts` stubs `ResizeObserver`, `IntersectionObserver`, `scrollIntoView` and the
  pointer-capture methods — without them _every_ popover test throws before it can assert
  anything. Every future Radix-based component test depends on this
- Coverage baseline at merge: **2.66% statements** (104/3907). Thresholds are configured but
  parked behind `ENFORCE_COVERAGE=true` until the backfill lifts the numbers; flip the guard in
  `vitest.config.ts` and add `npm run test:coverage` to CI at that point
- ⚠️ Test-writing gotchas worth remembering: query a dropdown trigger by a stable `aria-label`,
  never by its visible text — the text changes the moment something is selected and the query
  silently stops matching mid-test. And harness props must be listed explicitly; spreading a
  `Partial<ComponentProps<…>>` collapses `SearchableSelect`'s single/multiple discriminated union
- CI already ran `npm test` after lint/type-check/build, so it now runs the real suite with no
  workflow change
- Verified: 28 tests passing, `npm run type-check` clean, `eslint` clean on all new files,
  `npm run build` succeeds

---

#### US-13.1: Create Searchable Dropdown Component

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 8
- **PR**: [#70](https://github.com/otro34/the-collector/pull/70) (merged)
- **Acceptance Criteria**:
  - [x] SearchableSelect component created (`src/components/ui/searchable-select.tsx`)
  - [x] Filter text field at top of dropdown
  - [x] Real-time filtering as user types
  - [x] Case-insensitive search (custom `filterOption` substring matcher)
  - [x] Keyboard navigation supported (arrow keys with wrap, enter, escape, tab)
  - [x] Accessible (`aria-haspopup`/`aria-expanded`/`aria-controls` on the trigger,
        cmdk listbox + `aria-activedescendant`, sr-only "selected" text)
  - [x] Styled consistently with existing UI (same tokens/classes as `SelectTrigger`)
  - [x] Dark mode supported (popover/accent/secondary tokens, no hardcoded colors)
  - [x] Works with single and multi-select (discriminated union props; badges + `+N more`)
  - [x] Interactive behaviour verified — covered by the 21 interaction tests added in US-13.0
        (`src/components/ui/__tests__/searchable-select.test.tsx`) rather than by hand
  - [x] Write component tests — done in US-13.0 once the runner existed
  - [x] Document usage (`docs/phase-2/SEARCHABLE_SELECT.md`)

**Notes**:

- Built on Radix Popover + cmdk (the shadcn/ui Combobox stack) rather than extending
  `Select`: Radix Select swallows keystrokes for its own typeahead, so a filter field
  cannot live inside its content. Two new primitives added: `ui/popover.tsx`, `ui/command.tsx`
- New dependencies: `@radix-ui/react-popover` ^1.1.23, `cmdk` ^1.1.1
- cmdk's default fuzzy scoring is replaced with a plain case-insensitive substring match so
  results are predictable; `option.keywords` adds alias terms
- ⚠️ Two a11y details worth remembering: `aria-invalid` is **not** valid on `role=button`
  (mapped to `data-invalid` for styling; the message is still announced via
  `aria-describedby`), and cmdk uses `aria-selected` for the _highlighted_ row — so the
  _chosen_ state is announced with sr-only text instead of overriding it
- The multi-select trigger uses `<span>` badges rather than the `Badge` component, since a
  `<button>` may only contain phrasing content (`Badge` renders a `<div>`)
- Verified: `npm run type-check` clean, `eslint` clean on all new files, `npm run build`
  succeeds, SSR render checked over HTTP against a temporary demo page (trigger markup,
  ARIA attributes and disabled state all correct, no runtime errors)
- Interactive behaviour (open/filter/keyboard/multi-select toggling) could not be verified in a
  browser when the component was written — no extension was connected. **Closed in US-13.0**
  (2026-07-27) with 21 jsdom interaction tests; two real behaviours were confirmed there that
  had only been reasoned about: the filter resets on reopen, and disabled options are never
  highlighted by keyboard navigation. Dark mode is still only verified by inspection (it uses
  theme tokens exclusively, and jsdom has no CSS engine)

---

#### US-13.2: Update Forms with New Item Fields

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 10
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] All collection forms updated (Video Games, Music, Books)
  - [ ] Purchase Place field added (text input)
  - [ ] Purchase Date field added (date picker)
  - [ ] Purchase Status dropdown added (New Sealed, New Opened, Used)
  - [ ] Current Status dropdown added (Sealed, As New, Normal Use, Weared Down, Damaged, Broken)
  - [ ] Notes field added (textarea)
  - [ ] All fields optional
  - [ ] Form validation works correctly
  - [ ] Edit forms also updated

**Notes**:

- Update all 3 collection types
- Test create and edit flows

---

#### US-13.3: Apply Searchable Dropdowns Globally

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 6
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] All existing dropdowns converted to SearchableSelect
  - [ ] Platform dropdown (Video Games) - searchable
  - [ ] Format dropdown (Music) - searchable
  - [ ] Book Type dropdown (Books) - searchable
  - [ ] Publisher dropdowns - searchable
  - [ ] Genre selections - searchable (multi-select)
  - [ ] New status dropdowns - searchable
  - [ ] Sorting and filtering dropdowns - searchable

**Notes**:

- Identify all dropdown instances
- Test keyboard navigation for each

---

#### US-13.4: Square Cards for Music Collection (Vinyl Sleeve Aspect Ratio)

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 5
- **PR**: [#69](https://github.com/otro34/the-collector/pull/69) (merged)
- **Acceptance Criteria**:
  - [x] Cover area renders `aspect-square` when `collectionType === 'MUSIC'`
  - [x] Videogames and Books keep `aspect-[2/3]` (no visual regression)
  - [x] Aspect ratio derived from `collectionType` in a single shared helper
        (`src/lib/collection-display.ts`)
  - [x] `CollectionGrid` updated
  - [x] `VirtualizedCollectionGrid` updated, including virtualizer row height (`estimateSize`)
  - [x] `CollectionGridSkeleton` matches the real card ratio per collection type
  - [x] Music page loading placeholder uses the square ratio
  - [x] `ItemDetailModal` cover uses the square ratio for music items
  - [x] Album art fills the square without distortion (`object-cover` preserved)
  - [x] Placeholder icon stays centered in the square (`absolute inset-0`, unchanged)
  - [x] Hover overlay and title still cover the full cover area (`absolute inset-0`, unchanged)
  - [ ] Responsive at all breakpoints; dark mode unaffected — **needs manual check in browser**
  - [ ] ~~Tests updated~~ — **not possible**: the project has no test runner
        (`npm test` is a placeholder echo). Deferred; see Sprint 13 notes

**Notes**:

- Vinyl sleeves and CD jewel cases are square; the shared `aspect-[2/3]` distorted album art
- Helper defaults to portrait, so Action Figures (Sprint 14) inherits the mechanism for free
- ⚠️ Found while implementing: the virtualizer never measured its rows — it rendered
  `estimateSize` as the final height. Connected `measureElement` + `data-index` so rows are
  measured for real, which fixes the row-height fragility across breakpoints, not just for music
- Tailwind v4 is in use with no `@config` directive, so the `content` globs in
  `tailwind.config.ts` are inert and the whole repo is auto-scanned. Verified `aspect-square`
  is emitted into the production CSS from `src/lib/collection-display.ts`
- Verified: `npm run type-check` clean, `eslint` clean on changed files, `npm run build` succeeds

---

**Sprint 13 Notes**:

- Focus on UX improvements
- Ensure accessibility standards maintained
- US-13.4 touches shared grid components — verify `/videogames` and `/books` for regressions
- ✅ **Test infrastructure landed 2026-07-27** (US-13.0): Vitest + React Testing Library + jsdom.
  `npm test` runs a real suite. US-13.2 and US-13.3 are expected to ship with tests — read
  `docs/phase-2/TESTING.md` first; the jsdom stubs and query conventions there are not obvious
- US-13.4's remaining "responsive at all breakpoints / dark mode" check still needs a real
  browser: jsdom has no CSS engine, so no test can cover it

---

## Sprint 14: Action Figures Collection Implementation

**Goal**: Implement full CRUD functionality for Action Figures collection
**Duration**: 1-2 weeks
**Story Points**: 0/32
**Status**: ⚪ Planned

### User Stories

#### US-14.1: Create Action Figures List Page

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 10
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Action Figures list page created (`/app/action-figures/page.tsx`)
  - [ ] Displays all action figures in grid layout
  - [ ] Shows key information: character name, series, manufacturer, image
  - [ ] Supports sorting (name, series, year, date added)
  - [ ] Supports filtering (manufacturer, series, scale)
  - [ ] Search functionality works
  - [ ] Pagination implemented
  - [ ] Loading and error states handled
  - [ ] Responsive design (mobile, tablet, desktop)
  - [ ] Dark mode supported

**Notes**:

- Follow existing collection page patterns
- Reuse existing components where possible

---

#### US-14.2: Create Action Figures Form Components

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 12
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Action Figure form component created
  - [ ] All fields available (manufacturer, series, character, scale, material, etc.)
  - [ ] Searchable dropdowns used for common values
  - [ ] Form validation implemented
  - [ ] Error messages shown
  - [ ] Works for both create and edit modes
  - [ ] Image upload to S3 integrated
  - [ ] Purchase info and status fields included
  - [ ] Notes field included

**Notes**:

- Use SearchableSelect for manufacturer, scale, material
- Integrate with S3 image upload

---

#### US-14.3: Create Action Figures API Routes

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 8
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] GET `/api/action-figures` - list with pagination, search, filter
  - [ ] GET `/api/action-figures/[id]` - get single item
  - [ ] POST `/api/action-figures` - create new
  - [ ] PUT `/api/action-figures/[id]` - update existing
  - [ ] DELETE `/api/action-figures/[id]` - delete item
  - [ ] All endpoints handle errors properly
  - [ ] Validation applied on server side
  - [ ] Returns proper HTTP status codes
  - [ ] Works with Prisma for database operations

**Notes**:

- Follow existing API patterns
- Write comprehensive tests

---

#### US-14.4: Integrate Action Figures into Navigation & Dashboard

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 2
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Action Figures added to main navigation
  - [ ] Dashboard shows action figures statistics
  - [ ] Dashboard card links to action figures page
  - [ ] Collection type selector includes Action Figures
  - [ ] Search includes action figures results
  - [ ] Export/import supports action figures
  - [ ] CSV templates include action figures

**Notes**:

- Update navigation component
- Update dashboard statistics
- Update global search

---

**Sprint 14 Notes**:

- Ensure full integration with existing features

---

## Sprint 15: Videogame Completion Tracking & Deep Linking

**Goal**: Add completion status to videogames and implement deep linking across the application
**Duration**: 1 week
**Story Points**: 0/21
**Status**: ⚪ Planned

### User Stories

#### US-15.1: Add Completion Status to Videogames

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 10
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] `completionStatus` enum added (NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED, ON_HOLD)
  - [ ] `completionDate` field added (DateTime, optional)
  - [ ] `completionNotes` field added (String, optional)
  - [ ] `playtimeHours` field added (Float, optional)
  - [ ] Database migration created (non-destructive)
  - [ ] Existing videogame data preserved
  - [ ] Completion badge visible on videogame cards
  - [ ] Filter and sort by completion status
  - [ ] Completion statistics on list page
  - [ ] Edit form updated with completion fields
  - [ ] Zod validation schemas updated

**Notes**:

- Similar pattern to "read" status on books
- Non-destructive migration, all new fields optional

---

#### US-15.2: Implement Deep Linking

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 11
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Detail pages have shareable URLs (`/videogames/[id]`, `/music/[id]`, etc.)
  - [ ] Edit pages have direct URLs (`/videogames/[id]/edit`, etc.)
  - [ ] Search queries persist in URL params (`?q=mario&page=2`)
  - [ ] Filter state encoded in URL params (`?platform=Switch&genre=RPG`)
  - [ ] Sort state encoded in URL params (`?sort=title&order=asc`)
  - [ ] Pagination state in URL params (`?page=3&limit=24`)
  - [ ] URL updates without full page reload
  - [ ] Browser back/forward navigation works correctly
  - [ ] Bookmarkable URLs for any view state
  - [ ] Dashboard deep links (`/dashboard/videogames`, `/dashboard/music`, etc.)

**Notes**:

- Use Next.js router and useSearchParams
- Ensure all collection types supported
- Test browser back/forward navigation

---

**Sprint 15 Velocity**: TBD
**Sprint 15 Notes**:

- Foundation work for dashboards (deep links create the routing structure)
- Completion status enables analytics in Sprint 16

---

## Sprint 16: Analytics Engine & Data Model

**Goal**: Build the analytics data model and configurable daily processing engine
**Duration**: 2 weeks
**Story Points**: 0/34
**Status**: ⚪ Planned

### User Stories

#### US-16.1: Design Analytics Data Model

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 8
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] `AnalyticsSnapshot` model created (daily metric snapshots)
  - [ ] `Recommendation` model created (generated recommendations)
  - [ ] `CollectorProfile` model created (personality profiling)
  - [ ] `AnalyticsConfig` model created (process configuration)
  - [ ] Database migration created (non-destructive)
  - [ ] Proper indexes for query performance
  - [ ] TypeScript types exported
  - [ ] Zod validation schemas created

**Notes**:

- All models use JSON fields for flexible data storage
- Indexes on `collectionType + metricType` and `computedAt` columns
- See USER_STORIES.md US-16.1 for full schema details

---

#### US-16.2: Build Configurable Daily Processing Engine

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 13
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Processing engine created (`src/lib/analytics/engine.ts`)
  - [ ] Supports multiple configurable processors
  - [ ] Configuration stored in database (`AnalyticsConfig`)
  - [ ] Admin settings page for schedule configuration
  - [ ] API endpoint to trigger processing manually
  - [ ] API endpoint to get processing status
  - [ ] Cron job / scheduled task execution
  - [ ] Independent processor execution (one failure doesn't block others)
  - [ ] Processing logs for debugging
  - [ ] Old snapshot cleanup (configurable retention)
  - [ ] Idempotent processing

**Notes**:

- Consider using `node-cron` for scheduling
- Each processor should be independently testable
- Processing should be efficient for large collections

---

#### US-16.3: Implement Grouping & Classification Algorithms

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 13
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Franchise detection algorithm (fuzzy string matching)
  - [ ] Series grouping algorithm (sequential item detection)
  - [ ] Genre classification and normalization
  - [ ] Developer/publisher/artist clustering
  - [ ] Era/period classification (by decade)
  - [ ] All algorithms produce AnalyticsSnapshot data
  - [ ] Confidence scores where applicable
  - [ ] Efficient handling of large collections

**Notes**:

- Franchise matching: Levenshtein distance + token overlap + known franchise dictionary
- Series detection: regex for numbered entries + subtitle matching
- Allow manual overrides via tags
- See USER_STORIES.md US-16.3 for full algorithm details

---

**Sprint 16 Velocity**: TBD
**Sprint 16 Notes**:

- This is the most technically complex sprint
- Algorithms should be tested extensively with real collection data
- Performance testing critical for large collections

---

## Sprint 17: Collection-Specific Dashboards

**Goal**: Build rich, interactive dashboards for each collection type
**Duration**: 2 weeks
**Story Points**: 0/44 (+8 stretch)
**Status**: ⚪ Planned

### User Stories

#### US-17.1: Update Main Dashboard Navigation

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 8
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Main dashboard retains current layout
  - [ ] Action Figures count card added
  - [ ] Each count card links to collection-specific dashboard
  - [ ] "View Collection" secondary link still available
  - [ ] Dashboard sub-navigation for switching between dashboards
  - [ ] Breadcrumb navigation on specific dashboards
  - [ ] Loading and empty states
  - [ ] Responsive layout

**Notes**:

- Cards link to `/dashboard/videogames`, `/dashboard/music`, etc.
- Sub-navigation tabs or sidebar for dashboard switching

---

#### US-17.2: Videogames Detailed Dashboard

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 13
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Platform distribution bar chart (top 15, expandable)
  - [ ] Top franchises section with click-through to all games
  - [ ] Missing games recommendations section
  - [ ] Genre distribution chart
  - [ ] Developer/publisher highlights
  - [ ] Completion overview (progress bar, by platform, recent completions)
  - [ ] All charts responsive and interactive
  - [ ] Dark mode support
  - [ ] Data sourced from AnalyticsSnapshot

**Additional Proposed Features**:

- "This Month in Gaming History" - games released this month in past years
- Platform acquisition timeline
- Collection value estimation
- "Most Collected Year" highlight
- Rarity indicators for limited editions

**Notes**:

- Install charting library (recharts recommended)
- Charts must be interactive (clickable segments/bars)

---

#### US-17.3: Music Detailed Dashboard

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 10
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Genre distribution chart
  - [ ] Artist highlights with discography completeness
  - [ ] Format distribution (Vinyl vs. CD)
  - [ ] Decade distribution timeline
  - [ ] Recommendations section
  - [ ] All charts responsive and interactive
  - [ ] Dark mode support
  - [ ] Data sourced from AnalyticsSnapshot

**Additional Proposed Features**:

- Label highlights (most collected record labels)
- Collection growth timeline
- Most recently added albums
- Country of origin distribution

**Notes**:

- Focus on visual storytelling about music taste

---

#### US-17.4: Books/Comics Detailed Dashboard

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 13
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Genre distribution chart (separate views for manga, comics, books)
  - [ ] Publisher highlights (focus on comic publishers)
  - [ ] Author/writer highlights with completeness tracking
  - [ ] Character highlights for comics (most collected characters)
  - [ ] Series & collection tracking with completion percentage
  - [ ] Reading progress section (read vs. unread, pace, currently reading)
  - [ ] Next reading recommendations
  - [ ] All charts responsive and interactive
  - [ ] Dark mode support
  - [ ] Data sourced from AnalyticsSnapshot

**Additional Proposed Features**:

- Reading streak tracker
- "Shelf analysis" - estimated physical space
- Most collected era/decade
- Award-winning books highlighted

**Notes**:

- Character highlights particularly important for comics collectors
- Series completion tracking drives engagement

---

#### US-17.5: Action Figures Dashboard (Stretch Goal)

- **Status**: ⚪ Stretch
- **Assigned**: TBD
- **Story Points**: 8
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Manufacturer distribution chart
  - [ ] Series/line highlights with completion tracking
  - [ ] Scale distribution
  - [ ] Character collection tracking
  - [ ] Edition tracking (limited editions, exclusives)
  - [ ] Recommendations for missing figures

**Notes**:

- Stretch goal - implement if time permits
- Can be deferred to a later phase

---

**Sprint 17 Velocity**: TBD
**Sprint 17 Notes**:

- Requires charting library (recharts recommended)
- Heavy UI work - focus on responsiveness and dark mode
- All data should come from pre-computed analytics (Sprint 16)

---

## Sprint 18: Recommendation Engine & Personality System

**Goal**: Implement intelligent recommendations and collector personality profiling
**Duration**: 2 weeks
**Story Points**: 0/40
**Status**: ⚪ Planned

### User Stories

#### US-18.1: Implement Recommendation Algorithms

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 13
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Franchise completion recommender
  - [ ] Genre affinity recommender
  - [ ] Series continuation recommender (books/comics)
  - [ ] Platform coverage recommender (videogames)
  - [ ] Creator exploration recommender
  - [ ] Era gap recommender
  - [ ] Recommendations stored in `Recommendation` model
  - [ ] Refreshed by daily process
  - [ ] Dismiss functionality
  - [ ] Shown on collection dashboards

**Notes**:

- See USER_STORIES.md US-18.1 for algorithm scoring formulas
- Recommendations should feel personal and actionable
- Dismissed recommendations should not reappear

---

#### US-18.2: Build Collector Personality Scale

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 13
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Personality trait axes defined and scored:
    - Nostalgia ↔ Modern
    - Mainstream ↔ Niche
    - Completionist ↔ Casual
    - Focused ↔ Eclectic
    - Action ↔ Story
    - Physical ↔ Digital
  - [ ] Gamer archetypes implemented (7 types)
  - [ ] Reader archetypes implemented (7 types)
  - [ ] Overall collector archetype implemented (5 types)
  - [ ] Profile stored in `CollectorProfile` model
  - [ ] Updated by daily processing engine
  - [ ] Profile page with personality visualization (radar chart)
  - [ ] Fun descriptions for each archetype

**Notes**:

- See USER_STORIES.md US-18.2 for archetype definitions and scoring algorithm
- Personality should evolve as collection changes
- Make it fun and shareable

---

#### US-18.3: Implement Notification & Insight System

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 8
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Notification data model created
  - [ ] Notification bell/badge in header
  - [ ] Notification dropdown/panel
  - [ ] Notification types: recommendation, personality, milestone, insight, alert
  - [ ] Generated by daily processing engine
  - [ ] Mark as read / dismiss functionality
  - [ ] Notification preferences in settings
  - [ ] Toast/banner on first visit of the day
  - [ ] Maximum 10 active notifications

**Notes**:

- Keep notifications helpful, not annoying
- Auto-expire old notifications
- User should control which types they see

---

#### US-18.4: Update Reading Recommendations Page

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 6
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Uses new analytics data for recommendations
  - [ ] New categories: series continuation, character deep dives, author exploration, genre balance
  - [ ] Priority scoring for recommendations
  - [ ] Visual improvements (cover images, categorization)
  - [ ] "Why this recommendation" explanations
  - [ ] Personality-based messaging integration
  - [ ] Reading progress integration (streak, pace)
  - [ ] Backward compatible with existing features

**Notes**:

- Enhance, don't replace existing functionality
- Personality integration should feel natural

---

**Sprint 18 Velocity**: TBD
**Sprint 18 Notes**:

- Final sprint of Phase 2
- Focus on polish and user experience
- Personality system should be fun and engaging

---

## Velocity Tracking

### Sprint Velocity (To be calculated)

| Sprint    | Planned Points | Completed Points | Velocity | Notes                                                   |
| --------- | -------------- | ---------------- | -------- | ------------------------------------------------------- |
| Sprint 11 | 18             | 18               | 18 pts   | Completed 2026-02-25                                    |
| Sprint 12 | 26             | 26               | TBD      | Completed 2026-07-24; US-12.1 unblocked after AWS setup |
| Sprint 13 | 24             | 0                | TBD      | -                                                       |
| Sprint 14 | 32             | 0                | TBD      | -                                                       |
| Sprint 15 | 21             | 0                | TBD      | -                                                       |
| Sprint 16 | 34             | 0                | TBD      | -                                                       |
| Sprint 17 | 44 (+8)        | 0                | TBD      | -                                                       |
| Sprint 18 | 40             | 0                | TBD      | -                                                       |

**Average Velocity**: 18 pts (Sprint 11)

---

## Blockers & Issues

### Current Blockers

_None at the moment_

### Resolved Blockers

_To be updated as issues arise and are resolved_

---

## Key Decisions & Notes

### Technical Decisions

1. **Database Migration Strategy**
   - All migrations must be non-destructive
   - Test on development database first
   - Create backup before running migration
   - Document rollback procedure

2. **S3 Image Storage**
   - Use UUID-based filenames for uniqueness
   - Store CloudFront URL (not S3 URL) in database
   - Maintain backward compatibility with existing URLs
   - Consider implementing lazy migration (migrate images as they're edited)

3. **Action Figures Properties**
   - Focus on common collectible attributes
   - Make most fields optional for flexibility
   - Use JSON array for accessories list
   - Consider adding external API integration later

4. **Searchable Dropdowns**
   - Build on shadcn/ui Select component
   - Ensure keyboard accessibility
   - Support both single and multi-select modes
   - Case-insensitive filtering

5. **Analytics Engine Architecture**
   - Pre-compute analytics in daily batch process
   - Store results in AnalyticsSnapshot for fast dashboard loading
   - Use configurable scheduling (AnalyticsConfig model)
   - Each processor runs independently - failures are isolated

6. **Charting Library**
   - Recharts recommended for React/Next.js integration
   - Must support responsive design and dark mode
   - Consider lazy loading chart components to reduce bundle size

7. **Grouping Algorithms**
   - Franchise detection uses fuzzy matching + known franchise dictionary
   - Confidence scores to handle uncertain matches
   - Manual overrides via tags for false positives/negatives
   - Iterative improvement based on real collection data

8. **Personality System**
   - Six trait axes scored from -1.0 to +1.0
   - Three archetype categories: Gamer, Reader, Overall Collector
   - Daily recalculation to reflect collection evolution
   - Fun, shareable results to increase engagement

9. **Deep Linking Strategy**
   - Use Next.js App Router with URL search params
   - Serialize all view state (search, filters, sort, pagination) to URL
   - Browser back/forward navigation preserved
   - Dashboard sub-routes for collection-specific views

### User Feedback

_To be updated as feedback is received_

---

## Testing Status

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage for new code
- **Integration Tests**: All API routes tested
- **Component Tests**: All new components tested
- **E2E Tests**: Critical user flows tested

### Manual Testing Checklist

#### Sprint 11

- [x] Database migration runs successfully
- [x] Existing data preserved
- [x] New fields accessible via Prisma
- [x] TypeScript types work correctly

#### Sprint 12

- [x] S3 upload works
- [x] CloudFront URLs accessible
- [x] Images display correctly
- [x] Error handling works

#### Sprint 13

- [ ] Searchable dropdowns function correctly
- [ ] Keyboard navigation works
- [ ] Forms submit with new fields
- [ ] Validation works as expected

#### Sprint 14

- [ ] Action figures can be created
- [ ] Action figures can be edited
- [ ] Action figures can be deleted
- [ ] List page displays correctly
- [ ] Search and filter work

#### Sprint 15

- [ ] Completion status works on videogames
- [ ] Completion badge displays correctly
- [ ] Filter by completion status works
- [ ] Deep links work for all collection views
- [ ] URL params persist across navigation
- [ ] Browser back/forward works correctly

#### Sprint 16

- [ ] Analytics processing runs successfully
- [ ] Snapshots generated correctly
- [ ] Manual trigger works
- [ ] Configuration UI works
- [ ] Franchise detection produces reasonable groups
- [ ] Series grouping identifies sequences

#### Sprint 17

- [ ] Main dashboard links to specific dashboards
- [ ] Videogames dashboard charts render correctly
- [ ] Music dashboard charts render correctly
- [ ] Books dashboard charts render correctly
- [ ] All charts responsive at all breakpoints
- [ ] Dark mode works for all charts
- [ ] Dashboard data loads from analytics snapshots

#### Sprint 18

- [ ] Recommendations generated and displayed
- [ ] Dismiss functionality works
- [ ] Personality profile calculated correctly
- [ ] Personality page displays radar chart
- [ ] Notifications appear on site access
- [ ] Notification preferences work
- [ ] Reading recommendations page updated

---

## Phase 2 Completion Criteria

Phase 2 will be considered complete when:

- [ ] All 28 user stories completed (230 story points)
- [ ] Database schema extended with new fields and analytics models
- [ ] Action Figures collection fully functional
- [ ] S3 image storage implemented and tested
- [ ] Searchable dropdowns applied throughout app
- [ ] Videogame completion tracking functional
- [ ] Deep linking works across all views
- [ ] Analytics engine running with daily processing
- [ ] Collection-specific dashboards live with charts
- [ ] Recommendation algorithms producing useful suggestions
- [ ] Collector personality system functional
- [ ] Notification system working
- [ ] Reading recommendations enhanced
- [ ] All tests passing (80%+ coverage)
- [ ] Documentation updated
- [ ] No critical bugs
- [ ] Performance metrics maintained (Lighthouse 90+)
- [ ] Accessibility compliance maintained (WCAG AA)
- [ ] User acceptance testing passed

---

## Next Steps

### Before Starting Sprint 11

1. **Review requirements** with user
2. **Set up AWS account** (if not already done)
3. **Create S3 bucket** and CloudFront distribution
4. **Configure environment variables**
5. **Create database backup**
6. **Review Phase 1 documentation**
7. **Set sprint start date**

### After Phase 2 Completion

- Deploy to production
- Monitor for issues
- Gather user feedback
- Tune recommendation algorithms based on real usage
- Plan Phase 3 (if applicable)

---

## Resources & Links

### Documentation

- [Phase 2 User Stories](./USER_STORIES.md)
- [Phase 2 Execution Plan](./EXECUTION_PLAN.md)
- [Phase 2 Requirements](./requirements.md)
- [Phase 1 Documentation](../phase-1/)
- [Development Guide](../CLAUDE.md)

### External Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/) (recommended charting library)
- [node-cron](https://www.npmjs.com/package/node-cron) (for scheduled processing)

---

**Last Updated**: 2026-07-24
**Next Review**: Sprint 13 kickoff
