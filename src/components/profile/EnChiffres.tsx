interface EnChiffresProps {
  oeuvresVues: number
  collectionsDeMarrees: number
  tauxCompletionMoyen: number | null
  realisateursDecouverts: number
}

export function EnChiffres({
  oeuvresVues,
  collectionsDeMarrees,
  tauxCompletionMoyen,
  realisateursDecouverts,
}: EnChiffresProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        value={oeuvresVues}
        label="Oeuvres vues au total"
        accent
      />
      <StatCard
        value={collectionsDeMarrees}
        label="Collections démarrées"
      />
      <StatCard
        value={tauxCompletionMoyen !== null ? `${tauxCompletionMoyen} %` : 'n/a'}
        label="Taux de complétion moyen"
        laiton
      />
      <StatCard
        value={realisateursDecouverts}
        label="Réalisateurs découverts"
      />
    </div>
  )
}

interface StatCardProps {
  value: number | string
  label: string
  accent?: boolean
  laiton?: boolean
}

function StatCard({ value, label, accent = false, laiton = false }: StatCardProps) {
  const valueColor = accent
    ? 'var(--accent)'
    : laiton
      ? 'var(--laiton)'
      : undefined

  return (
    <div
      className="rounded-[4px] border px-5 py-[18px]"
      style={{ background: 'var(--surface)', borderColor: 'var(--line-strong)' }}
    >
      <div
        className="mb-1.5 font-display text-[2.2rem] font-bold leading-none tracking-[-0.05em] text-ink"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
      <div className="font-sans text-[0.8rem] leading-[1.3]" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
    </div>
  )
}
