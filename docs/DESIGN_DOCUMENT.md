# The Collector - Design Document

## 1. Project Overview

### 1.1 Vision
The Collector is a modern, responsive web application for managing personal collections of video games, music (vinyl/CDs), and books (manga, comics, and other books). It provides an elegant interface for cataloging, browsing, and managing collection data with robust import/export capabilities and cloud backup features.

### 1.2 Goals
- Create a beautiful, intuitive interface for collection management
- Support multiple collection types with type-specific metadata
- Enable easy data import from existing CSV files
- Provide flexible export and backup capabilities
- Ensure responsive design for mobile, tablet, and desktop
- Maintain fast performance with local SQLite database

### 1.3 Non-Goals
- Multi-user authentication (single-user application)
- Social features or sharing capabilities
- E-commerce integration for buying/selling
- Mobile native apps (web-responsive only)

## 2. Technical Architecture

### 2.1 Technology Stack

#### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

#### Backend
- **API**: Next.js API Routes (Server Actions)
- **Database**: SQLite
- **ORM**: Prisma
- **File Processing**: PapaParse (CSV handling)

#### Cloud Services
- **Backup Storage**: AWS S3 / Cloudflare R2 / Dropbox (configurable)
- **Image URLs**: External CDN links (stored as strings)

### 2.2 Database Schema

```prisma
// Collection Types
enum CollectionType {
  VIDEOGAME
  MUSIC
  BOOK
}

// Book subtypes
enum BookType {
  MANGA
  COMIC
  GRAPHIC_NOVEL
  OTHER
}

// Base Item Model (shared fields)
model Item {
  id                  String          @id @default(cuid())
  collectionType      CollectionType
  title               String
  year                Int?
  language            String?
  country             String?
  copies              Int             @default(1)
  description         String?
  coverUrl            String?
  price               Float?
  tags                String[]        // JSON array
  customFields        Json?           // Flexible JSON for type-specific data

  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  // Relationships
  videogame           Videogame?
  music               Music?
  book                Book?

  @@index([collectionType])
  @@index([title])
}

// Video Game specific fields
model Videogame {
  id                  String          @id @default(cuid())
  itemId              String          @unique
  item                Item            @relation(fields: [itemId], references: [id], onDelete: Cascade)

  platform            String
  publisher           String?
  developer           String?
  region              String?
  edition             String?
  genres              String[]
  metacriticScore     Int?
}

// Music specific fields (vinyl/CD)
model Music {
  id                  String          @id @default(cuid())
  itemId              String          @unique
  item                Item            @relation(fields: [itemId], references: [id], onDelete: Cascade)

  artist              String
  publisher           String?
  format              String          // CD, Vinyl, etc.
  discCount           String?
  genres              String[]
  tracklist           String?
}

// Book specific fields (manga, comics, etc.)
model Book {
  id                  String          @id @default(cuid())
  itemId              String          @unique
  item                Item            @relation(fields: [itemId], references: [id], onDelete: Cascade)

  type                BookType
  author              String
  volume              String?
  series              String?
  publisher           String?
  coverType           String?
  genres              String[]
}

// Backup tracking
model Backup {
  id                  String          @id @default(cuid())
  filename            String
  size                Int             // bytes
  itemCount           Int
  location            String          // local path or cloud URL
  type                String          // 'manual', 'scheduled', 'csv_export'
  createdAt           DateTime        @default(now())
}

// App settings
model Settings {
  id                  String          @id @default(cuid())
  key                 String          @unique
  value               Json
  updatedAt           DateTime        @updatedAt
}
```

### 2.3 Application Structure

```
the-collector/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth-related pages (future)
│   │   ├── api/               # API routes
│   │   │   ├── items/
│   │   │   ├── import/
│   │   │   ├── export/
│   │   │   └── backup/
│   │   ├── dashboard/         # Main dashboard
│   │   ├── videogames/        # Video games collection
│   │   ├── music/             # Music collection
│   │   ├── books/             # Books collection
│   │   ├── settings/          # App settings
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   ├── collections/      # Collection-specific components
│   │   ├── forms/            # Form components
│   │   └── shared/           # Shared components
│   ├── lib/                   # Utilities
│   │   ├── db.ts             # Prisma client
│   │   ├── utils.ts          # Helper functions
│   │   ├── validators.ts     # Zod schemas
│   │   └── csv-parser.ts     # CSV processing
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand stores
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── images/
├── original-data/             # Original CSV files
├── backups/                   # Local backup storage
└── package.json
```

