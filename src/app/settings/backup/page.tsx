'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, TestTube, ArrowLeft, Database, Activity } from 'lucide-react'
import Link from 'next/link'

const backupSettingsSchema = z.object({
  automaticBackups: z.boolean(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']),
  backupRetention: z.number().int().min(1).max(100),
  cloudStorageEnabled: z.boolean(),
  cloudProvider: z.enum(['none', 's3', 'r2', 'dropbox']),
  s3Bucket: z.string().optional(),
  s3Region: z.string().optional(),
  s3AccessKeyId: z.string().optional(),
  s3SecretAccessKey: z.string().optional(),
  r2AccountId: z.string().optional(),
  r2AccessKeyId: z.string().optional(),
  r2SecretAccessKey: z.string().optional(),
  dropboxAccessToken: z.string().optional(),
})

type BackupSettings = z.infer<typeof backupSettingsSchema>

export default function BackupSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const form = useForm<BackupSettings>({
    resolver: zodResolver(backupSettingsSchema),
    defaultValues: {
      automaticBackups: false,
      backupFrequency: 'weekly',
      backupRetention: 5,
      cloudStorageEnabled: false,
      cloudProvider: 'none',
    },
  })

  const cloudProvider = form.watch('cloudProvider')
  const cloudStorageEnabled = form.watch('cloudStorageEnabled')

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings/backup')
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            form.reset(data.settings)
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [form])

  async function onSubmit(data: BackupSettings) {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  async function testConnection() {
    setIsTesting(true)
    try {
      const provider = form.getValues('cloudProvider')

      if (provider === 'none') {
        toast.error('Please select a cloud provider first')
        return
      }

      const credentials = {
        provider,
        ...(provider === 's3' && {
          bucket: form.getValues('s3Bucket'),
          region: form.getValues('s3Region'),
          accessKeyId: form.getValues('s3AccessKeyId'),
          secretAccessKey: form.getValues('s3SecretAccessKey'),
        }),
        ...(provider === 'r2' && {
          accountId: form.getValues('r2AccountId'),
          accessKeyId: form.getValues('r2AccessKeyId'),
          secretAccessKey: form.getValues('r2SecretAccessKey'),
        }),
        ...(provider === 'dropbox' && {
          accessToken: form.getValues('dropboxAccessToken'),
        }),
      }

      const response = await fetch('/api/settings/backup/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success('Connection successful!')
      } else {
        toast.error(result.error || 'Connection failed')
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      toast.error('Connection test failed')
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/settings')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Backup Settings</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Configure automatic backups and cloud storage options
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/settings/backup/logs">
              <Button variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                View Logs
              </Button>
            </Link>
            <Link href="/settings/backup/manage">
              <Button variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Manage Backups
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Automatic Backups Section */}
          <Card>
            <CardHeader>
              <CardTitle>Automatic Backups</CardTitle>
              <CardDescription>
                Configure automatic backup schedule and retention policy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="automaticBackups"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Automatic Backups</FormLabel>
                      <FormDescription>Automatically create backups on a schedule</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="backupFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Backup Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>How often to create automatic backups</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="backupRetention"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Backup Retention</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of backups to keep (older backups will be deleted automatically)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Cloud Storage Section */}
          <Card>
            <CardHeader>
              <CardTitle>Cloud Storage</CardTitle>
              <CardDescription>Configure cloud storage for off-site backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="cloudStorageEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Cloud Storage</FormLabel>
                      <FormDescription>
                        Upload backups to cloud storage automatically
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {cloudStorageEnabled && (
                <>
                  <FormField
                    control={form.control}
                    name="cloudProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cloud Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="s3">Amazon S3</SelectItem>
                            <SelectItem value="r2">Cloudflare R2</SelectItem>
                            <SelectItem value="dropbox">Dropbox</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose your cloud storage provider</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {cloudProvider !== 'none' && (
                    <Tabs defaultValue={cloudProvider} value={cloudProvider} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="s3">Amazon S3</TabsTrigger>
                        <TabsTrigger value="r2">Cloudflare R2</TabsTrigger>
                        <TabsTrigger value="dropbox">Dropbox</TabsTrigger>
                      </TabsList>

                      {/* Amazon S3 Configuration */}
                      <TabsContent value="s3" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="s3Bucket"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>S3 Bucket Name</FormLabel>
                              <FormControl>
                                <Input placeholder="my-backup-bucket" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="s3Region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>S3 Region</FormLabel>
                              <FormControl>
                                <Input placeholder="us-east-1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="s3AccessKeyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Key ID</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="s3SecretAccessKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secret Access Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      {/* Cloudflare R2 Configuration */}
                      <TabsContent value="r2" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="r2AccountId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account ID</FormLabel>
                              <FormControl>
                                <Input placeholder="your-account-id" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="r2AccessKeyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Key ID</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="r2SecretAccessKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secret Access Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      {/* Dropbox Configuration */}
                      <TabsContent value="dropbox" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="dropboxAccessToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Token</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormDescription>
                                Generate an access token from the Dropbox App Console
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  )}

                  {cloudProvider !== 'none' && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={testConnection}
                        disabled={isTesting}
                      >
                        {isTesting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <TestTube className="mr-2 h-4 w-4" />
                            Test Connection
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/settings')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
