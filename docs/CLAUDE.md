# Claude AI Development Guide - The Collector

**Project**: The Collector - Personal Collection Management System
**Last Updated**: 2025-10-13
**Developer**: Juan Carlos Romaina (otro34@hotmail.com)

---

## 🎯 Project Context

The Collector is a responsive web application for managing personal collections of video games, music (vinyl/CDs), and books (manga, comics, and other books). Built with Next.js, TypeScript, SQLite, and modern UI components.

### Key Requirements
- **Local-first**: SQLite database, no cloud dependencies
- **Data Import**: Support existing CSV files in `original-data/`
- **Modern Design**: Responsive, fresh UI with dark mode
- **Cloud Backup**: Optional S3/R2/Dropbox backup
- **Cover Images**: Store URLs only (no local image storage)

---

## 📚 Essential Documents

You must be familiar with these documents before starting any work:

1. **docs/DESIGN_DOCUMENT.md**: Complete technical architecture, database schema, UI/UX design
2. **docs/USER_STORIES.md**: All user stories with acceptance criteria and task breakdowns
3. **docs/PROJECT_TRACKER.md**: Current sprint status and progress tracking
4. **docs/development-flow.md**: Git workflow, PR process, testing requirements

---

## 🏗️ Tech Stack

### Core Framework
- **Next.js 14+** (App Router)
- **TypeScript** (strict mode)
- **React 18+**

### Database & Backend
- **SQLite** (via Prisma ORM)
- **Prisma** for database access
- **Next.js API Routes** / Server Actions

### UI & Styling
- **Tailwind CSS** for styling
- **shadcn/ui** (Radix UI primitives) for components
- **Lucide React** for icons
- **next-themes** for dark mode

### State & Data Fetching
- **Zustand** for global state
- **TanStack Query** (React Query) for server state
- **React Hook Form** + **Zod** for forms and validation

### Utilities
- **PapaParse** for CSV parsing
- **AWS SDK** or **Cloudflare R2 SDK** for cloud backups (later sprints)

---

## 📁 Project Structure

```
the-collector/
├── docs/                       # All documentation
│   ├── CLAUDE.md              # This file
│   ├── DESIGN_DOCUMENT.md     # Technical design
│   ├── USER_STORIES.md        # Sprint planning
│   ├── PROJECT_TRACKER.md     # Progress tracking
│   └── development-flow.md    # Git workflow
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # Dashboard page
│   │   ├── videogames/       # Video games collection
│   │   ├── music/            # Music collection
│   │   ├── books/            # Books collection
│   │   ├── settings/         # Settings page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   ├── collections/     # Collection-specific
│   │   ├── forms/           # Form components
│   │   └── shared/          # Shared components
│   ├── lib/
│   │   ├── db.ts            # Prisma client singleton
│   │   ├── utils.ts         # Helper functions
│   │   ├── validators.ts    # Zod schemas
│   │   └── csv-parser.ts    # CSV processing
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript types
│   └── styles/              # Global styles
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # DB migrations
│   └── seed.ts              # Seed script
├── public/
├── original-data/           # Original CSV files (DO NOT MODIFY)
├── backups/                 # Local database backups
└── package.json
```

---

## 🔄 Development Workflow

### For Every User Story

#### 1. Read Current Sprint Context
Before starting any work:
```bash
# Review current sprint in docs/PROJECT_TRACKER.md
# Read the specific user story in docs/USER_STORIES.md
# Check acceptance criteria and tasks
```

#### 2. Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/US-XXX-description
```

**Branch naming convention**: `feature/US-[story-number]-[short-description]`
- Example: `feature/US-0.1-initialize-nextjs`
- Example: `feature/US-1.3-csv-parser`

#### 3. Configure Git (if not already done)
```bash
git config user.email "otro34@hotmail.com"
git config user.name "Juan Carlos Romaina"
```

#### 4. Implement the User Story

Follow these guidelines:

**Code Quality**:
- ✅ Write clean, readable TypeScript code
- ✅ Follow Next.js App Router conventions
- ✅ Use Prisma for all database operations
- ✅ Use TanStack Query for data fetching
- ✅ Use React Hook Form + Zod for forms
- ✅ Use Tailwind CSS classes (no inline styles)
- ✅ Use shadcn/ui components when possible
- ✅ Create reusable components
- ✅ Add TypeScript types for all props and returns
- ✅ Handle errors gracefully
- ✅ Add loading states
- ✅ Ensure responsive design (mobile, tablet, desktop)
- ✅ Support dark mode

**Testing**:
- ✅ Write unit tests for utilities and helpers (90% coverage)
- ✅ Write component tests (70% coverage)
- ✅ Write service/API tests (80% coverage)
- ✅ Overall minimum coverage: 70%

**Validation**:
- ✅ Code compiles with no errors
- ✅ No TypeScript errors
- ✅ No ESLint warnings/errors
- ✅ All acceptance criteria met

#### 5. Test Your Implementation

```bash
# Run development server
npm run dev

