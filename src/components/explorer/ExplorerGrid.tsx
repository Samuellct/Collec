'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CollectionCardData, PathwayCardData } from '@/app/(frontend)/explorer/page'

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

function AccessibilityBadge({ level }: { level: 'accessible' | 'curieux' | 'cinephile' }) {
  const style = accessibilityStyle[level]
  return (
    <span
      className="inline-block rounded-[3px] px-1.5 py-0.5 font-sans text-[0.7rem] font-medium leading-none"
      style={{ background: style.bg, color: style.color }}
    >
      {accessibilityLabel[level]}
    </span>
  )
}

function CollectionCard({ c }: { c: CollectionCardData }) {
  const hasProgress = c.userProgress !== null && c.userProgress.percentage > 0
  const isCompleted = c.userProgress?.is_completed ?? false
  const percentage = c.userProgress?.percentage ?? 0

  return (
    <Link
      href={`/collections/${c.slug}`}
      className="group block overflow-hidden rounded-[6px] border transition-shadow hover:shadow-md"
      style={{
        borderColor: isCompleted ? 'var(--laiton)' : 'var(--line-strong)',
        background: 'var(--surface-strong)',
      }}
    >
      {/* Cover or poster strip */}
      {c.cover_image_url ? (
        <div className="relative aspect-video w-full overflow-hidden bg-[var(--line)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.cover_image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {/* Progress bar overlay */}
          {hasProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'var(--line-strong)' }}>
              <div
                className="h-full"
                style={{
                  width: `${percentage}%`,
                  background: isCompleted ? 'var(--laiton)' : 'var(--accent)',
                }}
              />
            </div>
          )}
        </div>
      ) : c.posterUrls.length > 0 ? (
        <div className="relative overflow-hidden" style={{ height: '72px' }}>
          <div
            className="grid h-full"
            style={{ gridTemplateColumns: `repeat(${Math.min(c.posterUrls.length, 4)}, 1fr)` }}
          >
            {c.posterUrls.slice(0, 4).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" className="h-full w-full object-cover" />
            ))}
          </div>
          {/* Progress bar overlay */}
          {hasProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'var(--line-strong)' }}>
              <div
                className="h-full"
                style={{
                  width: `${percentage}%`,
                  background: isCompleted ? 'var(--laiton)' : 'var(--accent)',
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="h-[72px] w-full" style={{ background: 'var(--line)' }} />
      )}

      {/* Card body */}
      <div className="px-4 py-3">
        {/* Status badge */}
        {isCompleted && (
          <div className="mb-2 flex items-center gap-1.5">
            <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--laiton)' }}>
              ✓ Terminée
            </span>
          </div>
        )}
        {!isCompleted && hasProgress && (
          <div className="mb-2">
            <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--accent)' }}>
              En cours · {percentage} %
            </span>
          </div>
        )}

        <h3 className="mb-1 font-display text-[0.95rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
          {c.title}
        </h3>
        <p className="mb-3 font-serif text-[0.82rem] leading-[1.4]" style={{ color: 'var(--muted)' }}>
          <span className="line-clamp-2">{c.short_description}</span>
        </p>
        <div className="flex items-center gap-2">
          <AccessibilityBadge level={c.accessibility_level} />
          <span className="font-sans text-[0.75rem]" style={{ color: 'var(--subtle)' }}>
            {c.itemCount} {c.itemCount === 1 ? 'oeuvre' : 'oeuvres'}
          </span>
        </div>
      </div>
    </Link>
  )
}

function PathwayCard({ p }: { p: PathwayCardData }) {
  return (
    <Link
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
        <h3 className="mb-0.5 font-display text-[0.95rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink group-hover:text-[var(--accent)] transition-colors">
          {p.title}
        </h3>
        {p.subtitle && (
          <p className="mb-2 font-serif text-[0.82rem] leading-[1.3] line-clamp-1" style={{ color: 'var(--muted)' }}>
            {p.subtitle}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <AccessibilityBadge level={p.accessibility_level} />
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
}

interface ExplorerGridProps {
  collections: CollectionCardData[]
  pathways: PathwayCardData[]
}

export function ExplorerGrid({ collections, pathways }: ExplorerGridProps) {
  const [query, setQuery] = useState('')

  const q = query.toLowerCase()
  const filteredCollections =
    query.length >= 2
      ? collections.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.short_description.toLowerCase().includes(q),
        )
      : collections

  const filteredPathways =
    query.length >= 2
      ? pathways.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.subtitle ?? '').toLowerCase().includes(q),
        )
      : pathways

  const noResults = query.length >= 2 && filteredCollections.length === 0 && filteredPathways.length === 0

  return (
    <div>
      {/* Search bar */}
      <div className="mb-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une collection ou un parcours…"
          className="w-full rounded-[4px] border px-4 py-2.5 font-sans text-[0.875rem] outline-none transition-colors focus:border-[var(--accent)]"
          style={{ borderColor: 'var(--line-strong)', background: 'var(--surface)' }}
          aria-label="Rechercher"
        />
      </div>

      {noResults ? (
        <p className="font-serif text-[0.9rem]" style={{ color: 'var(--muted)' }}>
          Aucune collection ni parcours ne correspond à &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <>
          {/* Collections section */}
          {(query.length < 2 || filteredCollections.length > 0) && (
            <section className="mb-10">
              <SectionTitle>Collections</SectionTitle>
              {filteredCollections.length === 0 ? (
                <p className="font-serif text-[0.9rem]" style={{ color: 'var(--muted)' }}>
                  Aucune collection disponible pour le moment.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCollections.map((c) => (
                    <CollectionCard key={c.id} c={c} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Parcours section */}
          {(query.length < 2 || filteredPathways.length > 0) && (
            <section>
              <SectionTitle>Parcours</SectionTitle>
              {filteredPathways.length === 0 ? (
                <p className="font-serif text-[0.9rem]" style={{ color: 'var(--muted)' }}>
                  Aucun parcours disponible pour le moment.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredPathways.map((p) => (
                    <PathwayCard key={p.id} p={p} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 font-display text-[1.15rem] font-semibold tracking-[-0.025em] text-ink">
      {children}
      <span className="flex-1" style={{ height: '1px', background: 'var(--line)' }} aria-hidden="true" />
    </h2>
  )
}
