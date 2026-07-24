# The Collector - Phase 2 User Stories & Sprint Planning

**Phase**: 2
**Status**: 🔵 Planning
**Last Updated**: 2026-02-24

---

## Product Backlog

### Epic 9: Enhanced Item Metadata

Add comprehensive metadata fields to all collection items for better tracking and management.

### Epic 10: Advanced UI Components

Implement searchable dropdowns and enhanced form controls for better user experience.

### Epic 11: Cloud Image Storage

Migrate from URL-based images to S3 bucket storage with CloudFront CDN.

### Epic 12: Action Figures Collection

Add a new collection type for action figures and collectible items.

### Epic 13: Dashboard Redesign & Collection Analytics

Redesign the dashboard with collection-specific views, data analytics, and rich visualizations.

### Epic 14: Analytics Engine & Data Processing

Build a configurable daily processing engine to generate analytics, groupings, and recommendations.

### Epic 15: Recommendation & Personality System

Create intelligent recommendation algorithms and a collector personality profiling system.

### Epic 16: Enhanced Navigation & Deep Linking

Add deep linking support, videogame completion tracking, and improved URL-based navigation.

---

## Sprint Structure (2-week sprints)

### Sprint 11: Database & Model Updates

**Goal**: Extend the database schema with new fields and Action Figures collection type
**Duration**: 1 week
**Story Points**: 18

#### User Stories

**US-11.1: Add Purchase & Status Fields to Item Model**

- **As a** collector
- **I want** to track purchase details and item condition
- **So that** I can maintain comprehensive records of my collection

**Acceptance Criteria**:

- [ ] Database schema updated with new optional fields:
  - `purchasePlace` (String, optional)
  - `purchaseDate` (DateTime, optional)
  - `purchaseStatus` (Enum: NEW_SEALED, NEW_OPENED, USED)
  - `currentStatus` (Enum: SEALED, AS_NEW, NORMAL_USE, WEARED_DOWN, DAMAGED, BROKEN)
  - `notes` (Text, optional)
- [ ] Migration created and tested (non-destructive)
- [ ] Existing data preserved and validated
- [ ] TypeScript types updated
- [ ] Prisma client regenerated
- [ ] Database utilities updated to handle new fields

**Tasks**:

- Update `prisma/schema.prisma` with new fields and enums
- Create database migration
- Test migration on development database
- Update TypeScript types in `src/types/`
- Update database utilities in `src/lib/db/`
- Verify existing data integrity

**Effort**: 8 story points

---

**US-11.2: Add Action Figures Collection Type**

- **As a** collector
- **I want** to manage action figures and collectible items
- **So that** I can track my complete collection in one place

**Acceptance Criteria**:

- [ ] `ACTIONFIGURE` added to `CollectionType` enum
- [ ] `ActionFigure` model created with relevant fields:
  - `manufacturer` (String)
  - `series` (String, optional)
  - `characterName` (String, optional)
  - `scale` (String, optional - e.g., "1:6", "1:12")
  - `material` (String, optional - e.g., "PVC", "Resin")
  - `height` (String, optional - e.g., "12 inches")
  - `articulation` (String, optional - e.g., "30 points")
  - `accessories` (String array as JSON)
  - `edition` (String, optional - e.g., "Limited Edition")
  - `seriesNumber` (String, optional - e.g., "#45/1000")
- [ ] Database migration created and tested
- [ ] TypeScript types exported
- [ ] Relationships configured correctly

**Tasks**:

- Define Action Figure properties based on common collectibles
- Update Prisma schema with new model
- Create database migration
- Update TypeScript types
- Add indexes for performance
- Test with sample data

**Effort**: 5 story points

---

**US-11.3: Update Validation Schemas**

- **As a** developer
- **I want** updated Zod validation schemas
- **So that** form validation works with new fields

**Acceptance Criteria**:

- [ ] Zod schemas updated for new Item fields
- [ ] Zod schema created for Action Figures
- [ ] Validation rules defined for all new fields
- [ ] Error messages configured
- [ ] TypeScript types inferred from schemas
- [ ] All existing validations still work

**Tasks**:

- Update `src/lib/validators.ts` with new fields
- Create Action Figure validation schema
- Add enum validations for status fields
- Test validation rules
- Update form handlers

**Effort**: 5 story points

**Sprint 11 Total**: 18 story points

---

### Sprint 12: Cloud Image Storage Integration

**Goal**: Implement S3 bucket storage for images with CloudFront CDN
**Duration**: 1-2 weeks
**Story Points**: 26

#### User Stories

**US-12.1: Set Up AWS S3 Integration** 🟡 In Progress

- **As a** developer
- **I want** to configure AWS S3 for image storage
- **So that** images can be uploaded and stored reliably

**Acceptance Criteria**:

- [x] AWS SDK installed and configured (`@aws-sdk/client-s3` already in dependencies)
- [x] S3 bucket credentials added to environment variables (`.env.example` updated)
- [x] CloudFront distribution URL configured (env var documented)
- [ ] Bucket permissions configured correctly (user action required)
- [ ] CORS settings configured for uploads (user action required)
- [ ] Connection tested successfully (pending credentials)

**Tasks**:

- [x] ~~Install `@aws-sdk/client-s3`~~ (already installed)
- [x] Add env vars to `.env.example`: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `CLOUDFRONT_URL`
- [ ] User: create S3 bucket and CloudFront distribution in AWS console
- [ ] User: configure bucket policy and CORS for uploads
- [ ] User: add credentials to `.env`

**Effort**: 5 story points

---

**US-12.2: Create Image Upload Service** 🟢 Completed

- **As a** developer
- **I want** a reusable image upload service
- **So that** images can be uploaded to S3 from anywhere in the app

**Acceptance Criteria**:

