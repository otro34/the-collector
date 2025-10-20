'use client'

import { useState, useEffect } from 'react'
import type { CollectionType } from '@prisma/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import {
  DATABASE_FIELDS,
  autoDetectColumnMapping,
  validateMapping,
  saveColumnMapping,
  loadColumnMapping,
} from '@/lib/import-fields'

interface ColumnMappingProps {
  csvColumns: string[]
  collectionType: CollectionType
  onMappingComplete: (mapping: Record<string, string>) => void
  onBack: () => void
}

export function ColumnMapping({
  csvColumns,
  collectionType,
  onMappingComplete,
  onBack,
}: ColumnMappingProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [validation, setValidation] = useState<{ valid: boolean; missingFields: string[] }>({
    valid: false,
    missingFields: [],
  })

  const dbFields = DATABASE_FIELDS[collectionType]
  const requiredFields = dbFields.filter((f) => f.required)

  // Initialize mapping with auto-detect or saved mapping
  useEffect(() => {
    // Try to load saved mapping first
    const savedMapping = loadColumnMapping(collectionType)

    if (savedMapping) {
      // Check if saved mapping columns match current CSV columns
      const savedColumns = Object.keys(savedMapping)
      const hasMatchingColumns = savedColumns.some((col) => csvColumns.includes(col))

      if (hasMatchingColumns) {
        // Filter to only include columns that exist in current CSV
        const filteredMapping: Record<string, string> = {}
        csvColumns.forEach((col) => {
          if (savedMapping[col]) {
            filteredMapping[col] = savedMapping[col]
          }
        })
        setMapping(filteredMapping)
        return
      }
    }

    // Fall back to auto-detect
    const autoMapping = autoDetectColumnMapping(csvColumns, collectionType)
    setMapping(autoMapping)
  }, [csvColumns, collectionType])

  // Validate mapping whenever it changes
  useEffect(() => {
    const result = validateMapping(mapping, collectionType)
    setValidation(result)
  }, [mapping, collectionType])

  const handleMappingChange = (csvColumn: string, dbField: string) => {
    setMapping((prev) => ({
      ...prev,
      [csvColumn]: dbField === 'unmapped' ? '' : dbField,
    }))
  }

  const handleContinue = () => {
    if (validation.valid) {
      // Save mapping for future use
      saveColumnMapping(collectionType, mapping)
      onMappingComplete(mapping)
    }
  }

  const handleAutoDetect = () => {
    const autoMapping = autoDetectColumnMapping(csvColumns, collectionType)
    setMapping(autoMapping)
  }

  // Get mapped field count
  const mappedCount = Object.values(mapping).filter((v) => v).length
  const mappedRequiredCount = requiredFields.filter((f) =>
    Object.values(mapping).includes(f.key)
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Map CSV Columns</h2>
        <p className="text-muted-foreground">
          Map your CSV columns to database fields. Required fields must be mapped to continue.
        </p>
      </div>

      {/* Mapping Status */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {validation.valid ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            <span className="font-medium">
              {mappedRequiredCount}/{requiredFields.length} required fields mapped
            </span>
          </div>
          <Badge variant="secondary">
            {mappedCount}/{csvColumns.length} columns mapped
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleAutoDetect}>
          Auto-Detect Again
        </Button>
      </div>

      {/* Missing Required Fields Warning */}
      {!validation.valid && validation.missingFields.length > 0 && (
        <div className="flex items-start gap-3 p-4 border border-amber-500/50 rounded-lg bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-100">
              Missing Required Fields
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Please map the following required fields: {validation.missingFields.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Column Mapping Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">CSV Column</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Maps To</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Database Field</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Info</th>
              </tr>
            </thead>
            <tbody>
              {csvColumns.map((csvColumn, index) => {
                const mappedField = mapping[csvColumn]
                const dbField = dbFields.find((f) => f.key === mappedField)
                const isRequired = dbField?.required ?? false

                return (
                  <tr key={index} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{csvColumn}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted-foreground">→</span>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={mappedField || 'unmapped'}
                        onValueChange={(value) => handleMappingChange(csvColumn, value)}
                      >
                        <SelectTrigger className="w-full max-w-xs">
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unmapped">
                            <span className="text-muted-foreground italic">Don't import</span>
                          </SelectItem>
                          {dbFields.map((field) => (
                            <SelectItem key={field.key} value={field.key}>
                              <div className="flex items-center gap-2">
                                {field.label}
                                {field.required && (
                                  <Badge variant="destructive" className="text-xs py-0 px-1.5">
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      {dbField && (
                        <div className="flex items-center gap-2">
                          {isRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                          {dbField.description && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Info className="w-3 h-3" />
                              <span>{dbField.description}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-start gap-2 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-900 dark:text-blue-100">Mapping Tips</p>
          <ul className="list-disc list-inside mt-1 space-y-1 text-blue-700 dark:text-blue-300">
            <li>Required fields must be mapped to proceed with import</li>
            <li>Optional fields can be skipped (select "Don't import")</li>
            <li>Your mapping will be saved for future imports</li>
            <li>Click "Auto-Detect Again" to reset the auto-detection</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!validation.valid}>
          Continue to Import
        </Button>
      </div>
    </div>
  )
}
