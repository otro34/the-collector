# The Collector - Phase 2 Execution Plan

**Last Updated**: 2026-02-24
**Phase**: 2 - Enhanced Features, Analytics & Intelligence
**Status**: 🔵 Planning

---

## Executive Summary

Phase 2 builds upon the solid foundation of Phase 1 by adding enhanced metadata tracking, improved UI components, cloud-based image storage, a new collection type for action figures, collection-specific dashboards with rich analytics, intelligent recommendation algorithms, a collector personality profiling system, and deep linking throughout the application.

**Timeline**: 10-14 weeks
**Story Points**: 225 (base) + 8 (stretch)
**Sprints**: 8 (Sprints 11-18)

---

## Phase 2 Objectives

### Primary Goals

1. **Enhanced Metadata** - Track purchase details and item condition for better collection management
2. **Improved UX** - Searchable dropdowns for faster data entry and better usability
3. **Cloud Storage** - Migrate from URL-based images to reliable S3/CloudFront storage
4. **New Collection** - Add Action Figures collection type with full functionality
5. **Completion Tracking** - Track videogame completion status (similar to books "read")
6. **Deep Linking** - URL-based navigation for all views, filters, and search states
7. **Analytics Engine** - Configurable daily processing for collection intelligence
8. **Collection Dashboards** - Rich, interactive dashboards for each collection type
9. **Recommendations** - Intelligent algorithms suggesting what to add or experience next
10. **Personality System** - Collector personality profiling with archetypes and traits

### Success Metrics

- All items support purchase and condition tracking
- All dropdowns are searchable with keyboard navigation
- 100% of new images stored in S3 bucket
- Action Figures collection has same features as existing collections
- Videogame completion status fully functional
- All views are deep-linkable and bookmarkable
- Analytics engine processes data daily on configurable schedule
- Each collection has a dedicated, interactive dashboard
- Recommendations are personalized and actionable
- Personality profiles are fun, accurate, and evolve over time
- No data loss during migrations
- Performance maintained (Lighthouse 90+)
- Accessibility maintained (WCAG AA)

---

## Implementation Strategy

### Phase Structure

Phase 2 is organized into 8 sequential sprints in two major blocks:

```
Block 1: Foundation & New Features (Sprints 11-14)
════════════════════════════════════════════════════
Sprint 11: Database & Models (Foundation)
    ↓
Sprint 12: Cloud Storage (Infrastructure)
    ↓
Sprint 13: UI Components (User Interface)
    ↓
Sprint 14: Action Figures (New Feature)

Block 2: Intelligence & Analytics (Sprints 15-18)
════════════════════════════════════════════════════
Sprint 15: Completion Tracking & Deep Links (Foundation)
    ↓
Sprint 16: Analytics Engine & Algorithms (Core Intelligence)
    ↓
Sprint 17: Collection Dashboards (Visualization)
    ↓
Sprint 18: Recommendations & Personality (Intelligence)
```

### Why This Order?

**Block 1:**

1. **Sprint 11 First**: Database changes must be in place before UI can use them
2. **Sprint 12 Second**: Image storage infrastructure needed for new forms
3. **Sprint 13 Third**: Enhanced UI components ready for Action Figures
4. **Sprint 14 Fourth**: Action Figures can leverage all previous improvements

**Block 2:** 5. **Sprint 15 First**: Completion status provides data for analytics; deep links create routing structure for dashboards 6. **Sprint 16 Second**: Analytics engine must exist before dashboards can display data 7. **Sprint 17 Third**: Dashboards consume pre-computed analytics data 8. **Sprint 18 Last**: Recommendations and personality build on all analytics + dashboards

---

## Sprint-by-Sprint Breakdown

### Sprint 11: Database & Model Updates (Week 1)

**Goal**: Extend database schema safely and non-destructively

#### Key Activities

1. **Schema Design**
   - Add purchase and status fields to Item model
   - Create Action Figures model
   - Define enums for status values

