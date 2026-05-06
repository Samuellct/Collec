'use client'

import { useOptimistic, useTransition, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { PosterCard } from './PosterCard'
import { BadgeToast } from '@/components/gamification/BadgeToast'
import type { EarnedBadge } from '@/components/gamification/BadgeToast'
import type { CollectionItem, MediaItem } from '@/payload-types'

type PopulatedCollectionItem = CollectionItem & { media_item: MediaItem }

type SortMode = 'chrono' | 'anti-chrono' | 'alpha'

const sortLabel: Record<SortMode, string> = {
  chrono: 'Chronologique',
  'anti-chrono': 'Antéchronologique',
  alpha: 'Alphabétique',
}

function getMediaItemId(item: PopulatedCollectionItem): number {
  return item.media_item.id
}

function compareByReleaseDate(a: PopulatedCollectionItem, b: PopulatedCollectionItem): number {
  const da = a.media_item.release_date ?? '0000'
  const db = b.media_item.release_date ?? '0000'
  return da < db ? -1 : da > db ? 1 : 0
}

function compareByTitle(a: PopulatedCollectionItem, b: PopulatedCollectionItem): number {
  return a.media_item.title.localeCompare(b.media_item.title, 'fr', { sensitivity: 'base' })
}

interface PosterGridProps {
  items: PopulatedCollectionItem[]
  watchedMap: Record<number, number>
  markWatched: (mediaItemId: number, watchedAt: string, collectionSlug: string) => Promise<void>
  removeWatched: (watchedItemId: number, collectionSlug: string) => Promise<void>
  collectionSlug: string
  isAuthenticated: boolean
}

export function PosterGrid({
  items,
  watchedMap,
  markWatched,
  removeWatched,
  collectionSlug,
  isAuthenticated,
}: PosterGridProps) {
  const [sort, setSort] = useState<SortMode>('chrono')
  const [onlyUnwatched, setOnlyUnwatched] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const lastMarkTimestampRef = useRef<string | null>(null)

  const [isPending, startTransition] = useTransition()
  const [optimisticWatched, updateOptimistic] = useOptimistic(
    watchedMap,
    (_: Record<number, number>, next: Record<number, number>) => next,
  )

  useEffect(() => {
    if (!isPending && lastMarkTimestampRef.current) {
      const since = lastMarkTimestampRef.current
      lastMarkTimestampRef.current = null
      fetch(`/api/badges/recent?since=${encodeURIComponent(since)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { badges: EarnedBadge[] } | null) => {
          if (data?.badges?.length) setEarnedBadges(data.badges)
        })
        .catch(() => {})
    }
  }, [isPending])

  function handleMarkWatched(mediaItemId: number, watchedAt: string) {
    const next = { ...optimisticWatched, [mediaItemId]: -1 }
    lastMarkTimestampRef.current = new Date().toISOString()
    window.umami?.track('item_mark', { context: 'collection', slug: collectionSlug })
    startTransition(async () => {
      updateOptimistic(next)
      await markWatched(mediaItemId, watchedAt, collectionSlug)
    })
  }

  function handleRemoveWatched(mediaItemId: number, watchedItemId: number) {
    const next = { ...optimisticWatched }
    delete next[mediaItemId]
    startTransition(async () => {
      updateOptimistic(next)
      await removeWatched(watchedItemId, collectionSlug)
    })
  }

  function handleUnauthenticated() {
    setShowLoginPrompt(true)
  }

  const sorted = [...items].sort((a, b) => {
    if (sort === 'chrono') return compareByReleaseDate(a, b)
    if (sort === 'anti-chrono') return compareByReleaseDate(b, a)
    return compareByTitle(a, b)
  })

  const displayed = onlyUnwatched
    ? sorted.filter((item) => !optimisticWatched[getMediaItemId(item)])
    : sorted

  return (
    <div>
      {/* Barre tri/filtre */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {(['chrono', 'anti-chrono', 'alpha'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setSort(mode)}
            className={cn(
              'rounded-[3px] px-3 py-1 font-sans text-[0.78rem] transition-colors',
              sort === mode
                ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)]'
                : 'text-[var(--muted)] hover:text-ink',
            )}
          >
            {sortLabel[mode]}
          </button>
        ))}
        <span className="select-none text-[var(--line-strong)]">|</span>
        <button
          onClick={() => setOnlyUnwatched((v) => !v)}
          className={cn(
            'rounded-[3px] px-3 py-1 font-sans text-[0.78rem] transition-colors',
            onlyUnwatched
              ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)]'
              : 'text-[var(--muted)] hover:text-ink',
          )}
        >
          Non vus seulement
        </button>
      </div>

      {/* Grille */}
      <div className="grid gap-x-[14px] gap-y-6 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))] max-[400px]:[grid-template-columns:repeat(2,1fr)] max-[680px]:[grid-template-columns:repeat(3,1fr)]">
        {displayed.map((item) => {
          const mediaId = getMediaItemId(item)
          const isWatched = !!optimisticWatched[mediaId]
          const watchedItemId = optimisticWatched[mediaId]
          return (
            <PosterCard
              key={item.id}
              item={item}
              isWatched={isWatched}
              watchedItemId={watchedItemId}
              onMarkWatched={isAuthenticated ? handleMarkWatched : handleUnauthenticated}
              onRemoveWatched={handleRemoveWatched}
            />
          )
        })}
      </div>

      {earnedBadges.length > 0 && (
        <BadgeToast badges={earnedBadges} onDismiss={() => setEarnedBadges([])} />
      )}

      {/* Prompt non connecté */}
      {showLoginPrompt && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-3">
          <p className="font-sans text-[0.83rem] text-[var(--muted)]">
            Connecte-toi pour suivre ta progression.
          </p>
          <Link
            href="/login"
            className="whitespace-nowrap font-sans text-[0.83rem] font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-h)]"
          >
            Se connecter
          </Link>
        </div>
      )}
    </div>
  )
}
