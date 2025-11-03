'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Loader2, Search, X, BookOpen, AlertCircle, Check } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { isValidISBN, cleanISBN, formatISBN } from '@/lib/isbn'
import type { ISBNLookupResult } from '@/types/isbn'
import { toast } from 'sonner'

interface ISBNLookupProps {
  onBookFound: (book: ISBNLookupResult) => void
  onCancel: () => void
}

export function ISBNLookup({ onBookFound, onCancel }: ISBNLookupProps) {
  const [isbn, setIsbn] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null)
  const scannerDivId = 'isbn-barcode-scanner'

  // Cleanup scanner on unmount
  useEffect(() => {
    const cleanup = async () => {
      if (html5QrcodeRef.current && isScanning) {
        try {
          await html5QrcodeRef.current.stop()
        } catch (_err) {
          // Ignore errors during cleanup
        }
      }
    }
    return () => {
      void cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleISBNChange = (value: string) => {
    setIsbn(value)
    setError(null)
  }

  const lookupISBN = async (isbnToLookup: string) => {
    const cleaned = cleanISBN(isbnToLookup)

    // Validate ISBN
    if (!isValidISBN(cleaned)) {
      setError('Invalid ISBN format. Please enter a valid ISBN-10 or ISBN-13.')
      toast.error('Invalid ISBN format')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/isbn/lookup?isbn=${encodeURIComponent(cleaned)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.details || data.error || 'Failed to lookup ISBN')
        toast.error(data.error || 'Failed to lookup ISBN')
        return
      }

      // Success - pass book data to parent
      toast.success(`Book found: ${data.title}`)
      onBookFound(data)
    } catch (err) {
      console.error('ISBN lookup error:', err)
      setError('An unexpected error occurred while looking up the ISBN')
      toast.error('Failed to lookup ISBN')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualLookup = () => {
    if (!isbn.trim()) {
      setError('Please enter an ISBN')
      return
    }
    lookupISBN(isbn)
  }

  const startScanning = async () => {
    setCameraError(null)
    setError(null)
    setIsScanning(true) // Set this first to render the scanner div

    // Wait for next tick to ensure the DOM is updated
    await new Promise((resolve) => setTimeout(resolve, 0))

    try {
      // Initialize scanner after div is rendered
      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode(scannerDivId)
      }

      const qrCodeSuccessCallback = async (decodedText: string) => {
        // Barcode detected and decoded

        // Extract ISBN from barcode (it might have prefix like "ISBN ")
        const possibleISBN = decodedText.replace(/^ISBN[\s:-]*/i, '').trim()

        if (isValidISBN(possibleISBN)) {
          await stopScanning()
          setIsbn(formatISBN(possibleISBN))
          toast.success('ISBN scanned successfully!')
          await lookupISBN(possibleISBN)
        } else {
          toast.error('Scanned barcode is not a valid ISBN')
        }
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      // Start the scanner - it will request permission internally
      await html5QrcodeRef.current.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        config,
        qrCodeSuccessCallback,
        (_errorMessage: string) => {
          // Ignore continuous scanning errors
        }
      )

      toast.info('Point camera at ISBN barcode')
    } catch (err: unknown) {
      // Handle camera access errors
      setIsScanning(false) // Reset scanning state on error
      console.error('Scanner error details:', err)

      // Get error details
      const errorMessage =
        err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()
      const errorName = err instanceof Error && 'name' in err ? String(err.name) : ''

      // Log detailed error info for debugging
      console.error('Error name:', errorName)
      console.error('Error message:', errorMessage)

      // Check if it's a permission error - look for various indicators
      const isPermissionError =
        errorName === 'NotAllowedError' ||
        errorMessage.includes('permission') ||
        errorMessage.includes('notallowederror') ||
        errorMessage.includes('denied') ||
        errorMessage.includes('not allowed')

      if (isPermissionError) {
        setCameraError('Camera permission denied. Please allow camera access and try again.')
        toast.error('Camera permission denied')
      } else {
        // Other errors (camera in use, not found, etc.)
        setCameraError(
          `Unable to access camera. ${errorMessage ? `Error: ${errorMessage}` : 'It may be in use by another app or unavailable.'} Try entering ISBN manually.`
        )
        toast.error('Camera unavailable')
      }
    }
  }

  const stopScanning = async () => {
    if (html5QrcodeRef.current && isScanning) {
      try {
        await html5QrcodeRef.current.stop()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
    setIsScanning(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Add Book by ISBN</CardTitle>
              <CardDescription>Enter ISBN manually or scan with your camera</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Manual ISBN Input */}
        <div className="space-y-2">
          <Label htmlFor="isbn-input">ISBN-10 or ISBN-13</Label>
          <div className="flex gap-2">
            <Input
              id="isbn-input"
              type="text"
              placeholder="Enter ISBN (e.g., 978-0-13-468599-1)"
              value={isbn}
              onChange={(e) => handleISBNChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleManualLookup()
                }
              }}
              disabled={isLoading || isScanning}
            />
            <Button onClick={handleManualLookup} disabled={isLoading || isScanning || !isbn.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Looking up...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Look up
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">You can include or omit hyphens</p>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Barcode Scanner */}
        <div className="space-y-4">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <Camera className="mr-2 h-4 w-4" />
              Scan Barcode with Camera
            </Button>
          ) : (
            <div className="space-y-4">
              <div id={scannerDivId} className="border rounded-lg overflow-hidden" />
              <Button onClick={stopScanning} variant="outline" className="w-full">
                <X className="mr-2 h-4 w-4" />
                Stop Scanning
              </Button>
            </div>
          )}

          {cameraError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            <strong>Tips:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              <li>ISBN is usually found on the back cover with the barcode</li>
              <li>Both ISBN-10 (10 digits) and ISBN-13 (13 digits) are supported</li>
              <li>For best barcode scanning, ensure good lighting and steady camera</li>
              <li>If lookup fails, you can still enter book details manually</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
