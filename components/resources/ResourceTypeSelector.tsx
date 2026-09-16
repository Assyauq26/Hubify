'use client'

import type { ResourceType } from '@/lib/resources/types'

const labels: Record<ResourceType, string> = {
  file: 'File', link: 'Link', note: 'Note', table: 'Table', list: 'List',
}

export function ResourceTypeSelector({ value, onChange }: { value: ResourceType; onChange: (value: ResourceType) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Resource type">
      {(Object.keys(labels) as ResourceType[]).map((type) => (
        <button key={type} type="button" role="radio" aria-checked={value === type} onClick={() => onChange(type)} className={`min-h-11 border px-3 text-sm font-medium transition-colors ${value === type ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--primary-foreground)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]'}`}>
          {labels[type]}
        </button>
      ))}
    </div>
  )
}
