'use client'

import { useOptimistic, useTransition, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { PathwayStepCard } from './PathwayStepCard'
import { BadgeToast } from '@/components/gamification/BadgeToast'
import type { EarnedBadge } from '@/components/gamification/BadgeToast'
import type { PathwayStep, MediaItem } from '@/payload-types'

type PopulatedPathwayStep = PathwayStep & { media_item: MediaItem }

interface PathwayTimelineProps {
  steps: PopulatedPathwayStep[]
  watchedMap: Record<number, number>
  markWatched: (mediaItemId: number, watchedAt: string, pathwaySlug: string) => Promise<void>
  removeWatched: (watchedItemId: number, pathwaySlug: string) => Promise<void>
  pathwaySlug: string
  isAuthenticated: boolean
}

export function PathwayTimeline({
  steps,
  watchedMap,
  markWatched,
  removeWatched,
  pathwaySlug,
  isAuthenticated,
}: PathwayTimelineProps) {
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
    startTransition(async () => {
      updateOptimistic(next)
      await markWatched(mediaItemId, watchedAt, pathwaySlug)
    })
  }

  function handleRemoveWatched(mediaItemId: number, watchedItemId: number) {
    const next = { ...optimisticWatched }
    delete next[mediaItemId]
    startTransition(async () => {
      updateOptimistic(next)
      await removeWatched(watchedItemId, pathwaySlug)
    })
  }

  function handleUnauthenticated() {
    setShowLoginPrompt(true)
  }

  const currentStep = steps.find((s) => !optimisticWatched[s.media_item.id]) ?? null

  function getStepState(step: PopulatedPathwayStep): 'done' | 'current' | 'future' {
    if (optimisticWatched[step.media_item.id]) return 'done'
    if (step.id === currentStep?.id) return 'current'
    return 'future'
  }

  return (
    <div>
      {earnedBadges.length > 0 && (
        <BadgeToast badges={earnedBadges} onDismiss={() => setEarnedBadges([])} />
      )}

      {steps.map((step, index) => (
        <PathwayStepCard
          key={step.id}
          step={step}
          state={getStepState(step)}
          position={step.position}
          isLast={index === steps.length - 1}
          watchedItemId={optimisticWatched[step.media_item.id]}
          onMarkWatched={isAuthenticated ? handleMarkWatched : handleUnauthenticated}
          onRemoveWatched={handleRemoveWatched}
        />
      ))}

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
