# The Collector - Project Tracker

**Last Updated**: 2025-10-14

## Current Sprint: Sprint 1 - Database & Data Migration

**Status**: 🟡 In Progress
**Start Date**: 2025-10-14
**End Date**: TBD

---

## Sprint Progress Overview

| Sprint   | Status         | Start Date | End Date   | Completed Stories | Total Stories |
| -------- | -------------- | ---------- | ---------- | ----------------- | ------------- |
| Sprint 0 | 🟢 Completed   | 2025-10-14 | 2025-10-14 | 3                 | 3             |
| Sprint 1 | 🟡 In Progress | 2025-10-14 | -          | 3                 | 5             |
| Sprint 2 | ⚪ Planned     | -          | -          | 0                 | 5             |
| Sprint 3 | ⚪ Planned     | -          | -          | 0                 | 6             |
| Sprint 4 | ⚪ Planned     | -          | -          | 0                 | 6             |
| Sprint 5 | ⚪ Planned     | -          | -          | 0                 | 6             |
| Sprint 6 | ⚪ Planned     | -          | -          | 0                 | 6             |
| Sprint 7 | ⚪ Planned     | -          | -          | 0                 | 6             |
| Sprint 8 | ⚪ Planned     | -          | -          | 0                 | 10            |

**Legend**: 🔴 Not Started | 🟡 In Progress | 🟢 Completed | ⚪ Planned

---

## Sprint 0: Project Setup

### User Stories

