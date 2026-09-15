'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const navigation = [
  { href: '/dashboard', label: 'Projects' },
]

export function AppShell({
  email,
  children,
}: {
  email?: string | null
  children: ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-[var(--color-border)] px-5">
          <Link href="/dashboard" className="text-sm font-semibold tracking-[0.14em]">HUBIFY</Link>
        </div>
        <nav aria-label="Primary navigation" className="flex-1 p-3">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-[var(--color-surface-secondary)] text-[var(--color-foreground)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-foreground)]'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-[var(--color-border)] p-4">
          <p className="truncate text-xs text-[var(--color-muted)]">{email ?? 'Signed in'}</p>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 backdrop-blur-sm lg:hidden">
          <Link href="/dashboard" className="text-sm font-semibold tracking-[0.14em]">HUBIFY</Link>
          <span className="max-w-40 truncate text-xs text-[var(--color-muted)]">{email}</span>
        </header>
        <main className="pb-20 lg:pb-0">{children}</main>
      </div>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-1 border-t border-[var(--color-border)] bg-[var(--color-surface)] lg:hidden">
        <Link
          href="/dashboard"
          className={`flex min-h-14 items-center justify-center text-xs font-medium ${pathname === '/dashboard' ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)]'}`}
          aria-current={pathname === '/dashboard' ? 'page' : undefined}
        >
          Projects
        </Link>
      </nav>
    </div>
  )
}
