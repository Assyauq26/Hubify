'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { signOut } from '@/app/dashboard/actions'

const navigation = [
  { href: '/dashboard', label: 'Projects' },
  { href: '/dashboard/workspaces', label: 'Workspaces' },
  { href: '/dashboard/search', label: 'Search' },
]

export function AppShell({ email, children }: { email?: string | null; children: ReactNode }) {
  const pathname = usePathname()
  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-[var(--border)] bg-[var(--surface)] lg:flex lg:flex-col">
        <div className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-5">
          <Link href="/dashboard" className="text-sm font-semibold tracking-[0.14em]">HUBIFY</Link>
        </div>
        <nav aria-label="Primary navigation" className="min-h-0 flex-1 overflow-y-auto p-3">
          {navigation.map((item) => {
            const active = isActive(item.href)
            return <Link key={item.href} href={item.href} className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-[var(--surface-secondary)] text-[var(--foreground)]' : 'text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]'}`} aria-current={active ? 'page' : undefined}>{item.label}</Link>
          })}
        </nav>
        <div className="shrink-0 border-t border-[var(--border)] p-4">
          <p className="truncate text-xs text-[var(--muted)]">{email ?? 'Signed in'}</p>
          <form action={signOut} className="mt-2"><button type="submit" className="ui-button-ghost w-full text-left">Sign out</button></form>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 lg:hidden">
          <Link href="/dashboard" className="text-sm font-semibold tracking-[0.14em]">HUBIFY</Link>
          <div className="flex items-center gap-2"><Link href="/dashboard/search" className="min-h-10 px-2 inline-flex items-center text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]">Search</Link><form action={signOut}><button type="submit" className="min-h-10 px-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]">Sign out</button></form></div>
        </header>
        <main className="min-w-0 pb-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      </div>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="grid grid-cols-2">
          {navigation.slice(0, 2).map((item) => { const active = isActive(item.href); return <Link key={item.href} href={item.href} className={`flex min-h-14 items-center justify-center px-4 text-xs font-medium ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`} aria-current={active ? 'page' : undefined}>{item.label}</Link> })}
        </div>
      </nav>
    </div>
  )
}