2. **Migration Creation**
   - Generate Prisma migrations
   - Test migrations thoroughly
   - Document rollback procedures

3. **Validation Updates**
   - Update Zod schemas
   - Add validation rules
   - Test all validations

#### Critical Success Factors

- ⚠️ **NO DATA LOSS**: Migrations must be non-destructive
- **Backward Compatibility**: Existing code continues to work
- **Thorough Testing**: Test migrations on development database first

#### Deliverables

- Updated `prisma/schema.prisma`
- Database migration files
- Updated TypeScript types
- Updated validation schemas
- Migration documentation

#### Dependencies

- Current database backup
- Development database for testing

---

### Sprint 12: Cloud Image Storage Integration (Weeks 2-3)

**Goal**: Implement S3 bucket storage with CloudFront CDN

#### Key Activities

1. **AWS Setup**
   - Install AWS SDK
   - Configure S3 bucket
   - Set up CloudFront distribution
   - Configure CORS and permissions

2. **Upload Service**
   - Create image upload utility
   - Implement UUID-based naming
   - Add error handling and retries
   - Add image optimization (optional)

3. **UI Integration**
   - Update image selection flow
   - Add upload progress indicators
   - Handle upload errors gracefully
   - Maintain backward compatibility

4. **Migration Tool (Optional)**
   - Create migration script
   - Test with sample data
   - Document usage

#### Critical Success Factors

- **Reliable Uploads**: Images upload successfully every time
- **Backward Compatibility**: Existing URL-based images still work
- **Error Handling**: Failed uploads handled gracefully with retry
- **Performance**: Image loading is fast via CloudFront CDN

#### Deliverables

- AWS S3 configuration
- Image upload service (`src/lib/image-upload.ts`)
- Updated image selection UI
- Migration script (optional)
- Documentation for S3 setup

#### Dependencies

- AWS account with S3 access
- CloudFront distribution URL
- AWS credentials (access key, secret key)

