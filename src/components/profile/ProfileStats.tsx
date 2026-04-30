interface ProfileStatsProps {
  filmsVus: number
  seriesVues: number
  collectionsCompletees: number
  parcoursComplets: number
}

export function ProfileStats({
  filmsVus,
  seriesVues,
  collectionsCompletees,
  parcoursComplets,
}: ProfileStatsProps) {
  return (
    // Grid: 2 cols on mobile, 4 cols on ≥640px
    // Borders: inner separators only (not on last col, not on last row on mobile)
    <div
      className="grid grid-cols-2 overflow-hidden rounded-[4px] border sm:grid-cols-4 sm:max-w-[520px]"
      style={{ borderColor: 'var(--line-strong)', background: 'var(--surface)' }}
    >
      {/* top-left: border-r + border-b on mobile */}
      <StatCell value={filmsVus} label="Films vus" accent borderCls="border-r border-b sm:border-b-0" />
      {/* top-right on mobile (border-b), becomes col 2/4 on desktop (border-r) */}
      <StatCell value={seriesVues} label="Séries vues" borderCls="border-b sm:border-r sm:border-b-0" />
      {/* bottom-left on mobile (border-r only) */}
      <StatCell value={collectionsCompletees} label="Collections terminées" borderCls="border-r" />
      {/* bottom-right: no borders */}
      <StatCell value={parcoursComplets} label="Parcours terminés" />
    </div>
  )
}

interface StatCellProps {
  value: number
  label: string
  accent?: boolean
  borderCls?: string
}

function StatCell({ value, label, accent = false, borderCls = '' }: StatCellProps) {
  return (
    <div
      className={`px-4 py-3.5 text-center sm:px-5 sm:py-4 ${borderCls}`}
      style={{ borderColor: 'var(--line)' }}
    >
      <span
        className="mb-1 block font-display text-[1.65rem] font-bold leading-none tracking-[-0.04em] text-ink sm:text-[1.9rem]"
        style={accent ? { color: 'var(--accent)' } : undefined}
      >
        {value}
      </span>
      <span className="font-sans text-[0.72rem] leading-[1.3] sm:text-[0.78rem]" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
    </div>
  )
}
