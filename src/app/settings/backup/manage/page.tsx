'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  Loader2,
  Download,
  Trash2,
  ArrowLeft,
  Database,
  Calendar,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudUpload,
} from 'lucide-react'

type Backup = {
  id: string
  filename: string
  size: number
  itemCount: number
  location: string
  type: string
  createdAt: string
}

type BackupListResponse = {
  success: boolean
  backups: Backup[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export default function BackupManagePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const limit = 10

  // Fetch backups
  const { data, isLoading, error } = useQuery<BackupListResponse>({
    queryKey: ['backups', page, limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/backup/list?page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=desc`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch backups')
      }
      return response.json()
    },
  })

  // Delete backup mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/backup/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete backup')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Backup deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      setDeleteId(null)
    },
    onError: (error) => {
      console.error('Delete error:', error)
      toast.error('Failed to delete backup')
    },
  })

  // Upload to cloud mutation
  const uploadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/backup/${id}/upload`, {
        method: 'POST',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload backup')
      }
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Backup uploaded to cloud successfully')
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
    onError: (error) => {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload backup')
    },
  })

  // Download backup
  const handleDownload = async (backup: Backup) => {
    try {
      const response = await fetch(`/api/backup/${backup.id}/download`)
      if (!response.ok) {
        throw new Error('Failed to download backup')
      }

      // Create a blob from the response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = backup.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Backup downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download backup')
    }
  }

  // Delete backup
  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId)
    }
  }

  // Format file size
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Check if backup is in cloud
  const isInCloud = (location: string) => {
    return location.startsWith('https://') || location.startsWith('dropbox:')
  }

  // Handle cloud upload
  const handleUploadToCloud = (id: string) => {
    uploadMutation.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load backups</p>
          <Button onClick={() => router.push('/settings/backup')} className="mt-4">
            Back to Settings
          </Button>
        </div>
      </div>
    )
  }

  const backups = data?.backups || []
  const pagination = data?.pagination

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/settings/backup')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Backup Settings
        </Button>
        <h1 className="text-3xl font-bold">Backup Management</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View, download, and manage your database backups
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Backups</CardTitle>
          <CardDescription>
            {pagination &&
              `${pagination.totalCount} backup${pagination.totalCount !== 1 ? 's' : ''} total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No backups yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create your first backup to get started
              </p>
              <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[25%]">Filename</TableHead>
                      <TableHead className="w-[13%]">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Date
                        </div>
                      </TableHead>
                      <TableHead className="w-[10%]">
                        <div className="flex items-center">
                          <HardDrive className="h-4 w-4 mr-2" />
                          Size
                        </div>
                      </TableHead>
                      <TableHead className="w-[8%]">
                        <div className="flex items-center">
                          <Database className="h-4 w-4 mr-2" />
                          Items
                        </div>
                      </TableHead>
                      <TableHead className="w-[10%]">Type</TableHead>
                      <TableHead className="w-[10%]">Location</TableHead>
                      <TableHead className="w-[24%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">{backup.filename}</TableCell>
                        <TableCell>{formatDate(backup.createdAt)}</TableCell>
                        <TableCell>{formatSize(backup.size)}</TableCell>
                        <TableCell>{backup.itemCount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                            {backup.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isInCloud(backup.location) ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              <Cloud className="h-3 w-3 mr-1" />
                              Cloud
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              <HardDrive className="h-3 w-3 mr-1" />
                              Local
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!isInCloud(backup.location) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUploadToCloud(backup.id)}
                                disabled={uploadMutation.isPending}
                              >
                                {uploadMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <CloudUpload className="h-4 w-4 mr-1" />
                                )}
                                Upload
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(backup)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(backup.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                    {pagination.totalCount} backups
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Backup"
        description="Are you sure you want to delete this backup? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
