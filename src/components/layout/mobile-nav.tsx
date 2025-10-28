'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gamepad2, Music, BookOpen, LayoutDashboard, Upload, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlobalSearch } from '@/components/shared/global-search'

export function MobileNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      href: '/videogames',
      label: 'Video Games',
      icon: Gamepad2,
      active: pathname?.startsWith('/videogames'),
    },
    {
      href: '/music',
      label: 'Music',
      icon: Music,
      active: pathname?.startsWith('/music'),
    },
    {
      href: '/books',
      label: 'Books',
      icon: BookOpen,
      active: pathname?.startsWith('/books'),
    },
    {
      href: '/import',
      label: 'Import',
      icon: Upload,
      active: pathname?.startsWith('/import'),
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      active: pathname?.startsWith('/settings'),
    },
  ]

  return (
    <nav className="flex flex-col space-y-6 mt-6">
      {/* Mobile Search */}
      <div className="px-3">
        <h2 className="mb-3 px-4 text-lg font-semibold">Search</h2>
        <div className="px-4">
          <GlobalSearch />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-3">
        <h2 className="mb-3 px-4 text-lg font-semibold">Navigation</h2>
        <div className="space-y-1">
          {routes.map((route) => {
            const Icon = route.icon
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors',
                  'hover:bg-accent active:scale-[0.98]',
                  'min-h-[44px]', // Minimum touch target size
                  route.active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{route.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