- [x] Image upload utility created (`src/lib/image-upload.ts`)
- [x] Supports JPEG, PNG, WebP, GIF formats
- [x] Generates unique filenames (UUID-based)
- [x] Returns CloudFront URL after upload
- [x] Handles upload errors gracefully
- [x] Validates image size (max 10MB)
- [x] API route created (`src/app/api/upload-image/route.ts`)

**Effort**: 8 story points

---

**US-12.3: Update Image Selection Flow** 🟢 Completed

- **As a** user
- **I want** images to be automatically uploaded to cloud storage
- **So that** my collection images are reliably stored

**Acceptance Criteria**:

- [x] Image search results trigger upload to S3
- [x] Selected image URL saved as CloudFront URL
- [x] Upload progress indicator shown ("Uploading…" with spinner)
- [x] Upload errors handled with error message and retry option
- [x] Works for all collection types (via shared `ImageSearchDialog`)
- [x] Existing URL-based images still work (falls back when S3 not configured)

**Effort**: 8 story points

---

**US-12.4: Image Migration Strategy (Optional)** 🟢 Completed

- **As a** system administrator
- **I want** a tool to migrate existing images to S3
- **So that** all images use the new storage system

**Acceptance Criteria**:

- [x] Migration script created (`scripts/migrate-images.ts`)
- [x] Script downloads images from existing URLs
- [x] Script uploads images to S3
- [x] Script updates database with new URLs
- [x] Script handles failures gracefully (per-item try/catch)
- [x] Script provides progress report (per-item + final summary)
- [x] Can be run multiple times safely (skips CloudFront URLs)

**Usage**: `npx tsx scripts/migrate-images.ts [--dry-run]`

**Effort**: 5 story points

**Sprint 12 Total**: 26 story points (21 completed, 5 blocked on user credentials)

---

### Sprint 13: Enhanced UI Components & Forms

**Goal**: Add searchable dropdowns and update forms with new fields
**Duration**: 1-2 weeks
**Story Points**: 24

#### User Stories

**US-13.1: Create Searchable Dropdown Component**

- **As a** user
- **I want** to search/filter dropdown options
- **So that** I can quickly find and select values

**Acceptance Criteria**:

- [ ] SearchableSelect component created
- [ ] Filter text field at top of dropdown
- [ ] Real-time filtering as user types
- [ ] Case-insensitive search
- [ ] Keyboard navigation supported (arrow keys, enter, escape)
- [ ] Accessible (ARIA labels, screen reader friendly)
- [ ] Styled consistently with existing UI
- [ ] Dark mode supported
- [ ] Works with single and multi-select

**Tasks**:

- Create `src/components/ui/searchable-select.tsx`
- Implement search/filter logic
- Add keyboard navigation
- Add accessibility attributes
- Style with Tailwind
- Write component tests
- Document usage

**Effort**: 8 story points

---

**US-13.2: Update Forms with New Item Fields**

- **As a** user
- **I want** to enter purchase and status information
- **So that** I can track detailed item metadata

**Acceptance Criteria**:

- [ ] All collection forms updated (Video Games, Music, Books)
- [ ] Purchase fields added:
  - Purchase Place (text input)
  - Purchase Date (date picker)
  - Purchase Status (dropdown: New Sealed, New Opened, Used)
- [ ] Status fields added:
  - Current Status (dropdown: Sealed, As New, Normal Use, Weared Down, Damaged, Broken)
- [ ] Notes field added (textarea)
- [ ] All fields optional
- [ ] Form validation works correctly
- [ ] Edit forms also updated

**Tasks**:

- Update Video Games form component
- Update Music form component
- Update Books form component
- Add date picker for purchase date
- Add dropdowns with consistent values
- Update form handlers
- Test create and edit flows

**Effort**: 10 story points

---

**US-13.3: Apply Searchable Dropdowns Globally**

- **As a** user
- **I want** all dropdown fields to be searchable
- **So that** I can quickly find options in long lists

**Acceptance Criteria**:

- [ ] All existing dropdowns converted to SearchableSelect
- [ ] Platform dropdown (Video Games) - searchable
- [ ] Format dropdown (Music) - searchable
- [ ] Book Type dropdown (Books) - searchable
- [ ] Publisher dropdowns - searchable
- [ ] Genre selections - searchable (multi-select)
- [ ] New status dropdowns - searchable
- [ ] Sorting and filtering dropdowns - searchable

**Tasks**:

- Identify all dropdown components
- Replace with SearchableSelect
- Test each replacement
- Verify keyboard navigation works
- Verify accessibility
- Update tests

**Effort**: 6 story points

**Sprint 13 Total**: 24 story points

---

### Sprint 14: Action Figures Collection Implementation

**Goal**: Implement full CRUD functionality for Action Figures collection
**Duration**: 1-2 weeks
**Story Points**: 32

#### User Stories

**US-14.1: Create Action Figures List Page**

- **As a** user
- **I want** to view my action figures collection
- **So that** I can see all my collectibles in one place

**Acceptance Criteria**:

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

**Tasks**:

- Create page component
- Create action figure card component
- Implement data fetching with TanStack Query
- Add search, sort, filter controls
- Add pagination
- Style with Tailwind
- Write component tests
- Test on multiple devices

**Effort**: 10 story points

---

**US-14.2: Create Action Figures Form Components**

- **As a** user
- **I want** to add and edit action figures
- **So that** I can manage my collectibles

**Acceptance Criteria**:

- [ ] Action Figure form component created
- [ ] All fields available:
  - Title (required)
  - Manufacturer (required, searchable dropdown)
  - Series (optional, text input)
  - Character Name (optional, text input)
  - Scale (optional, searchable dropdown with common values)
  - Material (optional, searchable dropdown: PVC, Resin, Die-cast, Vinyl, etc.)
  - Height (optional, text input with unit)
  - Articulation (optional, text input)
  - Accessories (optional, multi-input for array)
  - Edition (optional, text input)
  - Series Number (optional, text input)
  - Year (optional)
  - Price (optional)
  - Tags (optional)
  - Image URL (with Google Image Search)
  - Purchase info and status fields
  - Notes
