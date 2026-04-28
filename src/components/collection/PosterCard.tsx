'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { DatePickerModal } from './DatePickerModal'
import type { CollectionItem, MediaItem } from '@/payload-types'

type PopulatedCollectionItem = CollectionItem & { media_item: MediaItem }

interface PosterCardProps {
  item: PopulatedCollectionItem
  isWatched: boolean
  watchedItemId: number | undefined
  onMarkWatched: (mediaItemId: number, watchedAt: string) => void
  onRemoveWatched: (mediaItemId: number, watchedItemId: number) => void
}

export function PosterCard({
  item,
  isWatched,
  watchedItemId,
  onMarkWatched,
  onRemoveWatched,
}: PosterCardProps) {
  const [showModal, setShowModal] = useState(false)
  const mediaItem = item.media_item

  function handleConfirmDate(watchedAt: string) {
    onMarkWatched(mediaItem.id, watchedAt)
    setShowModal(false)
  }

  function handleCloseModal() {
    onMarkWatched(mediaItem.id, new Date().toISOString())
    setShowModal(false)
  }

  return (
    <article className="flex flex-col gap-[9px]">
      {/* Poster */}
      <div className="relative">
        <Link href={`/films/${mediaItem.id}`} tabIndex={-1} aria-hidden="true">
          <div className="relative aspect-[2/3] overflow-hidden rounded-[3px] shadow-[0_2px_10px_var(--shadow-poster)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_var(--shadow-poster)]">
            {mediaItem.poster_url ? (
              <Image
                src={mediaItem.poster_url}
                alt={mediaItem.title}
                fill
                sizes="(max-width: 400px) 45vw, (max-width: 680px) 30vw, 130px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-end bg-[var(--line-strong)] p-2">
                <span className="font-serif text-[0.68rem] italic leading-[1.3] text-white/75 [text-shadow:0_1px_5px_rgba(0,0,0,0.6)]">
                  {mediaItem.title}
                </span>
              </div>
            )}

            {isWatched && (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(26,28,30,0.48)]">
                <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[var(--accent)]">
                  <CheckIcon />
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Métadonnées */}
      <div>
        <Link
          href={`/films/${mediaItem.id}`}
          className="block font-serif text-[0.86rem] font-medium leading-[1.3] text-ink transition-colors hover:text-copper line-clamp-2"
        >
          {mediaItem.title}
        </Link>
        {mediaItem.year && (
          <p className="font-sans text-[0.76rem] text-[var(--muted)]">{mediaItem.year}</p>
        )}
      </div>

      {/* Action */}
      {isWatched ? (
        <button
          onClick={() =>
            watchedItemId !== undefined && onRemoveWatched(mediaItem.id, watchedItemId)
          }
          className="text-left font-sans text-[0.74rem] text-[var(--muted)] transition-colors hover:text-copper"
          aria-label={`Retirer ${mediaItem.title} de mes vus`}
        >
          Retirer
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="text-left font-sans text-[0.74rem] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-h)]"
          aria-label={`Marquer ${mediaItem.title} comme vu`}
        >
          Vu
        </button>
      )}

      {showModal && (
        <DatePickerModal
          onConfirm={handleConfirmDate}
          onClose={handleCloseModal}
          onCancel={() => setShowModal(false)}
        />
      )}
    </article>
  )
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points="3,9 7,13 14,5"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
