'use client'

import { useOptimistic, useTransition, useState, useEffect, useRef } from 'react'
import { DatePickerModal } from '@/components/collection/DatePickerModal'
import { BadgeToast } from '@/components/gamification/BadgeToast'
import type { EarnedBadge } from '@/components/gamification/BadgeToast'

interface FilmWatchButtonProps {
  mediaItemId: number
  initialWatchedItemId: number | null
  isAuthenticated: boolean
  onMarkWatched: (mediaItemId: number, watchedAt: string) => Promise<void>
  onRemoveWatched: (watchedItemId: number) => Promise<void>
}

export function FilmWatchButton({
  mediaItemId,
  initialWatchedItemId,
  isAuthenticated,
  onMarkWatched,
  onRemoveWatched,
}: FilmWatchButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const lastMarkTimestampRef = useRef<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [optimisticId, updateOptimistic] = useOptimistic(
    initialWatchedItemId,
    (_: number | null, next: number | null) => next,
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

  function handleClickMark() {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    setShowModal(true)
  }

  function handleConfirmDate(watchedAt: string) {
    setShowModal(false)
    lastMarkTimestampRef.current = new Date().toISOString()
    startTransition(async () => {
      updateOptimistic(-1)
      await onMarkWatched(mediaItemId, watchedAt)
    })
  }

  function handleCloseModal() {
    setShowModal(false)
    lastMarkTimestampRef.current = new Date().toISOString()
    startTransition(async () => {
      updateOptimistic(-1)
      await onMarkWatched(mediaItemId, new Date().toISOString())
    })
  }

  function handleRemove() {
    if (!optimisticId || optimisticId === -1) return
    const id = optimisticId
    startTransition(async () => {
      updateOptimistic(null)
      await onRemoveWatched(id)
    })
  }

  const isWatched = optimisticId !== null && optimisticId !== -1

  return (
    <div className="flex flex-col gap-2">
      {earnedBadges.length > 0 && (
        <BadgeToast badges={earnedBadges} onDismiss={() => setEarnedBadges([])} />
      )}
      {isWatched ? (
        <button
          onClick={handleRemove}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-[9px] font-sans text-[0.88rem] text-[var(--muted)] transition-colors hover:border-copper hover:text-copper"
          aria-label="Retirer ce film de mes vus"
        >
          <CheckIcon />
          Vu · Retirer
        </button>
      ) : (
        <button
          onClick={handleClickMark}
          disabled={optimisticId === -1}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-[var(--accent)] px-4 py-[9px] font-sans text-[0.88rem] font-medium text-white transition-colors hover:bg-[var(--accent-h)] disabled:opacity-60"
          aria-label="Marquer ce film comme vu"
        >
          <CheckIcon />
          Marquer comme vu
        </button>
      )}

      {showLoginPrompt && (
        <p className="text-center font-sans text-[0.78rem] text-[var(--muted)]">
          <a
            href="/login"
            className="font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-h)]"
          >
            Connecte-toi
          </a>{' '}
          pour suivre ta progression.
        </p>
      )}

      {showModal && (
        <DatePickerModal
          onConfirm={handleConfirmDate}
          onClose={handleCloseModal}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <polyline
        points="2,7.5 5.5,11 12,4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