- [ ] Form validation implemented
- [ ] Error messages shown
- [ ] Works for both create and edit modes
- [ ] Image upload to S3 integrated

**Tasks**:

- Create form component
- Add all input fields
- Integrate SearchableSelect components
- Add form validation with Zod
- Add image search/upload
- Test create and edit modes
- Write component tests

**Effort**: 12 story points

---

**US-14.3: Create Action Figures API Routes**

- **As a** developer
- **I want** API endpoints for action figures
- **So that** CRUD operations work correctly

**Acceptance Criteria**:

- [ ] GET `/api/action-figures` - list with pagination, search, filter
- [ ] GET `/api/action-figures/[id]` - get single item
- [ ] POST `/api/action-figures` - create new
- [ ] PUT `/api/action-figures/[id]` - update existing
- [ ] DELETE `/api/action-figures/[id]` - delete item
- [ ] All endpoints handle errors properly
- [ ] Validation applied on server side
- [ ] Returns proper HTTP status codes
- [ ] Works with Prisma for database operations

**Tasks**:

- Create API route handlers
- Implement CRUD operations
- Add server-side validation
- Add error handling
- Write API tests
- Document endpoints

**Effort**: 8 story points

---

**US-14.4: Integrate Action Figures into Navigation & Dashboard**

- **As a** user
- **I want** to access action figures from navigation
- **So that** it's integrated with other collections

**Acceptance Criteria**:

- [ ] Action Figures added to main navigation
- [ ] Dashboard shows action figures statistics
- [ ] Dashboard card links to action figures page
- [ ] Collection type selector includes Action Figures
- [ ] Search includes action figures results
- [ ] Export/import supports action figures
- [ ] CSV templates include action figures

**Tasks**:

- Add to navigation component
- Update dashboard with stats
- Update global search
- Update export/import logic
- Create CSV template
- Test integration
- Update documentation

**Effort**: 2 story points

**Sprint 14 Total**: 32 story points

---

### Sprint 15: Videogame Completion Tracking & Deep Linking

**Goal**: Add completion status to videogames and implement deep linking across the application
**Duration**: 1 week
**Story Points**: 21

#### User Stories

**US-15.1: Add Completion Status to Videogames**

- **As a** gamer/collector
- **I want** to track which videogames I've completed
- **So that** I can see my gaming progress and get better recommendations

**Acceptance Criteria**:

- [ ] `completionStatus` field added to Videogame model (Enum: NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED, ON_HOLD)
- [ ] `completionDate` field added (DateTime, optional)
- [ ] `completionNotes` field added (String, optional - e.g., "100% completion", "Main story only")
- [ ] `playtimeHours` field added (Float, optional)
- [ ] Database migration created (non-destructive)
- [ ] Existing videogame data preserved
- [ ] Completion status displayed on videogame cards and detail pages
- [ ] Filter by completion status on videogames list page
- [ ] Sort by completion status supported
- [ ] Completion badge/indicator visible on cards (similar to "Read" badge on books)
- [ ] Edit form updated with completion fields
- [ ] Bulk update completion status supported
- [ ] Statistics shown on videogames page (X of Y games completed)
- [ ] Zod validation schemas updated

**Tasks**:

- Update `prisma/schema.prisma` with completion fields and enum
- Create database migration
- Update TypeScript types
- Update Zod validators
- Update videogame card component with completion badge
- Update videogame detail view
- Update videogame form (create and edit)
- Add filter/sort by completion status
- Add completion statistics to list page header
- Write tests for new functionality

**Effort**: 10 story points

---

**US-15.2: Implement Deep Linking**

- **As a** user
- **I want** URLs that reflect the current view state
- **So that** I can bookmark, share, and navigate back to specific views

**Acceptance Criteria**:

- [ ] Detail pages have shareable URLs (`/videogames/[id]`, `/music/[id]`, `/books/[id]`, `/action-figures/[id]`)
- [ ] Edit pages have direct URLs (`/videogames/[id]/edit`, `/music/[id]/edit`, etc.)
- [ ] Search queries persist in URL params (`?q=mario&page=2`)
- [ ] Filter state encoded in URL params (`?platform=Switch&genre=RPG&status=completed`)
- [ ] Sort state encoded in URL params (`?sort=title&order=asc`)
- [ ] Pagination state in URL params (`?page=3&limit=24`)
- [ ] URL updates without full page reload (using Next.js router)
- [ ] Browser back/forward navigation works correctly with filters
- [ ] Bookmarkable URLs for any collection view state
- [ ] Shared URLs open exactly the same view for other users
- [ ] Dashboard-specific deep links (`/dashboard/videogames`, `/dashboard/music`, `/dashboard/books`)

**Tasks**:

- Audit all existing routes for deep link support
- Implement URL param serialization/deserialization for search, filters, sort, pagination
- Update collection list pages to read and write URL params
- Ensure detail and edit pages use proper dynamic routes
- Add dashboard sub-routes for collection-specific dashboards
- Update navigation components to preserve URL state
- Handle browser back/forward with useSearchParams
- Test deep links across all collection types
- Test that shared links work correctly
- Write tests for URL param handling

**Effort**: 11 story points

**Sprint 15 Total**: 21 story points

---

### Sprint 16: Analytics Engine & Data Model

**Goal**: Build the analytics data model and configurable daily processing engine for dashboard data
**Duration**: 2 weeks
**Story Points**: 34

#### User Stories

**US-16.1: Design Analytics Data Model**

- **As a** developer
- **I want** a dedicated data model for pre-computed analytics
- **So that** dashboards load quickly with rich data

**Acceptance Criteria**:

- [ ] `AnalyticsSnapshot` model created (stores daily snapshots):
  - `id` (String, primary key)
  - `collectionType` (CollectionType enum)
  - `metricType` (String - e.g., "platform_count", "franchise_group", "genre_distribution")
  - `metricKey` (String - e.g., "Nintendo Switch", "Mario", "RPG")
  - `metricValue` (JSON - flexible value storage)
  - `count` (Int - for simple counts)
  - `computedAt` (DateTime)
  - `periodStart` (DateTime - for time-series data)
  - `periodEnd` (DateTime)
- [ ] `Recommendation` model created:
  - `id` (String, primary key)
  - `collectionType` (CollectionType)
  - `recommendationType` (String - e.g., "franchise_completion", "genre_explore", "series_next")
  - `title` (String - recommendation title)
  - `description` (String - why this is recommended)
  - `metadata` (JSON - additional context, links, etc.)
  - `priority` (Int - ranking order)
  - `dismissed` (Boolean - user dismissed it)
  - `computedAt` (DateTime)
  - `expiresAt` (DateTime, optional)
- [ ] `CollectorProfile` model created:
  - `id` (String, primary key)
  - `userId` (String)
  - `profileType` (String - "gamer", "reader", "overall")
  - `traits` (JSON - scored personality traits)
  - `archetype` (String - e.g., "The Completionist", "The Explorer")
  - `description` (String - personality description)
  - `insights` (JSON - supporting data points)
  - `computedAt` (DateTime)
- [ ] `AnalyticsConfig` model created:
  - `id` (String, primary key)
  - `processName` (String - e.g., "daily_analytics", "recommendations")
  - `schedule` (String - cron expression or interval)
  - `enabled` (Boolean)
  - `lastRunAt` (DateTime, optional)
  - `nextRunAt` (DateTime, optional)
  - `config` (JSON - process-specific configuration)
- [ ] Database migration created (non-destructive)
- [ ] Proper indexes for query performance
- [ ] TypeScript types exported
- [ ] Zod validation schemas created

**Tasks**:

- Design analytics schema in Prisma
- Create database migration
- Add indexes for common queries (collectionType + metricType, computedAt)
- Create TypeScript types
- Create Zod validators
- Test schema with sample data
- Document data model

**Effort**: 8 story points

---

**US-16.2: Build Configurable Daily Processing Engine**

- **As a** system administrator
- **I want** a configurable daily process that computes analytics
- **So that** dashboard data is always fresh and up-to-date

**Acceptance Criteria**:

- [ ] Processing engine created (`src/lib/analytics/engine.ts`)
- [ ] Supports multiple configurable processors:
  - Collection counts (total, by type, by status)
  - Platform distribution (videogames)
  - Genre distribution (all types)
  - Artist/developer/publisher groupings
  - Franchise detection and grouping
  - Completion statistics (books read, games completed)
  - Acquisition timeline data
  - Year distribution charts