#### Environment Variables Needed

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_S3_BUCKET=<your-bucket-name>
CLOUDFRONT_URL=https://<distribution-id>.cloudfront.net
```

---

### Sprint 13: Enhanced UI Components & Forms (Weeks 3-4)

**Goal**: Create searchable dropdowns and update all forms

#### Key Activities

1. **SearchableSelect Component**
   - Build reusable component
   - Implement filter logic
   - Add keyboard navigation
   - Ensure accessibility
   - Support dark mode

2. **Form Updates**
   - Add new fields to all collection forms
   - Integrate searchable dropdowns
   - Update create and edit flows
   - Test validation

3. **Global Dropdown Replacement**
   - Identify all dropdown instances
   - Replace with SearchableSelect
   - Test each replacement
   - Verify keyboard navigation

#### Critical Success Factors

- **Accessibility**: WCAG AA compliant, screen reader friendly
- **Keyboard Navigation**: Arrow keys, Enter, Escape work correctly
- **Consistency**: All dropdowns work the same way
- **Performance**: Filtering is fast and responsive

#### Deliverables

- SearchableSelect component
- Updated collection forms (Video Games, Music, Books)
- Component tests
- Usage documentation

#### Dependencies

- Sprint 11 complete (database fields available)
- Sprint 12 complete (S3 upload ready for forms)

---

### Sprint 14: Action Figures Collection (Weeks 5-6)

**Goal**: Implement complete Action Figures collection

#### Key Activities

1. **List Page**
   - Create collection page
   - Implement grid layout
   - Add search, filter, sort
   - Add pagination

2. **Forms**
   - Create form components
   - Add all action figure fields
   - Integrate searchable dropdowns
   - Integrate S3 image upload

3. **API Routes**
   - Implement CRUD endpoints
   - Add server-side validation
   - Write API tests

4. **Integration**
   - Add to navigation
   - Update dashboard
   - Update global search
   - Add export/import support

#### Critical Success Factors

- **Feature Parity**: Same functionality as other collections
- **Integration**: Seamlessly integrated into existing app
- **Quality**: Same quality standards as Phase 1

#### Deliverables

- Action Figures collection pages
- Form components
- API routes
- Navigation integration
- Dashboard integration
- Export/import templates
- Documentation

#### Dependencies

- Sprint 11 complete (Action Figures model exists)
- Sprint 12 complete (S3 upload ready)
- Sprint 13 complete (SearchableSelect ready)

---

### Sprint 15: Videogame Completion & Deep Linking (Week 7)

**Goal**: Add completion tracking and URL-based navigation

#### Key Activities

1. **Videogame Completion**
   - Add completion status enum and fields to schema
   - Create migration (non-destructive)
   - Update videogame cards with completion badges
   - Add filter/sort by completion status
   - Show completion statistics

2. **Deep Linking**
   - Implement URL param serialization for all view state
   - Add deep links for detail views, edit pages
   - Encode search, filter, sort, pagination in URL
   - Create dashboard sub-routes
   - Ensure browser back/forward works

#### Critical Success Factors

- **Non-Destructive**: Completion fields are optional, no data loss
- **Complete URL State**: Every view state representable in URL
- **Navigation**: Browser history works correctly

#### Deliverables

- Updated videogame schema with completion fields
- Completion badge and filter components
- URL param handling utilities
- Updated route structure for dashboards
- Deep link tests

#### Dependencies

- Sprint 14 complete (all collections exist for deep linking)

---

### Sprint 16: Analytics Engine & Data Model (Weeks 8-9)

**Goal**: Build the intelligence foundation

#### Key Activities

1. **Analytics Data Model**
   - Create AnalyticsSnapshot, Recommendation, CollectorProfile, AnalyticsConfig models
   - Database migration with proper indexes
   - TypeScript types and Zod schemas

2. **Processing Engine**
   - Build processor registry pattern
   - Implement individual metric processors
   - Add configurable scheduling (node-cron)
   - Admin settings UI
   - Manual trigger API

3. **Grouping Algorithms**
   - Franchise detection (fuzzy matching + dictionary)
   - Series grouping (sequential detection)
   - Genre normalization and hierarchy
   - Creator clustering
   - Era classification

#### Critical Success Factors

- **Performance**: Processing handles large collections efficiently
- **Reliability**: Failed processors don't block others
- **Accuracy**: Algorithms produce meaningful groupings
- **Configurability**: Admin can control schedule and enable/disable processors

#### Deliverables

- Analytics data models and migration
- Processing engine with scheduler
- Grouping algorithm implementations
- Admin settings page
- API endpoints for trigger and status
- Algorithm documentation

#### Dependencies

- Sprint 15 complete (completion data available)
- All collection types exist in database

#### Technical Architecture: Processing Engine

```
┌─────────────────────────────────────────┐
│           Analytics Engine               │
│                                          │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  Scheduler   │  │  Manual Trigger  │  │
│  │  (node-cron) │  │  (API endpoint)  │  │
│  └──────┬───────┘  └────────┬─────────┘  │
│         │                   │            │
│         └───────┬───────────┘            │
│                 ▼                        │
│  ┌──────────────────────────────────┐   │
│  │       Processor Registry         │   │
│  │                                  │   │
│  │  ┌────────────┐ ┌────────────┐  │   │
│  │  │ Platform   │ │ Franchise  │  │   │
│  │  │ Counter    │ │ Detector   │  │   │
│  │  └────────────┘ └────────────┘  │   │
│  │  ┌────────────┐ ┌────────────┐  │   │
│  │  │ Genre      │ │ Series     │  │   │
│  │  │ Normalizer │ │ Grouper    │  │   │
│  │  └────────────┘ └────────────┘  │   │
│  │  ┌────────────┐ ┌────────────┐  │   │
│  │  │ Creator    │ │ Era        │  │   │
│  │  │ Clusterer  │ │ Classifier │  │   │
│  │  └────────────┘ └────────────┘  │   │
│  │  ┌────────────┐ ┌────────────┐  │   │
│  │  │ Completion │ │ Collection │  │   │
│  │  │ Stats      │ │ Counts     │  │   │
│  │  └────────────┘ └────────────┘  │   │
│  └──────────────────────────────────┘   │
│                 │                        │
│                 ▼                        │
│  ┌──────────────────────────────────┐   │
│  │       AnalyticsSnapshot          │   │
│  │       (Database Storage)         │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### Proposed Grouping Algorithm Details

