# The Collector - User Stories & Sprint Planning

## Product Backlog

### Epic 1: Foundation & Setup

Setup the project infrastructure and basic application structure.

### Epic 2: Data Layer

Implement database schema, ORM integration, and data migration from CSV.

### Epic 3: Core UI & Navigation

Build the main layout, navigation, and dashboard.

### Epic 4: Collection Management

Implement CRUD operations for all collection types.

### Epic 5: Import/Export

Build CSV import/export functionality with validation.

### Epic 6: Backup & Restore

Implement local and cloud backup capabilities.

### Epic 7: Search & Filter

Advanced search and filtering across collections.

### Epic 8: Polish & Optimization

Performance optimization, error handling, and UX improvements.

---

## Sprint Structure (2-week sprints)

### Sprint 0: Project Setup (Foundation)

**Goal**: Set up the development environment and project structure
**Duration**: 3-5 days

#### User Stories

**US-0.1: Initialize Next.js Project**

- **As a** developer
- **I want** to set up a Next.js project with TypeScript
- **So that** I have a solid foundation for building the app

**Acceptance Criteria**:

- [ ] Next.js 14+ installed with App Router
- [ ] TypeScript configured
- [ ] Tailwind CSS installed and configured
- [ ] Project structure created according to design doc
- [ ] Git initialized with .gitignore

**Tasks**:

- Initialize Next.js with `create-next-app`
- Install TypeScript and configure tsconfig.json
- Install and configure Tailwind CSS
- Create folder structure
- Set up ESLint and Prettier

**Effort**: 2 story points

---

**US-0.2: Install Core Dependencies**

- **As a** developer
- **I want** to install all required dependencies
- **So that** I can use them throughout development

**Acceptance Criteria**:

- [ ] Prisma installed and configured for SQLite
- [ ] shadcn/ui initialized
- [ ] Zustand installed
- [ ] TanStack Query installed
- [ ] React Hook Form and Zod installed
- [ ] Other core libraries installed

**Tasks**:

- Install Prisma and initialize with SQLite
- Install and configure shadcn/ui
- Install state management and data fetching libraries
- Install form handling libraries
- Update package.json scripts

**Effort**: 2 story points

---

**US-0.3: Set Up Development Tools**

- **As a** developer
- **I want** to configure development tools
- **So that** I have a smooth development experience

**Acceptance Criteria**:

- [ ] ESLint configured with Next.js rules
- [ ] Prettier configured
- [ ] Husky pre-commit hooks (optional)
- [ ] VS Code settings recommended

**Tasks**:

- Configure ESLint
- Configure Prettier
- Set up pre-commit hooks
- Create .vscode/settings.json

**Effort**: 1 story point

---

### Sprint 1: Database & Data Migration

**Goal**: Set up the database schema and import existing CSV data
**Duration**: 2 weeks

#### User Stories

**US-1.1: Define Database Schema**

- **As a** developer
- **I want** to define the Prisma schema for all collections
- **So that** I can store collection data in a structured way

**Acceptance Criteria**:

- [ ] Prisma schema created with all models (Item, Videogame, Music, Book, Backup, Settings)
- [ ] Relationships defined correctly
- [ ] Indexes added for performance
- [ ] Enums defined for collection types
- [ ] Initial migration created
- [ ] Database file created

**Tasks**:

- Write Prisma schema based on design doc
- Define all models and relationships
- Add indexes for frequently queried fields
- Run initial migration
- Test database connection

**Effort**: 5 story points

---

**US-1.2: Create Database Utilities**

- **As a** developer
- **I want** to create utility functions for database operations
- **So that** I can interact with the database consistently

**Acceptance Criteria**:

- [ ] Prisma client singleton created
- [ ] Database connection helper functions
- [ ] CRUD helper functions for each collection type
- [ ] Error handling for database operations
- [ ] TypeScript types exported

**Tasks**:

- Create `lib/db.ts` with Prisma client
- Create CRUD utilities
- Add error handling
- Export TypeScript types

**Effort**: 3 story points

---

**US-1.3: Build CSV Parser**

- **As a** developer
- **I want** to build a CSV parsing utility
- **So that** I can import data from CSV files

**Acceptance Criteria**:

- [ ] CSV parser function created using PapaParse
- [ ] Column mapping logic implemented
- [ ] Data validation logic implemented
- [ ] Error reporting for invalid data
- [ ] Support for different CSV formats

**Tasks**:

- Install PapaParse
- Create `lib/csv-parser.ts`
- Implement parsing logic
- Add validation
- Create unit tests

**Effort**: 5 story points

---

**US-1.4: Import Existing CSV Data**

- **As a** user
- **I want** to import my existing CSV collection data
- **So that** I can start using the app with my current collection

**Acceptance Criteria**:

- [ ] Script to import books CSV
- [ ] Script to import music CSV
- [ ] Script to import videogames CSV
- [ ] All data imported successfully
- [ ] Data integrity verified
- [ ] Import logs/reports generated

**Tasks**:

- Create import script for each CSV file
- Map CSV columns to database fields
- Handle data type conversions
- Run imports and verify data
- Generate import reports

**Effort**: 8 story points

---

**US-1.5: Create Seed Data Script**

- **As a** developer
- **I want** to create a seed script
- **So that** I can easily reset and populate the database during development

**Acceptance Criteria**:

- [ ] Seed script created (`prisma/seed.ts`)
- [ ] Can clear database and reimport CSV data
- [ ] Configured in package.json
- [ ] Documentation added

**Tasks**:

- Create seed script
- Integrate with Prisma
- Test seed functionality
- Document usage

**Effort**: 3 story points

---

### Sprint 2: Core UI & Layout

**Goal**: Build the main layout, navigation, and dashboard
**Duration**: 2 weeks

#### User Stories

**US-2.1: Create Main Layout Component**

- **As a** user
- **I want** to see a consistent layout across all pages
- **So that** I can navigate the app easily

**Acceptance Criteria**:

