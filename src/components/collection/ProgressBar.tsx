import type { UserCollectionProgress } from '@/payload-types'

interface ProgressBarProps {
  progress: UserCollectionProgress
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const remaining = progress.items_total - progress.items_seen
  const pct = Math.round(progress.percentage)

  return (
    <div className="flex flex-col gap-3">
      {progress.is_completed && (
        <div className="flex items-center gap-2 font-sans text-[0.83rem] font-semibold text-[var(--laiton)]">
          <TrophyIcon />
          Collection complétée !
        </div>
      )}

      <div className="flex flex-wrap items-end gap-6">
        <div className="flex-1 min-w-[220px] max-w-[380px]">
          <p className="mb-2 font-sans text-[0.83rem] font-semibold text-ink">
            {progress.items_seen} vu{progress.items_seen > 1 ? 's' : ''}&nbsp;·&nbsp;
            {remaining} restant{remaining > 1 ? 's' : ''}
          </p>
          <div className="h-[5px] overflow-hidden rounded-[3px] bg-[var(--line-strong)]">
            <div
              className="h-full rounded-[3px] bg-[var(--accent)] transition-[width] duration-300"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${pct}% de la collection vue`}
            />
          </div>
        </div>

        <p className="font-display text-[2.8rem] font-bold leading-none tracking-[-0.05em] text-[var(--accent)]">
          {pct}
          <span className="text-[1.5rem]">%</span>
        </p>
      </div>
    </div>
  )
}

function TrophyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 11c-2.76 0-5-2.24-5-5V2h10v4c0 2.76-2.24 5-5 5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.5 14h5M8 11v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 4H1.5a1.5 1.5 0 0 0 0 3H3M13 4h1.5a1.5 1.5 0 0 1 0 3H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
