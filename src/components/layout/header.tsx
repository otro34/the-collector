import Link from 'next/link'
import { HeaderClient } from './header-client'
import { UserMenu } from './user-menu'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="mr-4 md:mr-6 flex items-center space-x-2 min-h-[44px] py-2">
          <span className="font-bold text-xl">The Collector</span>
        </Link>

        {/* Client portion of header */}
        <HeaderClient />

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}