- [ ] Root layout with header and main content area
- [ ] Responsive header with navigation
- [ ] Mobile menu (hamburger)
- [ ] Theme toggle (light/dark)
- [ ] Footer component

**Tasks**:

- Create layout components
- Build responsive header
- Implement mobile menu
- Add theme toggle functionality
- Style footer

**Effort**: 5 story points

---

**US-2.2: Implement Navigation**

- **As a** user
- **I want** to navigate between different sections
- **So that** I can access different collections and features

**Acceptance Criteria**:

- [ ] Navigation menu with links to all sections
- [ ] Active link highlighting
- [ ] Navigation works on mobile and desktop
- [ ] Search bar in header (UI only for now)

**Tasks**:

- Create navigation component
- Add route links
- Implement active state
- Add search bar UI
- Test on different screen sizes

**Effort**: 3 story points

---

**US-2.3: Build Dashboard Page**

- **As a** user
- **I want** to see an overview of my collection on the dashboard
- **So that** I can quickly understand my collection statistics

**Acceptance Criteria**:

- [ ] Dashboard page with stats cards
- [ ] Total items count by collection type
- [ ] Recent additions section (last 20 items)
- [ ] Quick action buttons (Add Item, Import, Backup)
- [ ] Collection overview cards with navigation
- [ ] Responsive layout

**Tasks**:

- Create dashboard page
- Build stats cards component
- Fetch data from database
- Create recent items component
- Add quick action buttons
- Style for mobile/tablet/desktop

**Effort**: 8 story points

---

**US-2.4: Install and Configure shadcn/ui Components**

- **As a** developer
- **I want** to install shadcn/ui components
- **So that** I can build a consistent and beautiful UI

**Acceptance Criteria**:

- [ ] Button component installed
- [ ] Card component installed
- [ ] Dialog component installed
- [ ] Dropdown Menu component installed
- [ ] Input component installed
- [ ] Label component installed
- [ ] Select component installed
- [ ] Theme configured with custom colors

**Tasks**:

- Install shadcn/ui components as needed
- Configure theme in tailwind.config.js
- Test all components
- Create component demo page (optional)

**Effort**: 3 story points

---

**US-2.5: Implement Dark Mode**

- **As a** user
- **I want** to toggle between light and dark themes
- **So that** I can use the app in different lighting conditions

**Acceptance Criteria**:

- [ ] Theme provider set up
- [ ] Dark mode toggle in header
- [ ] Theme preference persisted in localStorage
- [ ] All pages styled for both themes
- [ ] Smooth theme transitions

**Tasks**:

- Set up next-themes provider
- Create theme toggle component
- Configure dark mode styles
- Test all pages in both themes
- Add transitions

**Effort**: 3 story points

---

### Sprint 3: Collection Views & Browsing

**Goal**: Implement collection pages with grid/list views
**Duration**: 2 weeks

#### User Stories

**US-3.1: Create Video Games Collection Page**

- **As a** user
- **I want** to view my video game collection
- **So that** I can browse and find games

**Acceptance Criteria**:

- [ ] Video games collection page at `/videogames`
- [ ] Grid view with cover images
- [ ] List view with detailed info
- [ ] View toggle button
- [ ] Basic pagination (50 items per page)
- [ ] Loading states
- [ ] Empty state when no games

**Tasks**:

- Create videogames page
- Fetch data with TanStack Query
- Build grid view component
- Build list view component
- Implement view toggle
- Add pagination
- Style for responsive

**Effort**: 8 story points

---

**US-3.2: Create Music Collection Page**

- **As a** user
- **I want** to view my music collection
- **So that** I can browse and find albums

**Acceptance Criteria**:

- [ ] Music collection page at `/music`
- [ ] Grid view with album covers
- [ ] List view with detailed info
- [ ] View toggle button
- [ ] Basic pagination
- [ ] Loading states
- [ ] Empty state

**Tasks**:

- Create music page (similar to videogames)
- Fetch data with TanStack Query
- Reuse grid/list components with music data
- Add pagination
- Style for responsive

**Effort**: 5 story points

---

**US-3.3: Create Books Collection Page**

- **As a** user
- **I want** to view my books collection
- **So that** I can browse and find manga/comics/books

**Acceptance Criteria**:

- [ ] Books collection page at `/books`
- [ ] Grid view with cover images
- [ ] List view with detailed info
- [ ] View toggle button
- [ ] Basic pagination
- [ ] Loading states
- [ ] Empty state

**Tasks**:

- Create books page (similar to videogames)
- Fetch data with TanStack Query
- Reuse grid/list components with book data
- Add pagination
- Style for responsive

**Effort**: 5 story points

---

**US-3.4: Create Reusable Collection Grid Component**

- **As a** developer
- **I want** to create a reusable grid component
- **So that** I can display items consistently across collection types

**Acceptance Criteria**:

- [ ] Generic CollectionGrid component
- [ ] Accepts item type as prop
- [ ] Displays cover image
- [ ] Shows primary metadata (title, year, etc.)
- [ ] Responsive grid layout
- [ ] Hover effects
- [ ] Click to view details

**Tasks**:

- Create CollectionGrid component
- Make it generic/reusable
- Add hover effects
- Handle missing cover images (placeholder)
- Test with all collection types

**Effort**: 5 story points

---

**US-3.5: Create Reusable Collection List Component**

- **As a** developer
- **I want** to create a reusable list component
- **So that** I can display items in list view consistently

**Acceptance Criteria**:

- [ ] Generic CollectionList component
- [ ] Table-like layout
- [ ] Shows all relevant metadata
- [ ] Responsive (stacks on mobile)
- [ ] Alternating row colors
- [ ] Click to view details

**Tasks**:

- Create CollectionList component
- Make it generic/reusable
- Style for desktop and mobile
- Test with all collection types

**Effort**: 5 story points

---

**US-3.6: Implement Lazy Loading for Images**

