import Link from 'next/link'
import type { CollectionItem, MediaItem } from '@/payload-types'

type PopulatedCollectionItem = CollectionItem & { media_item: MediaItem }

interface NextItemCardProps {
  item: PopulatedCollectionItem
}

export function NextItemCard({ item }: NextItemCardProps) {
  const mediaItem = item.media_item

  return (
    <Link
      href={`/films/${mediaItem.slug ?? mediaItem.id}`}
      className="flex items-center gap-[14px] rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-3 transition-[border-color,box-shadow] hover:border-[var(--accent)] hover:shadow-[0_2px_8px_var(--accent-soft)]"
    >
      <span className="shrink-0 font-sans text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
        Prochain
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-serif text-[0.95rem] font-medium text-ink truncate">{mediaItem.title}</p>
        {mediaItem.year && (
          <p className="font-sans text-[0.82rem] text-[var(--muted)]">{mediaItem.year}</p>
        )}
      </div>

      <span className="shrink-0 ml-auto font-sans text-[var(--muted)]" aria-hidden="true">
        →
      </span>
    </Link>
  )
}
