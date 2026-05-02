import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { PosterGrid } from '@/components/collection/PosterGrid'
import { ProgressBar } from '@/components/collection/ProgressBar'
import { markWatched, removeWatched } from './actions'
import type { CollectionItem, MediaItem, UserCollectionProgress } from '@/payload-types'

type Props = {
  params: Promise<{ slug: string }>
}

type PopulatedCollectionItem = CollectionItem & { media_item: MediaItem }

const accessibilityLabel: Record<string, string> = {
  accessible: 'Accessible',
  curieux: 'Curieux',
  cinephile: 'Cinéphile',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'collections',
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const collection = result.docs[0]
  if (!collection) return { title: 'Collection introuvable · Collec Club' }
  return { title: `${collection.title} · Collec Club` }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  // Collection (published only)
  const result = await payload.find({
    collection: 'collections',
    where: { slug: { equals: slug }, is_published: { equals: true } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const collection = result.docs[0]
  if (!collection) notFound()

  // Items avec media_item peuplé
  const itemsResult = await payload.find({
    collection: 'collection-items',
    where: { collection: { equals: collection.id } },
    depth: 1,
    limit: 0,
    overrideAccess: true,
  })
  const items = itemsResult.docs as PopulatedCollectionItem[]

  const user = await getCurrentUser()

  let watchedMap: Record<number, number> = {}
  let progress: UserCollectionProgress | null = null

  if (user) {
    const mediaItemIds = items.map((item) => item.media_item.id)

    const [watchedResult, progressResult] = await Promise.all([
      mediaItemIds.length > 0
        ? payload.find({
            collection: 'user-watched-items',
            where: {
              and: [{ user: { equals: user.id } }, { media_item: { in: mediaItemIds } }],
            },
            depth: 0,
            limit: 500,
            overrideAccess: true,
          })
        : Promise.resolve({ docs: [] as never[] }),
      payload.find({
        collection: 'user-collection-progress',
        where: {
          and: [{ user: { equals: user.id } }, { collection: { equals: collection.id } }],
        },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      }),
    ])

    watchedMap = Object.fromEntries(
      watchedResult.docs.map((w) => [
        typeof w.media_item === 'number' ? w.media_item : w.media_item.id,
        w.id,
      ]),
    ) as Record<number, number>

    progress = progressResult.docs[0] ?? null
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 font-sans text-[0.8rem] text-[var(--muted)]">
        <Link href="/explorer" className="transition-colors hover:text-copper">
          Explorer
        </Link>
        <span>/</span>
        <span className="text-ink">{collection.title}</span>
      </nav>

      {/* Hero */}
      <section className="pb-9 pt-11">
        <h1 className="mb-3 font-display text-[clamp(2.2rem,5vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.045em] text-ink">
          {collection.title}
        </h1>

        <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-[14px] font-sans text-[0.88rem] text-[var(--muted)]">
          <span className="rounded-[3px] bg-[var(--accent-soft)] px-[9px] py-[2px] text-[0.77rem] font-semibold text-[var(--accent)]">
            {accessibilityLabel[collection.accessibility_level]}
          </span>
          <span>
            {items.length} oeuvre{items.length > 1 ? 's' : ''}
          </span>
          {collection.is_open && <span>· Collection ouverte</span>}
        </div>

        {collection.short_description && (
          <p className="mb-6 font-sans text-[0.88rem] text-[var(--muted)]">
            {collection.short_description}
          </p>
        )}

        {user && progress && <ProgressBar progress={progress} />}
      </section>

      {/* Note éditoriale */}
      {collection.editorial_note && (
        <section className="border-t border-[var(--line)] pb-12 pt-10">
          <p className="mb-4 font-sans text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[var(--accent)]">
            Note éditoriale
          </p>
          <div className="max-w-[660px] font-serif text-[1.02rem] leading-[1.78]">
            {collection.editorial_note.split('\n').map((para, i) => (
              <p key={i} className={i > 0 ? 'mt-4' : ''}>
                {para}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Grille */}
      <section className="border-t border-[var(--line)] pt-10">
        <div className="mb-8 flex items-center gap-4">
          <h2 className="shrink-0 font-display text-[1.15rem] font-semibold text-ink">Oeuvres</h2>
          <div className="h-px flex-1 bg-[var(--line)]" />
          <span className="whitespace-nowrap font-sans text-[0.82rem] text-[var(--subtle)]">
            {items.length} titre{items.length > 1 ? 's' : ''}
          </span>
        </div>

        <PosterGrid
          items={items}
          watchedMap={watchedMap}
          markWatched={markWatched}
          removeWatched={removeWatched}
          collectionSlug={slug}
          isAuthenticated={!!user}
        />
      </section>
    </div>
  )
}