- **As a** user
- **I want** images to load smoothly
- **So that** the page loads quickly and doesn't stutter

**Acceptance Criteria**:

- [ ] Images lazy load as user scrolls
- [ ] Blur placeholder while loading
- [ ] Fallback image for broken URLs
- [ ] Optimized image loading

**Tasks**:

- Use Next.js Image component
- Configure image domains in next.config.js
- Add blur placeholders
- Create fallback image component
- Test with slow network

**Effort**: 3 story points

---

### Sprint 4: Item Details & CRUD Operations

**Goal**: Implement add, edit, delete, and view details for items
**Duration**: 2 weeks

#### User Stories

**US-4.1: Create Item Detail Modal**

- **As a** user
- **I want** to view detailed information about an item
- **So that** I can see all metadata and options

**Acceptance Criteria**:

- [ ] Modal opens when clicking an item
- [ ] Large cover image display
- [ ] All metadata fields shown
- [ ] Edit and Delete buttons
- [ ] Close button
- [ ] Responsive layout

**Tasks**:

- Create ItemDetail component
- Build modal layout
- Fetch item data by ID
- Display all fields based on collection type
- Add action buttons
- Style for mobile/desktop

**Effort**: 5 story points

---

**US-4.2: Create "Add Videogame" Form**

- **As a** user
- **I want** to add a new video game to my collection
- **So that** I can track new acquisitions

**Acceptance Criteria**:

- [ ] Form with all videogame fields
- [ ] Form validation (required fields)
- [ ] Cover URL validation
- [ ] Genre multi-select
- [ ] Success/error messages
- [ ] Form resets after submission
- [ ] Redirect to game detail after save

**Tasks**:

- Create AddVideogameForm component
- Set up React Hook Form with Zod
- Build form fields
- Add validation rules
- Create API route for POST /api/items/videogames
- Handle form submission
- Add success/error toast

**Effort**: 8 story points

---

**US-4.3: Create "Add Music" Form**

- **As a** user
- **I want** to add a new music album to my collection
- **So that** I can track new acquisitions

**Acceptance Criteria**:

- [ ] Form with all music fields
- [ ] Form validation
- [ ] Genre multi-select
- [ ] Success/error messages
- [ ] Form resets after submission

**Tasks**:

- Create AddMusicForm component (reuse structure from videogame)
- Set up form with music-specific fields
- Create API route for POST /api/items/music
- Handle submission
- Add success/error toast

**Effort**: 5 story points

---

**US-4.4: Create "Add Book" Form**

- **As a** user
- **I want** to add a new book to my collection
- **So that** I can track new acquisitions

**Acceptance Criteria**:

- [ ] Form with all book fields
- [ ] Form validation
- [ ] Book type selector (Manga, Comic, etc.)
- [ ] Genre multi-select
- [ ] Success/error messages

**Tasks**:

- Create AddBookForm component (reuse structure)
- Set up form with book-specific fields
- Create API route for POST /api/items/books
- Handle submission
- Add success/error toast

**Effort**: 5 story points

---

**US-4.5: Implement Edit Functionality**

- **As a** user
- **I want** to edit an existing item
- **So that** I can correct or update information

**Acceptance Criteria**:

- [ ] Edit button opens form pre-filled with current data
- [ ] Form validation works
- [ ] Save updates the database
- [ ] Success/error messages
- [ ] Detail view refreshes after save

**Tasks**:

- Reuse Add forms for Edit mode
- Pre-fill form with current data
- Create API route for PUT /api/items/:id
- Handle update submission
- Refresh item data after save

**Effort**: 5 story points

---

**US-4.6: Implement Delete Functionality**

- **As a** user
- **I want** to delete an item from my collection
- **So that** I can remove items I no longer own

**Acceptance Criteria**:

- [ ] Delete button in item detail
- [ ] Confirmation dialog before deleting
- [ ] Item removed from database
- [ ] User redirected to collection page
- [ ] Success message shown

**Tasks**:

- Add delete button to item detail
- Create confirmation dialog component
- Create API route for DELETE /api/items/:id
- Handle deletion
- Add success toast and redirect

**Effort**: 3 story points

---

### Sprint 5: Search & Filtering

**Goal**: Implement search and advanced filtering
**Duration**: 2 weeks

#### User Stories

**US-5.1: Implement Global Search**

- **As a** user
- **I want** to search across all collections
- **So that** I can quickly find any item

**Acceptance Criteria**:

- [ ] Search bar in header is functional
- [ ] Search query returns results from all collections
- [ ] Results show collection type
- [ ] Click result navigates to item detail
- [ ] Debounced search (300ms)
- [ ] Empty state for no results

**Tasks**:

- Create search API route
- Implement full-text search query
- Build search results dropdown
- Add debouncing
- Style search results
- Add keyboard navigation (up/down arrows, enter)

**Effort**: 8 story points

---

**US-5.2: Add Sorting to Collection Pages**

- **As a** user
- **I want** to sort items by different criteria
- **So that** I can organize my view

**Acceptance Criteria**:

- [ ] Sort dropdown with options (Title, Year, Date Added, Genre)
- [ ] Ascending/Descending toggle
- [ ] Sort persisted during session
- [ ] Works on all collection pages

**Tasks**:

- Create sort dropdown component
- Update collection pages to accept sort params
- Modify database queries to sort
- Persist sort preference in URL params
- Test all sort options

**Effort**: 5 story points

---

**US-5.3: Create Filter Sidebar for Videogames**

- **As a** user
- **I want** to filter video games by platform, genre, year, etc.
- **So that** I can narrow down my collection

**Acceptance Criteria**:

- [ ] Sidebar with filter options
- [ ] Platform multi-select
- [ ] Genre multi-select
- [ ] Year range slider
- [ ] Publisher dropdown
- [ ] Apply/Clear buttons
- [ ] Collapsible on mobile
- [ ] Filter count badge

**Tasks**:

