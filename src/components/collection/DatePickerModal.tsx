'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

type DateChoice = 'today' | 'yesterday' | 'custom'

interface DatePickerModalProps {
  onConfirm: (watchedAt: string) => void
  onClose: () => void
}

function resolveDate(choice: DateChoice, customDate: string): string {
  if (choice === 'yesterday') {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString()
  }
  if (choice === 'custom' && customDate) {
    return new Date(customDate).toISOString()
  }
  return new Date().toISOString()
}

export function DatePickerModal({ onConfirm, onClose }: DatePickerModalProps) {
  const [choice, setChoice] = useState<DateChoice>('today')
  const [customDate, setCustomDate] = useState('')

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="date-modal-title"
        className="fixed left-1/2 top-1/2 z-50 w-[min(360px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-[4px] bg-bg p-6 shadow-lg"
      >
        <h2
          id="date-modal-title"
          className="mb-5 font-display text-[1.1rem] font-bold text-ink"
        >
          Quand as-tu vu ce film ?
        </h2>

        <fieldset className="mb-6 flex flex-col gap-3">
          <legend className="sr-only">Date de visionnage</legend>

          {(
            [
              { value: 'today', label: "Aujourd'hui" },
              { value: 'yesterday', label: 'Hier' },
              { value: 'custom', label: 'Une autre date' },
            ] as { value: DateChoice; label: string }[]
          ).map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 font-sans text-[0.88rem] text-ink"
            >
              <input
                type="radio"
                name="date-choice"
                value={value}
                checked={choice === value}
                onChange={() => setChoice(value)}
                className="accent-copper"
              />
              {label}
            </label>
          ))}

          {choice === 'custom' && (
            <input
              type="date"
              value={customDate}
              max={today}
              onChange={(e) => setCustomDate(e.target.value)}
              className="ml-6 rounded border border-[var(--line-strong)] bg-bg px-3 py-1.5 font-sans text-[0.88rem] text-ink focus:border-copper focus:outline-none"
            />
          )}
        </fieldset>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="font-sans text-[0.83rem] text-[var(--muted)] transition-colors hover:text-ink"
          >
            Annuler
          </button>
          <Button
            onClick={() => onConfirm(resolveDate(choice, customDate))}
            disabled={choice === 'custom' && !customDate}
          >
            Confirmer
          </Button>
        </div>
      </div>
    </>
  )
}
