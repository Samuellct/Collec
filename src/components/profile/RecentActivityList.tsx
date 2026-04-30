export type ActivityItem =
  | { type: 'watched'; title: string; date: string }
  | { type: 'collection-done'; title: string; date: string }
  | { type: 'pathway-done'; title: string; date: string }

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "aujourd'hui"
  if (diffDays === 1) return 'hier'
  if (diffDays < 7) return `il y a ${diffDays} jours`
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(date)
}

function activityLabel(item: ActivityItem): string {
  if (item.type === 'watched') return 'Vu'
  if (item.type === 'collection-done') return 'Collection terminée'
  return 'Parcours terminé'
}

interface RecentActivityListProps {
  items: ActivityItem[]
}

export function RecentActivityList({ items }: RecentActivityListProps) {
  if (items.length === 0) {
    return (
      <p className="font-serif text-[0.9rem]" style={{ color: 'var(--muted)' }}>
        Aucune activité pour le moment.
      </p>
    )
  }

  return (
    <ul className="list-none">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 py-2.5"
          style={
            i < items.length - 1
              ? { borderBottom: '1px solid var(--line)' }
              : undefined
          }
        >
          <span
            className="mt-[7px] h-2 w-2 shrink-0 rounded-full"
            style={{ background: item.type === 'watched' ? 'var(--accent)' : 'var(--laiton)' }}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[0.83rem] leading-[1.4] text-ink">
              {activityLabel(item)}&nbsp;&middot;&nbsp;
              <strong className="font-[500]">{item.title}</strong>
            </p>
            <p className="mt-0.5 font-sans text-[0.74rem]" style={{ color: 'var(--subtle)' }}>
              {formatRelativeDate(item.date)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
