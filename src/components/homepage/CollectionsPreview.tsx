import Link from 'next/link'
import type { CollectionCardData } from '@/app/(frontend)/page'

const accessibilityLabel = {
  accessible: 'Accessible',
  curieux: 'Curieux',
  cinephile: 'Cinéphile',
} as const

const accessibilityStyle: Record<string, { bg: string; color: string }> = {
  accessible: { bg: 'rgba(74, 124, 89, 0.12)', color: '#4A7C59' },
  curieux: { bg: 'var(--laiton-soft)', color: 'var(--laiton)' },
  cinephile: { bg: 'var(--accent-soft)', color: 'var(--accent)' },
}

function CollectionCard({ c }: { c: CollectionCardData }) {
  const style = accessibilityStyle[c.accessibility_level]
  return (
    <Link
      href={`/collections/${c.slug}`}
      className="group block overflow-hidden rounded-[6px] border transition-shadow hover:shadow-md"
      style={{ borderColor: 'var(--line-strong)', background: 'var(--surface-strong)' }}
    >
      {c.cover_image_url ? (
        <div className="aspect-video w-full overflow-hidden" style={{ background: 'var(--line)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.cover_image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : c.posterUrls.length > 0 ? (
        <div
          className="overflow-hidden"
          style={{
            height: '72px',
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(c.posterUrls.length, 4)}, 1fr)`,
          }}
        >
          {c.posterUrls.slice(0, 4).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="h-full w-full object-cover" />
          ))}
        </div>
      ) : (
        <div className="h-[72px] w-full" style={{ background: 'var(--line)' }} />
      )}

      <div className="px-4 py-3">
        <h3 className="mb-1 font-display text-[0.95rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink line-clamp-2 transition-colors group-hover:text-[var(--accent)]">
          {c.title}
        </h3>
        <p className="mb-3 font-serif text-[0.82rem] leading-[1.4]" style={{ color: 'var(--muted)' }}>
          <span className="line-clamp-2">{c.short_description}</span>
        </p>
        <div className="flex items-center gap-2">
          <span
            className="inline-block rounded-[3px] px-1.5 py-0.5 font-sans text-[0.7rem] font-medium leading-none"
            style={{ background: style.bg, color: style.color }}
          >
            {accessibilityLabel[c.accessibility_level]}
          </span>
          <span className="font-sans text-[0.75rem]" style={{ color: 'var(--subtle)' }}>
            {c.itemCount} {c.itemCount === 1 ? 'oeuvre' : 'oeuvres'}
          </span>
        </div>
      </div>
    </Link>
  )
}

interface CollectionsPreviewProps {
  collections: CollectionCardData[]
}

export function CollectionsPreview({ collections }: CollectionsPreviewProps) {
  if (collections.length === 0) return null

  return (
    <section className="border-b px-6 py-10" style={{ borderColor: 'var(--line)' }}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-[1.3rem] font-semibold tracking-[-0.03em] text-ink">
          Collections
        </h2>
        <Link
          href="/explorer"
          className="font-sans text-[0.82rem] transition-colors hover:text-[var(--accent)]"
          style={{ color: 'var(--muted)' }}
        >
          Voir toutes
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <CollectionCard key={c.id} c={c} />
        ))}
      </div>
    </section>
  )
}