#### US-0.1: Initialize Next.js Project

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 2
- **PR**: [#1](https://github.com/otro34/the-collector/pull/1)
- **Acceptance Criteria**:
  - [x] Next.js 14+ installed with App Router
  - [x] TypeScript configured
  - [x] Tailwind CSS installed and configured
  - [x] Project structure created according to design doc
  - [x] Git initialized with .gitignore

#### US-0.2: Install Core Dependencies

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 2
- **PR**: [#3](https://github.com/otro34/the-collector/pull/3)
- **Acceptance Criteria**:
  - [x] Prisma installed and configured for SQLite
  - [x] shadcn/ui initialized
  - [x] Zustand installed
  - [x] TanStack Query installed
  - [x] React Hook Form and Zod installed
  - [x] Other core libraries installed

#### US-0.3: Set Up Development Tools

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 1
- **PR**: [#4](https://github.com/otro34/the-collector/pull/4)
- **Acceptance Criteria**:
  - [x] ESLint configured with Next.js rules
  - [x] Prettier configured
  - [x] Husky pre-commit hooks (optional)
  - [x] VS Code settings recommended

**Sprint 0 Total**: 5 story points

---

## Sprint 1: Database & Data Migration

### User Stories

#### US-1.1: Define Database Schema

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 5
- **PR**: TBD
- **Acceptance Criteria**:
  - [x] Prisma schema created with all models (Item, Videogame, Music, Book, Backup, Settings)
  - [x] Relationships defined correctly
  - [x] Indexes added for performance
  - [x] Enums defined for collection types
  - [x] Initial migration created
  - [x] Database file created

#### US-1.2: Create Database Utilities

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 3
- **PR**: TBD
- **Acceptance Criteria**:
  - [x] Database connection helpers created (testConnection, disconnect, getHealthStatus)
  - [x] CRUD operations for items (create, read, update, delete for all collection types)
  - [x] Custom error handling with typed errors (DatabaseError, NotFoundError, etc.)
  - [x] TypeScript types exported for type safety
  - [x] All functions properly typed
  - [x] Error handling utilities (handlePrismaError, safeDbOperation, formatErrorResponse)
  - [x] JSON parsing helpers for array fields (parseJsonArray, stringifyArray, parseItem functions)

#### US-1.3: Build CSV Parser

- **Status**: 🟢 Completed
- **Assigned**: Claude
- **Story Points**: 5
- **PR**: TBD
- **Acceptance Criteria**:
  - [x] CSV parser function created using PapaParse
  - [x] Column mapping logic implemented (auto-detect and manual)
  - [x] Data validation logic implemented using Zod schemas
  - [x] Error reporting for invalid data (row/column/field level)
  - [x] Support for different CSV formats (videogames, music, books)

#### US-1.4: Import Existing CSV Data

- **Status**: ⚪ Planned
- **Story Points**: 8

#### US-1.5: Create Seed Data Script

- **Status**: ⚪ Planned
- **Story Points**: 3

**Sprint 1 Total**: 24 story points

---

## Overall Project Progress

### Completion Summary

- **Total Story Points**: 258
- **Completed Story Points**: 18
- **Overall Progress**: 7.0%

### Milestone Tracker

- [ ] **Milestone 1**: Foundation Complete (Sprint 0-1)
- [ ] **Milestone 2**: Core UI & Collections (Sprint 2-3)
- [ ] **Milestone 3**: CRUD Operations (Sprint 4)
- [ ] **Milestone 4**: Search & Data Management (Sprint 5-6)
- [ ] **Milestone 5**: Backup & Polish (Sprint 7-8)
- [ ] **Milestone 6**: MVP Launch

---

## Current Sprint Backlog

### In Progress

- None

### To Do

- US-1.4: Import Existing CSV Data
- US-1.5: Create Seed Data Script

### Done

- US-0.1: Initialize Next.js Project ✅ [PR #1](https://github.com/otro34/the-collector/pull/1)
- US-0.2: Install Core Dependencies ✅ [PR #3](https://github.com/otro34/the-collector/pull/3)
- US-0.3: Set Up Development Tools ✅ [PR #4](https://github.com/otro34/the-collector/pull/4)
- US-1.1: Define Database Schema ✅ [PR #5](https://github.com/otro34/the-collector/pull/5)
- US-1.2: Create Database Utilities ✅ [PR #6](https://github.com/otro34/the-collector/pull/6)
- US-1.3: Build CSV Parser ✅ [PR TBD](https://github.com/otro34/the-collector/pull/TBD)

---

## Blockers & Issues

### Active Blockers

- None

### Resolved Blockers

- None

---

## Notes & Decisions

### 2025-10-14 (Latest - US-1.3)

- **US-1.3 Completed**: CSV parser utility created with full validation and error reporting
- Created src/lib/csv-parser.ts with PapaParse integration (650+ lines)
- Implemented auto-detect column mapping for all CSV formats (videogames, music, books)
- Default column mappings configured for existing CSV files in original-data/
- Data validation using Zod schemas (videogameSchema, musicSchema, bookSchema)
- Comprehensive error reporting with row/column/field-level details
- Support for multiple CSV formats with flexible column mapping
- Parser functions: parseVideogameCSV, parseMusicCSV, parseBookCSV, parseCollectionCSV
- Error reporting helpers: formatValidationErrors, generateErrorReport, getParseResultSummary
- Type-safe parsing with ParseResult<T> containing data, errors, warnings, and stats
- Installed PapaParse and @types/papaparse dependencies
- All code passes TypeScript type checking and ESLint validation
- Note: Unit tests deferred until testing infrastructure (vitest) is set up in future sprint

### 2025-10-14 (Earlier - US-1.2)

- **US-1.2 Completed**: Database utilities created with comprehensive functionality
- Created src/lib/db-utils.ts with CRUD operations for all collection types
- Created src/lib/db-errors.ts with custom error handling (DatabaseError, NotFoundError, ValidationError, etc.)
- Created src/types/database.ts with TypeScript types and JSON parsing helpers
- Enhanced src/lib/db.ts with connection helpers (testConnection, disconnect, getHealthStatus)
- Fixed SQLite compatibility issues (removed 'mode: insensitive', fixed type handling)
- All functions properly typed with Prisma-generated types
- JSON array parsing utilities created for tags and genres fields
- Error handling utilities map Prisma errors to custom typed errors
- All code passes TypeScript type checking and ESLint validation

### 2025-10-14 (Earlier - US-1.1)

- **US-1.1 Completed**: Database schema defined and initial migration created
- Updated Prisma schema with proper types (Json for customFields and Settings.value)
- SQLite limitation: Arrays stored as JSON strings (not native arrays) due to SQLite constraints
- All models include proper relationships and cascade deletes
- Database indexes added on collectionType and title fields for performance
- Initial migration applied successfully, database file created at prisma/dev.db
- Database connection tested and verified working
- Critical fix: Manually edited migration.sql to replace JSONB with TEXT for SQLite compatibility
- Sprint 1 officially started

### 2025-10-14

- **Sprint 0 Completed**: All project setup tasks finished in 1 day
- Installed Next.js 15.5.5, TypeScript, Tailwind CSS v4
- Configured Prisma for SQLite with complete database schema
- Installed all core dependencies: shadcn/ui, Zustand, TanStack Query, React Hook Form, Zod, etc.
- Set up development tools: ESLint, Prettier, Husky pre-commit hooks
- Created VS Code workspace settings and extension recommendations
- All PRs created with GitHub Actions CI workflow
- Ready to begin Sprint 1: Database & Data Migration

### 2025-10-13

- Project initiated
- Design document created
- User stories defined
- Sprint structure planned (9 sprints, ~18 weeks estimated)
- Selected SQLite for local database (instead of PostgreSQL)
- Decided to store cover image URLs only (no local storage)

---

## Velocity Tracking

| Sprint   | Planned Points | Completed Points | Velocity       |
| -------- | -------------- | ---------------- | -------------- |
| Sprint 0 | 5              | 5                | 5.0 points/day |
| Sprint 1 | 24             | -                | -              |
| Sprint 2 | 22             | -                | -              |
| Sprint 3 | 31             | -                | -              |
| Sprint 4 | 31             | -                | -              |
| Sprint 5 | 36             | -                | -              |
| Sprint 6 | 34             | -                | -              |
| Sprint 7 | 36             | -                | -              |
| Sprint 8 | 39             | -                | -              |

**Average Velocity**: TBD (calculated after first sprint)

---

## Sprint Schedule (Estimated)

- **Sprint 0**: Week 1 (3-5 days)
- **Sprint 1**: Week 1-3
- **Sprint 2**: Week 3-5
- **Sprint 3**: Week 5-7
- **Sprint 4**: Week 7-9
- **Sprint 5**: Week 9-11
- **Sprint 6**: Week 11-13
- **Sprint 7**: Week 13-15
- **Sprint 8**: Week 15-17

**Estimated Completion**: Week 17 (~4 months from start)

---

## How to Use This Tracker

1. **Update sprint status** as you begin and complete sprints
2. **Check off acceptance criteria** as you complete them
3. **Update user story status** (Not Started → In Progress → Completed)
4. **Track blockers** in the Blockers section
5. **Record decisions** in the Notes section
6. **Calculate velocity** after each sprint for better future estimates
7. **Review and update regularly** (daily or at least at sprint boundaries)

### Status Legend

- ⚪ Not Started / Planned
- 🟡 In Progress
- 🟢 Completed
- 🔴 Blocked
- ⏸️ Paused

---

## Quick Commands

To update this tracker, search for the relevant section and update the status, checkboxes, or dates as needed.

**Ready to begin Sprint 0?** Update the "Current Sprint" section at the top and change Sprint 0 status to 🟡 In Progress.
