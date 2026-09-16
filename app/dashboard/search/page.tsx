import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { searchResources } from '@/lib/resources/search'
import type { ResourceType } from '@/lib/resources/types'

const filters: Array<{ value: ResourceType | ''; label: string }> = [
  { value: '', label: 'All' }, { value: 'file', label: 'Files' }, { value: 'link', label: 'Links' },
  { value: 'note', label: 'Notes' }, { value: 'table', label: 'Tables' }, { value: 'list', label: 'Lists' },
]
function isResourceType(value: string): value is ResourceType { return ['file', 'link', 'note', 'table', 'list'].includes(value) }

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const query = (params.q ?? '').trim().slice(0, 120)
  const type = params.type && isResourceType(params.type) ? params.type : undefined
  const { data: results, error } = await searchResources(user.id, query, type)

  return <div className="min-w-0 bg-[var(--background)] px-[var(--content-gutter)] py-8 text-[var(--foreground)] sm:px-8 lg:px-10 lg:py-10">
    <div className="mx-auto max-w-6xl">
      <header className="border-b border-[var(--border)] pb-7">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Library</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">Search</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">Find files, links, notes, tables, and lists across your workspaces.</p>
      </header>

      <form method="get" className="mt-7 flex flex-col gap-3 sm:flex-row" role="search">
        <label className="min-w-0 flex-1"><span className="sr-only">Search resources</span><input name="q" defaultValue={query} autoFocus placeholder="Search files, links, notes…" className="ui-input min-h-11" /></label>
        {type ? <input type="hidden" name="type" value={type} /> : null}
        <button type="submit" className="ui-button-primary inline-flex min-h-11 items-center justify-center sm:min-w-24">Search</button>
      </form>

      <nav aria-label="Search filters" className="mt-5 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
        {filters.map((filter) => {
          const active = (type ?? '') === filter.value
          const href = query ? `/dashboard/search?q=${encodeURIComponent(query)}${filter.value ? `&type=${filter.value}` : ''}` : filter.value ? `/dashboard/search?type=${filter.value}` : '/dashboard/search'
          return <Link key={filter.value} href={href} aria-current={active ? 'page' : undefined} className={`inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-xs font-medium outline-none focus-visible:bg-[var(--surface-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-inset ${active ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>{filter.label}</Link>
        })}
      </nav>

      <section className="mt-6" aria-live="polite">
        {error ? <div role="alert" className="ui-error p-5 text-sm">We could not search your resources. Please try again.</div> : query ? <>
          <div className="mb-3 flex items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]"><span>{results.length} result{results.length === 1 ? '' : 's'} for “{query}”</span>{type ? <span className="uppercase tracking-[0.08em]">{type}</span> : null}</div>
          {results.length ? <div className="divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">{results.map((resource) => <Link key={resource.id} href={`/dashboard/resources/${resource.id}`} className="group block min-h-12 px-4 py-4 outline-none transition-colors hover:bg-[var(--surface-secondary)] focus-visible:bg-[var(--surface-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-inset sm:px-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-2"><span className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{resource.type}</span>{resource.isFavorite ? <span aria-label="Favorite">★</span> : null}</div><h2 className="mt-1 truncate text-sm font-medium">{resource.title}</h2>{resource.description ? <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--muted-foreground)]">{resource.description}</p> : null}<p className="mt-2 text-xs text-[var(--muted-foreground)]">{resource.workspaceName}</p></div><span aria-hidden="true" className="pt-0.5 text-[var(--muted)] transition-transform group-hover:translate-x-0.5">→</span></div></Link>)}</div> : <div className="border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-10 text-center"><p className="text-sm font-medium">No resources found</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Try a different keyword or resource type.</p></div>}
        </> : <div className="border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-10 text-center"><p className="text-sm font-medium">Search your Hubify library</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Enter a keyword to search resource titles and descriptions.</p></div>}
      </section>
    </div>
  </div>
}