- [ ] Configuration stored in database (`AnalyticsConfig`)
- [ ] Admin settings page to configure schedule and enable/disable processors
- [ ] API endpoint to trigger processing manually (`POST /api/analytics/run`)
- [ ] API endpoint to get processing status (`GET /api/analytics/status`)
- [ ] Processing runs as a cron job / scheduled task (configurable interval)
- [ ] Each processor runs independently (one failure doesn't block others)
- [ ] Processing logs stored for debugging
- [ ] Old snapshots cleaned up (configurable retention period)
- [ ] Processing is idempotent (safe to re-run)

**Tasks**:

- Create analytics engine with processor registry
- Implement individual processors for each metric type
- Create API routes for manual trigger and status
- Create settings UI for analytics configuration
- Implement cron/scheduled execution (using node-cron or similar)
- Add logging and error handling
- Add snapshot cleanup logic
- Write tests for each processor
- Document configuration options

**Effort**: 13 story points

---

**US-16.3: Implement Grouping & Classification Algorithms**

- **As a** collector
- **I want** my collection automatically organized into meaningful groups
- **So that** I can discover patterns and relationships in my collection

**Acceptance Criteria**:

- [ ] **Franchise Detection Algorithm** implemented:
  - Uses fuzzy string matching to group items by franchise
  - Handles variations (e.g., "Super Mario Bros", "Super Mario World", "Mario Kart" → "Mario" franchise)
  - Supports manual franchise overrides via tags
  - Works across platforms for videogames
  - Configurable similarity threshold
- [ ] **Series Grouping Algorithm** implemented:
  - Groups sequential items (comic runs, book series, game sequels)
  - Detects numbered sequences (e.g., "Final Fantasy VII", "Final Fantasy VIII")
  - Groups by publisher series for comics (e.g., "Batman" across publishers)
  - Identifies series gaps (missing issues/volumes)
- [ ] **Genre Classification** implemented:
  - Normalizes genre data across items
  - Creates genre hierarchy (e.g., "Action RPG" → parent "RPG")
  - Calculates genre affinity scores per user
- [ ] **Developer/Publisher/Artist Clustering** implemented:
  - Groups items by creator
  - Identifies most collected creators
  - Tracks creator output over time
- [ ] **Era/Period Classification** implemented:
  - Groups items by decade or era
  - Identifies collection focus periods
  - Highlights retro vs. modern distribution
- [ ] All algorithms produce data stored in AnalyticsSnapshot
- [ ] Algorithms are efficient and handle large collections
- [ ] Results include confidence scores where applicable

**Proposed Algorithms**:

1. **Franchise Matching**: Levenshtein distance + common prefix extraction + keyword tokenization. Group items sharing >70% token overlap. Use a franchise dictionary for known franchises (Mario, Zelda, Final Fantasy, etc.) with aliases.

2. **Series Detection**: Regular expression for numbered entries + subtitle matching. Sort by detected sequence number. Flag gaps where numbers are missing.

3. **Genre Normalization**: Maintain a genre taxonomy tree. Map raw genre strings to normalized categories. Calculate user's genre distribution as weighted scores.

4. **Creator Clustering**: Group by exact match on normalized creator names. Apply fuzzy matching for variations (e.g., "Square Enix" vs "Square-Enix" vs "Squaresoft").

5. **Era Classification**: Bucket by decade (1980s, 1990s, 2000s, 2010s, 2020s). Calculate density per era. Identify peak collection periods.

**Tasks**:

- Implement franchise detection with fuzzy matching
- Build franchise dictionary for common game/comic franchises
- Implement series grouping algorithm
- Implement genre normalization and hierarchy
- Implement creator clustering
- Implement era classification
- Integrate all algorithms with the processing engine
- Write comprehensive tests with edge cases
- Performance test with large datasets
- Document algorithm details and tuning parameters

**Effort**: 13 story points

**Sprint 16 Total**: 34 story points

---

### Sprint 17: Collection-Specific Dashboards

**Goal**: Build rich, interactive dashboards for each collection type
**Duration**: 2 weeks
**Story Points**: 42

#### User Stories

**US-17.1: Update Main Dashboard Navigation**

- **As a** user
- **I want** the main dashboard collection cards to link to detailed dashboards
- **So that** I can explore each collection in depth

**Acceptance Criteria**:

- [ ] Main dashboard retains current layout (total items, videogames, music, books counts)
- [ ] Action Figures count card added to main dashboard
- [ ] Each count card links to the collection-specific dashboard (not the collection list)
  - Videogames card → `/dashboard/videogames`
  - Music card → `/dashboard/music`
  - Books card → `/dashboard/books`
  - Action Figures card → `/dashboard/action-figures`
- [ ] "View Collection" secondary link still available to go to list page
- [ ] Dashboard sub-navigation for switching between dashboards
- [ ] Breadcrumb navigation on specific dashboards (Dashboard → Videogames Dashboard)
- [ ] Loading states for dashboard data
- [ ] Empty states when no analytics data available yet
- [ ] Responsive layout for all dashboard pages

**Tasks**:

- Update main dashboard card components with dual links
- Create dashboard layout with sub-navigation
- Create dashboard route structure (`/dashboard/[collection]`)
- Add breadcrumb navigation
- Add loading and empty states
- Test responsive design
- Write component tests

**Effort**: 8 story points

---

**US-17.2: Videogames Detailed Dashboard**

- **As a** gamer/collector
- **I want** a rich videogames dashboard with charts and insights
- **So that** I can understand my gaming collection at a glance

**Acceptance Criteria**:

- [ ] **Platform Distribution** section:
  - Bar chart showing games per platform (top 15 visible by default)
  - "Show All" button to expand full list
  - Clickable bars to filter collection by platform
  - Color-coded by platform family (Nintendo, PlayStation, Xbox, PC, etc.)
- [ ] **Top Franchises** section:
  - Grid/list of top franchises with game count
  - Click on franchise to see all games in that franchise (across platforms)
  - Franchise detail modal/page showing all games, platforms, completion status
  - Shows franchise completion percentage
- [ ] **Missing Games Recommendations** section:
  - Recommends games missing from collected franchises
  - Shows franchise name, missing game title, platform suggestions
  - "Dismiss" button to hide recommendations
  - Priority ordered (most collected franchises first)
- [ ] **Genre Distribution** section:
  - Pie or donut chart showing genre breakdown
  - Click to filter by genre
  - Top genres highlighted
- [ ] **Developer/Publisher Highlights** section:
  - Top developers/publishers by game count
  - Click to see all games by developer
  - Shows developer's representation across collection
- [ ] **Completion Overview** section:
  - Progress bar showing completed vs. total games
  - Completion rate by platform
  - Recently completed games
  - Games in progress
- [ ] **Additional Proposed Features**:
  - "This Month in Gaming History" - games in collection released this month in past years
  - Platform timeline - acquisition over time per platform
  - Collection value estimation (if price data available)
  - "Most Collected Year" - which release year has most games
  - Rarity indicators for limited editions
- [ ] All charts responsive and interactive
- [ ] Dark mode support for all visualizations
- [ ] Data sourced from AnalyticsSnapshot (pre-computed)

**Tasks**:

- Install charting library (recharts or chart.js)
- Create platform distribution bar chart component
- Create franchise highlights component with detail view
- Create missing games recommendations component
- Create genre distribution chart
- Create developer/publisher highlights component
- Create completion overview section
- Create additional feature components
- Implement data fetching from analytics API
- Style all components with Tailwind
- Test responsive design
- Write component tests

**Effort**: 13 story points

---

**US-17.3: Music Detailed Dashboard**

- **As a** music collector
- **I want** a detailed music dashboard with insights
- **So that** I can understand my music collection and discover patterns

**Acceptance Criteria**:

- [ ] **Genre Distribution** section:
  - Bar/pie chart showing albums by genre
  - Click to filter collection by genre
  - Sub-genre breakdown available
- [ ] **Artist Highlights** section:
  - Top artists by album count
  - Click to see all albums by artist
  - Artist detail showing discography completeness
  - Timeline of albums per artist
- [ ] **Format Distribution** section:
  - Vinyl vs. CD vs. other format breakdown
  - Count and percentage for each format
- [ ] **Decade Distribution** section:
  - Albums grouped by release decade
  - Visual timeline chart
  - Highlights collection era focus (e.g., "Mostly 80s and 90s music")
- [ ] **Recommendations** section:
  - Albums to complete an artist's discography
  - Genre exploration suggestions (popular albums in under-represented genres)
  - "If you like X, try Y" style recommendations based on genre affinity
- [ ] **Additional Proposed Features**:
  - Label highlights (most collected record labels)
  - Collection growth timeline
  - "Vinyl vs CD" comparison stats
  - Most recently added albums section
  - Country of origin distribution
- [ ] All charts responsive and interactive
- [ ] Dark mode support
- [ ] Data sourced from AnalyticsSnapshot

**Tasks**:

- Create genre distribution chart component
- Create artist highlights component
- Create format distribution component
- Create decade distribution timeline
- Create recommendations section
- Create additional feature components
- Implement data fetching from analytics API
- Style all components
- Test responsive design
- Write component tests

**Effort**: 10 story points

---

**US-17.4: Books/Comics Detailed Dashboard**

- **As a** book/comic collector
- **I want** a detailed books dashboard with insights
- **So that** I can understand my reading collection and plan my next reads

**Acceptance Criteria**:

- [ ] **Genre Distribution** section:
  - Chart showing books by genre
  - Separate views for manga, comics, and other books
  - Click to filter by genre
- [ ] **Publisher Highlights** section:
  - Top publishers by book count
  - Publisher detail with all books
  - Special focus on comic publishers (Marvel, DC, Image, etc.)
- [ ] **Author/Writer Highlights** section:
  - Top authors by book count
  - Click to see all works by author
  - Author completeness tracking
- [ ] **Character Highlights** section (for comics):
  - Most collected characters (Batman, Spider-Man, etc.)
  - Click to see all comics featuring character
  - Character reading order suggestions
- [ ] **Series & Collection Highlights** section:
  - Active series being collected
  - Series completion percentage
  - Missing issues/volumes identified
  - Suggested next volumes to buy
- [ ] **Reading Progress** section:
  - Books read vs. unread
  - Reading pace (books read per month)
  - Currently reading
  - Recent completions
- [ ] **Next Reading Recommendations** section:
  - Based on unread books in collection
  - Priority: complete started series first
  - Genre-balanced suggestions
  - "Character deep dive" recommendations (read all Batman, etc.)
- [ ] **Additional Proposed Features**:
  - Reading streak tracker
  - "Shelf analysis" - estimated physical space used
  - Most collected era/decade
  - Language distribution (if multilingual collection)
  - Award-winning books in collection highlighted
- [ ] All charts responsive and interactive
- [ ] Dark mode support
- [ ] Data sourced from AnalyticsSnapshot

**Tasks**:

- Create genre distribution chart component
- Create publisher highlights component
- Create author/writer highlights component
- Create character highlights component (comics)
- Create series tracking component
- Create reading progress component
- Create recommendations section
- Create additional feature components
- Implement data fetching from analytics API
- Style all components
- Test responsive design
- Write component tests

**Effort**: 13 story points

---

**US-17.5: Action Figures Dashboard (Proposed)**

- **As a** figure collector
- **I want** a dashboard for my action figures collection
- **So that** I can see collection insights and track my figures

**Acceptance Criteria**:

- [ ] **Manufacturer Distribution** section:
  - Bar chart showing figures by manufacturer
  - Click to filter by manufacturer
- [ ] **Series/Line Highlights** section:
  - Top figure lines (Marvel Legends, Figma, etc.)
  - Series completion tracking
  - Missing figures in collected series
- [ ] **Scale Distribution** section:
  - Breakdown by scale (1:6, 1:12, etc.)
- [ ] **Character Collection** section:
  - Most collected characters across lines
  - Different versions of same character
- [ ] **Edition Tracking** section:
  - Limited editions and exclusives highlighted
  - Convention exclusives grouped
- [ ] **Recommendations** section:
  - Missing figures from collected series
  - New releases from favorite manufacturers
- [ ] All charts responsive and interactive
- [ ] Dark mode support

**Tasks**:

- Create manufacturer distribution chart
- Create series highlights component
- Create scale distribution component
- Create character tracking component
- Create edition tracking component
- Create recommendations section
- Implement data fetching
- Style and test

**Effort**: 8 story points (Proposed - included as stretch goal, not in base estimate)

**Sprint 17 Total**: 44 story points (base) + 8 (stretch)

---

### Sprint 18: Recommendation Engine & Personality System

**Goal**: Implement intelligent recommendations and the collector personality profiling system
**Duration**: 2 weeks
**Story Points**: 40

#### User Stories

**US-18.1: Implement Recommendation Algorithms**

- **As a** collector
- **I want** personalized recommendations based on my collection
- **So that** I can discover what to add or experience next

**Acceptance Criteria**:

- [ ] **Franchise Completion Recommender**:
  - Identifies franchises with partial ownership
  - Suggests specific missing entries
  - Ranks by franchise size and user investment
  - Example: "You have 8 of 12 Mario platformers - consider adding Super Mario Sunshine"
- [ ] **Genre Affinity Recommender**:
  - Analyzes genre distribution
  - Recommends popular items in user's favorite genres
  - Suggests genre exploration for under-represented categories
  - Example: "You love RPGs (45% of collection) - here are highly-rated RPGs you're missing"
- [ ] **Series Continuation Recommender** (Books/Comics):
  - Identifies started but incomplete series
  - Suggests next volume/issue
  - Prioritizes series closest to completion
  - Example: "You're 3 volumes from completing Berserk - consider volumes 38, 39, 40"
- [ ] **Platform Coverage Recommender** (Videogames):
  - Suggests highly-rated games for underrepresented platforms
  - Helps diversify platform collection
  - Example: "Your Switch library has only 5 games - here are 10 must-haves"
- [ ] **Creator Exploration Recommender**:
  - If user likes works by a creator, suggest other works
  - Works for authors, artists, developers, musicians
  - Example: "You have 3 books by Neil Gaiman - try American Gods or Neverwhere"
- [ ] **Era Gap Recommender**:
  - Identifies time periods with few items
  - Suggests classic/essential items from those eras
  - Example: "Your 90s gaming collection is thin - consider these SNES/PS1 classics"
- [ ] Recommendations stored in `Recommendation` model
- [ ] Recommendations refreshed by daily process
- [ ] Users can dismiss recommendations
- [ ] Dismissed recommendations don't reappear
- [ ] Recommendations shown on collection dashboards

**Proposed Algorithm Details**:

1. **Franchise Completion Score**: `franchise_score = (owned_count / total_known) * log(total_known)` - Higher score for larger franchises with more items already owned.

2. **Genre Affinity Score**: `affinity = genre_count / total_items` - Normalize to percentage. Recommend items in genres where `affinity > 0.2` (top genres).

3. **Series Priority**: `priority = (owned_in_series / total_in_series) * 100` - Complete series closest to 100% first.

4. **Platform Diversity Index**: `diversity = unique_platforms / total_items` - Low diversity suggests recommending for new platforms.

5. **Creator Loyalty Score**: `loyalty = creator_item_count / total_in_type` - Recommend completing collections of creators with `loyalty > 0.1`.

**Tasks**:

- Implement franchise completion recommender
- Implement genre affinity recommender
- Implement series continuation recommender
- Implement platform coverage recommender
- Implement creator exploration recommender
- Implement era gap recommender
- Create recommendation API endpoints
- Add dismiss functionality
- Integrate with daily processing engine
- Write tests for all algorithms
- Document recommendation logic

**Effort**: 13 story points

---

**US-18.2: Build Collector Personality Scale**

- **As a** collector
- **I want** to see a personality profile based on my collection
- **So that** I can understand my collecting patterns and share my collector identity

**Acceptance Criteria**:

- [ ] **Personality Trait Axes** defined and scored:
  - **Nostalgia ↔ Modern**: Ratio of retro (pre-2000) vs. modern items
  - **Mainstream ↔ Niche**: Based on popularity/sales data of owned items
  - **Completionist ↔ Casual**: Series/franchise completion rates
  - **Focused ↔ Eclectic**: Concentration in few genres/types vs. spread across many
  - **Action ↔ Story**: Genre-based (action/sports games vs. RPGs/adventures; action comics vs. graphic novels)
  - **Physical ↔ Digital**: Format preferences (vinyl vs. digital, physical games vs. digital)
- [ ] **Gamer Archetypes** (based on videogame collection):
  - "The Completionist" - High completion rate, collects full franchises
  - "The Explorer" - Diverse genres and platforms, tries everything
  - "The Competitor" - Heavy on sports, fighting, multiplayer games
  - "The Strategist" - Focuses on strategy, tactics, puzzle games
  - "The Storyteller" - RPGs, adventure games, narrative-driven
  - "The Retro Gamer" - Mostly classic/retro games
  - "The Platform Loyalist" - Concentrated on one platform family
- [ ] **Reader Archetypes** (based on books/comics):
  - "The Superhero Fan" - Mostly superhero comics
  - "The Manga Enthusiast" - Heavy manga collection
  - "The Indie Reader" - Independent publishers, diverse genres
  - "The Series Devotee" - Collects complete runs of series
  - "The Graphic Novel Connoisseur" - Focuses on standalone graphic novels
  - "The Literary Explorer" - Wide range of genres and authors
  - "The Completionist Collector" - Aims for complete runs
- [ ] **Overall Collector Archetype**:
  - "The Curator" - Carefully selected, quality-focused collection
  - "The Archivist" - Comprehensive, aims for completeness
  - "The Treasure Hunter" - Focuses on rare/limited editions
  - "The Enthusiast" - Passionate, fast-growing collection
  - "The Connoisseur" - Niche expertise, deep knowledge in specific areas
- [ ] Profile stored in `CollectorProfile` model
- [ ] Updated by daily processing engine
- [ ] Profile page showing personality visualization (radar chart or similar)
- [ ] Shareable profile card (image generation optional)
- [ ] Fun descriptions for each archetype
- [ ] Trait scores change as collection evolves

**Proposed Scoring Algorithm**:

```
For each trait axis (scored -1.0 to 1.0):

Nostalgia↔Modern:
  score = (items_after_2000 - items_before_2000) / total_items
  -1.0 = fully retro, +1.0 = fully modern

Completionist↔Casual:
  score = avg_franchise_completion_rate * 2 - 1
  -1.0 = no series completed, +1.0 = all series complete

Focused↔Eclectic:
  score = 1 - (genre_entropy / max_entropy)
  -1.0 = max diversity, +1.0 = single genre focus
  (Note: inverted so positive = focused)

Archetype Selection:
  - Score each archetype based on trait alignment
  - Select archetype with highest match score
  - Generate description combining top 2-3 traits
```

**Tasks**:

- Define complete trait scoring formulas
- Implement trait calculation processors
- Implement archetype selection algorithm
- Create collector profile page (`/profile` or `/dashboard/profile`)
- Create personality radar chart visualization
- Create archetype descriptions and display
- Create shareable profile card component
- Integrate with daily processing engine
- Store results in CollectorProfile model
- Write comprehensive tests
- Document personality system

**Effort**: 13 story points

---

**US-18.3: Implement Notification & Insight System**

- **As a** user
- **I want** to see personalized notifications and insights when I visit the site
- **So that** I'm greeted with relevant recommendations and personality updates

**Acceptance Criteria**:

- [ ] `Notification` model created (or extend existing):
  - `id`, `userId`, `type` (recommendation, personality, insight, milestone)
  - `title`, `message`, `metadata` (JSON)
  - `read` (Boolean), `dismissed` (Boolean)
  - `createdAt`, `expiresAt`
- [ ] Notification bell/badge in header showing unread count
- [ ] Notification dropdown/panel with recent notifications
- [ ] Notification types:
  - **Recommendation**: "We found 3 new recommendations for your collection"
  - **Personality Update**: "Your collector profile has been updated! You're now The Completionist"
  - **Milestone**: "Congratulations! You've completed 50 games!"
  - **Insight**: "Did you know? 60% of your games are Nintendo titles"
  - **Collection Alert**: "New volume of [series] detected - add to collection?"
- [ ] Notifications generated by daily processing engine
- [ ] Mark as read / dismiss functionality
- [ ] Notification preferences in settings (which types to show)
- [ ] Notifications shown as toast/banner on first visit of the day
- [ ] Notification history page
- [ ] Maximum 10 active notifications (auto-expire old ones)

**Tasks**:

- Create/update notification data model
- Create notification API endpoints
- Create notification UI components (bell, dropdown, toast)
- Integrate notification generation into processing engine
- Add notification preferences to settings
- Create notification history page
- Implement auto-expiry logic
- Write tests
- Style with Tailwind, ensure dark mode support

**Effort**: 8 story points

---

**US-18.4: Update Reading Recommendations Page**

- **As a** reader/collector
- **I want** the reading recommendations page updated with analytics data
- **So that** I get better, more personalized reading suggestions

**Acceptance Criteria**:

- [ ] Reading recommendations page uses new analytics data instead of/in addition to existing logic
- [ ] Recommendations now include:
  - Series continuation (from series grouping algorithm)
  - Character deep dives (from character highlights)
  - Author exploration (from creator clustering)
  - Genre balance suggestions (from genre distribution)
  - Reading path suggestions (existing feature enhanced)
- [ ] Recommendations prioritized by:
  - Books already in collection (unread) first
  - Series closest to completion
  - Most-collected authors
  - Genre affinity match
- [ ] Visual improvements:
  - Better categorization of recommendation types
  - Cover images where available
  - "Why this recommendation" explanation shown
  - Quick-add button for items not in collection
- [ ] Integration with personality system:
  - Recommendations tailored to reader archetype
  - "Because you're a [archetype]" messaging
- [ ] Reading progress integration:
  - Currently reading prominently displayed
  - Reading streak and pace shown
  - Estimated time to complete current reads

**Tasks**:

- Refactor reading recommendations to use analytics data
- Add new recommendation categories
- Implement priority scoring for recommendations
- Update UI with visual improvements
- Integrate personality-based messaging
- Integrate reading progress data
- Maintain backward compatibility with existing features
- Write tests
- Test responsive design

**Effort**: 6 story points

**Sprint 18 Total**: 40 story points

---

## Phase 2 Summary

**Total Story Points**: 225 (base) + 8 (stretch from US-17.5)
**Total Sprints**: 8 (Sprints 11-18)
**Estimated Duration**: 10-14 weeks

### Story Point Distribution

- Sprint 11: 18 points (Database & Models)
- Sprint 12: 26 points (Cloud Storage)
- Sprint 13: 24 points (UI Components)
- Sprint 14: 32 points (Action Figures)
- Sprint 15: 21 points (Completion Tracking & Deep Links)
- Sprint 16: 34 points (Analytics Engine)
- Sprint 17: 44 points (Collection Dashboards) + 8 stretch
- Sprint 18: 40 points (Recommendations & Personality)

### Key Deliverables

1. Enhanced item metadata with purchase and condition tracking
2. Searchable dropdowns for improved UX
3. S3/CloudFront image storage system
4. Complete Action Figures collection management
5. Videogame completion tracking
6. Deep linking across the entire application
7. Analytics engine with daily configurable processing
8. Grouping and classification algorithms (franchise, series, genre, era)
9. Collection-specific dashboards (Videogames, Music, Books, Action Figures)
10. Intelligent recommendation system (6 algorithm types)
11. Collector personality profiling with archetypes
12. Notification and insight system
13. Enhanced reading recommendations page

---

## Dependencies & Risks

### Technical Dependencies

- AWS S3 account and credentials required for Sprint 12
- CloudFront distribution setup required for Sprint 12
- Charting library required for Sprint 17 (recharts recommended)
- Sprint 16 must complete before Sprint 17 (analytics data needed)
- Sprint 16 must complete before Sprint 18 (processing engine needed)

### Risks

- **S3 Migration**: Existing image URLs may become invalid if not handled properly
  - **Mitigation**: Keep backward compatibility, gradual migration
- **Database Migration**: Schema changes must preserve existing data
  - **Mitigation**: Test migrations thoroughly, create backups
- **UI Changes**: New dropdowns must not break existing workflows
  - **Mitigation**: Comprehensive testing, gradual rollout
- **Analytics Performance**: Daily processing could be slow with large collections
  - **Mitigation**: Optimize queries, use batch processing, configurable scheduling
- **Algorithm Accuracy**: Franchise/series detection may have false positives
  - **Mitigation**: Use confidence scores, allow manual overrides, iterative improvement
- **Charting Library Size**: Adding charts could increase bundle size
  - **Mitigation**: Use tree-shaking, lazy load dashboard components

---

## Testing Strategy

### Unit Tests

- Minimum 80% coverage for new utilities
- All validation schemas tested
- S3 upload service fully tested
- All analytics algorithms tested with edge cases
- Recommendation algorithms tested

### Integration Tests

- API routes tested end-to-end
- Form submissions tested
- Image upload flow tested
- Analytics processing pipeline tested
- Dashboard data fetching tested

### Manual Testing

- All forms tested on multiple devices
- Searchable dropdowns tested with keyboard
- Dark mode tested for all new components
- Accessibility tested with screen readers
- Dashboard charts tested at various screen sizes
- Deep links tested across browsers

---

## Definition of Done (Phase 2)

A user story is done when:

- [ ] All acceptance criteria met
- [ ] Code committed to feature branch
- [ ] Database migration tested and documented
- [ ] No data loss or corruption
- [ ] TypeScript types defined
- [ ] Forms work for create and edit modes
- [ ] Searchable dropdowns applied where needed
- [ ] S3 image upload works reliably
- [ ] Responsive design implemented
- [ ] Dark mode styling added
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Tests written and passing (80%+ coverage)
- [ ] Manual testing completed
- [ ] No console errors/warnings
- [ ] PR created with detailed description
- [ ] Documentation updated
- [ ] PROJECT_TRACKER.md updated
