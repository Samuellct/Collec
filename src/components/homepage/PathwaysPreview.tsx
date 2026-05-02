import Link from 'next/link'
import type { PathwayCardData } from '@/app/(frontend)/page'

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

interface PathwaysPreviewProps {
  pathways: PathwayCardData[]
}

export function PathwaysPreview({ pathways }: PathwaysPreviewProps) {
  if (pathways.length === 0) return null

  return (
    <section className="px-6 py-10">
      <h2 className="mb-5 font-display text-[1.3rem] font-semibold tracking-[-0.03em] text-ink">
        Parcours
      </h2>
      <div className="flex flex-col gap-3">
        {pathways.map((p) => {
          const style = accessibilityStyle[p.accessibility_level]
          return (
            <Link
              key={p.id}
              href={`/parcours/${p.slug}`}
              className="group flex items-start gap-4 rounded-[6px] border px-4 py-3.5 transition-shadow hover:shadow-md"
              style={{ borderColor: 'var(--line-strong)', background: 'var(--surface-strong)' }}
            >
              <span
                className="mt-0.5 shrink-0 text-[1.4rem] leading-none"
                style={{ color: 'var(--laiton)' }}
                aria-hidden="true"
              >
                ◎
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="mb-0.5 font-display text-[0.95rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink transition-colors group-hover:text-[var(--accent)]">
                  {p.title}
                </h3>
                {p.subtitle && (
                  <p
                    className="mb-2 line-clamp-1 font-serif text-[0.82rem] leading-[1.3]"
                    style={{ color: 'var(--muted)' }}
                  >
                    {p.subtitle}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-block rounded-[3px] px-1.5 py-0.5 font-sans text-[0.7rem] font-medium leading-none"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {accessibilityLabel[p.accessibility_level]}
                  </span>
                  <span className="font-sans text-[0.75rem]" style={{ color: 'var(--subtle)' }}>
                    {p.stepCount} {p.stepCount === 1 ? 'étape' : 'étapes'}
                  </span>
                  {p.estimated_duration_hours !== null && (
                    <span className="font-sans text-[0.75rem]" style={{ color: 'var(--subtle)' }}>
                      · ~{p.estimated_duration_hours}h
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
