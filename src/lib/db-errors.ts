import { Prisma } from '@prisma/client'

/**
 * Custom error types for database operations
 */

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public cause?: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class NotFoundError extends DatabaseError {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with ID '${id}' not found` : `${resource} not found`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends DatabaseError {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class UniqueConstraintError extends DatabaseError {
  constructor(field: string) {
    super(`A record with this ${field} already exists`, 'UNIQUE_CONSTRAINT')
    this.name = 'UniqueConstraintError'
  }
}

export class ForeignKeyError extends DatabaseError {
  constructor(message: string) {
    super(message, 'FOREIGN_KEY_CONSTRAINT')
    this.name = 'ForeignKeyError'
  }
}

/**
 * Handle Prisma errors and convert them to custom error types
 */
export function handlePrismaError(error: unknown): DatabaseError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.[0] || 'field'
        return new UniqueConstraintError(field)

      case 'P2025':
        // Record not found
        return new NotFoundError('Record')

      case 'P2003':
        // Foreign key constraint failed
        return new ForeignKeyError(
          'Cannot delete or update because it is referenced by other records'
        )

      case 'P2014':
        // Required relation violation
        return new ValidationError(
          'The change you are trying to make would violate required relation'
        )

      case 'P2011':
        // Null constraint violation
        const nullField = (error.meta?.target as string) || 'field'
        return new ValidationError(`${nullField} cannot be null`)

      default:
        return new DatabaseError(
          error.message || 'An unknown database error occurred',
          error.code,
          error
        )
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError(error.message)
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new DatabaseError(
      'Failed to initialize database connection',
      'INITIALIZATION_ERROR',
      error
    )
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new DatabaseError('Database engine encountered a critical error', 'RUST_PANIC', error)
  }

  // Unknown error
  if (error instanceof Error) {
    return new DatabaseError(error.message, 'UNKNOWN_ERROR', error)
  }

  return new DatabaseError('An unknown error occurred', 'UNKNOWN_ERROR', error)
}

/**
 * Wrapper for safe database operations with error handling
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<{ data: T | null; error: DatabaseError | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    const dbError = handlePrismaError(error)
    if (errorMessage) {
      dbError.message = `${errorMessage}: ${dbError.message}`
    }
    return { data: null, error: dbError }
  }
}

/**
 * Format error for API responses
 */
export function formatErrorResponse(error: DatabaseError) {
  return {
    error: {
      message: error.message,
      code: error.code,
      name: error.name,
      ...(error instanceof ValidationError && error.fields ? { fields: error.fields } : {}),
    },
  }
}

/**
 * Check if error is a specific type
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function isUniqueConstraintError(error: unknown): error is UniqueConstraintError {
  return error instanceof UniqueConstraintError
}

export function isForeignKeyError(error: unknown): error is ForeignKeyError {
  return error instanceof ForeignKeyError
}
