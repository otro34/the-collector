# The Collector - Phase 2 Project Tracker

**Last Updated**: 2026-02-25
**Phase**: 2 - Enhanced Features, Analytics & Intelligence
**Status**: 🟡 In Progress

---

## Current Sprint: Sprint 11 - Database & Model Updates

**Sprint Status**: 🟢 Completed
**Start Date**: 2026-02-25
**End Date**: 2026-02-25
**Goal**: Extend the database schema with new fields and Action Figures collection type

---

## Phase 2 Overview

**Total Story Points**: 225 (base) + 8 (stretch)
**Completed Story Points**: 18/225 (8%)
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

| Sprint    | Status       | Start Date | End Date   | Completed Stories | Total Stories  | Story Points |
| --------- | ------------ | ---------- | ---------- | ----------------- | -------------- | ------------ |
| Sprint 11 | 🟢 Completed | 2026-02-25 | 2026-02-25 | 3                 | 3              | 18/18        |
| Sprint 12 | ⚪ Planned   | TBD        | TBD        | 0                 | 4              | 0/26         |
| Sprint 13 | ⚪ Planned   | TBD        | TBD        | 0                 | 3              | 0/24         |
| Sprint 14 | ⚪ Planned   | TBD        | TBD        | 0                 | 4              | 0/32         |
| Sprint 15 | ⚪ Planned   | TBD        | TBD        | 0                 | 2              | 0/21         |
| Sprint 16 | ⚪ Planned   | TBD        | TBD        | 0                 | 3              | 0/34         |
| Sprint 17 | ⚪ Planned   | TBD        | TBD        | 0                 | 4 (+1 stretch) | 0/44 (+8)    |
| Sprint 18 | ⚪ Planned   | TBD        | TBD        | 0                 | 4              | 0/40         |

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
**Story Points**: 0/26
**Status**: ⚪ Planned

### User Stories

#### US-12.1: Set Up AWS S3 Integration

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 5
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] AWS SDK installed and configured
  - [ ] S3 bucket credentials added to environment variables
  - [ ] CloudFront distribution URL configured
  - [ ] Bucket permissions configured correctly
  - [ ] CORS settings configured for uploads
  - [ ] Connection tested successfully

**Environment Variables Needed**:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_BUCKET=<bucket-name>
CLOUDFRONT_URL=https://<distribution-id>.cloudfront.net
```

**Notes**:

- User needs to provide AWS credentials
- Document setup in README

---

#### US-12.2: Create Image Upload Service

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 8
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Image upload utility created (`src/lib/image-upload.ts`)
  - [ ] Supports JPEG, PNG, WebP formats
  - [ ] Generates unique filenames (UUID-based)
  - [ ] Returns CloudFront URL after upload
  - [ ] Handles upload errors gracefully
  - [ ] Validates image size and dimensions
  - [ ] Optimizes images before upload (optional)

**Notes**:

- Consider image compression for performance
- Add retry logic for failed uploads

---

#### US-12.3: Update Image Selection Flow

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 8
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Image search results trigger upload to S3
  - [ ] Selected image URL saved as CloudFront URL
  - [ ] Upload progress indicator shown
  - [ ] Upload errors handled with retry option
  - [ ] Works for all collection types
  - [ ] Existing URL-based images still work (backwards compatible)

**Notes**:

- Maintain backward compatibility
- Test with all collection types

---

#### US-12.4: Image Migration Strategy (Optional)

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 5
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] Migration script created
  - [ ] Script downloads images from existing URLs
  - [ ] Script uploads images to S3
  - [ ] Script updates database with new URLs
  - [ ] Script handles failures gracefully
  - [ ] Script provides progress report
  - [ ] Can be run multiple times safely (idempotent)

**Notes**:

- Optional - can migrate gradually
- Create script in `scripts/migrate-images.ts`

---

**Sprint 12 Notes**:

- AWS credentials required before starting
- Test S3 uploads thoroughly
- Consider bandwidth costs

---

## Sprint 13: Enhanced UI Components & Forms

**Goal**: Add searchable dropdowns and update forms with new fields
**Duration**: 1-2 weeks
**Story Points**: 0/24
**Status**: ⚪ Planned

### User Stories

#### US-13.1: Create Searchable Dropdown Component

- **Status**: 🔴 Not Started
- **Assigned**: TBD
- **Story Points**: 8
- **PR**: TBD
- **Acceptance Criteria**:
  - [ ] SearchableSelect component created
  - [ ] Filter text field at top of dropdown
  - [ ] Real-time filtering as user types
  - [ ] Case-insensitive search
  - [ ] Keyboard navigation supported (arrow keys, enter, escape)
  - [ ] Accessible (ARIA labels, screen reader friendly)
  - [ ] Styled consistently with existing UI
  - [ ] Dark mode supported
  - [ ] Works with single and multi-select

**Notes**:

- Base on shadcn/ui Select component
- Ensure accessibility compliance

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

**Sprint 13 Notes**:

- Focus on UX improvements
- Ensure accessibility standards maintained

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

| Sprint    | Planned Points | Completed Points | Velocity | Notes |
| --------- | -------------- | ---------------- | -------- | ----- |
| Sprint 11 | 18             | 0                | TBD      | -     |
| Sprint 12 | 26             | 0                | TBD      | -     |
| Sprint 13 | 24             | 0                | TBD      | -     |
| Sprint 14 | 32             | 0                | TBD      | -     |
| Sprint 15 | 21             | 0                | TBD      | -     |
| Sprint 16 | 34             | 0                | TBD      | -     |
| Sprint 17 | 44 (+8)        | 0                | TBD      | -     |
| Sprint 18 | 40             | 0                | TBD      | -     |

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

- [ ] S3 upload works
- [ ] CloudFront URLs accessible
- [ ] Images display correctly
- [ ] Error handling works

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

- [ ] All 27 user stories completed (225 story points)
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

**Last Updated**: 2026-02-25
**Next Review**: Sprint 12 kickoff
