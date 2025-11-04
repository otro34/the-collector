# Reading Progress API Documentation

## Overview

The Reading Progress API allows tracking which books/comics users have read, including reading dates, chosen reading paths, and current phase in those paths.

## Base URL

```
/api/reading-progress
```

## Endpoints

### 1. Get All Reading Progress

Retrieve all reading progress records for the user.

**Endpoint:** `GET /api/reading-progress`

**Request:**

```http
GET /api/reading-progress HTTP/1.1
```

**Response:** `200 OK`

```json
{
  "success": true,
  "progress": [
    {
      "id": "cm1abc123...",
      "itemId": "cm1def456...",
      "isRead": true,
      "startedAt": "2025-10-01T00:00:00.000Z",
      "completedAt": "2025-10-15T00:00:00.000Z",
      "readingPath": "Character-Focused",
      "currentPhase": "Phase 2: Origins",
      "createdAt": "2025-10-01T00:00:00.000Z",
      "updatedAt": "2025-10-15T00:00:00.000Z",
      "item": {
        "id": "cm1def456...",
        "title": "Batman: Year One",
        "collectionType": "BOOK",
        "book": {
          "type": "COMIC",
          "author": "Frank Miller",
          "series": "Batman"
        }
      }
    }
  ]
}
```

**Error Responses:**

- `500 Internal Server Error` - Failed to fetch reading progress

---

### 2. Create or Update Reading Progress

Create new or update existing reading progress for a specific item.

**Endpoint:** `POST /api/reading-progress`

**Request Body:**

```json
{
  "itemId": "cm1def456...",
  "isRead": true,
  "startedAt": "2025-10-01T00:00:00.000Z",
  "completedAt": "2025-10-15T00:00:00.000Z",
  "readingPath": "Character-Focused",
  "currentPhase": "Phase 2: Origins"
}
```

**Field Descriptions:**

- `itemId` (string, required): ID of the item to track progress for
- `isRead` (boolean, optional, default: false): Whether the item has been read
- `startedAt` (string, optional): ISO 8601 datetime when reading started
- `completedAt` (string, optional): ISO 8601 datetime when reading completed
- `readingPath` (string, optional): Name of the reading path (e.g., "Character-Focused")
- `currentPhase` (string, optional): Current phase in the reading path

**Response:** `200 OK`

```json
{
  "success": true,
  "progress": {
    "id": "cm1abc123...",
    "itemId": "cm1def456...",
    "isRead": true,
    "startedAt": "2025-10-01T00:00:00.000Z",
    "completedAt": "2025-10-15T00:00:00.000Z",
    "readingPath": "Character-Focused",
    "currentPhase": "Phase 2: Origins",
    "createdAt": "2025-10-01T00:00:00.000Z",
    "updatedAt": "2025-10-15T00:00:00.000Z",
    "item": {
      "id": "cm1def456...",
      "title": "Batman: Year One",
      "collectionType": "BOOK",
      "book": {
        "type": "COMIC",
        "author": "Frank Miller",
        "series": "Batman"
      }
    }
  },
  "message": "Reading progress created"
}
```

**Error Responses:**

- `400 Bad Request` - Validation failed
  ```json
  {
    "error": "Validation failed",
    "details": [
      {
        "code": "invalid_type",
        "path": ["itemId"],
        "message": "Item ID is required"
      }
    ]
  }
  ```
- `404 Not Found` - Item not found
  ```json
  {
    "error": "Item not found"
  }
  ```
- `500 Internal Server Error` - Failed to save reading progress

---

### 3. Get Reading Progress by Item ID

Retrieve reading progress for a specific item.

**Endpoint:** `GET /api/reading-progress/[itemId]`

**URL Parameters:**

- `itemId` (string, required): ID of the item

**Request:**

```http
GET /api/reading-progress/cm1def456... HTTP/1.1
```

**Response:** `200 OK`

```json
{
  "success": true,
  "progress": {
    "id": "cm1abc123...",
    "itemId": "cm1def456...",
    "isRead": true,
    "startedAt": "2025-10-01T00:00:00.000Z",
    "completedAt": "2025-10-15T00:00:00.000Z",
    "readingPath": "Character-Focused",
    "currentPhase": "Phase 2: Origins",
    "createdAt": "2025-10-01T00:00:00.000Z",
    "updatedAt": "2025-10-15T00:00:00.000Z",
    "item": {
      "id": "cm1def456...",
      "title": "Batman: Year One",
      "collectionType": "BOOK",
      "book": {
        "type": "COMIC",
        "author": "Frank Miller",
        "series": "Batman"
      }
    }
  }
}
```

