'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
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
      href: '/settings',
      label: 'Settings',
      active: pathname?.startsWith('/settings'),
    },
  ]

  return (
    <nav className={cn('flex items-center space-x-4 lg:space-x-6', className)} {...props}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
