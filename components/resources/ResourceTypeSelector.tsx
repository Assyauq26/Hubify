'use client'

import type { ResourceType } from '@/lib/resources/types'

const labels: Record<ResourceType, string> = {
  file: 'File',
  link: 'Link',
  note: 'Note',
  table: 'Table',
  list: 'List',
}

export function ResourceTypeSelector({ value, onChange }: { value: ResourceType; onChange: (value: ResourceType) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Resource type">
      {(Object.keys(labels) as ResourceType[]).map((type) => (
        <button
          key={type}
          type="button"
          role="radio"
          aria-checked={value === type}
          onClick={() => onChange(type)}
          className={value === type ? 'min-h-10 border border-[var(--foreground)] bg-[var(--foreground)] px-3 text-sm font-medium text-[var(--primary-foreground)]' : 'min-h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]'}
        >
          {labels[type]}
        </button>
      ))}
    </div>
  )
}
