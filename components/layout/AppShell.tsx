'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { signOut } from '@/app/dashboard/actions'

const navigation = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/workspaces', label: 'Workspaces' },
  { href: '/dashboard/search', label: 'Search' },
]

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors ${
        active
          ? 'bg-[var(--surface-secondary)] text-[var(--foreground)]'
          : 'text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]'
      }`}
    >
      {label}
    </Link>
  )
}

export function AppShell({ email, children }: { email?: string | null; children: ReactNode }) {
  const pathname = usePathname()
  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--border)] bg-[var(--surface)] lg:flex lg:flex-col">
        <div className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-5">
          <Link href="/dashboard" className="text-sm font-semibold tracking-[0.14em]">HUBIFY</Link>
        </div>
        <nav aria-label="Primary navigation" className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Workspace</p>
          <div className="space-y-1">
            {navigation.map((item) => <NavLink key={item.href} href={item.href} label={item.label} active={isActive(item.href)} />)}
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
          {navigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`mobile-nav-item text-xs font-medium ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
