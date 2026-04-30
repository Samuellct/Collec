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
    <div
      className="flex max-w-[560px] overflow-hidden rounded-[4px] border bg-[var(--surface)] max-[640px]:max-w-full"
      style={{ borderColor: 'var(--line-strong)' }}
    >
      <StatCell value={filmsVus} label="Films vus" accent />
      <StatCell value={seriesVues} label="Séries vues" />
      <StatCell value={collectionsCompletees} label="Collections terminées" />
      <StatCell value={parcoursComplets} label="Parcours terminés" last />
    </div>
  )
}

interface StatCellProps {
  value: number
  label: string
  accent?: boolean
  last?: boolean
}

function StatCell({ value, label, accent = false, last = false }: StatCellProps) {
  return (
    <div
      className="flex-1 px-5 py-4 text-center max-[420px]:basis-1/2"
      style={last ? undefined : { borderRight: '1px solid var(--line)' }}
    >
      <span
        className="mb-1 block font-display text-[2rem] font-bold leading-none tracking-[-0.04em] text-ink"
        style={accent ? { color: 'var(--accent)' } : undefined}
      >
        {value}
      </span>
      <span className="font-sans text-[0.78rem]" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
    </div>
  )
}
