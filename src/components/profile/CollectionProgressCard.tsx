import Link from 'next/link'

interface CollectionProgressCardProps {
  title: string
  slug: string
  percentage: number
  itemsSeen: number
  itemsTotal: number
  variant: 'in-progress' | 'completed'
}

export function CollectionProgressCard({
  title,
  slug,
  percentage,
  itemsSeen,
  itemsTotal,
  variant,
}: CollectionProgressCardProps) {
  const pct = Math.round(percentage)
  const isCompleted = variant === 'completed'

  return (
    <Link
      href={`/collections/${slug}`}
      className="mb-3 block rounded-[4px] border px-[18px] py-4 text-ink no-underline transition-[border-color,box-shadow] duration-150 hover:shadow-[0_2px_8px_var(--accent-soft)] last:mb-0"
      style={{
        background: isCompleted ? 'rgba(184,92,56,0.04)' : 'var(--surface)',
        borderColor: isCompleted ? 'var(--accent-soft)' : 'var(--line-strong)',
      }}
    >
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="font-serif text-[0.95rem] font-[500] leading-[1.3]">{title}</div>
        {isCompleted ? (
          <TrophyIcon />
        ) : (
          <div
            className="shrink-0 font-display text-[1.25rem] font-bold leading-none tracking-[-0.04em]"
            style={{ color: 'var(--accent)' }}
          >
            {pct}&thinsp;%
          </div>
        )}
      </div>
      <p className="mb-2.5 font-sans text-[0.78rem]" style={{ color: 'var(--muted)' }}>
        {itemsSeen}&nbsp;/&nbsp;{itemsTotal}&nbsp;oeuvres
      </p>
      <div
        className="h-[4px] overflow-hidden rounded-[2px]"
        style={{ background: 'var(--line-strong)' }}
      >
        <div
          className="h-full rounded-[2px] transition-[width] duration-300"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: isCompleted ? 'var(--laiton)' : 'var(--accent)',
          }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% de la collection vue`}
        />
      </div>
    </Link>
  )
}

function TrophyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0"
      style={{ color: 'var(--laiton)' }}
    >
      <path
        d="M8 11c-2.76 0-5-2.24-5-5V2h10v4c0 2.76-2.24 5-5 5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.5 14h5M8 11v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M3 4H1.5a1.5 1.5 0 0 0 0 3H3M13 4h1.5a1.5 1.5 0 0 1 0 3H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
