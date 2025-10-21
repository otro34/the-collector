import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, User, Shield } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/db'

export async function UserMenu() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  // Get user role from database
  let userRole = 'USER'
  if (session.user.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })
    userRole = user?.role || 'USER'
  }

  const userInitials =
    session.user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userRole === 'ADMIN' && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin/users" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>User Management</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem disabled>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/auth/signin' })
          }}
        >
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
