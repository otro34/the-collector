'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { MainNav } from '@/components/layout/main-nav'
import { MobileNav } from '@/components/layout/mobile-nav'
import { GlobalSearch } from '@/components/shared/global-search'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">The Collector</span>
        </Link>

        {/* Desktop Navigation */}
        <MainNav className="hidden md:flex" />

        {/* Right side - Search and Theme Toggle */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Global Search */}
          <div className="hidden md:block w-full max-w-sm">
            <GlobalSearch />
          </div>

          <ThemeToggle />

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <MobileNav />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
