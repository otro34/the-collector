/**
 * ISBN (International Standard Book Number) validation and formatting utilities
 * Supports both ISBN-10 and ISBN-13 formats
 */

/**
 * Validates an ISBN-10 check digit
 */
function validateISBN10(isbn: string): boolean {
  if (isbn.length !== 10) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(isbn[i], 10)
    if (isNaN(digit)) return false
    sum += digit * (10 - i)
  }

  // Last character can be a digit or 'X' (representing 10)
  const lastChar = isbn[9].toUpperCase()
  const checkDigit = lastChar === 'X' ? 10 : parseInt(lastChar, 10)
  if (isNaN(checkDigit)) return false

  sum += checkDigit
  return sum % 11 === 0
}

/**
 * Validates an ISBN-13 check digit
 */
function validateISBN13(isbn: string): boolean {
  if (isbn.length !== 13) return false

  let sum = 0
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(isbn[i], 10)
    if (isNaN(digit)) return false
    sum += digit * (i % 2 === 0 ? 1 : 3)
  }

  return sum % 10 === 0
}

/**
 * Cleans an ISBN string by removing hyphens, spaces, and converting to uppercase
 */
export function cleanISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, '').toUpperCase()
}

/**
 * Validates an ISBN (either ISBN-10 or ISBN-13)
 * @param isbn - The ISBN to validate (can include hyphens and spaces)
 * @returns true if valid, false otherwise
 */
export function isValidISBN(isbn: string): boolean {
  const cleaned = cleanISBN(isbn)

  if (cleaned.length === 10) {
    return validateISBN10(cleaned)
  } else if (cleaned.length === 13) {
    return validateISBN13(cleaned)
  }

  return false
}

/**
 * Formats an ISBN with hyphens for better readability
 * Note: This is a simple formatting, not a proper ISBN hyphenation algorithm
 */
export function formatISBN(isbn: string): string {
  const cleaned = cleanISBN(isbn)

  if (cleaned.length === 10) {
    // Format as: X-XXX-XXXXX-X
    return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
  } else if (cleaned.length === 13) {
    // Format as: XXX-X-XXX-XXXXX-X
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7, 12)}-${cleaned.slice(12)}`
  }

  return isbn
}

/**
 * Converts ISBN-10 to ISBN-13
 * @param isbn10 - Valid ISBN-10
 * @returns ISBN-13 or null if invalid
 */
export function isbn10ToISBN13(isbn10: string): string | null {
  const cleaned = cleanISBN(isbn10)
  if (cleaned.length !== 10 || !validateISBN10(cleaned)) {
    return null
  }

  // Remove check digit and add 978 prefix
  const base = '978' + cleaned.slice(0, 9)

  // Calculate ISBN-13 check digit
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base[i], 10) * (i % 2 === 0 ? 1 : 3)
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return base + checkDigit
}

/**
 * Attempts to convert ISBN-13 to ISBN-10
 * Only works for ISBN-13s with 978 prefix
 * @param isbn13 - Valid ISBN-13
 * @returns ISBN-10 or null if invalid or not convertible
 */
export function isbn13ToISBN10(isbn13: string): string | null {
  const cleaned = cleanISBN(isbn13)
  if (cleaned.length !== 13 || !validateISBN13(cleaned)) {
    return null
  }

  // Only 978 prefix can be converted to ISBN-10
  if (!cleaned.startsWith('978')) {
    return null
  }

  // Take the 9 digits after the 978 prefix
  const base = cleaned.slice(3, 12)

  // Calculate ISBN-10 check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(base[i], 10) * (10 - i)
  }

  const checkDigit = (11 - (sum % 11)) % 11
  const checkChar = checkDigit === 10 ? 'X' : checkDigit.toString()

  return base + checkChar
}

/**
 * Detects the type of ISBN (10 or 13)
 * @param isbn - The ISBN to detect
 * @returns 10, 13, or null if invalid
 */
export function detectISBNType(isbn: string): 10 | 13 | null {
  const cleaned = cleanISBN(isbn)

  if (cleaned.length === 10 && validateISBN10(cleaned)) {
    return 10
  } else if (cleaned.length === 13 && validateISBN13(cleaned)) {
    return 13
  }

  return null
}

/**
 * Extracts ISBN from a longer string (useful for barcode scanning)
 * @param text - Text that may contain an ISBN
 * @returns Array of found ISBNs
 */
export function extractISBNs(text: string): string[] {
  const isbns: string[] = []

  // Pattern for ISBN-13 (flexible grouping, relies on validation function)
  const isbn13Pattern = /\b(?:978|979)[\d\s-]{10,16}\b/g
  const matches13 = text.match(isbn13Pattern)
  if (matches13) {
    matches13.forEach((match) => {
      const cleaned = cleanISBN(match)
      if (validateISBN13(cleaned)) {
        isbns.push(cleaned)
      }
    })
  }

  // Pattern for ISBN-10 (flexible grouping, relies on validation function)
  const isbn10Pattern = /\b[\d\s-]{9,13}[\dX]\b/g
  const matches10 = text.match(isbn10Pattern)
  if (matches10) {
    matches10.forEach((match) => {
      const cleaned = cleanISBN(match)
      if (validateISBN10(cleaned) && !isbns.includes(cleaned)) {
        isbns.push(cleaned)
      }
    })
  }

  return isbns
}
