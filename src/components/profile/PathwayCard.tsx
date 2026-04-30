import Link from 'next/link'

interface PathwayCardProps {
  title: string
  slug: string
  percentage: number
  stepsCompleted: number
  stepsTotal: number
  variant: 'in-progress' | 'completed'
}

export function PathwayCard({
  title,
  slug,
  percentage,
  stepsCompleted,
  stepsTotal,
  variant,
}: PathwayCardProps) {
  const pct = Math.round(percentage)
  const isCompleted = variant === 'completed'

  return (
    <Link
      href={`/parcours/${slug}`}
      className="mb-3 flex items-center gap-3.5 rounded-[4px] border px-[18px] py-4 text-ink no-underline transition-[border-color,box-shadow] duration-150 hover:shadow-[0_2px_8px_var(--accent-soft)] last:mb-0"
      style={{
        background: isCompleted ? 'rgba(184,92,56,0.04)' : 'var(--surface)',
        borderColor: isCompleted ? 'var(--accent-soft)' : 'var(--line-strong)',
      }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] text-[1rem] leading-none"
        style={{
          background: isCompleted ? 'var(--accent-soft)' : 'var(--laiton-soft)',
          border: `1px solid ${isCompleted ? 'rgba(184,92,56,0.2)' : 'rgba(181,150,77,0.2)'}`,
          color: isCompleted ? 'var(--accent)' : 'var(--laiton)',
        }}
        aria-hidden="true"
      >
        {isCompleted ? '✓' : '◎'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[0.9rem] font-[500]">
          {title}
        </div>
        <div className="font-sans text-[0.77rem]" style={{ color: 'var(--muted)' }}>
          {stepsCompleted}&nbsp;/&nbsp;{stepsTotal}&nbsp;étapes
        </div>
      </div>
      {!isCompleted && (
        <div
          className="shrink-0 font-sans text-[0.8rem] font-semibold"
          style={{ color: 'var(--accent)' }}
        >
          {pct}&thinsp;%
        </div>
      )}
    </Link>
  )
}
