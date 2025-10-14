# The Collector

A modern web application for managing personal collections of video games, music (vinyl/CDs), and books (manga, comics, and other books).

## Features

- **Local-first**: SQLite database with no cloud dependencies required
- **Multiple Collections**: Manage video games, music, and books in one place
- **CSV Import**: Import existing collection data from CSV files
- **Modern UI**: Built with Next.js, TypeScript, and Tailwind CSS
- **Dark Mode**: Full dark mode support with next-themes
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: SQLite with Prisma ORM
- **State Management**: Zustand, TanStack Query
- **Forms**: React Hook Form, Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

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

3. Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with CSV data (optional)
npm run db:seed
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Scripts

### Seeding the Database

The seed script (`prisma/seed.ts`) can clear the database and repopulate it with data from CSV files. This is useful during development to reset the database to a known state.

```bash
# Clear database and reimport all CSV data
npm run db:seed

# Or use Prisma CLI directly
npx prisma db seed
```

**Environment Variables:**

- `SEED_SKIP_IMPORT=true` - Clear database only, don't import CSV data
- `SEED_IMPORT_ONLY=true` - Import CSV data only, don't clear database

**Examples:**

```bash
# Clear database without reimporting
SEED_SKIP_IMPORT=true npm run db:seed

# Import CSV data without clearing (add to existing data)
SEED_IMPORT_ONLY=true npm run db:seed
```

### Importing CSV Data

The import script (`scripts/import-csv.ts`) imports collection data from CSV files in the `original-data/` directory.

```bash
# Import all CSV files (videogames, music, books)
npm run db:import
```

The script will:

- Parse and validate CSV data
- Import valid rows to the database
- Generate error reports for invalid data (saved to `logs/`)
- Create import reports (saved to `logs/`)
- Display detailed statistics

**Expected CSV files:**

- `original-data/videogames_catalog.csv`
- `original-data/music_catalog.csv`
- `original-data/books_manga_comics_catalog.csv`

### Other Database Commands

```bash
# Generate Prisma client (after schema changes)
npm run db:generate

# Push schema changes to database (for development)
npm run db:push

# Create and run migrations (for production)
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Test database connection
npm run db:test
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

# Testing (coming in future sprints)
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
│   └── development-flow.md    # Git workflow
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                   # Utilities and helpers
│   │   ├── db.ts             # Prisma client
│   │   ├── db-utils.ts       # CRUD operations
│   │   ├── db-errors.ts      # Error handling
│   │   └── csv-parser.ts     # CSV parsing
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
│   └── test-db.ts             # Database test script
├── original-data/             # Original CSV files (DO NOT MODIFY)
├── logs/                      # Import logs and error reports
└── backups/                   # Local database backups
```

## Database Schema

The application uses SQLite with the following main tables:

- **Item**: Base table for all collection items (title, description, cover URL, etc.)
- **Videogame**: Video game specific data (platform, publisher, developer, etc.)
- **Music**: Music specific data (artist, format, disc count, etc.)
- **Book**: Book specific data (author, series, volume, type, etc.)
- **Backup**: Backup metadata
- **Settings**: Application settings

See `prisma/schema.prisma` for the complete schema definition.

## CSV Import Format

The import script expects CSV files with specific column headers. The parser will auto-detect column mappings and validate data.

### Videogames CSV

Required columns: `Title`, `Platform`

Optional columns: `Description`, `Cover URL`, `Year`, `Language`, `Publisher`, `Developer`, `Region`, `Edition`, `Genres`, `Metacritic Score`, `Copies`, `Price Estimate`

### Music CSV

Required columns: `Title`, `Artist`, `Format`

Optional columns: `Description`, `Cover URL`, `Year`, `Language`, `Publisher`, `Disc Count`, `Genres`, `Tracklist`, `Copies`, `Price Estimate`

### Books CSV

Required columns: `Title`, `Author`

Optional columns: `Description`, `Cover URL`, `Year`, `Language`, `Country`, `Type`, `Volume`, `Series`, `Publisher`, `Cover Type`, `Genres`, `Copies`, `Price Estimate`

## Contributing

This is a personal project. If you'd like to contribute or report issues, please see the [repository issues](https://github.com/otro34/the-collector/issues).

## License

ISC

## Development Status

Currently in **Sprint 1: Database & Data Migration**

- Sprint 0 (Project Setup): ✅ Completed
- Sprint 1 (Database & Data): 🚧 In Progress
- Sprint 2 (Core UI): 📋 Planned
- Sprint 3+ (Features): 📋 Planned

See `docs/PROJECT_TRACKER.md` for detailed progress.

## Credits

Built with [Claude Code](https://claude.com/claude-code)