**1. Franchise Detection**

```
Input: Collection items with titles
Process:
  1. Tokenize titles (remove articles, numbers, subtitles)
  2. Match against known franchise dictionary (500+ entries)
  3. For unmatched items, apply fuzzy clustering:
     - Calculate pairwise Levenshtein distance
     - Group items with >70% token overlap
     - Apply minimum group size threshold (2+)
  4. Store with confidence score
Output: Franchise groups with item lists

Example:
  "Super Mario Bros" → Mario (confidence: 0.95)
  "Mario Kart 8 Deluxe" → Mario (confidence: 0.90)
  "Paper Mario: TTYD" → Mario (confidence: 0.85)
```

**2. Series Detection**

```
Input: Collection items (especially books/comics)
Process:
  1. Extract volume/issue numbers via regex
  2. Group by series name (with fuzzy matching)
  3. Sort by detected sequence number
  4. Identify gaps in sequence
  5. Calculate completion percentage
Output: Ordered series with gap identification

Example:
  "Berserk Vol. 1", "Berserk Vol. 3", "Berserk Vol. 4"
  → Series: Berserk, Owned: [1,3,4], Missing: [2], Completion: 75%
```

**3. Genre Normalization**

```
Input: Raw genre strings from items
Process:
  1. Map to normalized genre taxonomy
  2. Build genre hierarchy tree
  3. Calculate per-user genre affinity scores
  4. Identify dominant and underrepresented genres
Output: Normalized genre distribution + affinity scores

Taxonomy Example:
  RPG
  ├── Action RPG
  ├── JRPG
  ├── Tactical RPG
  └── Western RPG
```

---

### Sprint 17: Collection-Specific Dashboards (Weeks 10-11)

**Goal**: Build rich, interactive dashboards for each collection type

#### Key Activities

1. **Chart Infrastructure**
   - Install and configure charting library (recharts)
   - Create reusable chart wrapper components
   - Ensure dark mode and responsive support

2. **Dashboard Framework**
   - Update main dashboard navigation
   - Create dashboard layout with sub-navigation
   - Build data fetching layer from analytics API

3. **Collection Dashboards**
   - Videogames: platforms, franchises, genres, developers, completion
   - Music: genres, artists, formats, decades
   - Books/Comics: genres, publishers, authors, characters, series, reading
   - Action Figures (stretch): manufacturers, series, scales

#### Critical Success Factors

- **Visual Appeal**: Charts must be attractive and informative
- **Performance**: Dashboards load quickly from pre-computed data
- **Responsiveness**: Works perfectly on mobile, tablet, desktop
- **Interactivity**: Charts are clickable, expandable, explorable

#### Proposed Additional Dashboard Features

1. **"This Day in Your Collection"** - Items added on this date in previous years
2. **Collection Growth Timeline** - Visual timeline of acquisitions over time
3. **Acquisition Heatmap** - Calendar heatmap showing when items were added
4. **Collection Value Tracker** - Estimated value based on price data
5. **"Most Collected Year"** - Which release year dominates the collection
6. **Platform/Format Loyalty Score** - How concentrated the collection is
7. **"Hidden Gems"** - Items in collection that are highly rated but from niche genres
8. **Milestone Tracker** - "Next milestone: 500 items!" with progress bar

#### Deliverables

- Charting library integration
- Reusable chart components
- Dashboard layout and navigation
- Videogames dashboard page
- Music dashboard page
- Books/Comics dashboard page
- Action Figures dashboard page (stretch)
- Dashboard data API
- Component tests