- Create FilterSidebar component
- Build filter controls
- Fetch filter options from database (unique platforms, genres, etc.)
- Update API to accept filter params
- Apply filters to query
- Show active filter count

**Effort**: 8 story points

---

**US-5.4: Create Filter Sidebar for Music**

- **As a** user
- **I want** to filter music by format, genre, artist, etc.
- **So that** I can narrow down my collection

**Acceptance Criteria**:

- [ ] Sidebar with music-specific filters
- [ ] Format multi-select (CD, Vinyl, etc.)
- [ ] Genre multi-select
- [ ] Year range slider
- [ ] Artist search/dropdown
- [ ] Apply/Clear buttons

**Tasks**:

- Reuse FilterSidebar component
- Configure for music-specific filters
- Update music API to accept filters
- Test filtering

**Effort**: 5 story points

---

**US-5.5: Create Filter Sidebar for Books**

- **As a** user
- **I want** to filter books by type, genre, author, series, etc.
- **So that** I can narrow down my collection

**Acceptance Criteria**:

- [ ] Sidebar with book-specific filters
- [ ] Book type multi-select (Manga, Comic, etc.)
- [ ] Genre multi-select
- [ ] Author search/dropdown
- [ ] Series dropdown
- [ ] Publisher dropdown
- [ ] Apply/Clear buttons

**Tasks**:

- Reuse FilterSidebar component
- Configure for book-specific filters
- Update books API to accept filters
- Test filtering

**Effort**: 5 story points

---

**US-5.6: Add Search Within Collection**

- **As a** user
- **I want** to search within a specific collection
- **So that** I can find items faster

**Acceptance Criteria**:

- [ ] Search box on each collection page
- [ ] Real-time search results
- [ ] Searches title, author/artist/developer, description
- [ ] Works with filters
- [ ] Debounced (300ms)

**Tasks**:

- Add search box to collection pages
- Update API to accept search query
- Implement search logic in queries
- Combine with existing filters
- Test search + filters together

**Effort**: 5 story points

---

### Sprint 6: Import & Export

**Goal**: Build CSV import/export functionality
**Duration**: 2 weeks

#### User Stories

**US-6.1: Create Import Page UI**

- **As a** user
- **I want** to navigate to an import page
- **So that** I can import CSV data

**Acceptance Criteria**:

- [ ] Import page at `/import`
- [ ] File upload area (drag & drop)
- [ ] Collection type selector
- [ ] Upload button
- [ ] Instructions/help text
- [ ] Loading state during upload

**Tasks**:

- Create import page
- Build file upload component
- Add drag & drop functionality
- Create collection type selector
- Style page

**Effort**: 5 story points

---

**US-6.2: Implement CSV Upload & Parsing**

- **As a** user
- **I want** to upload a CSV file
- **So that** I can import my data

**Acceptance Criteria**:

- [ ] File upload accepts .csv files only
- [ ] CSV is parsed on upload
- [ ] Preview of first 10 rows shown
- [ ] Detected column names displayed
- [ ] Error handling for invalid CSV

**Tasks**:

- Create API route for CSV upload
- Parse CSV with PapaParse
- Return preview data to frontend
- Display preview table
- Handle errors

**Effort**: 5 story points

---

**US-6.3: Build Column Mapping Interface**

- **As a** user
- **I want** to map CSV columns to database fields
- **So that** I can import data correctly

**Acceptance Criteria**:

- [ ] Auto-detect column mapping when possible
- [ ] Manual dropdown to map each column
- [ ] Show required vs optional fields
- [ ] Validation before proceeding
- [ ] Save mapping for future imports

**Tasks**:

- Create column mapping component
- Implement auto-detection logic
- Build manual mapping UI
- Validate mapping completeness
- Store mapping in Settings

**Effort**: 8 story points

---

**US-6.4: Implement Data Validation & Import**

- **As a** user
- **I want** to validate and import my CSV data
- **So that** I can ensure data quality

**Acceptance Criteria**:

- [ ] Validate each row before import
- [ ] Show validation errors (row number, field, error)
- [ ] Option to skip invalid rows or fix them
- [ ] Progress bar during import
- [ ] Import summary (success count, error count)
- [ ] Option to download error report

**Tasks**:

- Create validation logic using Zod schemas
- Build validation results UI
- Create import API route
- Implement batch insert with transaction
- Show progress indicator
- Generate import summary

**Effort**: 8 story points

---

**US-6.5: Implement CSV Export**

- **As a** user
- **I want** to export my collection to CSV
- **So that** I can back up my data or use it elsewhere

**Acceptance Criteria**:

- [ ] Export button on each collection page
- [ ] Export all items or filtered subset
- [ ] Choose fields to include
- [ ] Download CSV file
- [ ] Maintain original CSV format compatibility

**Tasks**:

- Create export API route
- Convert database data to CSV format
- Add field selection UI (optional)
- Generate and download CSV file
- Test with large datasets

**Effort**: 5 story points

---

**US-6.6: Implement JSON Export**

- **As a** user
- **I want** to export my collection to JSON
- **So that** I have a complete data dump

**Acceptance Criteria**:

- [ ] Export button for JSON
- [ ] Export entire database or specific collection
- [ ] Well-formatted JSON output
- [ ] Download JSON file

**Tasks**:

- Create JSON export API route
- Fetch and format data
- Generate and download JSON file
- Test with large datasets

**Effort**: 3 story points

---

**US-6.7: Create Settings Hub Page**

- **As a** user
- **I want** to see a settings hub with navigation options
- **So that** I can easily access different settings sections

**Acceptance Criteria**:

- [ ] Main settings page at `/settings` with navigation
- [ ] Navigation cards/sections for:
  - [ ] Backup Settings (link to `/settings/backup`)
  - [ ] General Settings (placeholder for future)
  - [ ] Export/Import (placeholder or link to `/import`)
  - [ ] About/Info (placeholder for future)
- [ ] Each card shows description and icon
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Consistent with app design system
- [ ] Dark mode support

