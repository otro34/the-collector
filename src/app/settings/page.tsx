import Link from 'next/link'
import { Database, Settings as SettingsIcon, FileUp, Info, ChevronRight } from 'lucide-react'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type SettingsSection = {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href?: string
  disabled?: boolean
  comingSoon?: boolean
}

const settingsSections: SettingsSection[] = [
  {
    id: 'backup',
    title: 'Backup Settings',
    description: 'Configure automatic backups, cloud storage, and manage your backup history',
    icon: Database,
    href: '/settings/backup',
  },
  {
    id: 'export-import',
    title: 'Export & Import',
    description: 'Import collections from CSV files or export your data to various formats',
    icon: FileUp,
    href: '/import',
  },
  {
    id: 'general',
    title: 'General Settings',
    description: 'Manage application preferences, language, and display options',
    icon: SettingsIcon,
    disabled: true,
    comingSoon: true,
  },
  {
    id: 'about',
    title: 'About & Info',
    description: 'View application information, version details, and documentation',
    icon: Info,
    disabled: true,
    comingSoon: true,
  },
]

export default function SettingsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        {settingsSections.map((section) => {
          const Icon = section.icon
          const isDisabled = section.disabled || false

          const cardContent = (
            <Card
              className={`relative overflow-hidden transition-all ${
                isDisabled
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        isDisabled ? 'bg-muted' : 'bg-primary/10 text-primary dark:bg-primary/20'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {section.title}
                        {section.comingSoon && (
                          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                            Coming Soon
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1.5">{section.description}</CardDescription>
                    </div>
                  </div>
                  {!isDisabled && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
            </Card>
          )

          if (isDisabled) {
            return <div key={section.id}>{cardContent}</div>
          }

          return (
            <Link key={section.id} href={section.href!}>
              {cardContent}
            </Link>
          )
        })}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-muted">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">More settings coming soon</p>
            <p className="text-sm text-muted-foreground mt-1">
              We're continuously adding new features and settings to enhance your collection
              management experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
