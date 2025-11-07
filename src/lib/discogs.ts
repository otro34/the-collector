/**
 * Discogs API utilities for music album lookup
 * Supports UPC/EAN barcode validation and searching
 */

/**
 * Cleans a barcode string by removing spaces, hyphens, and non-digit characters
 */
export function cleanBarcode(barcode: string): string {
  return barcode.replace(/[^\d]/g, '')
}

/**
 * Validates a UPC (Universal Product Code) barcode
 * UPC-A: 12 digits
 * UPC-E: 8 digits (compressed format)
 */
export function isValidUPC(barcode: string): boolean {
  const cleaned = cleanBarcode(barcode)

  // UPC-A (12 digits) or UPC-E (8 digits)
  if (cleaned.length !== 12 && cleaned.length !== 8) {
    return false
  }

  if (cleaned.length === 12) {
    return validateUPCA(cleaned)
  } else {
    return validateUPCE(cleaned)
  }
}

/**
 * Validates UPC-A check digit (12 digits)
 */
function validateUPCA(barcode: string): boolean {
  if (barcode.length !== 12) return false

  let sum = 0
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(barcode[i], 10)
    if (isNaN(digit)) return false
    sum += digit * (i % 2 === 0 ? 3 : 1)
  }

  const checkDigit = parseInt(barcode[11], 10)
  if (isNaN(checkDigit)) return false

  const calculatedCheck = (10 - (sum % 10)) % 10
  return checkDigit === calculatedCheck
}

/**
 * Validates UPC-E check digit (8 digits)
 */
function validateUPCE(barcode: string): boolean {
  if (barcode.length !== 8) return false

  // UPC-E validation is complex, for now just check all digits
  for (let i = 0; i < 8; i++) {
    if (isNaN(parseInt(barcode[i], 10))) return false
  }

  return true
}

/**
 * Validates an EAN (European Article Number) barcode
 * EAN-13: 13 digits
 * EAN-8: 8 digits
 */
export function isValidEAN(barcode: string): boolean {
  const cleaned = cleanBarcode(barcode)

  if (cleaned.length !== 13 && cleaned.length !== 8) {
    return false
  }

  if (cleaned.length === 13) {
    return validateEAN13(cleaned)
  } else {
    return validateEAN8(cleaned)
  }
}

/**
 * Validates EAN-13 check digit
 */
function validateEAN13(barcode: string): boolean {
  if (barcode.length !== 13) return false

  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i], 10)
    if (isNaN(digit)) return false
    sum += digit * (i % 2 === 0 ? 1 : 3)
  }

  const checkDigit = parseInt(barcode[12], 10)
  if (isNaN(checkDigit)) return false

  const calculatedCheck = (10 - (sum % 10)) % 10
  return checkDigit === calculatedCheck
}

/**
 * Validates EAN-8 check digit
 */
function validateEAN8(barcode: string): boolean {
  if (barcode.length !== 8) return false

  let sum = 0
  for (let i = 0; i < 7; i++) {
    const digit = parseInt(barcode[i], 10)
    if (isNaN(digit)) return false
    sum += digit * (i % 2 === 0 ? 3 : 1)
  }

  const checkDigit = parseInt(barcode[7], 10)
  if (isNaN(checkDigit)) return false

  const calculatedCheck = (10 - (sum % 10)) % 10
  return checkDigit === calculatedCheck
}

/**
 * Validates a barcode (UPC or EAN)
 * @param barcode - The barcode to validate (can include spaces and hyphens)
 * @returns true if valid UPC or EAN, false otherwise
 */
export function isValidBarcode(barcode: string): boolean {
  const cleaned = cleanBarcode(barcode)

  // Check if it's a valid UPC or EAN
  return isValidUPC(cleaned) || isValidEAN(cleaned)
}

/**
 * Detects the type of barcode (UPC or EAN)
 * @param barcode - The barcode to detect
 * @returns 'UPC', 'EAN', or null if invalid
 */
export function detectBarcodeType(barcode: string): 'UPC' | 'EAN' | null {
  const cleaned = cleanBarcode(barcode)

  if (isValidUPC(cleaned)) {
    return 'UPC'
  } else if (isValidEAN(cleaned)) {
    return 'EAN'
  }

  return null
}

/**
 * Extracts barcode from a longer string (useful for barcode scanning)
 * @param text - Text that may contain a barcode
 * @returns Array of found barcodes
 */
export function extractBarcodes(text: string): string[] {
  const barcodes: string[] = []

  // Pattern for 8, 12, or 13 digit barcodes
  const barcodePattern = /\b\d{8}(?:\d{4,5})?\b/g
  const matches = text.match(barcodePattern)

  if (matches) {
    matches.forEach((match) => {
      const cleaned = cleanBarcode(match)
      if (isValidBarcode(cleaned) && !barcodes.includes(cleaned)) {
        barcodes.push(cleaned)
      }
    })
  }

  return barcodes
}

/**
 * Formats artist name from Discogs format
 * Discogs often uses "Artist (2)" for disambiguation, we want to clean this
 */
export function formatArtistName(artist: string): string {
  // Remove disambiguation numbers like "Artist (2)"
  return artist.replace(/\s*\(\d+\)$/, '').trim()
}

/**
 * Parses Discogs title which often includes artist and format info
 * Format: "Artist - Album Title (Format, Country, Year)"
 * @returns Object with artist and title separated
 */
export function parseDiscogsTitle(title: string): { artist: string; title: string } {
  // Try to split on " - " to separate artist and title
  const parts = title.split(' - ')

  if (parts.length >= 2) {
    const artist = formatArtistName(parts[0].trim())
    // Join remaining parts in case title contains " - "
    const albumTitle = parts.slice(1).join(' - ').trim()
    // Remove format/country info in parentheses at the end
    const cleanTitle = albumTitle.replace(/\s*\([^)]*\)\s*$/, '').trim()

    return { artist, title: cleanTitle }
  }

  // If no separator found, return as-is
  return { artist: '', title: title.trim() }
}
