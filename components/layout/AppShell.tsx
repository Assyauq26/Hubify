'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { signOut } from '@/app/dashboard/actions'

type WorkspaceItem = { id: string; name: string }

type Props = {
  email?: string | null
  children: ReactNode
  workspaces?: WorkspaceItem[]
}

const primaryNavigation = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/search', label: 'Search' },
]

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
        active
          ? 'bg-[var(--surface-secondary)] text-[var(--foreground)]'
          : 'text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]'
      }`}
    >
      {label}
    </Link>
  )
}

export function AppShell({ email, children, workspaces = [] }: Props) {
  const pathname = usePathname()
  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--border)] bg-[var(--surface)] lg:flex lg:flex-col">
        <div className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-5">
          <Link href="/dashboard" className="text-sm font-semibold tracking-[0.14em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]">HUBIFY</Link>
        </div>

        <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Hubify</p>
          <div className="space-y-1">
            {primaryNavigation.map((item) => <NavLink key={item.href} href={item.href} label={item.label} active={isActive(item.href)} />)}
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between px-3 pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Workspaces</p>
              <Link href="/dashboard/workspaces/new" aria-label="Create workspace" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-base text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">+</Link>
            </div>
            <div className="space-y-1">
              {workspaces.length ? workspaces.map((workspace) => {
                const active = pathname === `/dashboard/workspaces/${workspace.id}` || pathname.startsWith(`/dashboard/workspaces/${workspace.id}/`)
                return (
                  <Link
                    key={workspace.id}
                    href={`/dashboard/workspaces/${workspace.id}`}
                    aria-current={active ? 'page' : undefined}
                    className={`block min-h-10 truncate rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${active ? 'bg-[var(--surface-secondary)] font-medium text-[var(--foreground)]' : 'text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]'}`}
                  >
                    {workspace.name}
                  </Link>
                )
              }) : <Link href="/dashboard/workspaces/new" className="block rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">Create your first workspace</Link>}
            </div>
            <Link href="/dashboard/workspaces" className="mt-2 block px-3 text-xs font-medium text-[var(--muted)] underline underline-offset-4 hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">View all workspaces</Link>
          </div>
        </nav>

        <div className="shrink-0 border-t border-[var(--border)] p-4">
          <p className="truncate text-xs text-[var(--muted)]" title={email ?? undefined}>{email ?? 'Signed in'}</p>
          <form action={signOut} className="mt-2">
            <button type="submit" className="ui-button-ghost min-h-11 w-full justify-start px-3 text-left">Sign out</button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 lg:hidden">
          <Link href="/dashboard" className="text-sm font-semibold tracking-[0.14em]">HUBIFY</Link>
          <form action={signOut}>
            <button type="submit" className="touch-target inline-flex items-center justify-center px-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]">Sign out</button>
          </form>
        </header>

        <main className="min-w-0 pb-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      </div>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="grid grid-cols-3">
          <Link href="/dashboard" aria-current={pathname === '/dashboard' ? 'page' : undefined} className={`mobile-nav-item text-xs font-medium ${pathname === '/dashboard' ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>Home</Link>
          <Link href="/dashboard/search" aria-current={pathname.startsWith('/dashboard/search') ? 'page' : undefined} className={`mobile-nav-item text-xs font-medium ${pathname.startsWith('/dashboard/search') ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>Search</Link>
          <Link href="/dashboard/workspaces" aria-current={pathname.startsWith('/dashboard/workspaces') ? 'page' : undefined} className={`mobile-nav-item text-xs font-medium ${pathname.startsWith('/dashboard/workspaces') ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>Workspaces</Link>
        </div>
      </nav>
    </div>
  )
}