## 3. User Interface Design

### 3.1 Design System

#### Color Palette
- **Primary**: Indigo/Blue (modern, trustworthy)
- **Secondary**: Amber/Gold (highlights, accents)
- **Neutral**: Slate grays (backgrounds, text)
- **Success**: Green
- **Warning**: Yellow
- **Error**: Red

#### Typography
- **Headings**: Inter or Poppins (bold, modern)
- **Body**: Inter or System UI (readable)
- **Mono**: JetBrains Mono (code, IDs)

#### Spacing
- 4px base unit
- Consistent padding/margins using Tailwind spacing scale

### 3.2 Key Pages & Layouts

#### Dashboard (/)
- **Header**: Navigation, search bar, theme toggle
- **Stats Cards**: Total items, by collection type, recent additions
- **Quick Actions**: Import CSV, Add Item, Create Backup
- **Recent Items**: Latest 20 items across all collections
- **Collection Overview**: Cards for each collection type with counts

#### Collection Pages (/videogames, /music, /books)
- **Filter Sidebar** (collapsible on mobile):
  - Search box
  - Genre filters
  - Year range
  - Platform/Format filters
  - Publisher/Developer/Author filters
- **Main Content**:
  - View toggle (Grid/List/Table)
  - Sort dropdown (Title, Year, Genre, Date Added)
  - Items grid/list with lazy loading
  - Pagination or infinite scroll

#### Item Detail Modal/Page
- Large cover image
- All metadata fields
- Edit button
- Delete button (with confirmation)
- Related items (same series/author/platform)

#### Import Page (/import)
- CSV file upload
- Column mapping interface
- Preview table
- Validation results
- Import confirmation

#### Settings Page (/settings)
- **General**: App preferences, theme
- **Backup**: Configure cloud storage, backup schedule
- **Export**: Download options (CSV, JSON)
- **About**: Version info, data stats

### 3.3 Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### 3.4 Dark Mode
- Full dark mode support using CSS variables
- Toggle in header
- Persisted in localStorage

## 4. Core Features

### 4.1 Collection Management

#### Browse Collections
- Grid view with cover images
- List view with detailed info
- Table view for data-dense display
- Sorting and filtering
- Search across all fields
- Pagination (50 items per page default)

#### Add/Edit Items
- Type-specific forms (Videogame, Music, Book)
- Field validation
- Auto-save drafts (localStorage)
- Cover URL validation
- Duplicate detection

#### Delete Items
- Soft delete with confirmation
- Bulk delete selection

### 4.2 Data Import/Export

#### CSV Import
- Upload CSV file
- Auto-detect column mapping
- Manual column mapping UI
- Preview before import
- Validation with error reporting
- Partial import (skip errors)
- Progress indicator

#### CSV Export
- Export entire collection or filtered subset
- Choose fields to include
- Maintain original CSV format compatibility

#### JSON Export
- Full database dump
- Collection-specific exports

### 4.3 Backup System

#### Local Backups
- Copy SQLite database file
- Store in `/backups` directory
- Timestamped filenames
- Keep last N backups (configurable)

#### Cloud Backups
- Upload to S3/R2/Dropbox
- Manual trigger
- Scheduled automatic backups (configurable interval)
- Backup history with download links
- Restore from backup

#### Backup Management
- List all backups (local + cloud)
- Download backup files
- Restore from backup (with confirmation)
- Delete old backups

### 4.4 Search & Filter

#### Global Search
- Search across all collections
- Search fields: title, author/artist/developer, description
- Instant results
- Filter by collection type

#### Advanced Filters
- Multi-select genres
- Year range slider
- Platform/Format checkboxes
- Publisher/Developer/Author dropdown
- Custom field filters

### 4.5 Statistics & Analytics

#### Dashboard Stats
- Total items count
- Items by collection type
- Items by genre (top 10)
- Items by year (chart)
- Recent additions (last 30 days)
- Collection value (if prices available)