**Tasks**:

- Replace placeholder settings page with hub layout
- Create navigation cards component
- Add icons for each settings section (Lucide React)
- Link to existing backup settings page
- Create placeholders for future settings sections
- Style with shadcn/ui Card components
- Test responsive behavior
- Test dark mode

**Effort**: 3 story points

---

### Sprint 7: Backup & Restore

**Goal**: Implement local and cloud backup functionality
**Duration**: 2 weeks

#### User Stories

**US-7.1: Create Backup Settings Page**

- **As a** user
- **I want** to configure backup settings
- **So that** I can control how backups work

**Acceptance Criteria**:

- [ ] Settings page at `/settings/backup`
- [ ] Toggle for automatic backups
- [ ] Backup frequency selector (daily, weekly, monthly)
- [ ] Backup retention setting (keep last N backups)
- [ ] Cloud storage configuration (S3/R2/Dropbox credentials)
- [ ] Test connection button
- [ ] Save settings

**Tasks**:

- Create backup settings page
- Build settings form
- Store settings in Settings table
- Add cloud storage config UI
- Implement connection test
- Save settings

**Effort**: 5 story points

---

**US-7.2: Implement Local Backup**

- **As a** user
- **I want** to create a manual backup
- **So that** I can save my database locally

**Acceptance Criteria**:

- [ ] "Create Backup" button on dashboard
- [ ] Copies SQLite database file to `/backups` directory
- [ ] Filename includes timestamp
- [ ] Success message with backup path
- [ ] Backup record saved to Backup table

**Tasks**:

- Create backup API route
- Copy database file with timestamp
- Store backup record in database
- Return backup info to frontend
- Show success message

**Effort**: 5 story points

---

**US-7.3: List All Backups**

- **As a** user
- **I want** to see a list of all backups
- **So that** I can manage them

**Acceptance Criteria**:

- [ ] Backup management page at `/settings/backup/manage`
- [ ] Table with backup list (date, size, item count, location)
- [ ] Sort by date (newest first)
- [ ] Download button for each backup
- [ ] Delete button for each backup
- [ ] Pagination for many backups

**Tasks**:

- Create backup management page
- Fetch backups from database
- Build backup table component
- Add download functionality
- Add delete functionality
- Test with multiple backups

**Effort**: 5 story points

---

**US-7.4: Implement Cloud Backup Upload**

- **As a** user
- **I want** to upload backups to cloud storage
- **So that** I have an off-site backup

**Acceptance Criteria**:

- [ ] Manual "Upload to Cloud" button
- [ ] Uploads latest backup to configured cloud storage
- [ ] Progress indicator during upload
- [ ] Success/error message
- [ ] Backup record updated with cloud URL

**Tasks**:

- Install AWS SDK or relevant cloud SDK
- Create cloud upload utility
- Create upload API route
- Handle upload with progress
- Update backup record
- Handle errors

**Effort**: 8 story points

---

**US-7.5: Implement Scheduled Automatic Backups**

- **As a** user
- **I want** backups to happen automatically
- **So that** I don't have to remember to do it

**Acceptance Criteria**:

- [ ] Scheduled job runs based on settings
- [ ] Creates local backup
- [ ] Optionally uploads to cloud (if configured)
- [ ] Cleans up old backups based on retention setting
- [ ] Logs backup activity

**Tasks**:

- Set up cron job or scheduled task
- Create backup scheduler
- Implement backup rotation (delete old backups)
- Add logging
- Test scheduler

**Effort**: 8 story points

---

**US-7.6: Implement Restore from Backup**

- **As a** user
- **I want** to restore my database from a backup
- **So that** I can recover from data loss

**Acceptance Criteria**:

- [ ] "Restore" button for each backup
- [ ] Confirmation dialog with warning
- [ ] Replaces current database with backup
- [ ] Success message
- [ ] Page refresh to show restored data

**Tasks**:

- Create restore API route
- Implement database replacement logic
- Add confirmation dialog with strong warning
- Test restore process thoroughly
- Handle errors

**Effort**: 5 story points

---

### Sprint 8: Polish & Optimization

**Goal**: Polish the UI, optimize performance, and fix bugs
**Duration**: 2 weeks

#### User Stories

**US-8.1: Optimize Database Queries**

- **As a** developer
- **I want** to optimize slow queries
- **So that** the app performs well with large collections

**Acceptance Criteria**:

- [ ] Analyze slow queries with Prisma query logging
- [ ] Add indexes where needed
- [ ] Optimize N+1 queries
- [ ] Add pagination to all list views
- [ ] Test with 1000+ items

**Tasks**:

- Enable Prisma query logging
- Identify slow queries
- Add database indexes
- Refactor queries to reduce N+1
- Add pagination
- Performance test

**Effort**: 5 story points

---

**US-8.2: Implement Virtual Scrolling**

- **As a** user
- **I want** smooth scrolling with many items
- **So that** the app doesn't lag

**Acceptance Criteria**:

- [ ] Virtual scrolling for grid view (optional)
- [ ] Smooth scrolling with 1000+ items
- [ ] No performance degradation

**Tasks**:

- Evaluate need for virtual scrolling
- Install react-virtual or similar
- Implement virtual scrolling for collection grids
- Test performance

**Effort**: 5 story points (if needed)

---

**US-8.3: Add Loading Skeletons**

- **As a** user
- **I want** to see loading placeholders
- **So that** I know the app is working

**Acceptance Criteria**:

- [ ] Skeleton loaders for all data-fetching components
- [ ] Skeleton matches the layout of actual content
- [ ] Smooth transition from skeleton to content

**Tasks**:

- Create skeleton components
- Add to all pages with data fetching
- Test loading states

**Effort**: 3 story points

---

**US-8.4: Implement Error Boundaries**

- **As a** developer
- **I want** error boundaries to catch errors
- **So that** the app doesn't crash completely

**Acceptance Criteria**:

