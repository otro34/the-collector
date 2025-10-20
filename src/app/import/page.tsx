'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

type CollectionType = 'VIDEOGAME' | 'MUSIC' | 'BOOK'

export default function ImportPage() {
  const router = useRouter()
  const [collectionType, setCollectionType] = useState<CollectionType>()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find((file) => file.name.endsWith('.csv'))

    if (csvFile) {
      setSelectedFile(csvFile)
    } else {
      toast.error('Please select a CSV file')
    }
  }, [])

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file)
      } else {
        toast.error('Please select a CSV file')
      }
    }
  }

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !collectionType) {
      toast.error('Please select a file and collection type')
      return
    }

    setIsUploading(true)

    try {
      // TODO: Implement actual upload in US-6.2
      // For now, just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('File uploaded successfully')
      // router.push('/import/mapping') // Will navigate to mapping page in US-6.3
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import Data</h1>
        <p className="text-muted-foreground">Import your collection data from a CSV file</p>
      </div>

      <div className="grid gap-6">
        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Before You Import
            </CardTitle>
            <CardDescription>Please review these important guidelines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong className="font-medium">CSV File Requirements:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground ml-2">
                  <li>File must be in CSV format (.csv extension)</li>
                  <li>First row should contain column headers</li>
                  <li>UTF-8 encoding recommended</li>
                  <li>Maximum file size: 10MB</li>
                </ul>
              </div>

              <div>
                <strong className="font-medium">Collection-Specific Fields:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground ml-2">
                  <li>
                    <strong>Videogames:</strong> Required: Title, Platform. Optional: Year,
                    Developer, Publisher, Genre, etc.
                  </li>
                  <li>
                    <strong>Music:</strong> Required: Title, Artist. Optional: Album, Year, Format,
                    Genre, etc.
                  </li>
                  <li>
                    <strong>Books:</strong> Required: Title, Author. Optional: Year, Publisher,
                    Series, Type, etc.
                  </li>
                </ul>
              </div>

              <div>
                <strong className="font-medium">Import Process:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1 text-muted-foreground ml-2">
                  <li>Select your collection type</li>
                  <li>Upload your CSV file</li>
                  <li>Map columns to database fields (next step)</li>
                  <li>Review and validate data (next step)</li>
                  <li>Complete the import</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>Select your collection type and upload your CSV file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Collection Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="collection-type">Collection Type</Label>
              <Select
                value={collectionType}
                onValueChange={(value) => setCollectionType(value as CollectionType)}
              >
                <SelectTrigger id="collection-type">
                  <SelectValue placeholder="Select collection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEOGAME">Video Games</SelectItem>
                  <SelectItem value="MUSIC">Music</SelectItem>
                  <SelectItem value="BOOK">Books</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>CSV File</Label>
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8
                  transition-colors duration-200
                  ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                  ${!collectionType ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
                `}
                onDragEnter={collectionType ? handleDragEnter : undefined}
                onDragOver={collectionType ? handleDragOver : undefined}
                onDragLeave={collectionType ? handleDragLeave : undefined}
                onDrop={collectionType ? handleDrop : undefined}
                onClick={() => {
                  if (collectionType) {
                    document.getElementById('file-input')?.click()
                  }
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={!collectionType}
                />

                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  {selectedFile ? (
                    <>
                      <FileText className="w-12 h-12 text-primary" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleClearFile()
                        }}
                      >
                        Clear
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {collectionType
                            ? 'Drag & drop your CSV file here'
                            : 'Select a collection type first'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {collectionType && 'or click to browse'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !collectionType || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload & Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