#### Collection Stats
- Type-specific statistics
- Genre distribution
- Publisher/Developer breakdown
- Platform distribution (games)
- Format distribution (music)

## 5. Data Migration

### 5.1 Initial CSV Import
- Import all three CSV files
- Map columns to database fields
- Handle different column names
- Preserve all original data
- Generate unique IDs

### 5.2 Data Mapping

#### Books CSV → Database
```
id → id (preserve if unique)
type → book.type
title → item.title
author → book.author
volume → book.volume
series → book.series
publisher → book.publisher
year → item.year
language → item.language
country → item.country
copies → item.copies
cover_type → book.coverType
genre → book.genres (parse comma-separated)
description → item.description
cover_url → item.coverUrl
price → item.price
```

#### Music CSV → Database
```
ID → id
Title → item.title
Artist → music.artist
Publisher → music.publisher
Year → item.year
Format → music.format
Disc Count → music.discCount
Language → item.language
Copies → item.copies
Genres → music.genres (parse comma-separated)
Description → item.description
Tracklist → music.tracklist
Price Estimate → item.price
Cover URL → item.coverUrl
```

#### Videogames CSV → Database
```
ID → id
Platform → videogame.platform
Title → item.title
Publisher → videogame.publisher
Developer → videogame.developer
Year → item.year
Region → videogame.region
Edition → videogame.edition
Language → item.language
Copies → item.copies
Genres → videogame.genres (parse comma-separated)
Description → item.description
Metacritic Score → videogame.metacriticScore
Price Estimate → item.price
Cover URL → item.coverUrl
```

## 6. Performance Considerations

### 6.1 Optimization Strategies
- **Image Loading**: Lazy loading, blur placeholders
- **Virtual Scrolling**: For large lists (1000+ items)
- **Database Indexing**: On frequently queried fields
- **Query Caching**: React Query with stale-while-revalidate
- **Bundle Optimization**: Code splitting, tree shaking
- **Server Components**: Use Next.js Server Components where possible

### 6.2 Performance Targets
- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3.5s
- Collection page load: < 500ms
- Search results: < 200ms

## 7. Security & Privacy

### 7.1 Data Security
- Local-first architecture (data stays on your machine)
- Optional encrypted cloud backups
- No telemetry or analytics tracking

### 7.2 Input Validation
- Zod schemas for all forms
- SQL injection prevention (Prisma ORM)
- XSS prevention (React escaping)
- File upload validation (CSV only, size limits)

## 8. Testing Strategy

### 8.1 Unit Tests
- Utility functions
- Data validation
- CSV parsing logic

### 8.2 Integration Tests
- API routes
- Database operations
- Import/Export flows

### 8.3 E2E Tests
- Critical user flows
- Add/Edit/Delete items
- Import CSV
- Backup/Restore

## 9. Deployment

### 9.1 Local Development
```bash
npm install
npm run dev
```

### 9.2 Production Build
```bash
npm run build
npm start
```

### 9.3 Hosting Options
- **Local**: Serve on localhost
- **Network**: Serve on local network for other devices
- **VPS**: Deploy to personal server
- **Static Export**: Next.js static export (with API limitations)

## 10. Future Enhancements (Post-MVP)

### Phase 2
- Wishlist functionality
- Lending tracker (who borrowed what)
- Price tracking over time
- Import from external APIs (IGDB, Google Books, Discogs)
- Barcode scanner integration

### Phase 3
- Multi-user support with authentication
- Collaborative collections
- Public collection sharing
- Collection comparison tools
- Advanced analytics and reports

### Phase 4
- Mobile apps (React Native)
- Offline-first PWA
- Real-time sync across devices
- AI-powered recommendations
- Automatic duplicate detection and merging

## 11. Success Metrics

### MVP Success Criteria
- Successfully import all existing CSV data
- Browse all collections with filtering
- Add/Edit/Delete items with validation
- Export data to CSV/JSON
- Create and restore backups
- Responsive design works on mobile/tablet/desktop
- Dark mode fully functional

### Performance Metrics
- Page load times meet targets
- Smooth scrolling with 1000+ items
- Search results in < 200ms

### User Experience Metrics
- Intuitive navigation (no tutorial needed)
- Error messages are clear and actionable
- Forms validate in real-time
- Visual feedback for all actions