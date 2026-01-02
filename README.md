# The Collector

A modern web application for managing personal collections of video games, music (vinyl/CDs), and books (manga, comics, and other books).

##Important!

Want to run your own instance? See the complete [Self-Hosting Guide](docs/SELF_HOSTING.md) for step-by-step instructions.

## Features

### Core Features

- **Multiple Collections**: Manage video games, music, and books in one unified application
- **Local-first**: SQLite database for development, PostgreSQL for production
- **CSV Import/Export**: Bulk import and export collection data
- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### Collection Management

- **Video Games**: Track platform, publisher, developer, region, edition, genres, and Metacritic scores
- **Music**: Manage artist, format (vinyl/CD), disc count, genres, and tracklists
- **Books/Manga/Comics**: Catalog author, type, volume, series, publisher, and genres

### External Data Integration

- **RAWG API**: Auto-populate videogame metadata (platform, publisher, developer, genres, ratings)
- **Discogs API**: Lookup and auto-fill music album metadata
- **Google Image Search**: Find cover images for your collection items
- **ISBN Lookup**: Fetch book metadata via ISBN

### Reading Progress & Tracking

- **Read/Unread Status**: Mark books, comics, and manga as read or unread
- **Progress Tracking**: Track reading progress with start and completion dates
- **Reading Paths**: Create reading paths for series with different approaches
- **Series Completion**: Track progress across multi-volume series
- **Recently Completed**: View recently finished items

### Search & Discovery

- **Case-Insensitive Search**: Search across all collections with persistent query state
- **Advanced Filtering**: Filter by type, genre, status, and more
- **Sorting Options**: Sort by title, year, date added, and other fields
- **Collection Statistics**: View insights about your collections

### Authentication & Admin

- **GitHub OAuth**: Secure authentication via GitHub
- **User Management**: Admin dashboard with user allowlist
- **Role-Based Access**: Admin and User roles with appropriate permissions

### Backup & Export

- **Cloud Backup**: Support for AWS S3, Dropbox, and Cloudflare R2
- **CSV Export**: Export collections to CSV format
- **JSON Export**: Full data backup in JSON format
- **Scheduled Backups**: Automated backup scheduling

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: SQLite (development) / PostgreSQL (production) with Prisma ORM
- **State Management**: Zustand, TanStack Query
- **Forms**: React Hook Form, Zod validation
- **Authentication**: NextAuth.js v5 with GitHub OAuth

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- GitHub OAuth App (for authentication)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/otro34/the-collector.git
cd the-collector
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
AUTH_SECRET="your-auth-secret"  # Generate: openssl rand -base64 32
AUTH_GITHUB_ID="your-github-oauth-app-id"
AUTH_GITHUB_SECRET="your-github-oauth-app-secret"

# External APIs (optional)
GOOGLE_API_KEY="your-google-api-key"
GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id"
DISCOGS_TOKEN="your-discogs-token"
RAWG_API_KEY="your-rawg-api-key"
```

4. Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with CSV data (optional)
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable                  | Required | Description                          |
| ------------------------- | -------- | ------------------------------------ |
| `DATABASE_URL`            | Yes      | Database connection string           |
| `AUTH_SECRET`             | Yes      | NextAuth secret key                  |
| `AUTH_GITHUB_ID`          | Yes      | GitHub OAuth App Client ID           |
| `AUTH_GITHUB_SECRET`      | Yes      | GitHub OAuth App Client Secret       |
| `GOOGLE_API_KEY`          | No       | Google Custom Search API key         |
| `GOOGLE_SEARCH_ENGINE_ID` | No       | Google Programmable Search Engine ID |
| `DISCOGS_TOKEN`           | No       | Discogs API token for music lookup   |
| `RAWG_API_KEY`            | No       | RAWG API key for videogame lookup    |

## Database Scripts

### Seeding the Database

The seed script can clear the database and repopulate it with data from CSV files:

```bash
# Clear database and reimport all CSV data
npm run db:seed

# Clear database only, don't import CSV data
SEED_SKIP_IMPORT=true npm run db:seed

# Import CSV data only, don't clear database
SEED_IMPORT_ONLY=true npm run db:seed
```

### Importing CSV Data

The import script imports collection data from CSV files in the `original-data/` directory:

```bash
npm run db:import
```

The script will:

- Parse and validate CSV data
- Import valid rows to the database
- Generate error reports for invalid data (saved to `logs/`)
- Create import reports (saved to `logs/`)

**Expected CSV files:**

- `original-data/videogames_catalog.csv`
- `original-data/music_catalog.csv`
- `original-data/books_manga_comics_catalog.csv`

### Other Database Commands

```bash
npm run db:generate      # Generate Prisma client (after schema changes)
npm run db:push          # Push schema changes to database (development)
npm run db:migrate       # Create and run migrations
npm run db:migrate:deploy # Deploy migrations (production)
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:test          # Test database connection
```

## Development Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking

# Testing
npm test                 # Run tests
```

## Project Structure

