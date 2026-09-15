'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'

type JsonValue = Record<string, unknown>

type NoteEditorProps = {
  initialContent: JsonValue
  onContentChange: (content: JsonValue) => void
}

export function NoteEditor({ initialContent, onContentChange }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onContentChange(currentEditor.getJSON() as JsonValue)
    },
  })

  const [linkUrl, setLinkUrl] = useState('')

  useEffect(() => {
    if (!editor) return
    onContentChange(editor.getJSON() as JsonValue)
  }, [editor, onContentChange])

  if (!editor) {
    return <div className="min-h-64 bg-[var(--surface-secondary)]" aria-label="Loading editor" />
  }

  const setLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run()
      setLinkUrl('')
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run()
    setLinkUrl('')
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border)] p-2">
        <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><span className="italic">I</span></ToolbarButton>
        <ToolbarButton label="Strike" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><span className="line-through">S</span></ToolbarButton>
        <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
        <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>“</ToolbarButton>
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--border)]" />
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>↶</ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>↷</ToolbarButton>
      </div>

      <div className="flex flex-col gap-2 border-b border-[var(--border)] bg-[var(--surface-secondary)] p-2 sm:flex-row">
        <input
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              setLink()
            }
          }}
          placeholder="https://example.com"
          aria-label="Link URL"
          className="ui-input min-w-0 flex-1 bg-[var(--surface)] text-sm"
        />
        <button type="button" onClick={setLink} className="ui-button-secondary w-full sm:w-auto">Apply link</button>
      </div>

      <EditorContent editor={editor} className="note-editor min-h-72 px-4 py-5 sm:px-7" />
    </div>
  )
}

function ToolbarButton({ label, active = false, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-9 rounded-md px-2.5 text-xs font-semibold transition-colors ${active ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]'}`}
    >
      {children}
    </button>
  )
}
