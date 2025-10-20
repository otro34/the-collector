'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      active: pathname === '/dashboard',
    },
    {
      href: '/videogames',
      label: 'Video Games',
      active: pathname?.startsWith('/videogames'),
    },
    {
      href: '/music',
      label: 'Music',
      active: pathname?.startsWith('/music'),
    },
    {
      href: '/books',
      label: 'Books',
      active: pathname?.startsWith('/books'),
    },
    {
      href: '/import',
      label: 'Import',
      active: pathname?.startsWith('/import'),
    },
    {
      href: '/settings',
      label: 'Settings',
      active: pathname?.startsWith('/settings'),
    },
  ]

  return (
    <nav className="flex flex-col space-y-4 mt-6">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'block px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent',
                route.active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Search</h2>
        <div className="px-4">
          <input
            type="search"
            placeholder="Search collections..."
            className="w-full px-4 py-2 rounded-md border bg-background text-sm outline-none focus:border-primary"
            disabled
          />
        </div>
      </div>
    </nav>
  )
}
