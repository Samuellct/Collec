import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getWatchProviders } from '@/modules/media-items/tmdb/watch-providers'
import { FilmWatchButton } from '@/components/film/FilmWatchButton'
import { markWatched, removeWatched } from './actions'
import type {
  MediaItem,
  MediaType,
  Collection,
  Pathway,
  CollectionItem,
  PathwayStep,
  UserCollectionProgress,
  UserPathwayProgress,
} from '@/payload-types'

type Props = {
  params: Promise<{ slug: string }>
}

type PopulatedCollectionItem = CollectionItem & { collection: Collection }
type PopulatedPathwayStep = PathwayStep & { pathway: Pathway }

function formatDuration(duration: number | null | undefined, slug: string): string | null {
  if (!duration) return null
  if (slug === 'series') return `${duration} saison${duration > 1 ? 's' : ''}`
  const h = Math.floor(duration / 60)
  const m = duration % 60
  if (h === 0) return `${m}min`
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

async function findMediaItem(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  slugParam: string,
): Promise<(MediaItem & { media_type: MediaType }) | null> {
  // Try by slug first
  const bySlug = await payload.find({
    collection: 'media-items',
    where: { slug: { equals: slugParam } },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  if (bySlug.docs.length > 0) {
    return bySlug.docs[0] as MediaItem & { media_type: MediaType }
  }

  // Fallback: if param looks like a numeric ID (legacy links), fetch by ID
  if (/^\d+$/.test(slugParam)) {
    try {
      const byId = await payload.findByID({
        collection: 'media-items',
        id: parseInt(slugParam, 10),
        depth: 1,
        overrideAccess: true,
      })
      return byId as MediaItem & { media_type: MediaType }
    } catch {
      return null
    }
  }

  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: slugParam } = await params
  const payload = await getPayload({ config })
  const mediaItem = await findMediaItem(payload, slugParam)
  if (!mediaItem) return { title: 'Film introuvable — Collec Club' }
  return { title: `${mediaItem.title} — Collec Club` }
}

export default async function FilmPage({ params }: Props) {
  const { slug: slugParam } = await params
  const payload = await getPayload({ config })

  const mediaItem = await findMediaItem(payload, slugParam)
  if (!mediaItem) notFound()

  const mediaType = mediaItem.media_type as MediaType
  const tmdbMediaType: 'movie' | 'tv' = mediaType.slug === 'series' ? 'tv' : 'movie'

  let watchProviders = null
  if (mediaItem.tmdb_id) {
    try {
      watchProviders = await getWatchProviders(mediaItem.tmdb_id, tmdbMediaType)
    } catch {}
  }

  const [ciResult, psResult] = await Promise.all([
    payload.find({
      collection: 'collection-items',
      where: { media_item: { equals: mediaItem.id } },
      depth: 1,
      limit: 20,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'pathway-steps',
      where: { media_item: { equals: mediaItem.id } },
      depth: 1,
      limit: 20,
      overrideAccess: true,
    }),
  ])

  const collectionItems = ciResult.docs.filter(
    (ci) => typeof ci.collection !== 'number' && ci.collection.is_published,
  ) as PopulatedCollectionItem[]

  const pathwaySteps = psResult.docs.filter(
    (ps) => typeof ps.pathway !== 'number' && ps.pathway.is_published,
  ) as PopulatedPathwayStep[]

  const user = await getCurrentUser()

  let watchedItemId: number | null = null
  let collectionProgressMap: Record<number, UserCollectionProgress> = {}
  let pathwayProgressMap: Record<number, UserPathwayProgress> = {}

  if (user) {
    const collectionIds = collectionItems.map((ci) => ci.collection.id)
    const pathwayIds = pathwaySteps.map((ps) => ps.pathway.id)

    const [watchedResult, cpResult, ppResult] = await Promise.all([
      payload.find({
        collection: 'user-watched-items',
        where: { and: [{ user: { equals: user.id } }, { media_item: { equals: mediaItem.id } }] },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      }),
      collectionIds.length > 0
        ? payload.find({
            collection: 'user-collection-progress',
            where: {
              and: [{ user: { equals: user.id } }, { collection: { in: collectionIds } }],
            },
            depth: 0,
            limit: 50,
            overrideAccess: true,
          })
        : Promise.resolve({ docs: [] as never[] }),
      pathwayIds.length > 0
        ? payload.find({
            collection: 'user-pathway-progress',
            where: { and: [{ user: { equals: user.id } }, { pathway: { in: pathwayIds } }] },
            depth: 0,
            limit: 50,
            overrideAccess: true,
          })
        : Promise.resolve({ docs: [] as never[] }),
    ])

    watchedItemId = watchedResult.docs[0]?.id ?? null

    collectionProgressMap = Object.fromEntries(
      cpResult.docs.map((p) => [
        typeof p.collection === 'number' ? p.collection : p.collection.id,
        p,
      ]),
    ) as Record<number, UserCollectionProgress>

    pathwayProgressMap = Object.fromEntries(
      ppResult.docs.map((p) => [
        typeof p.pathway === 'number' ? p.pathway : p.pathway.id,
        p,
      ]),
    ) as Record<number, UserPathwayProgress>
  }

  const durationStr = formatDuration(mediaItem.duration, mediaType.slug)
  const hasWatchProviders =
    watchProviders &&
    (watchProviders.flatrate.length > 0 ||
      watchProviders.rent.length > 0 ||
      watchProviders.buy.length > 0)

  // Bind filmSlug so FilmWatchButton doesn't need to know about it
  const boundMarkWatched = markWatched.bind(null, slugParam)
  const boundRemoveWatched = removeWatched.bind(null, slugParam)

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-[var(--line)] pb-10 pt-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 font-sans text-[0.8rem] text-[var(--muted)]">
          <Link href="/explorer" className="transition-colors hover:text-copper">
            Explorer
          </Link>
          <span>/</span>
          <span className="text-ink">{mediaItem.title}</span>
        </nav>

        {/* Hero grid */}
        <div className="grid grid-cols-[220px_1fr] items-start gap-9 max-[760px]:grid-cols-[140px_1fr] max-[760px]:gap-5 max-[640px]:grid-cols-1">
          {/* Colonne poster */}
          <div className="max-[640px]:flex max-[640px]:items-start max-[640px]:gap-4">
            <div className="relative mb-3 aspect-[2/3] w-full flex-shrink-0 overflow-hidden rounded-[4px] shadow-[0_8px_32px_var(--shadow-poster),0_2px_8px_rgba(0,0,0,0.12)] max-[640px]:mb-0 max-[640px]:w-[120px]">
              {mediaItem.poster_url ? (
                <Image
                  src={mediaItem.poster_url}
                  alt={mediaItem.title}
                  fill
                  sizes="(max-width:640px) 120px, (max-width:760px) 140px, 220px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-[var(--line-strong)]" />
              )}
            </div>

            <div className="max-[640px]:flex max-[640px]:flex-1 max-[640px]:flex-col max-[640px]:justify-end">
              <FilmWatchButton
                mediaItemId={mediaItem.id}
                initialWatchedItemId={watchedItemId}
                isAuthenticated={!!user}
                onMarkWatched={boundMarkWatched}
                onRemoveWatched={boundRemoveWatched}
              />
            </div>
          </div>

          {/* Colonne info */}
          <div className="min-w-0">
            <h1 className="mb-1 font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.045em] text-ink">
              {mediaItem.title}
            </h1>

            {mediaItem.original_title && mediaItem.original_title !== mediaItem.title && (
              <p className="mb-5 font-display text-[1.05rem] font-normal italic text-[var(--muted)]">
                {mediaItem.original_title}
              </p>
            )}

            {/* Meta row */}
            <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-sans text-[0.88rem] text-[var(--muted)]">
              <span className="rounded-[3px] bg-[var(--accent-soft)] px-[9px] py-[2px] text-[0.77rem] font-semibold text-[var(--accent)]">
                {mediaType.label}
              </span>
              {mediaItem.director && <span>{mediaItem.director}</span>}
              {mediaItem.year && (
                <>
                  <span className="text-[var(--line-strong)]">·</span>
                  <span>{mediaItem.year}</span>
                </>
              )}
              {durationStr && (
                <>
                  <span className="text-[var(--line-strong)]">·</span>
                  <span>{durationStr}</span>
                </>
              )}
            </div>

            <div className="mb-5 h-px bg-[var(--line)]" />

            {/* Synopsis */}
            {mediaItem.synopsis && (
              <>
                <p className="mb-2 font-sans text-[0.74rem] font-bold uppercase tracking-[0.09em] text-[var(--accent)]">
                  Synopsis
                </p>
                <p className="max-w-[600px] font-serif text-[1rem] leading-[1.75] text-ink">
                  {mediaItem.synopsis}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-10">
        <div className="grid grid-cols-[1fr_300px] items-start gap-12 max-[760px]:grid-cols-1 max-[760px]:gap-8">
          {/* Colonne principale */}
          <div>
            {/* Collections */}
            {collectionItems.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 flex items-center gap-3 font-display text-[1.1rem] font-semibold leading-none tracking-[-0.025em] text-ink">
                  Dans les collections
                  <span className="h-px flex-1 bg-[var(--line)]" />
                </h2>
                {collectionItems.map((ci) => {
                  const coll = ci.collection
                  const progress = collectionProgressMap[coll.id] ?? null
                  return (
                    <Link
                      key={ci.id}
                      href={`/collections/${coll.slug}`}
                      className="mb-2 flex items-center gap-3 rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-3 no-underline transition-colors hover:border-[var(--accent)]"
                    >
                      <div className="relative aspect-[2/3] w-10 flex-shrink-0 overflow-hidden rounded-[2px] shadow-[0_1px_4px_var(--shadow-poster)]">
                        {coll.cover_image_url ? (
                          <Image
                            src={coll.cover_image_url}
                            alt={coll.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-[var(--line-strong)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif text-[0.88rem] font-medium text-ink">
                          {coll.title}
                        </p>
                        {progress && (
                          <p className="font-sans text-[0.76rem] text-[var(--muted)]">
                            {progress.items_seen}/{progress.items_total} oeuvre
                            {progress.items_total > 1 ? 's' : ''} complétée
                            {progress.items_seen > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      {progress ? (
                        <span className="flex-shrink-0 font-sans text-[0.75rem] font-semibold text-[var(--accent)]">
                          {Math.round(progress.percentage)} %
                        </span>
                      ) : (
                        <span className="flex-shrink-0 font-sans text-[0.75rem] text-[var(--muted)]">
                          Pas commencée
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Parcours */}
            {pathwaySteps.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-3 font-display text-[1.1rem] font-semibold leading-none tracking-[-0.025em] text-ink">
                  Dans les parcours
                  <span className="h-px flex-1 bg-[var(--line)]" />
                </h2>
                {pathwaySteps.map((ps) => {
                  const pathway = ps.pathway
                  const progress = pathwayProgressMap[pathway.id] ?? null
                  return (
                    <Link
                      key={ps.id}
                      href={`/parcours/${pathway.slug}`}
                      className="mb-2 flex items-center gap-3 rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-3 no-underline transition-colors hover:border-[var(--accent)]"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[4px] border border-[rgba(181,150,77,0.2)] bg-[var(--laiton-soft)] text-[0.9rem]">
                        ◎
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-[0.88rem] font-medium text-ink">
                          {pathway.title}
                        </p>
                        <p className="font-sans text-[0.76rem] text-[var(--muted)]">
                          Étape {ps.position}
                          {progress &&
                            ` · ${progress.steps_completed}/${progress.steps_total} complétée${progress.steps_completed > 1 ? 's' : ''}`}
                        </p>
                      </div>
                      {progress ? (
                        <span className="flex-shrink-0 font-sans text-[0.75rem] font-semibold text-[var(--accent)]">
                          {Math.round(progress.percentage)} %
                        </span>
                      ) : (
                        <span className="flex-shrink-0 font-sans text-[0.75rem] text-[var(--muted)]">
                          À faire
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}

            {collectionItems.length === 0 && pathwaySteps.length === 0 && (
              <p className="font-sans text-[0.88rem] text-[var(--muted)]">
                Ce film ne fait pas encore partie d&apos;une collection ou d&apos;un parcours.
              </p>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Watch providers */}
            {hasWatchProviders && watchProviders && (
              <div className="rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] p-5">
                <p className="mb-3 font-sans text-[0.74rem] font-bold uppercase tracking-[0.09em] text-[var(--accent)]">
                  Disponible sur
                </p>
                {watchProviders.flatrate.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 font-sans text-[0.74rem] text-[var(--muted)]">Inclus</p>
                    <div className="flex flex-wrap gap-3">
                      {watchProviders.flatrate.map((p) => (
                        <div key={p.provider_id} className="flex items-center gap-2">
                          <div className="relative h-7 w-7 overflow-hidden rounded-[3px]">
                            <Image
                              src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                              alt={p.provider_name}
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          </div>
                          <span className="font-sans text-[0.8rem] text-ink">
                            {p.provider_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {watchProviders.rent.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 font-sans text-[0.74rem] text-[var(--muted)]">Location</p>
                    <div className="flex flex-wrap gap-3">
                      {watchProviders.rent.slice(0, 4).map((p) => (
                        <div key={p.provider_id} className="flex items-center gap-2">
                          <div className="relative h-7 w-7 overflow-hidden rounded-[3px]">
                            <Image
                              src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                              alt={p.provider_name}
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          </div>
                          <span className="font-sans text-[0.8rem] text-ink">
                            {p.provider_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="font-sans text-[0.72rem] text-[var(--muted)]">Données JustWatch</p>
              </div>
            )}

            {/* Fiche technique */}
            <div className="rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] p-5">
              <p className="mb-3 font-sans text-[0.74rem] font-bold uppercase tracking-[0.09em] text-[var(--accent)]">
                Fiche technique
              </p>
              <ul className="divide-y divide-[var(--line)]">
                {(
                  [
                    { role: 'Réalisation', value: mediaItem.director },
                    { role: 'Avec', value: mediaItem.cast },
                    { role: 'Année', value: mediaItem.year?.toString() },
                    { role: 'Durée', value: durationStr },
                  ] as { role: string; value: string | null | undefined }[]
                )
                  .filter((row) => row.value)
                  .map(({ role, value }) => (
                    <li key={role} className="flex gap-3 py-2 font-sans text-[0.86rem]">
                      <span className="min-w-[100px] flex-shrink-0 text-[var(--muted)]">
                        {role}
                      </span>
                      <span className="text-ink">{value}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