**Error Responses:**

- `404 Not Found` - Reading progress not found
  ```json
  {
    "error": "Reading progress not found"
  }
  ```
- `500 Internal Server Error` - Failed to fetch reading progress

---

### 4. Delete Reading Progress

Delete reading progress for a specific item.

**Endpoint:** `DELETE /api/reading-progress/[itemId]`

**URL Parameters:**

- `itemId` (string, required): ID of the item

**Request:**

```http
DELETE /api/reading-progress/cm1def456... HTTP/1.1
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reading progress deleted successfully"
}
```

**Error Responses:**

- `404 Not Found` - Reading progress not found
  ```json
  {
    "error": "Reading progress not found"
  }
  ```
- `500 Internal Server Error` - Failed to delete reading progress

---

## Database Schema

### ReadingProgress Model

```prisma
model ReadingProgress {
  id                  String          @id @default(cuid())
  itemId              String          @unique
  item                Item            @relation(fields: [itemId], references: [id], onDelete: Cascade)

  isRead              Boolean         @default(false)
  startedAt           DateTime?
  completedAt         DateTime?
  readingPath         String?         // e.g., "Character-Focused", "Publisher-Focused"
  currentPhase        String?         // e.g., "Phase 1: Gateway Masterpieces"

  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  @@index([itemId])
  @@index([isRead])
  @@index([itemId, isRead])
}
```

### Indexes

The following indexes are created for performance:

- `itemId` - For fast lookups by item ID
- `isRead` - For filtering by read status
- `itemId, isRead` - Composite index for combined queries

### Relationships

- **One-to-One** with `Item`: Each item can have at most one reading progress record
- **Cascade Delete**: When an item is deleted, its reading progress is automatically deleted

---

## Usage Examples

### Example 1: Mark a Book as Read

```javascript
const response = await fetch('/api/reading-progress', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    itemId: 'cm1def456...',
    isRead: true,
    completedAt: new Date().toISOString(),
  }),
})

const data = await response.json()
console.log(data.message) // "Reading progress created" or "Reading progress updated"
```

### Example 2: Start Reading a Book

```javascript
const response = await fetch('/api/reading-progress', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    itemId: 'cm1def456...',
    isRead: false,
    startedAt: new Date().toISOString(),
    readingPath: 'Character-Focused',
    currentPhase: 'Phase 1: Gateway Masterpieces',
  }),
})
```

### Example 3: Get All Read Books

```javascript
const response = await fetch('/api/reading-progress')
const data = await response.json()

const readBooks = data.progress.filter((p) => p.isRead)
console.log(`You've read ${readBooks.length} books!`)
```

### Example 4: Check if a Book Has Been Read

```javascript
const itemId = 'cm1def456...'
const response = await fetch(`/api/reading-progress/${itemId}`)

if (response.ok) {
  const data = await response.json()
  console.log(`Read: ${data.progress.isRead}`)
} else if (response.status === 404) {
  console.log('No reading progress found for this item')
}
```

### Example 5: Remove Reading Progress

```javascript
const itemId = 'cm1def456...'
const response = await fetch(`/api/reading-progress/${itemId}`, {
  method: 'DELETE',
})

if (response.ok) {
  console.log('Reading progress deleted')
}
```

---

## Implementation Details

### Automatic Date Management

- When marking an item as read (`isRead: true`), if no `completedAt` date is provided, consider setting it automatically in the UI layer
- When marking an item as unread (`isRead: false`), the `completedAt` date can be cleared or left as-is depending on use case

### Validation

The API validates:

- `itemId` must be a valid string
- `isRead` must be a boolean
- `startedAt` and `completedAt` must be valid ISO 8601 datetime strings if provided
- The referenced item must exist in the database

### Unique Constraint

Each item can have only one reading progress record due to the unique constraint on `itemId`. Attempting to create a duplicate will result in an update of the existing record.

---

## Related Features

This API is part of the Reading Recommendations feature set (Sprint 9):

- **US-9.1**: Set up database structure for recommendations
- **US-9.2**: Build recommendation parser and API
- **US-9.3**: Create reading progress tracking (this document)
- **US-9.4**: Build recommendations page UI
- **US-9.5**: Add read/unread toggle to book items