- [ ] Error boundary component created
- [ ] Wraps main app content
- [ ] Shows friendly error message
- [ ] Logs error for debugging
- [ ] Reset button to try again

**Tasks**:

- Create error boundary component
- Add to layout
- Style error page
- Add logging
- Test with intentional errors

**Effort**: 3 story points

---

**US-8.5: Add Toast Notifications**

- **As a** user
- **I want** to see toast notifications for actions
- **So that** I get feedback on my actions

**Acceptance Criteria**:

- [ ] Toast notification system installed (e.g., react-hot-toast)
- [ ] Success toasts for create/update/delete
- [ ] Error toasts for failures
- [ ] Consistent styling
- [ ] Auto-dismiss after 3-5 seconds

**Tasks**:

- Install toast library
- Create toast wrapper
- Add toasts to all CRUD operations
- Style toasts
- Test all toast scenarios

**Effort**: 3 story points

---

**US-8.6: Add Keyboard Shortcuts**

- **As a** user
- **I want** keyboard shortcuts for common actions
- **So that** I can navigate faster

**Acceptance Criteria**:

- [ ] `/` to focus search
- [ ] `Esc` to close modals
- [ ] Arrow keys in search results
- [ ] `Ctrl/Cmd + K` for command palette (optional)
- [ ] Shortcuts documented in help page

**Tasks**:

- Implement keyboard event listeners
- Add shortcuts to relevant components
- Create help page with shortcuts
- Test shortcuts

**Effort**: 5 story points

---

**US-8.7: Improve Mobile Experience**

- **As a** user
- **I want** the app to work well on mobile
- **So that** I can use it on my phone

**Acceptance Criteria**:

- [ ] All pages responsive and usable on mobile
- [ ] Touch-friendly buttons and links
- [ ] Mobile menu works smoothly
- [ ] Forms work on mobile keyboards
- [ ] Images load optimally

**Tasks**:

- Test all pages on mobile viewport
- Fix responsive issues
- Improve touch targets
- Optimize mobile performance
- Test on actual devices

**Effort**: 5 story points

---

**US-8.8: Create Help/Documentation Page**

- **As a** user
- **I want** to access help documentation
- **So that** I can learn how to use the app

**Acceptance Criteria**:

- [ ] Help page at `/help`
- [ ] Sections for each feature
- [ ] Screenshots or demos
- [ ] FAQ section
- [ ] Keyboard shortcuts reference

**Tasks**:

- Create help page
- Write documentation content
- Add screenshots
- Create FAQ
- Link from header

**Effort**: 5 story points

---

**US-8.9: Accessibility Improvements**

- **As a** user with accessibility needs
- **I want** the app to be accessible
- **So that** I can use it with assistive technologies

**Acceptance Criteria**:

- [ ] All images have alt text
- [ ] Proper heading hierarchy
- [ ] Focus indicators visible
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works throughout
- [ ] Color contrast meets WCAG AA

**Tasks**:

- Run accessibility audit (Lighthouse, axe)
- Fix accessibility issues
- Add ARIA labels
- Test with keyboard only
- Test with screen reader

**Effort**: 5 story points

---

**US-8.10: Performance Optimization**

- **As a** user
- **I want** the app to load and run fast
- **So that** I have a smooth experience

**Acceptance Criteria**:

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Bundle size optimized
- [ ] Images optimized

**Tasks**:

- Run Lighthouse audit
- Optimize bundle size (code splitting, tree shaking)
- Optimize images (next/image)
- Lazy load components
- Analyze and fix performance bottlenecks

**Effort**: 5 story points

---

### Sprint 9: Reading Recommendations & Enhanced Data Entry

**Goal**: Implement reading order recommendations, progress tracking, and ISBN integration
**Duration**: 2 weeks

#### User Stories

**US-9.1: Add Book by ISBN Code**

- **As a** user
- **I want** to add books to my collection using ISBN codes
- **So that** I can quickly add books without manually entering all details

**Acceptance Criteria**:

- [ ] Option to add book via ISBN on the add book page
- [ ] Manual ISBN input field with validation (ISBN-10 or ISBN-13)
- [ ] Camera/barcode scanner option to scan ISBN barcode
- [ ] Camera permission request handling
- [ ] Barcode detection and ISBN extraction
- [ ] Fetch book metadata from ISBN lookup API (e.g., Google Books API, Open Library API)
- [ ] Pre-fill book form with fetched data (title, author, publisher, year, cover image, etc.)
- [ ] Allow user to review and edit fetched data before saving
- [ ] Fallback to manual entry if ISBN lookup fails
- [ ] Success/error messages for ISBN lookup
- [ ] Works on both mobile and desktop (camera on mobile, webcam on desktop)
- [ ] Loading state during API fetch
- [ ] Handle missing or incomplete data from API

**Tasks**:

- Research and select ISBN lookup API (Google Books API, Open Library API)
- Create ISBN validation utility (support both ISBN-10 and ISBN-13)
- Build manual ISBN input component
- Implement barcode scanner component (using library like `html5-qrcode` or `quagga2`)
- Request and handle camera permissions
- Create API route to fetch book data by ISBN
- Integrate with chosen ISBN lookup service
- Map API response to book form fields
- Update AddBookForm to support ISBN entry mode
- Add toggle between manual entry and ISBN entry
- Handle API errors and rate limits
- Add loading indicators
- Test on multiple devices (mobile, tablet, desktop)
- Test with various ISBN formats
- Document ISBN feature usage

**Effort**: 13 story points

---

**US-9.2: Parse and Store Reading Order Recommendations**

- **As a** user
- **I want** the app to understand the reading order recommendations from my markdown files
- **So that** I can get personalized recommendations based on what's in my collection

**Acceptance Criteria**:

