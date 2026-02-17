import type { Metadata } from 'next'
import {
  Keyboard,
  Search,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  X,
  Gamepad2,
  Upload,
  Database,
  HelpCircle,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Help & Documentation | The Collector',
  description: 'Learn how to use The Collector app and discover keyboard shortcuts',
}

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Help & Documentation</h1>
        </div>
        <p className="text-muted-foreground">
          Learn how to use The Collector to manage your video games, music, and books collections.
        </p>
      </div>

      {/* Keyboard Shortcuts Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <CardTitle>Keyboard Shortcuts</CardTitle>
          </div>
          <CardDescription>Use these keyboard shortcuts to navigate faster</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Shortcuts */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>Global Shortcuts</span>
            </h3>
            <div className="space-y-2">
              <ShortcutRow
                keys={['/']}
                description="Focus the search bar from anywhere"
                icon={<Search className="h-4 w-4" />}
              />
              <ShortcutRow
                keys={['Esc']}
                description="Close open modals, dialogs, or clear search"
                icon={<X className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Search Shortcuts */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>Search Navigation</span>
            </h3>
            <div className="space-y-2">
              <ShortcutRow
                keys={['↑']}
                description="Navigate up in search results"
                icon={<ArrowUp className="h-4 w-4" />}
              />
              <ShortcutRow
                keys={['↓']}
                description="Navigate down in search results"
                icon={<ArrowDown className="h-4 w-4" />}
              />
              <ShortcutRow
                keys={['Enter']}
                description="Open selected search result"
                icon={<CornerDownLeft className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Guide */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Features Guide</CardTitle>
          <CardDescription>Overview of main features and how to use them</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Collections */}
          <FeatureSection
            icon={<Gamepad2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            title="Managing Collections"
            description="The Collector supports three types of collections:"
            items={[
              {
                name: 'Video Games',
                description:
                  'Track your game collection with platform, publisher, developer, genres, and more.',
              },
              {
                name: 'Music',
                description:
                  'Manage your vinyl, CDs, and digital albums with artist, format, and tracklist info.',
              },
              {
                name: 'Books',
                description:
                  'Organize manga, comics, and other books with series, volume, author, and publisher.',
              },
            ]}
          />

          {/* Search & Filter */}
          <FeatureSection
            icon={<Search className="h-5 w-5 text-primary" />}
            title="Search & Filter"
            description="Find items in your collection quickly:"
            items={[
              {
                name: 'Global Search',
                description: 'Use the search bar in the header to search across all collections.',
              },
              {
                name: 'Collection Search',
                description:
                  'Each collection page has a dedicated search box for that collection type.',
              },
              {
                name: 'Filters',
                description:
                  'Use the filter sidebar to narrow down results by platform, genre, year, and more.',
              },
              {
                name: 'Sorting',
                description:
                  'Sort items by title, year, or date added in ascending or descending order.',
              },
            ]}
          />

          {/* Import/Export */}
          <FeatureSection
            icon={<Upload className="h-5 w-5 text-primary" />}
            title="Import & Export"
            description="Manage your collection data:"
            items={[
              {
                name: 'CSV Import',
                description:
                  'Import items from CSV files with automatic column mapping and validation.',
              },
              {
                name: 'CSV Export',
                description: 'Export your collections to CSV format with custom field selection.',
              },
              {
                name: 'JSON Export',
                description: 'Download your entire database or specific collections as JSON.',
              },
            ]}
          />

          {/* Backup */}
          <FeatureSection
            icon={<Database className="h-5 w-5 text-primary" />}
            title="Backup & Recovery"
            description="Keep your data safe:"
            items={[
              {
                name: 'Manual Backup',
                description: 'Create database backups on demand from the dashboard or settings.',
              },
              {
                name: 'Automatic Backups',
                description:
                  'Schedule automatic backups (daily, weekly, or monthly) in backup settings.',
              },
              {
                name: 'Cloud Upload',
                description: 'Upload backups to S3, Cloudflare R2, or Dropbox for extra safety.',
              },
              {
                name: 'Restore',
                description: 'Restore your database from any backup with automatic safety backup.',
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FAQItem
            question="How do I add items to my collection?"
            answer="Click the 'Add' button on any collection page (Video Games, Music, or Books). Fill out the form with item details and click 'Save'. You can also use the quick actions on the dashboard."
          />
          <FAQItem
            question="Can I import my existing collection data?"
            answer="Yes! Go to the Import page (linked from dashboard or settings) and upload a CSV file. The app will automatically detect columns and guide you through mapping them to the correct fields."
          />
          <FAQItem
            question="How do I backup my collection?"
            answer="Click the 'Create Backup' button on the dashboard or go to Settings > Backup to create manual backups. You can also set up automatic scheduled backups and upload them to cloud storage."
          />
          <FAQItem
            question="Can I search across all my collections at once?"
            answer="Yes! Use the search bar in the header (or press '/' on your keyboard) to search across all collections. Results will show items from video games, music, and books with color-coded badges."
          />
          <FAQItem
            question="What image formats are supported for cover art?"
            answer="The app stores cover image URLs (not local files). You can use any publicly accessible image URL (HTTPS). Common formats like JPG, PNG, and WebP work well."
          />
          <FAQItem
            question="Is my data stored in the cloud?"
            answer="No, your data is stored locally in a database on your machine. Cloud features are optional and only used for backups if you choose to enable them in settings."
          />
          <FAQItem
            question="Can I use this on mobile devices?"
            answer="Yes! The app is fully responsive and works on mobile, tablet, and desktop. All features are touch-friendly and optimized for smaller screens."
          />
        </CardContent>
      </Card>

      {/* Accessibility Section */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>Accessibility</CardTitle>
          </div>
          <CardDescription>
            The Collector is designed to be accessible to all users, including those using assistive
            technologies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FeatureSection
            icon={<Keyboard className="h-5 w-5 text-primary" />}
            title="Keyboard Navigation"
            description="All features are fully accessible via keyboard:"
            items={[
              {
                name: 'Tab Navigation',
                description: 'Navigate through all interactive elements using Tab and Shift+Tab.',
              },
              {
                name: 'Skip to Content',
                description:
                  'Press Tab on page load to reveal a "Skip to content" link that bypasses navigation.',
              },
              {
                name: 'Focus Indicators',
                description:
                  'All interactive elements show a clear 2px outline when focused for easy visibility.',
              },
            ]}
          />

          <FeatureSection
            icon={<Eye className="h-5 w-5 text-primary" />}
            title="Screen Reader Support"
            description="Full compatibility with screen readers:"
            items={[
              {
                name: 'ARIA Labels',
                description:
                  'All buttons, links, and interactive elements have descriptive labels for screen readers.',
              },
              {
                name: 'Alt Text',
                description:
                  'All images include descriptive alt text to convey their meaning and purpose.',
              },
              {
                name: 'Semantic HTML',
                description:
                  'Proper heading hierarchy and semantic elements ensure logical document structure.',
              },
            ]}
          />

          <FeatureSection
            icon={<Eye className="h-5 w-5 text-primary" />}
            title="Visual Accessibility"
            description="Designed for users with visual impairments:"
            items={[
              {
                name: 'High Contrast',
                description:
                  'Text meets WCAG AA contrast requirements (4.5:1 minimum) in both light and dark modes.',
              },
              {
                name: 'Responsive Text',
                description: 'Text can be enlarged up to 200% without loss of functionality.',
              },
              {
                name: 'Touch Targets',
                description:
                  'All interactive elements meet minimum touch target size of 44x44 pixels.',
              },
            ]}
          />

          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground">
              We are committed to accessibility and WCAG 2.1 AA compliance. For detailed
              accessibility information, see{' '}
              <a
                href="https://github.com/otro34/the-collector/blob/main/docs/ACCESSIBILITY.md"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                our accessibility documentation
              </a>
              . If you encounter accessibility issues, please report them on our GitHub repository.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Need more help? Check the settings page for additional options and configurations.</p>
      </div>
    </div>
  )
}

// Helper Components
interface ShortcutRowProps {
  keys: string[]
  description: string
  icon?: React.ReactNode
}

function ShortcutRow({ keys, description, icon }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <span className="text-sm">{description}</span>
      </div>
      <div className="flex items-center gap-2">
        {keys.map((key, index) => (
          <Badge key={index} variant="outline" className="font-mono px-2 py-1">
            {key}
          </Badge>
        ))}
      </div>
    </div>
  )
}

interface FeatureSectionProps {
  icon: React.ReactNode
  title: string
  description: string
  items: {
    name: string
    description: string
  }[]
}

function FeatureSection({ icon, title, description, items }: FeatureSectionProps) {
  return (
    <div className="border-t pt-6 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="space-y-3 ml-7">
        {items.map((item, index) => (
          <div key={index}>
            <div className="font-medium text-sm">{item.name}</div>
            <div className="text-sm text-muted-foreground">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <div className="border-t pt-6 first:border-t-0 first:pt-0">
      <h3 className="font-semibold mb-2">{question}</h3>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </div>
  )
}
