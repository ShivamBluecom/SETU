import type { NoteWithAuthor } from '@/types/api'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelativeTime } from '@/lib/format'

interface NotesListProps {
  notes: NoteWithAuthor[]
}

export function NotesList({ notes }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <p style={{ fontSize: '13px', color: 'var(--color-text-3)', padding: '8px 0' }}>
        No notes yet.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {notes.map((note) => (
        <div key={note.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Avatar name={note.author.name} size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-1)' }}>
                {note.author.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>
                {formatRelativeTime(note.createdAt)}
              </span>
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-2)',
                margin: 0,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}
            >
              {note.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
