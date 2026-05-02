import Link from 'next/link'
import type { InProgressCollection, RecentlyWatchedItem } from '@/app/(frontend)/page'

interface UserProgressSectionProps {
  inProgress: InProgressCollection[]
  recentWatched: RecentlyWatchedItem[]
}

export function UserProgressSection({ inProgress, recentWatched }: UserProgressSectionProps) {
  return (
    <section className="border-b px-6 py-10" style={{ borderColor: 'var(--line)' }}>
      {/* Collections en cours */}
      {inProgress.length > 0 && (
        <div className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-[1.3rem] font-semibold tracking-[-0.03em] text-ink">
              Tes collections en cours
            </h2>
            <Link
              href="/profil"
              className="font-sans text-[0.82rem] transition-colors hover:text-[var(--accent)]"
              style={{ color: 'var(--muted)' }}
            >
              Voir tout
            </Link>
          </div>
          <div className="divide-y" style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}>
            {inProgress.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                className="group flex items-center gap-5 py-5 transition-colors first:pt-0 last:pb-0 hover:opacity-90 sm:gap-6"
              >
                {/* Fan de posters */}
                <div className="relative flex shrink-0 items-end" style={{ height: '72px' }}>
                  {c.posterUrls.slice(0, 3).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="h-[72px] w-[48px] rounded-[4px] object-cover"
                      style={{
                        position: 'relative',
                        marginLeft: i > 0 ? '-14px' : undefined,
                        zIndex: 3 - i,
                        boxShadow: '-2px 0 6px var(--shadow-poster)',
                      }}
                    />
                  ))}
                  {c.posterUrls.length === 0 && (
                    <div
                      className="h-[72px] w-[48px] rounded-[4px]"
                      style={{ background: 'var(--line)' }}
                    />
                  )}
                  {c.itemsTotal - c.posterUrls.length > 0 && c.posterUrls.length > 0 && (
                    <div
                      className="flex h-[72px] w-[48px] items-center justify-center rounded-[4px] border border-dashed font-sans text-[0.78rem] font-semibold"
                      style={{
                        marginLeft: '-14px',
                        zIndex: 0,
                        borderColor: 'var(--line-strong)',
                        background: 'var(--accent-soft)',
                        color: 'var(--muted)',
                      }}
                    >
                      +{c.itemsTotal - c.posterUrls.length}
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="min-w-0 flex-1">
                  <h3 className="mb-0.5 font-display text-[1rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink transition-colors group-hover:text-[var(--accent)]">
                    {c.title}
                  </h3>
                  <p className="mb-2 font-sans text-[0.82rem]" style={{ color: 'var(--muted)' }}>
                    {c.itemsSeen} sur {c.itemsTotal}{' '}
                    {c.itemsTotal === 1 ? 'oeuvre vue' : 'oeuvres vues'}
                  </p>
                  <div
                    className="h-[4px] max-w-[260px] overflow-hidden rounded-[2px]"
                    style={{ background: 'var(--line-strong)' }}
                  >
                    <div
                      className="h-full rounded-[2px]"
                      style={{ width: `${c.percentage}%`, background: 'var(--accent)' }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Vus récemment */}
      {recentWatched.length > 0 && (
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-[1.3rem] font-semibold tracking-[-0.03em] text-ink">
              Vus récemment
            </h2>
          </div>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}
          >
            {recentWatched.map((w) => (
              <Link key={`${w.id}-${w.slug}`} href={`/films/${w.slug}`} className="group">
                {w.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={w.poster_url}
                    alt={w.title}
                    className="aspect-[2/3] w-full rounded-[3px] object-cover transition-transform duration-200 group-hover:-translate-y-1"
                    style={{ boxShadow: '0 2px 8px var(--shadow-poster)' }}
                  />
                ) : (
                  <div
                    className="aspect-[2/3] w-full rounded-[3px]"
                    style={{ background: 'var(--line)' }}
                  />
                )}
                <p className="mt-1.5 line-clamp-2 font-serif text-[0.78rem] font-medium leading-[1.25]">
                  {w.title}
                </p>
                {w.year && (
                  <p className="font-sans text-[0.72rem]" style={{ color: 'var(--muted)' }}>
                    {w.year}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
