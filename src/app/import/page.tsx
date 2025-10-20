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
import { ColumnMapping } from '@/components/import/column-mapping'
import { ImportProgress } from '@/components/import/import-progress'
import { ImportSummary } from '@/components/import/import-summary'

type CollectionType = 'VIDEOGAME' | 'MUSIC' | 'BOOK'

type ImportStep = 'upload' | 'mapping' | 'import' | 'complete'

interface ParsedPreview {
  preview: Record<string, unknown>[]
  fullData: Record<string, unknown>[]
  columns: string[]
  totalRows: number
  validRows: number
  invalidRows: number
  errors: Array<{
    row: number
    field: string
    message: string
    value: unknown
  }>
}

interface ImportError {
  row: number
  field?: string
  message: string
  value?: unknown
}

interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: ImportError[]
  duration: number
}

export default function ImportPage() {
  const router = useRouter()
  const [step, setStep] = useState<ImportStep>('upload')
  const [collectionType, setCollectionType] = useState<CollectionType>()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedPreview | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  // Validate and set file
  const validateAndSetFile = useCallback((file: File) => {
    if (file.name.endsWith('.csv')) {
      setSelectedFile(file)
    } else {
      toast.error('Please select a CSV file')
    }
  }, [])

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const csvFile = files.find((file) => file.name.endsWith('.csv'))

      if (csvFile) {
        validateAndSetFile(csvFile)
      } else {
        toast.error('Please select a CSV file')
      }
    },
    [validateAndSetFile]
  )

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
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
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('collectionType', collectionType)

      const response = await fetch('/api/import/parse', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to parse CSV file')
      }

      setParsedData(result)
      toast.success(`CSV parsed successfully! Found ${result.validRows} valid rows.`)

      // Show warning if there are invalid rows
      if (result.invalidRows > 0) {
        toast.warning(`${result.invalidRows} rows have validation errors`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload file')
      setParsedData(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setParsedData(null)
  }

  const handleMappingComplete = async (mapping: Record<string, string>) => {
    setStep('import')

    // Start import process
    await executeImport(mapping)
  }

  const handleBackToUpload = () => {
    setStep('upload')
  }

  const executeImport = async (mapping: Record<string, string>) => {
    if (!parsedData || !collectionType) return

    setIsImporting(true)
    const totalRows = parsedData.fullData.length
    setImportProgress({ current: 0, total: totalRows })

    try {
      // Transform CSV data using column mapping
      const transformedData = parsedData.fullData.map((row) => {
        const transformed: Record<string, unknown> = {}
        for (const [csvCol, dbField] of Object.entries(mapping)) {
          if (dbField && row[csvCol] !== undefined) {
            transformed[dbField] = row[csvCol]
          }
        }
        return transformed
      })

      // Update progress after transformation
      setImportProgress({ current: Math.floor(totalRows * 0.1), total: totalRows })

      // Process in chunks for better progress feedback
      const CHUNK_SIZE = 50
      const chunks: Record<string, unknown>[][] = []
      for (let i = 0; i < transformedData.length; i += CHUNK_SIZE) {
        chunks.push(transformedData.slice(i, i + CHUNK_SIZE))
      }

      let totalImported = 0
      let totalFailed = 0
      const allErrors: ImportError[] = []

      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]

        const response = await fetch('/api/import/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collectionType,
            data: chunk,
            columnMapping: mapping,
          }),
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Import failed')
        }

        totalImported += result.imported
        totalFailed += result.failed
        allErrors.push(...result.errors)

        // Update progress after each chunk
        const processed = Math.min((i + 1) * CHUNK_SIZE, totalRows)
        setImportProgress({ current: processed, total: totalRows })
      }

      // Create final result
      const finalResult: ImportResult = {
        success: true,
        imported: totalImported,
        failed: totalFailed,
        errors: allErrors,
        duration: 0, // We don't track total duration for chunked processing
      }

      setImportResult(finalResult)
      setStep('complete')
      toast.success(`Import complete! ${totalImported} items imported successfully.`)
    } catch (error) {
      console.error('Import error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to import data')
      setStep('mapping')
    } finally {
      setIsImporting(false)
    }
  }

  const handleDownloadErrorReport = () => {
    if (!importResult || importResult.errors.length === 0) return

    // Create CSV content
    const csvContent = [
      ['Row', 'Field', 'Error', 'Value'].join(','),
      ...importResult.errors.map((err) =>
        [
          err.row,
          err.field || 'N/A',
          `"${err.message.replace(/"/g, '""')}"`,
          err.value !== null && err.value !== undefined
            ? `"${String(err.value).replace(/"/g, '""')}"`
            : '-',
        ].join(',')
      ),
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `import-errors-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success('Error report downloaded')
  }

  const handleFinish = () => {
    // Reset state and go back to upload
    setParsedData(null)
    setSelectedFile(null)
    setImportResult(null)
    setStep('upload')
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import Data</h1>
        <p className="text-muted-foreground">Import your collection data from a CSV file</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'upload'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            1
          </div>
          <span className={step === 'upload' ? 'font-medium' : 'text-muted-foreground'}>
            Upload
          </span>
        </div>
        <div className="w-12 h-0.5 bg-muted" />
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'mapping'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </div>
          <span className={step === 'mapping' ? 'font-medium' : 'text-muted-foreground'}>
            Mapping
          </span>
        </div>
        <div className="w-12 h-0.5 bg-muted" />
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'import'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            3
          </div>
          <span className={step === 'import' ? 'font-medium' : 'text-muted-foreground'}>
            Import
          </span>
        </div>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
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
                      <strong>Music:</strong> Required: Title, Artist. Optional: Album, Year,
                      Format, Genre, etc.
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
              <CardDescription>
                Select your collection type and upload your CSV file
              </CardDescription>
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

          {/* Preview Card - Only shown after successful upload */}
          {parsedData && (
            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  Preview of first 10 rows ({parsedData.validRows} valid rows,{' '}
                  {parsedData.invalidRows} invalid rows out of {parsedData.totalRows} total)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Column names */}
                <div>
                  <h3 className="font-medium text-sm mb-2">
                    Detected Columns ({parsedData.columns.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.columns.map((column, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                      >
                        {column}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preview table */}
                <div>
                  <h3 className="font-medium text-sm mb-2">First 10 Rows</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-xs">#</th>
                            {parsedData.columns.map((column, index) => (
                              <th key={index} className="px-3 py-2 text-left font-medium text-xs">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.preview.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t hover:bg-muted/50">
                              <td className="px-3 py-2 text-muted-foreground">{rowIndex + 1}</td>
                              {parsedData.columns.map((column, colIndex) => (
                                <td key={colIndex} className="px-3 py-2">
                                  {typeof row[column] === 'object'
                                    ? JSON.stringify(row[column])
                                    : String(row[column] ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Validation errors (if any) */}
                {parsedData.errors.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm mb-2 text-destructive">
                      Validation Errors (showing first 20)
                    </h3>
                    <div className="border rounded-lg border-destructive/20 bg-destructive/5 p-3 max-h-60 overflow-y-auto">
                      <div className="space-y-2">
                        {parsedData.errors.map((error, index) => (
                          <div key={index} className="text-xs">
                            <span className="font-medium">Row {error.row}:</span>{' '}
                            <span className="text-muted-foreground">{error.field}</span> -{' '}
                            {error.message}
                            {error.value !== null && error.value !== undefined && (
                              <span className="ml-1 text-muted-foreground">
                                (value:{' '}
                                {typeof error.value === 'object'
                                  ? JSON.stringify(error.value)
                                  : String(error.value)}
                                )
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Next step button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setParsedData(null)
                      setSelectedFile(null)
                    }}
                  >
                    Upload Different File
                  </Button>
                  <Button
                    onClick={() => {
                      setStep('mapping')
                    }}
                  >
                    Continue to Mapping
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Mapping Step */}
      {step === 'mapping' && parsedData && collectionType && (
        <Card>
          <CardContent className="pt-6">
            <ColumnMapping
              csvColumns={parsedData.columns}
              collectionType={collectionType}
              onMappingComplete={handleMappingComplete}
              onBack={handleBackToUpload}
            />
          </CardContent>
        </Card>
      )}

      {/* Import Step */}
      {step === 'import' && isImporting && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <ImportProgress
              current={importProgress.current}
              total={importProgress.total}
              status="Validating and importing items..."
            />
          </div>
        </div>
      )}

      {/* Complete Step */}
      {step === 'complete' && importResult && (
        <ImportSummary
          imported={importResult.imported}
          failed={importResult.failed}
          errors={importResult.errors}
          duration={importResult.duration}
          onDownloadErrors={importResult.errors.length > 0 ? handleDownloadErrorReport : undefined}
          onFinish={handleFinish}
        />
      )}
    </div>
  )
}