# Run type checking
npm run type-check

# Run linter
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

#### 6. Commit Your Work

Use the detailed commit format:

```bash
git add .
git commit -m "$(cat <<'EOF'
feat(scope): detailed description [US-XXX]

- Implemented feature A
- Added component B
- Created API endpoint C
- Added unit tests for D
- Updated documentation

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Commit type options**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Styling changes
- `test`: Adding tests
- `docs`: Documentation changes
- `chore`: Build/config changes

**Scope examples**: `database`, `ui`, `api`, `forms`, `import`, `backup`, `search`

#### 7. Push Branch and Create Pull Request

```bash
# Push branch
git push -u origin feature/US-XXX-description
```

Then use GitHub MCP to create PR:

```typescript
// Use mcp__github__create_pull_request with:
{
  owner: "jromaina",
  repo: "the-collector",
  title: "feat: [US-XXX] Descriptive title",
  head: "feature/US-XXX-description",
  base: "main",
  body: `
## 📋 Summary
[Brief description of what was implemented]

### ✨ Implemented Functionalities
- Feature 1
- Feature 2
- Feature 3

### 🧪 Testing and Quality
- Added unit tests with XX% coverage
- Added component tests
- All acceptance criteria validated
- Linter passed
- TypeScript checks passed

### 📊 Project Progress
- Sprint: Sprint X
- User Story: US-XXX
- Story Points: X
- Acceptance Criteria: X/X completed

## 🔧 Testing Plan
- [ ] Feature works on desktop
- [ ] Feature works on tablet
- [ ] Feature works on mobile
- [ ] Dark mode supported
- [ ] All edge cases handled
- [ ] Error states handled
- [ ] Loading states present

## 📸 Screenshots
[Add screenshots if applicable]

🤖 Generated with [Claude Code](https://claude.ai/code)
  `
}
```

#### 8. Request Copilot Review

```typescript
// Use mcp__github__request_copilot_review
{
  owner: "jromaina",
  repo: "the-collector",
  pullNumber: [PR_NUMBER]
}
```

#### 9. Update Project Tracker

After PR is created, update `docs/PROJECT_TRACKER.md`:
1. Change user story status from 🔵 Pending → 🟡 In Progress → 🟢 Completed
2. Check off all acceptance criteria
3. Update sprint progress
4. Update velocity metrics
5. Add notes about any decisions or blockers

---

## 🎨 UI/UX Guidelines

### Design Principles
- **Mobile-first**: Design for mobile, enhance for desktop
- **Accessibility**: WCAG AA compliance, keyboard navigation
- **Performance**: Fast loading, smooth interactions
- **Consistency**: Reuse components, maintain design patterns

### Color Palette
- **Primary**: Indigo/Blue (`bg-indigo-600`, `text-indigo-600`)
- **Secondary**: Amber/Gold (`bg-amber-500`, `text-amber-500`)
- **Neutral**: Slate grays (`bg-slate-100`, `text-slate-900`)
- **Success**: Green (`bg-green-600`)
- **Warning**: Yellow (`bg-yellow-500`)
- **Error**: Red (`bg-red-600`)

### Component Patterns
- Use shadcn/ui components as base
- Add custom styling with Tailwind
- Ensure dark mode support (`dark:` prefix)
- Add hover states (`hover:`)
- Add focus states (`focus:`)
- Add loading states (skeletons, spinners)
- Add error states (error messages, retry buttons)

### Responsive Breakpoints
```css
/* Mobile */
< 640px

/* Tablet */
640px - 1024px (sm:, md:)

/* Desktop */
> 1024px (lg:, xl:)
```

---

## 🗄️ Database Guidelines

### Prisma Schema
Located at `prisma/schema.prisma`. Follow the schema defined in `docs/DESIGN_DOCUMENT.md`.

### Database Operations
Always use Prisma client:

```typescript
import { prisma } from '@/lib/db'

// Read
const items = await prisma.item.findMany({
  where: { collectionType: 'VIDEOGAME' },
  include: { videogame: true }
})

// Create
const item = await prisma.item.create({
  data: {
    collectionType: 'VIDEOGAME',
    title: 'Game Title',
    // ...
    videogame: {
      create: {
        platform: 'Nintendo Switch',
        // ...
      }
    }
  }
})

// Update
const updated = await prisma.item.update({
  where: { id: itemId },
  data: { title: 'New Title' }
})

