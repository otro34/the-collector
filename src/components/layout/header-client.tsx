'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { MainNav } from '@/components/layout/main-nav'
import { MobileNav } from '@/components/layout/mobile-nav'
import { GlobalSearch } from '@/components/shared/global-search'

export function HeaderClient() {
  return (
    <>
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
            <Button variant="ghost" className="md:hidden min-h-[44px] min-w-[44px]" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <MobileNav />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
