'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  href: string
  label: string
  className?: string
}

export function FloatingActionButton({ href, label, className }: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'md:hidden', // Only show on mobile
        'shadow-lg hover:shadow-xl transition-shadow',
        className
      )}
      aria-label={label}
    >
      <Button
        size="lg"
        className={cn(
          'h-14 w-14 rounded-full p-0',
          'hover:scale-110 active:scale-95 transition-transform',
          'shadow-lg'
        )}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </Link>
  )
}
