'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Loader2, Search, X, Music, AlertCircle, Check, Disc3 } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { isValidBarcode, cleanBarcode } from '@/lib/discogs'
import type { DiscogsSearchResult } from '@/types/discogs'
import { toast } from 'sonner'
import Image from 'next/image'

interface DiscogsSearchProps {
  onAlbumSelected: (album: DiscogsSearchResult) => void
  onCancel: () => void
}

export function DiscogsSearch({ onAlbumSelected, onCancel }: DiscogsSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [barcode, setBarcode] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<DiscogsSearchResult[]>([])

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null)
  const isProcessingRef = useRef(false)
  const lastScannedBarcodeRef = useRef<string | null>(null)
  const scannerDivId = 'discogs-barcode-scanner'

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

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value)
    setError(null)
  }

  const searchDiscogs = async (query?: string, barcodeValue?: string) => {
    if (!query && !barcodeValue) {
      setError('Please enter a search term or barcode')
      return
    }

    setIsLoading(true)
    setError(null)
    setSearchResults([])

    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (barcodeValue) params.append('barcode', cleanBarcode(barcodeValue))
      params.append('perPage', '20')

      const response = await fetch(`/api/discogs/search?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.details || data.error || 'Failed to search Discogs')
        toast.error(data.error || 'Failed to search Discogs')
        return
      }

      if (!data.results || data.results.length === 0) {
        setError('No albums found. Try a different search term.')
        toast.info('No results found')
        return
      }

      setSearchResults(data.results)
      toast.success(`Found ${data.results.length} results`)
    } catch (err) {
      console.error('Discogs search error:', err)
      setError('An unexpected error occurred while searching')
      toast.error('Failed to search Discogs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSearch = () => {
    if (!searchQuery.trim()) {
      setError('Please enter an album title or artist name')
      return
    }
    searchDiscogs(searchQuery)
  }

  const handleBarcodeSearch = () => {
    if (!barcode.trim()) {
      setError('Please enter a barcode')
      return
    }

    const cleaned = cleanBarcode(barcode)
    if (!isValidBarcode(cleaned)) {
      setError('Invalid barcode format. Please enter a valid UPC or EAN barcode.')
      toast.error('Invalid barcode format')
      return
    }

    searchDiscogs(undefined, barcode)
  }

  const handleAlbumClick = (album: DiscogsSearchResult) => {
    toast.success(`Selected: ${album.title}`)
    onAlbumSelected(album)
  }

  const startScanning = async () => {
    setCameraError(null)
    setError(null)
    isProcessingRef.current = false
    lastScannedBarcodeRef.current = null
    setIsScanning(true)

    await new Promise((resolve) => setTimeout(resolve, 0))

    try {
      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode(scannerDivId)
      }

      const qrCodeSuccessCallback = async (decodedText: string) => {
        const possibleBarcode = decodedText.trim()

        if (lastScannedBarcodeRef.current === possibleBarcode) {
          return
        }

        if (isProcessingRef.current) {
          return
        }
        isProcessingRef.current = true

        try {
          if (!isValidBarcode(possibleBarcode)) {
            toast.error('Scanned barcode is not valid')
            isProcessingRef.current = false
            return
          }

          lastScannedBarcodeRef.current = possibleBarcode

          if (html5QrcodeRef.current && isScanning) {
            await html5QrcodeRef.current.stop()
            setIsScanning(false)
          }

          setBarcode(possibleBarcode)
          toast.success('Barcode scanned successfully!')
          await searchDiscogs(undefined, possibleBarcode)
        } catch (err) {
          console.error('Error processing scan:', err)
          toast.error('Error processing barcode')
          lastScannedBarcodeRef.current = null
        } finally {
          isProcessingRef.current = false
        }
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      await html5QrcodeRef.current.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        (_errorMessage: string) => {
          // Ignore continuous scanning errors
        }
      )

      toast.info('Point camera at barcode')
    } catch (err: unknown) {
      setIsScanning(false)
      console.error('Scanner error details:', err)

      const errorMessage =
        err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()
      const errorName = err instanceof Error && 'name' in err ? String(err.name) : ''

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
        setCameraError(
          `Unable to access camera. ${errorMessage ? `Error: ${errorMessage}` : 'It may be in use by another app or unavailable.'} Try entering barcode manually.`
        )
        toast.error('Camera unavailable')
      }
    }
  }

  const stopScanning = async () => {
    try {
      if (html5QrcodeRef.current && isScanning) {
        await html5QrcodeRef.current.stop()
      }
    } catch (err) {
      console.error('Error stopping scanner:', err)
    } finally {
      setIsScanning(false)
      isProcessingRef.current = false
      lastScannedBarcodeRef.current = null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Search for Music Album</CardTitle>
              <CardDescription>Search by title/artist or scan barcode</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Title/Artist Search */}
        <div className="space-y-2">
          <Label htmlFor="search-input">Album Title or Artist</Label>
          <div className="flex gap-2">
            <Input
              id="search-input"
              type="text"
              placeholder="e.g., The Dark Side of the Moon Pink Floyd"
              value={searchQuery}
              onChange={(e) => handleSearchQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleManualSearch()
                }
              }}
              disabled={isLoading || isScanning}
            />
            <Button
              onClick={handleManualSearch}
              disabled={isLoading || isScanning || !searchQuery.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Search
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or scan barcode</span>
          </div>
        </div>

        {/* Barcode Input */}
        <div className="space-y-2">
          <Label htmlFor="barcode-input">Barcode (UPC/EAN)</Label>
          <div className="flex gap-2">
            <Input
              id="barcode-input"
              type="text"
              placeholder="Enter barcode number"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleBarcodeSearch()
                }
              }}
              disabled={isLoading || isScanning}
            />
            <Button
              onClick={handleBarcodeSearch}
              disabled={isLoading || isScanning || !barcode.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Lookup
                </>
              )}
            </Button>
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

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select an Album</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              {searchResults.map((album) => (
                <Card
                  key={album.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleAlbumClick(album)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {album.coverUrl ? (
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={album.coverUrl}
                            alt={album.title}
                            fill
                            className="object-cover rounded"
                            sizes="80px"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex-shrink-0 bg-muted rounded flex items-center justify-center">
                          <Disc3 className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{album.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{album.artist}</p>
                        <div className="flex gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                          {album.year && <span>{album.year}</span>}
                          {album.format && <span>• {album.format}</span>}
                          {album.label && <span className="truncate">• {album.label}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            <strong>Tips:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              <li>Search by album title, artist name, or both for best results</li>
              <li>Barcode lookup provides exact matches</li>
              <li>UPC (12 digits) and EAN (8/13 digits) barcodes are supported</li>
              <li>Select an album from results to auto-fill the form</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