#### Dependencies

- Sprint 16 complete (analytics data available)
- Sprint 15 complete (deep link routes exist)

---

### Sprint 18: Recommendations & Personality (Weeks 12-13)

**Goal**: Deliver intelligent recommendations and personality profiling

#### Key Activities

1. **Recommendation Algorithms**
   - Franchise completion recommender
   - Genre affinity recommender
   - Series continuation recommender
   - Platform coverage recommender
   - Creator exploration recommender
   - Era gap recommender

2. **Personality System**
   - Define trait axes and scoring formulas
   - Implement archetype selection
   - Create profile visualization page
   - Generate personality descriptions

3. **Notification System**
   - Create notification model and API
   - Build notification UI (bell, dropdown, toast)
   - Integrate with processing engine
   - Add user preferences

4. **Reading Recommendations Enhancement**
   - Integrate analytics data
   - Add new recommendation categories
   - Improve visual presentation
   - Add personality-based messaging

#### Critical Success Factors

- **Relevance**: Recommendations feel personalized and useful
- **Fun Factor**: Personality system is engaging and shareable
- **Non-Intrusive**: Notifications are helpful, not annoying
- **Accuracy**: Algorithms produce meaningful results

#### Proposed Recommendation Algorithm Scoring

**Franchise Completion Score**:

```
score = (owned_count / total_known) * log(total_known)
```

Higher score for larger franchises with more items already owned. Prioritizes completing franchises the user has already invested in.

**Genre Affinity Score**:

```
affinity = genre_count / total_items
```