// Delete
await prisma.item.delete({
  where: { id: itemId }
})
```

### Migrations
```bash
# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

---

## 🧪 Testing Guidelines

### Unit Tests (Vitest or Jest)
```typescript
// Example: lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate } from './utils'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const result = formatDate(new Date('2025-01-13'))
    expect(result).toBe('January 13, 2025')
  })
})
```

### Component Tests (React Testing Library)
```typescript
// Example: components/ItemCard.test.tsx
import { render, screen } from '@testing-library/react'
import { ItemCard } from './ItemCard'

describe('ItemCard', () => {
  it('should render item title', () => {
    render(<ItemCard item={mockItem} />)
    expect(screen.getByText('Mock Title')).toBeInTheDocument()
  })
})
```

### API Tests
```typescript
// Example: app/api/items/route.test.ts
import { GET } from './route'

describe('GET /api/items', () => {
  it('should return items', async () => {
    const response = await GET(new Request('http://localhost:3000/api/items'))
    const data = await response.json()
    expect(data).toHaveProperty('items')
  })
})
```

---

## 📊 Sprint Management

### Current Sprint Information
Always check `docs/PROJECT_TRACKER.md` for:
- Current sprint number and goal
- Active user stories
- Acceptance criteria checklist
- Blockers and issues

### Sprint Velocity
After completing each sprint, calculate velocity:
```
Velocity = Completed Story Points / Sprint Duration
```
Update in `docs/PROJECT_TRACKER.md` to improve future estimates.

### Definition of Done
A user story is done when:
- [ ] All acceptance criteria met
- [ ] Code committed to feature branch
- [ ] TypeScript types defined
- [ ] Responsive design implemented
- [ ] Dark mode styling added
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Tests written and passing
- [ ] Manual testing completed
- [ ] No console errors/warnings
- [ ] PR created with detailed description
- [ ] Copilot review requested
- [ ] `docs/PROJECT_TRACKER.md` updated

---

## 🔍 Common Patterns

### Data Fetching (TanStack Query)
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await fetch('/api/items')
      if (!res.ok) throw new Error('Failed to fetch items')
      return res.json()
    }
  })
}

// Usage in component
const { data, isLoading, error } = useItems()
```

### Forms (React Hook Form + Zod)
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  year: z.number().int().min(1900).max(2100).optional()
})

type FormData = z.infer<typeof schema>

export function ItemForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', year: undefined }
  })

  const onSubmit = async (data: FormData) => {
    // Handle submission
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### Server Actions (Next.js)
```typescript
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createItem(formData: FormData) {
  const title = formData.get('title') as string

  const item = await prisma.item.create({
    data: { title, /* ... */ }
  })

  revalidatePath('/items')
  return { success: true, item }
}
```

---

## 🚨 Important Reminders

### DO:
- ✅ Always read the current user story before starting
- ✅ Check all acceptance criteria
- ✅ Follow the git workflow exactly
- ✅ Write descriptive commit messages
- ✅ Update PROJECT_TRACKER.md after each story
- ✅ Request Copilot review on PRs
- ✅ Test on multiple screen sizes
- ✅ Test dark mode
- ✅ Handle errors gracefully
- ✅ Add loading states
- ✅ Write tests with good coverage

### DON'T:
- ❌ Commit directly to `main`
- ❌ Skip acceptance criteria
- ❌ Skip testing
- ❌ Forget to update PROJECT_TRACKER.md
- ❌ Modify files in `original-data/` folder
- ❌ Store images locally (use URLs only)
- ❌ Add console.logs in production code
- ❌ Skip responsive design
- ❌ Ignore TypeScript errors
- ❌ Skip dark mode support

---

## 🎯 Current Status

**Current Sprint**: Sprint 0 - Project Setup
**Status**: Not Started
**Next User Story**: US-0.1 - Initialize Next.js Project

---

## 📞 Need Help?

If you encounter any issues or need clarification:
1. Review relevant documentation (DESIGN_DOCUMENT.md, USER_STORIES.md)
2. Check PROJECT_TRACKER.md for context
3. Ask the user for clarification if acceptance criteria are unclear
4. Document any decisions or blockers in PROJECT_TRACKER.md

---

## 🚀 Quick Start

To begin Sprint 0, start with US-0.1:

```bash
# 1. Create feature branch
git checkout -b feature/US-0.1-initialize-nextjs

# 2. Initialize Next.js project
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# 3. Follow remaining tasks in US-0.1
# 4. Test, commit, push, create PR
# 5. Update PROJECT_TRACKER.md
```

**Ready to start? Ask the user if you should begin Sprint 0!**