- [ ] Parser utility created to read and parse `COMIC_READING_ORDER.md` and `MANGA_READING_ORDER.md`
- [ ] Extract structured data from markdown (phases, story arcs, series, reading paths)
- [ ] Parse volume numbers, issue numbers, and series names
- [ ] Create database models to store parsed recommendations
- [ ] API endpoint to fetch recommendations by collection type (COMIC, MANGA, GRAPHIC_NOVEL)
- [ ] Handle markdown parsing errors gracefully
- [ ] Cache parsed data for performance
- [ ] Update recommendations when markdown files change

**Tasks**:

- Create markdown parser utility using regex or markdown parsing library
- Define recommendation data structure (phases, arcs, paths)
- Create Prisma models: `ReadingRecommendation`, `ReadingPath`, `ReadingPhase`
- Write parser logic to extract phases, series, and reading order
- Create API route `/api/recommendations/parse` to trigger parsing
- Store parsed recommendations in database
- Create API route `/api/recommendations` to fetch recommendations
- Add caching layer (in-memory or Redis if needed)
- Write unit tests for parser
- Document recommendation data structure

**Effort**: 8 story points

---

**US-9.3: Create Reading Progress Tracking Model**

- **As a** user
- **I want** to track which books/comics I've read
- **So that** I can see my progress through my collection

**Acceptance Criteria**:

- [ ] Database model created for reading progress
- [ ] Track read/unread status per item
- [ ] Track reading start date and completion date
- [ ] Track chosen reading path (e.g., "Character-Focused", "Publisher-Focused")
- [ ] Track current phase/milestone in chosen path
- [ ] API endpoints for marking items as read/unread
- [ ] API endpoint to fetch user's reading progress
- [ ] Support updating reading dates
- [ ] Cascade delete when item is deleted

**Tasks**:

- Create `ReadingProgress` Prisma model
- Add fields: itemId, isRead, startedAt, completedAt, readingPath, currentPhase
- Add indexes for performance (itemId, isRead)
- Create API route POST `/api/reading-progress` to create/update progress
- Create API route GET `/api/reading-progress` to fetch all progress
- Create API route GET `/api/reading-progress/:itemId` to fetch item progress
- Create API route DELETE `/api/reading-progress/:itemId` to delete progress
- Run Prisma migration
- Write API tests
- Document reading progress API

**Effort**: 5 story points

---

**US-9.4: Build Recommendations Page**

- **As a** user
- **I want** to see personalized reading recommendations
- **So that** I know what to read next from my collection

**Acceptance Criteria**:

- [ ] Recommendations page at `/recommendations`
- [ ] Filter by collection type (Comics, Manga, Graphic Novels)
- [ ] Display available reading paths (Character-Focused, Publisher-Focused, etc.)
- [ ] Show current phase/milestone for chosen path
- [ ] Display "What to Read Next" section based on progress
- [ ] Show reading path progress (e.g., "Phase 2: 5/10 books read")
- [ ] List all phases with completion status
- [ ] Click on phase to see books in that phase from user's collection
- [ ] Highlight books user owns vs. books mentioned in guide
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states while fetching recommendations
- [ ] Empty state when no recommendations available

**Tasks**:

- Create recommendations page `/app/recommendations/page.tsx`
- Fetch recommendations from API
- Match recommendations against user's collection
- Build collection type filter component
- Create reading path selector component
- Build phase progress display component
- Create "What to Read Next" recommendation component
- Implement phase detail view
- Add visual indicators for owned vs. missing items
- Style with Tailwind and shadcn/ui components
- Test on mobile, tablet, desktop
- Add loading skeletons
- Create empty state component

**Effort**: 13 story points

---

**US-9.5: Add Read/Unread Toggle to Book Items**

- **As a** user
- **I want** to mark books as read or unread
- **So that** I can track what I've finished reading

**Acceptance Criteria**:

- [ ] "Mark as Read/Unread" toggle in item detail modal
- [ ] Visual indicator on item cards showing read status (checkmark badge)
- [ ] Filter option "Not Yet Read" on collection pages
- [ ] Reading status updates immediately (optimistic UI)
- [ ] Success toast notification when status changes
- [ ] Automatically set completion date when marked as read
- [ ] Clear completion date when marked as unread
- [ ] Works for books, comics, manga, and graphic novels
- [ ] Read status persists across sessions
- [ ] Show read count in collection header (e.g., "45 of 250 read")

**Tasks**:

- Add read/unread toggle to ItemDetailModal component
- Create checkbox or switch component for read status
- Add visual indicator (badge) to CollectionGrid item cards
- Add visual indicator to CollectionList items
- Update FilterSidebar to include "Reading Status" filter
- Integrate with reading progress API
- Add optimistic update using TanStack Query
- Show read count in collection page header
- Add success toast notifications
- Update queries to refetch after status change
- Test toggle functionality
- Test filter functionality
- Style for dark mode

**Effort**: 8 story points

---

**US-9.6: Display Collection Insights and Series Completion**

- **As a** user
- **I want** to see insights about my collection
- **So that** I know which series are complete and what's missing

**Acceptance Criteria**:

- [ ] Collection insights section on recommendations page
- [ ] Identify complete series (e.g., "Card Captor Sakura: 25/25 volumes")
- [ ] Identify incomplete series with missing volumes
- [ ] Show percentage completion for each series
- [ ] List "Complete Series" achievements
- [ ] Show gaps in story arcs from recommendation guides
- [ ] Display reading statistics (total read, total unread, reading velocity)
- [ ] Show recently completed items
- [ ] Recommend next items to complete series
- [ ] Responsive cards/grid layout
- [ ] Beautiful data visualization (progress bars, charts)

**Tasks**:

- Create collection insights API endpoint
- Implement series detection logic (group by series field)
- Calculate completion percentage per series
- Identify missing volumes in sequences
- Create insights component for recommendations page
- Build complete series list component
- Build incomplete series component with missing volumes
- Create reading statistics cards
- Add recently completed items widget
- Implement progress bars for series completion
- Consider using chart library (recharts or similar) for visualizations
- Style with shadcn/ui Card and Progress components
- Test with various collection sizes
- Add loading states

**Effort**: 13 story points