```
the-collector/
├── docs/                       # Documentation
│   ├── CLAUDE.md              # AI development guide
│   ├── DESIGN_DOCUMENT.md     # Technical design
│   ├── USER_STORIES.md        # Sprint planning
│   ├── PROJECT_TRACKER.md     # Progress tracking
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── AUTHENTICATION_SETUP.md # Auth setup guide
│   └── development-flow.md    # Git workflow
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── admin/            # Admin dashboard
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── books/            # Books collection
│   │   ├── dashboard/        # Main dashboard
│   │   ├── help/             # Help page
│   │   ├── import/           # CSV import interface
│   │   ├── music/            # Music collection
│   │   ├── recommendations/  # Reading recommendations
│   │   ├── settings/         # Application settings
│   │   └── videogames/       # Videogames collection
│   ├── components/            # React components
│   │   ├── admin/            # Admin components
│   │   ├── books/            # Book-specific components
│   │   ├── collections/      # Shared collection components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── forms/            # Form components
│   │   ├── import/           # Import interface
│   │   ├── items/            # Item display/edit
│   │   ├── layout/           # Layout components
│   │   ├── music/            # Music-specific components
│   │   ├── providers/        # Context providers
│   │   ├── recommendations/  # Recommendations components
│   │   ├── shared/           # Shared utilities
│   │   ├── ui/               # shadcn/ui components
│   │   └── videogame/        # Videogame-specific components
│   ├── lib/                   # Utilities and helpers
│   │   ├── db.ts             # Prisma client
│   │   ├── db-utils.ts       # CRUD operations
│   │   ├── db-errors.ts      # Error handling
│   │   ├── csv-parser.ts     # CSV parsing
│   │   ├── discogs.ts        # Discogs API client
│   │   ├── rawg.ts           # RAWG API client
│   │   ├── isbn.ts           # ISBN lookup
│   │   ├── backup-scheduler.ts # Backup scheduling
│   │   └── cloud-storage.ts  # Cloud storage
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand stores
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed script
├── scripts/
│   ├── import-csv.ts          # CSV import script
│   ├── seed-recommendations.ts # Recommendations seeder
│   └── test-db.ts             # Database test script
├── original-data/             # Original CSV files (DO NOT MODIFY)
├── logs/                      # Import logs and error reports
└── backups/                   # Local database backups
```

## Database Schema

The application uses the following main tables:

- **User**: User accounts with role-based access (ADMIN, USER)
- **Item**: Base table for all collection items (title, description, cover URL, etc.)
- **Videogame**: Video game specific data (platform, publisher, developer, etc.)
- **Music**: Music specific data (artist, format, disc count, etc.)
- **Book**: Book specific data (author, series, volume, type, etc.)
- **ReadingProgress**: Track reading status and progress for books
- **Backup**: Backup metadata
- **Settings**: Application settings

See `prisma/schema.prisma` for the complete schema definition.

## CSV Import Format

### Videogames CSV

Required columns: `Title`, `Platform`

Optional columns: `Description`, `Cover URL`, `Year`, `Language`, `Publisher`, `Developer`, `Region`, `Edition`, `Genres`, `Metacritic Score`, `Copies`, `Price Estimate`

### Music CSV

Required columns: `Title`, `Artist`, `Format`

Optional columns: `Description`, `Cover URL`, `Year`, `Language`, `Publisher`, `Disc Count`, `Genres`, `Tracklist`, `Copies`, `Price Estimate`

### Books CSV

Required columns: `Title`, `Author`

Optional columns: `Description`, `Cover URL`, `Year`, `Language`, `Country`, `Type`, `Volume`, `Series`, `Publisher`, `Cover Type`, `Genres`, `Copies`, `Price Estimate`

## Deployment

For production deployment, see `docs/DEPLOYMENT.md`. The application supports:

- **Vercel** (recommended)
- **Railway**
- **Docker**
- Any Node.js hosting platform

For production, switch the database provider in `prisma/schema.prisma` from `sqlite` to `postgresql`.

### Self-Hosting

Want to run your own instance? See the complete [Self-Hosting Guide](docs/SELF_HOSTING.md) for step-by-step instructions on:

- Forking the repository
- Setting up a PostgreSQL database
- Configuring GitHub OAuth authentication
- Deploying to Vercel
- Setting up external APIs (RAWG, Discogs, Google Search)

## Contributing

This is a personal project. If you'd like to contribute or report issues, please see the [repository issues](https://github.com/otro34/the-collector/issues).

## License

ISC

## Development Status

The project is actively developed with the following completed sprints:

- Sprint 0: Project Setup
- Sprint 1: Database & Data Migration
- Sprint 2: Core UI Components
- Sprint 3: Collection Views
- Sprint 4: Item Management
- Sprint 5: Search & Filtering
- Sprint 6: Authentication
- Sprint 7: Admin Dashboard
- Sprint 8: Cloud Backup
- Sprint 9: Reading Progress & Tracking
- Sprint 10: External API Integration (RAWG, Discogs)

See `docs/PROJECT_TRACKER.md` for detailed progress.

## Credits

Built with help of [Claude Code](https://claude.com/claude-code) and a responsible human.