Recommend items in genres where `affinity > 0.2` (user's top genres).

**Series Priority Score**:

```
priority = (owned_in_series / total_in_series) * 100
```

Complete series closest to 100% first. Strong psychological motivation to finish what's started.

**Platform Diversity Index**:

```
diversity = unique_platforms / total_games
```

Low diversity suggests expanding to new platforms. Recommend top-rated exclusives for underrepresented platforms.

**Creator Loyalty Score**:

```
loyalty = creator_item_count / total_in_type
```

For creators with `loyalty > 0.1`, recommend their other works the user doesn't own.

**Era Gap Detection**:

```
For each decade:
  era_density = items_in_decade / total_items
If era_density < 0.05 and decade has classic items:
  recommend classics from that era
```

#### Proposed Personality Trait Scoring

```
Nostalgia ↔ Modern (scored -1.0 to +1.0):
  score = (items_after_2000 - items_before_2000) / total_items

Completionist ↔ Casual:
  score = avg_franchise_completion_rate * 2 - 1

Focused ↔ Eclectic:
  score = 1 - (genre_entropy / max_possible_entropy)

Mainstream ↔ Niche:
  score = weighted_avg(item_popularity) normalized to [-1, 1]

Action ↔ Story:
  For games: (action_games - story_games) / total_games
  For books: (action_comics - literary_works) / total_books

Physical ↔ Digital:
  score = (physical_count - digital_count) / total_items
```

**Archetype Selection**:

```
1. Calculate all trait scores
2. For each archetype, define ideal trait vector
3. Compute cosine similarity between user traits and each archetype
4. Select archetype with highest similarity
5. Generate description combining top 2-3 dominant traits
```

#### Deliverables

- 6 recommendation algorithm implementations
- Recommendation API endpoints
- Personality trait calculation engine
- Archetype selection algorithm
- Collector profile page with radar chart
- Notification data model and API
- Notification UI components
- Updated reading recommendations page
- Comprehensive tests
- Algorithm documentation

#### Dependencies

- Sprint 16 complete (processing engine exists)
- Sprint 17 complete (dashboards ready for recommendations display)

---

## Technical Implementation Details

### Database Migration Strategy

#### Approach: Non-Destructive Migrations

All database changes must preserve existing data:

```prisma
// GOOD: Adding optional fields
model Item {
  // ... existing fields
  purchasePlace     String?    // Optional - no data loss
  purchaseDate      DateTime?  // Optional - no data loss
  notes             String?    // Optional - no data loss
}

// BAD: Removing or renaming fields - DO NOT DO THIS
```

#### Migration Workflow

1. **Create Migration**

   ```bash
   npx prisma migrate dev --name add_purchase_fields
   ```

2. **Review Migration SQL**
   - Check for `DROP` statements
   - Check for `ALTER` statements that change types
   - Ensure only `ADD` statements for new fields

3. **Test on Development**

   ```bash
   # Backup dev database
   cp prisma/dev.db prisma/dev.db.backup
   # Run migration
   npx prisma migrate deploy
   # Verify data integrity
   ```

4. **Document Rollback**

5. **Apply to Production** (with backup)

---

### S3 Image Storage Architecture

#### Flow Diagram

```
User Searches Image
       ↓
Google Image Search API
       ↓
User Selects Image
       ↓
Download Image (temporarily)
       ↓
Generate UUID Filename
       ↓
Upload to S3 Bucket
       ↓
Get S3 Object Key
       ↓
Construct CloudFront URL
       ↓
Save URL to Database
       ↓
Display Image via CloudFront
```

#### Filename Convention

```typescript
const filename = `${uuidv4()}.${getExtension(imageUrl)}`
const cloudFrontUrl = `${CLOUDFRONT_URL}/${filename}`
```

---

### Searchable Dropdown Component API

```typescript
interface SearchableSelectProps<T> {
  options: T[]
  value?: T | T[]
  onChange: (value: T | T[]) => void
  placeholder?: string
  searchPlaceholder?: string
  getLabel: (option: T) => string
  getValue: (option: T) => string
  multiple?: boolean
  disabled?: boolean
  className?: string
}
```

---

### Analytics Data Architecture

#### Data Flow

```
Collection Data (Prisma)
       ↓
Processing Engine (Scheduled/Manual)
       ↓
┌──────────────────────────┐
│ Processors               │
│ ├── Platform Counter     │
│ ├── Franchise Detector   │
│ ├── Genre Normalizer     │
│ ├── Series Grouper       │
│ ├── Creator Clusterer    │
│ ├── Era Classifier       │
│ ├── Completion Stats     │
│ └── Collection Counts    │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│ AnalyticsSnapshot Table  │
│ (Pre-computed metrics)   │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│ Dashboard API Endpoints  │
│ GET /api/analytics/...   │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│ Dashboard UI             │
│ ├── Charts (recharts)    │
│ ├── Tables               │
│ ├── Cards                │
│ └── Recommendations      │
└──────────────────────────┘
```

#### Recommended Folder Structure for Analytics

```
src/
├── lib/
│   └── analytics/
│       ├── engine.ts              # Main processing engine
│       ├── scheduler.ts           # Cron job configuration
│       ├── processors/
│       │   ├── index.ts           # Processor registry
│       │   ├── platform-counter.ts
│       │   ├── franchise-detector.ts
│       │   ├── genre-normalizer.ts
│       │   ├── series-grouper.ts
│       │   ├── creator-clusterer.ts
│       │   ├── era-classifier.ts
│       │   ├── completion-stats.ts
│       │   └── collection-counts.ts
│       ├── recommenders/
│       │   ├── index.ts           # Recommender registry
│       │   ├── franchise-completion.ts
│       │   ├── genre-affinity.ts
│       │   ├── series-continuation.ts
│       │   ├── platform-coverage.ts
│       │   ├── creator-exploration.ts
│       │   └── era-gap.ts
│       ├── personality/
│       │   ├── traits.ts          # Trait calculations
│       │   ├── archetypes.ts      # Archetype definitions
│       │   └── profile-generator.ts
│       └── dictionaries/
│           ├── franchises.ts      # Known franchise dictionary
│           ├── genre-taxonomy.ts  # Genre hierarchy
│           └── creators.ts        # Creator aliases
├── app/
│   ├── dashboard/
│   │   ├── page.tsx               # Main dashboard
│   │   ├── videogames/
│   │   │   └── page.tsx           # Videogames dashboard
│   │   ├── music/
│   │   │   └── page.tsx           # Music dashboard
│   │   ├── books/
│   │   │   └── page.tsx           # Books dashboard
│   │   └── action-figures/
│   │       └── page.tsx           # Action figures dashboard
│   ├── profile/
│   │   └── page.tsx               # Collector personality page
│   └── api/
│       └── analytics/
│           ├── run/route.ts       # Manual trigger
│           ├── status/route.ts    # Processing status
│           ├── snapshots/route.ts # Query snapshots
│           ├── recommendations/route.ts
│           └── profile/route.ts   # Collector profile
└── components/
    ├── dashboard/
    │   ├── chart-wrapper.tsx       # Reusable chart container
    │   ├── platform-chart.tsx
    │   ├── genre-chart.tsx
    │   ├── franchise-card.tsx
    │   ├── recommendation-card.tsx
    │   └── completion-overview.tsx
    ├── personality/
    │   ├── trait-radar.tsx         # Radar chart
    │   ├── archetype-card.tsx
    │   └── profile-summary.tsx
    └── notifications/
        ├── notification-bell.tsx
        ├── notification-panel.tsx
        └── notification-toast.tsx
```

---

## Risk Management

### Identified Risks

#### 1. Data Loss During Migration

- **Probability**: Low
- **Impact**: Critical
- **Mitigation**: Test migrations thoroughly, create backups, non-destructive only

#### 2. S3 Upload Failures

- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Retry logic, clear errors, backward compatibility

#### 3. Breaking Existing Functionality

- **Probability**: Low
- **Impact**: High
- **Mitigation**: Comprehensive testing, backward compatibility

#### 4. AWS Cost Overruns

- **Probability**: Low
- **Impact**: Low
- **Mitigation**: Monitor usage, optimize images, billing alerts

#### 5. Analytics Performance

- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Pre-compute in batch, optimize queries, configurable scheduling, pagination

#### 6. Algorithm Accuracy

- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Confidence scores, manual overrides, iterative improvement, known franchise dictionary

#### 7. Chart Library Bundle Size

- **Probability**: Medium
- **Impact**: Low
- **Mitigation**: Tree-shaking, lazy loading dashboard components, code splitting

#### 8. Personality System Engagement

- **Probability**: Low
- **Impact**: Low
- **Mitigation**: Make it fun and shareable, iterate based on feedback

---

## Testing Strategy

### Test Coverage Goals

| Test Type         | Coverage Target | Priority |
| ----------------- | --------------- | -------- |
| Unit Tests        | 80%+            | High     |
| Component Tests   | 70%+            | High     |
| Integration Tests | 80%+            | High     |
| Algorithm Tests   | 90%+            | Critical |
| E2E Tests         | Critical flows  | Medium   |

### Testing Focus Areas

#### Algorithms (Sprint 16-18)

- Franchise detection with known edge cases
- Series grouping with various numbering schemes
- Genre normalization across different data sources
- Recommendation scoring accuracy
- Personality trait calculations with extreme distributions

#### Charts (Sprint 17)

- Responsive rendering at all breakpoints
- Dark mode color schemes
- Empty state handling
- Large dataset performance
- Accessibility (screen reader labels for charts)

#### Deep Links (Sprint 15)

- URL param encoding/decoding for special characters
- Browser back/forward navigation
- Shared URL reconstruction
- Filter combination edge cases

---

## Deployment Plan

### Pre-Deployment Checklist

- [ ] All user stories completed
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Database backup created
- [ ] Environment variables configured
- [ ] S3 bucket configured
- [ ] CloudFront distribution configured
- [ ] Analytics processing tested
- [ ] Dashboard performance verified

### Deployment Steps

1. **Backup Production Database**
2. **Deploy Code** (build and deploy to hosting platform)
3. **Run Migrations** (`npx prisma migrate deploy`)
4. **Configure Analytics Schedule** (via admin settings)
5. **Trigger Initial Analytics Run** (manual)
6. **Verify Deployment** (test critical flows)
7. **Monitor** (error logs, performance, analytics processing)

### Rollback Plan

If issues occur:

1. Stop new deployments
2. Revert code to previous version
3. Rollback database if needed (using backup)
4. Investigate issues
5. Fix and redeploy

---

## Timeline & Milestones

### Week 1: Sprint 11

- Database schema updated
- Migrations tested and applied
- Validation schemas updated

### Weeks 2-3: Sprint 12

- S3 integration complete
- Image upload service working
- UI integration complete

### Weeks 3-4: Sprint 13

- SearchableSelect component ready
- All forms updated
- Global dropdown replacement complete

### Weeks 5-6: Sprint 14

- Action Figures pages complete
- API routes implemented
- Full integration complete

### Week 7: Sprint 15

- Videogame completion tracking live
- Deep linking implemented across all views
- Dashboard route structure ready

### Weeks 8-9: Sprint 16

- Analytics data model in place
- Processing engine operational
- Grouping algorithms producing results

### Weeks 10-11: Sprint 17

- All collection dashboards live
- Charts interactive and responsive
- Dashboard navigation complete

### Weeks 12-13: Sprint 18

- Recommendation algorithms running
- Personality profiles generated
- Notification system active
- Reading recommendations enhanced

### Week 14: Final Testing & Deployment

- Integration testing
- Performance testing
- Accessibility testing
- Production deployment

---

## Success Criteria

### Phase 2 Complete When:

- [ ] All 225 story points completed
- [ ] All acceptance criteria met
- [ ] Test coverage goals achieved
- [ ] Documentation updated
- [ ] No critical bugs
- [ ] Performance maintained (Lighthouse 90+)
- [ ] Accessibility maintained (WCAG AA)
- [ ] Analytics engine running daily
- [ ] All dashboards functional with real data
- [ ] Recommendations generating meaningful suggestions
- [ ] Personality system producing accurate profiles
- [ ] User acceptance testing passed
- [ ] Successfully deployed to production

---

## Post-Phase 2 Activities

### Monitoring (First 2 Weeks)

- Monitor error logs
- Track S3 usage and costs
- Monitor analytics processing performance
- Check recommendation quality
- Gather user feedback on personality profiles
- Track dashboard engagement metrics

### Potential Improvements

- Optimize S3 image sizes with thumbnail generation
- Fine-tune franchise detection dictionary
- Add more recommendation algorithms based on user feedback
- Implement collaborative filtering (if multi-user)
- Add image galleries for items
- External API integrations for Action Figures
- Shareable personality profile cards (image generation)
- Mobile app with push notifications

---

## Resources & Tools

### Required Tools

- Node.js 18+
- PostgreSQL 14+
- Prisma CLI
- AWS CLI (for S3 management)

### Required Packages (New)

- `@aws-sdk/client-s3` - S3 uploads
- `recharts` - Charting library
- `node-cron` - Scheduled processing
- `fuse.js` or similar - Fuzzy matching for franchise detection
- `uuid` - Unique filename generation

### Required Accounts

- AWS account with S3 access
- GitHub account (already configured)

### Documentation References

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [AWS S3 SDK](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html)
- [Recharts](https://recharts.org/)
- [node-cron](https://www.npmjs.com/package/node-cron)
- [Fuse.js](https://fusejs.io/) (fuzzy search)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Communication Plan

### Weekly Updates

- Sprint progress review
- Blocker identification
- Velocity tracking
- Next week planning

### Stakeholder Communication

- Demo after each sprint
- Feedback collection
- Priority adjustments if needed
- Algorithm accuracy review after Sprint 16

---

**Last Updated**: 2026-02-24
**Next Review**: Sprint 11 kickoff