---

### Sprint 10: Enhanced Data Entry for Music & Videogames

**Goal**: Implement automated data lookup for music and videogame collections
**Duration**: 2 weeks

#### User Stories

**US-10.1: Add Music by Title or Barcode using Discogs API**

- **As a** user
- **I want** to add music albums to my collection by searching title or scanning barcode
- **So that** I can quickly add albums without manually entering all details

**Acceptance Criteria**:

- [ ] Option to add music via search on the add music page
- [ ] Title search input field with live search results
- [ ] Barcode scanner option to scan album barcode
- [ ] Camera permission request handling
- [ ] Barcode detection and extraction
- [ ] Fetch album metadata from Discogs API (title, artist, year, label, format, cover image, etc.)
- [ ] Display search results with cover images and basic info
- [ ] Pre-fill music form with selected album data
- [ ] Allow user to review and edit fetched data before saving
- [ ] Fallback to manual entry if lookup fails
- [ ] Success/error messages for search/lookup
- [ ] Works on both mobile and desktop (camera on mobile, webcam on desktop)
- [ ] Loading state during API fetch
- [ ] Handle missing or incomplete data from API
- [ ] Handle Discogs API rate limits
- [ ] Support both vinyl and CD formats

**Tasks**:

- Research Discogs API authentication and endpoints
- Create Discogs API integration utility
- Create barcode validation utility (support UPC/EAN barcodes)
- Build title search component with autocomplete
- Implement barcode scanner component (reuse from ISBN implementation)
- Request and handle camera permissions
- Create API route to search Discogs by title
- Create API route to fetch album data by barcode
- Map Discogs API response to music form fields
- Update AddMusicForm to support search/barcode entry mode
- Add toggle between manual entry and search entry
- Handle API errors and rate limits with retry logic
- Add loading indicators and search result previews
- Test with various albums and formats
- Test on multiple devices (mobile, tablet, desktop)
- Document Discogs API integration

**Effort**: 13 story points

---

**US-10.2: Add Videogame by Title using RAWG API**

- **As a** user
- **I want** to add videogames to my collection by searching title
- **So that** I can quickly add games without manually entering all details

**Acceptance Criteria**:

- [ ] Option to add game via search on the add videogame page
- [ ] Title search input field with live search results
- [ ] Fetch game metadata from RAWG API (title, release date, platforms, genres, publishers, cover image, etc.)
- [ ] Display search results with cover images and basic info
- [ ] Filter results by platform
- [ ] Pre-fill videogame form with selected game data
- [ ] Allow user to review and edit fetched data before saving
- [ ] Map RAWG platforms to user's platform list
- [ ] Fallback to manual entry if lookup fails
- [ ] Success/error messages for search
- [ ] Loading state during API fetch
- [ ] Handle missing or incomplete data from API
- [ ] Handle RAWG API rate limits
- [ ] Support multiple platforms per game

**Tasks**:

- Research RAWG API authentication and endpoints
- Create RAWG API integration utility
- Build title search component with autocomplete
- Create API route to search RAWG by title
- Create API route to fetch game details by ID
- Map RAWG API response to videogame form fields
- Implement platform mapping logic (RAWG platforms → user platforms)
- Update AddVideogameForm to support search entry mode
- Add toggle between manual entry and search entry
- Handle API errors and rate limits with retry logic
- Add loading indicators and search result previews
- Display game metadata (release date, genres, platforms, etc.)
- Test with various games and platforms
- Test on multiple devices (mobile, tablet, desktop)
- Document RAWG API integration

**Effort**: 13 story points

---

## Sprint Summary

| Sprint    | Duration | Story Points | Focus                          |
| --------- | -------- | ------------ | ------------------------------ |
| Sprint 0  | 3-5 days | 5            | Project Setup                  |
| Sprint 1  | 2 weeks  | 24           | Database & Data Migration      |
| Sprint 2  | 2 weeks  | 22           | Core UI & Layout               |
| Sprint 3  | 2 weeks  | 31           | Collection Views               |
| Sprint 4  | 2 weeks  | 31           | CRUD Operations                |
| Sprint 5  | 2 weeks  | 36           | Search & Filtering             |
| Sprint 6  | 2 weeks  | 37           | Import & Export                |
| Sprint 7  | 2 weeks  | 36           | Backup & Restore               |
| Sprint 8  | 2 weeks  | 39           | Polish & Optimization          |
| Sprint 9  | 2 weeks  | 60           | Reading Recommendations & ISBN |
| Sprint 10 | 2 weeks  | 26           | Music & Videogame Data Lookup  |

**Total**: ~11 sprints, ~21 weeks (5 months)
**Total Story Points**: 347

---

## Definition of Done

A user story is considered "Done" when:

- [ ] All acceptance criteria are met
- [ ] Code is written and committed
- [ ] Code follows project conventions
- [ ] TypeScript types are properly defined
- [ ] Component is responsive (mobile/tablet/desktop)
- [ ] Dark mode styling is implemented
- [ ] Error handling is implemented
- [ ] Loading states are implemented
- [ ] Manual testing completed
- [ ] No console errors or warnings
- [ ] Code reviewed (self-review or peer review)
- [ ] Documentation updated (if needed)

---

## Sprint Ceremonies

### Sprint Planning (Start of each sprint)

- Review and prioritize user stories
- Estimate story points
- Commit to sprint goal and stories
- Break down stories into tasks

### Daily Standup (Optional for solo project)

- What did I accomplish yesterday?
- What will I work on today?
- Any blockers?

### Sprint Review (End of each sprint)

- Demo completed features
- Review sprint goal achievement
- Gather feedback

### Sprint Retrospective (End of each sprint)

- What went well?
- What could be improved?
- Action items for next sprint

---

## Notes

- Story points are estimates (1 point ≈ 2-4 hours)
- Sprints can be adjusted based on velocity
- Some stories may be split or combined during development
- Additional stories may be added to backlog as needed
