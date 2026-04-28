'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { DatePickerModal } from '@/components/collection/DatePickerModal'
import { cn } from '@/lib/cn'
import type { PathwayStep, MediaItem } from '@/payload-types'

export type StepState = 'done' | 'current' | 'future'

type PopulatedPathwayStep = PathwayStep & { media_item: MediaItem }

interface PathwayStepCardProps {
  step: PopulatedPathwayStep
  state: StepState
  position: number
  isLast: boolean
  watchedItemId: number | undefined
  onMarkWatched: (mediaItemId: number, watchedAt: string) => void
  onRemoveWatched: (mediaItemId: number, watchedItemId: number) => void
}

export function PathwayStepCard({
  step,
  state,
  position,
  isLast,
  watchedItemId,
  onMarkWatched,
  onRemoveWatched,
}: PathwayStepCardProps) {
  const [showModal, setShowModal] = useState(false)
  const mediaItem = step.media_item

  function handleConfirmDate(watchedAt: string) {
    onMarkWatched(mediaItem.id, watchedAt)
    setShowModal(false)
  }

  function handleCloseModal() {
    onMarkWatched(mediaItem.id, new Date().toISOString())
    setShowModal(false)
  }

  const labelText =
    state === 'done'
      ? `Étape ${position} · Complétée`
      : state === 'current'
        ? `Étape ${position} · En cours`
        : `Étape ${position}`

  const heading = step.step_title || mediaItem.title

  return (
    <article className="grid grid-cols-[56px_1fr] gap-x-7 max-[680px]:grid-cols-[40px_1fr] max-[680px]:gap-x-4">
      {/* Spine */}
      <div className="relative flex flex-col items-center pt-[6px]">
        {/* Dot */}
        <div
          className={cn(
            'z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 font-sans text-[0.75rem] font-semibold',
            state === 'done' && 'border-[var(--accent)] bg-[var(--accent)] text-white',
            state === 'current' &&
              'border-[var(--accent)] bg-[var(--bg)] font-bold text-[var(--accent)]',
            state === 'future' && 'border-[var(--line-strong)] bg-[var(--bg)] text-[var(--muted)]',
          )}
        >
          {state === 'done' ? <DotCheckIcon /> : position}
        </div>

        {/* Connecteur vertical */}
        {!isLast && <div className="mt-1 w-px flex-1 bg-[var(--line-strong)]" />}
      </div>

      {/* Body */}
      <div className="pb-10 pt-1">
        {/* Label */}
        <p
          className={cn(
            'mb-1 font-sans text-[0.74rem] font-semibold uppercase tracking-[0.08em]',
            state === 'done' && 'text-[var(--subtle)]',
            state === 'current' && 'text-[var(--accent)]',
            state === 'future' && 'text-[var(--subtle)]',
          )}
        >
          {labelText}
        </p>

        {/* Heading */}
        <h2
          className={cn(
            'mb-3 font-display text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.025em]',
            state === 'done' && 'text-[var(--muted)]',
            state !== 'done' && 'text-ink',
          )}
        >
          {heading}
        </h2>

        {/* Contenu selon l'état */}
        {state === 'current' ? (
          <>
            <div
              className="max-w-[640px] rounded-[4px] bg-[var(--surface-strong)] px-[22px] py-5"
              style={{ border: '1px solid var(--line-strong)', borderLeft: '3px solid var(--accent)' }}
            >
              <p className="mb-4 max-w-[600px] font-serif text-[0.95rem] leading-[1.72] text-ink">
                {step.step_editorial}
              </p>

              <StepFilmCard mediaItem={mediaItem} isDone={false} className="mb-4" />

              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--accent)] px-[18px] py-[9px] font-sans text-[0.88rem] font-medium text-white transition-colors hover:bg-[var(--accent-h)]"
                aria-label={`Marquer ${mediaItem.title} comme vu`}
              >
                <SmallCheckIcon />
                Marquer comme vu
              </button>
            </div>

            {showModal && (
              <DatePickerModal
                onConfirm={handleConfirmDate}
                onClose={handleCloseModal}
                onCancel={() => setShowModal(false)}
              />
            )}
          </>
        ) : (
          <>
            <p
              className={cn(
                'mb-4 max-w-[600px] font-serif text-[0.95rem] leading-[1.72]',
                state === 'done' && 'text-[var(--muted)]',
                state === 'future' && 'text-[var(--subtle)]',
              )}
            >
              {step.step_editorial}
            </p>

            <StepFilmCard mediaItem={mediaItem} isDone={state === 'done'} />

            {state === 'done' && watchedItemId !== undefined && (
              <button
                onClick={() => onRemoveWatched(mediaItem.id, watchedItemId)}
                className="mt-2 text-left font-sans text-[0.74rem] text-[var(--muted)] transition-colors hover:text-copper"
                aria-label={`Retirer ${mediaItem.title} de mes vus`}
              >
                Retirer
              </button>
            )}
          </>
        )}
      </div>
    </article>
  )
}

interface StepFilmCardProps {
  mediaItem: MediaItem
  isDone: boolean
  className?: string
}

function StepFilmCard({ mediaItem, isDone, className }: StepFilmCardProps) {
  const meta = [mediaItem.director, mediaItem.year].filter(Boolean).join(' · ')

  return (
    <Link
      href={`/films/${mediaItem.id}`}
      className={cn(
        'flex max-w-[500px] items-start gap-[14px] rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] p-3 text-inherit no-underline transition-[border-color,box-shadow] hover:border-[var(--accent)] hover:shadow-[0_2px_8px_var(--accent-soft)]',
        className,
      )}
    >
      <div className="relative aspect-[2/3] w-12 flex-shrink-0 overflow-hidden rounded-[2px] shadow-[0_2px_6px_var(--shadow-poster)]">
        {mediaItem.poster_url ? (
          <Image
            src={mediaItem.poster_url}
            alt={mediaItem.title}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[var(--line-strong)]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-serif text-[0.92rem] font-medium leading-[1.3] text-ink">
          {mediaItem.title}
        </p>
        {meta && (
          <p className="mt-[2px] font-sans text-[0.78rem] text-[var(--muted)]">{meta}</p>
        )}
        {isDone && (
          <p className="mt-1 font-sans text-[0.75rem] font-medium text-[var(--accent)]">Vu</p>
        )}
      </div>
    </Link>
  )
}

function DotCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <polyline
        points="2,7.5 5.5,11 12,4"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SmallCheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <polyline
        points="2,8 6,12 13,4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
