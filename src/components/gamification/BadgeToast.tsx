'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export interface EarnedBadge {
  id: number
  title: string
  icon_url: string | null
}

interface BadgeToastProps {
  badges: EarnedBadge[]
  onDismiss: () => void
}

export function BadgeToast({ badges, onDismiss }: BadgeToastProps) {
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const badge = badges[index]

  const handleDismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (index < badges.length - 1) {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => i + 1)
        setVisible(true)
      }, 250)
    } else {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }
  }, [index, badges.length, onDismiss])

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    timerRef.current = setTimeout(handleDismiss, 6000)
    return () => {
      cancelAnimationFrame(frame)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [index, handleDismiss])

  if (!badge) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Badge gagné : ${badge.title}`}
      onClick={handleDismiss}
      className="badge-toast"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        maxWidth: '340px',
        width: 'calc(100vw - 3rem)',
        background: 'var(--parchment)',
        border: '1px solid var(--line-strong)',
        borderRadius: '6px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.875rem',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(18,20,23,0.12)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(1rem)',
        transition: 'opacity 300ms ease, transform 300ms ease',
      }}
    >
      {/* Icône badge */}
      <div
        style={{
          flexShrink: 0,
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          background: 'var(--laiton-soft, #f5eed6)',
          border: '2px solid var(--laiton, #B5964D)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {badge.icon_url ? (
          <Image src={badge.icon_url} alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
        ) : (
          <TrophyIcon />
        )}
      </div>

      {/* Texte */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: '0.78rem',
            color: 'var(--muted)',
            lineHeight: 1.4,
          }}
        >
          Badge obtenu
        </p>
        <p
          style={{
            margin: '0.2rem 0 0',
            fontFamily: 'var(--font-display)',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--ink)',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {badge.title}
        </p>
      </div>

      {/* Bouton fermer */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDismiss()
        }}
        aria-label="Fermer"
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: 'var(--muted)',
          lineHeight: 1,
        }}
      >
        <CloseIcon />
      </button>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .badge-toast {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}

function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 13c-3.31 0-6-2.69-6-6V3h12v4c0 3.31-2.69 6-6 6z"
        stroke="#B5964D"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M4 5H2v2a2 2 0 0 0 2 2M16 5h2v2a2 2 0 0 1-2 2" stroke="#B5964D" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 13v3M7 16h6" stroke="#B5964D" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
