# The Collector - Project Tracker

**Last Updated**: 2025-10-14

## Current Sprint: Sprint 0 - Project Setup
**Status**: 🟡 In Progress
**Start Date**: 2025-10-14
**End Date**: TBD (3-5 days)

---

## Sprint Progress Overview

| Sprint | Status | Start Date | End Date | Completed Stories | Total Stories |
|--------|--------|------------|----------|-------------------|---------------|
| Sprint 0 | 🟡 In Progress | 2025-10-14 | - | 1 | 3 |
| Sprint 1 | ⚪ Planned | - | - | 0 | 5 |
| Sprint 2 | ⚪ Planned | - | - | 0 | 5 |
| Sprint 3 | ⚪ Planned | - | - | 0 | 6 |
| Sprint 4 | ⚪ Planned | - | - | 0 | 6 |
| Sprint 5 | ⚪ Planned | - | - | 0 | 6 |
| Sprint 6 | ⚪ Planned | - | - | 0 | 6 |
| Sprint 7 | ⚪ Planned | - | - | 0 | 6 |
| Sprint 8 | ⚪ Planned | - | - | 0 | 10 |

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
- **Status**: ⚪ Not Started
- **Assigned**: -
- **Story Points**: 2
- **Acceptance Criteria**:
  - [ ] Prisma installed and configured for SQLite
  - [ ] shadcn/ui initialized
  - [ ] Zustand installed
  - [ ] TanStack Query installed
  - [ ] React Hook Form and Zod installed
  - [ ] Other core libraries installed

#### US-0.3: Set Up Development Tools
- **Status**: ⚪ Not Started
- **Assigned**: -
- **Story Points**: 1
- **Acceptance Criteria**:
  - [ ] ESLint configured with Next.js rules
  - [ ] Prettier configured
  - [ ] Husky pre-commit hooks (optional)
  - [ ] VS Code settings recommended

**Sprint 0 Total**: 5 story points

---

## Sprint 1: Database & Data Migration

### User Stories

#### US-1.1: Define Database Schema
- **Status**: ⚪ Planned
- **Story Points**: 5

#### US-1.2: Create Database Utilities
- **Status**: ⚪ Planned
- **Story Points**: 3

#### US-1.3: Build CSV Parser
- **Status**: ⚪ Planned
- **Story Points**: 5

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
- **Completed Story Points**: 2
- **Overall Progress**: 0.8%

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
- US-0.2: Install Core Dependencies
- US-0.3: Set Up Development Tools

### Done
- US-0.1: Initialize Next.js Project ✅ [PR #1](https://github.com/otro34/the-collector/pull/1)

---

## Blockers & Issues

### Active Blockers
- None

### Resolved Blockers
- None

---

## Notes & Decisions

### 2025-10-14
- **US-0.1 Completed**: Next.js 15.5.5 project initialized successfully
- Installed Tailwind CSS v4 which requires `@tailwindcss/postcss` plugin (different from v3)
- Created complete project structure with all necessary directories
- Build, type checking, and linting all pass successfully
- PR #1 created and Copilot review requested

### 2025-10-13
- Project initiated
- Design document created
- User stories defined
- Sprint structure planned (9 sprints, ~18 weeks estimated)
- Selected SQLite for local database (instead of PostgreSQL)
- Decided to store cover image URLs only (no local storage)

---

## Velocity Tracking

| Sprint | Planned Points | Completed Points | Velocity |
|--------|----------------|------------------|----------|
| Sprint 0 | 5 | 2 | In Progress |
| Sprint 1 | 24 | - | - |
| Sprint 2 | 22 | - | - |
| Sprint 3 | 31 | - | - |
| Sprint 4 | 31 | - | - |
| Sprint 5 | 36 | - | - |
| Sprint 6 | 34 | - | - |
| Sprint 7 | 36 | - | - |
| Sprint 8 | 39 | - | - |

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