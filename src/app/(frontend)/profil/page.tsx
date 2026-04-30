import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { CollectionProgressCard } from '@/components/profile/CollectionProgressCard'
import { PathwayCard } from '@/components/profile/PathwayCard'
import { RecentActivityList } from '@/components/profile/RecentActivityList'
import type { ActivityItem } from '@/components/profile/RecentActivityList'
import type {
  MediaType,
  MediaItem,
  Collection,
  Pathway,
  UserWatchedItem,
  UserCollectionProgress,
  UserPathwayProgress,
} from '@/payload-types'

type PopulatedWatchedItem = Omit<UserWatchedItem, 'media_item'> & {
  media_item: Omit<MediaItem, 'media_type'> & { media_type: MediaType }
}
type PopulatedCollectionProgress = Omit<UserCollectionProgress, 'collection'> & {
  collection: Collection
}
type PopulatedPathwayProgress = Omit<UserPathwayProgress, 'pathway'> & {
  pathway: Pathway
}

function formatMemberSince(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
    new Date(dateStr),
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 font-display text-[1.15rem] font-semibold tracking-[-0.025em] text-ink">
      {children}
      <span
        className="flex-1"
        style={{ height: '1px', background: 'var(--line)' }}
        aria-hidden="true"
      />
    </h2>
  )
}

export default async function ProfilPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?next=/profil')
  }

  const payload = await getPayload({ config })

  const [watchedResult, collectionProgressResult, pathwayProgressResult] = await Promise.all([
    payload.find({
      collection: 'user-watched-items',
      where: { user: { equals: user.id } },
      depth: 2,
      sort: '-watched_at',
      limit: 200,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'user-collection-progress',
      where: { user: { equals: user.id } },
      depth: 1,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'user-pathway-progress',
      where: { user: { equals: user.id } },
      depth: 1,
      overrideAccess: true,
    }),
  ])

  const watchedItems = watchedResult.docs as PopulatedWatchedItem[]
  const collectionProgress = collectionProgressResult.docs as PopulatedCollectionProgress[]
  const pathwayProgress = pathwayProgressResult.docs as PopulatedPathwayProgress[]

  const filmsVus = watchedItems.filter((w) => w.media_item.media_type.slug === 'film').length
  const seriesVues = watchedItems.filter((w) => w.media_item.media_type.slug === 'series').length
  const collectionsCompletees = collectionProgress.filter((p) => p.is_completed).length
  const parcoursComplets = pathwayProgress.filter((p) => p.is_completed).length

  const collectionsEnCours = collectionProgress
    .filter((p) => !p.is_completed && p.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)

  const collectionsTerminees = collectionProgress
    .filter((p) => p.is_completed)
    .sort((a, b) => {
      const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0
      const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0
      return dateB - dateA
    })

  const parcoursEnCours = pathwayProgress
    .filter((p) => !p.is_completed && p.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)

  const parcoursTermines = pathwayProgress
    .filter((p) => p.is_completed)
    .sort((a, b) => {
      const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0
      const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0
      return dateB - dateA
    })

  // Activity: merge watched items + completed milestones, sorted by date DESC
  const activityItems: ActivityItem[] = [
    ...watchedItems.slice(0, 10).map((w): ActivityItem => ({
      type: 'watched',
      title: w.media_item.title,
      date: w.watched_at,
    })),
    ...collectionProgress
      .filter((p) => p.is_completed && p.completed_at)
      .map((p): ActivityItem => ({
        type: 'collection-done',
        title: p.collection.title,
        date: p.completed_at!,
      })),
    ...pathwayProgress
      .filter((p) => p.is_completed && p.completed_at)
      .map((p): ActivityItem => ({
        type: 'pathway-done',
        title: p.pathway.title,
        date: p.completed_at!,
      })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15)

  const pseudo = user.pseudo ?? 'Utilisateur'
  const initial = pseudo[0].toUpperCase()

  return (
    <main className="mx-auto max-w-[1080px] px-6">
      {/* Profile header */}
      <div className="border-b py-10" style={{ borderColor: 'var(--line)' }}>
        <div className="mb-7 flex items-start gap-5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-[1.4rem] font-bold leading-none text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--bordeaux) 100%)' }}
            aria-hidden="true"
          >
            {initial}
          </div>
          <div>
            <h1 className="font-display text-[1.75rem] font-bold leading-[1.1] tracking-[-0.04em] text-ink">
              {pseudo}
            </h1>
            <p className="mt-1 font-sans text-[0.83rem]" style={{ color: 'var(--muted)' }}>
              Membre depuis {formatMemberSince(user.createdAt)}
            </p>
          </div>
        </div>

        <ProfileStats
          filmsVus={filmsVus}
          seriesVues={seriesVues}
          collectionsCompletees={collectionsCompletees}
          parcoursComplets={parcoursComplets}
        />
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-[1fr_320px] items-start gap-12 py-10 max-[800px]:grid-cols-1 max-[800px]:gap-8">
        {/* Main column */}
        <div>
          {/* Collections en cours */}
          <section className="mb-9">
            <SectionTitle>Collections en cours</SectionTitle>
            {collectionsEnCours.length === 0 ? (
              <p className="font-serif text-[0.9rem]" style={{ color: 'var(--muted)' }}>
                Tu n&apos;as pas encore démarré de collection.{' '}
                <Link
                  href="/explorer"
                  className="underline underline-offset-2"
                  style={{ color: 'var(--accent)' }}
                >
                  Explorer les collections
                </Link>
              </p>
            ) : (
              collectionsEnCours.map((p) => (
                <CollectionProgressCard
                  key={p.id}
                  title={p.collection.title}
                  slug={p.collection.slug}
                  percentage={p.percentage}
                  itemsSeen={p.items_seen}
                  itemsTotal={p.items_total}
                  variant="in-progress"
                />
              ))
            )}
          </section>

          {/* Collections terminées */}
          {collectionsTerminees.length > 0 && (
            <section className="mb-9">
              <SectionTitle>Collections terminées</SectionTitle>
              {collectionsTerminees.map((p) => (
                <CollectionProgressCard
                  key={p.id}
                  title={p.collection.title}
                  slug={p.collection.slug}
                  percentage={p.percentage}
                  itemsSeen={p.items_seen}
                  itemsTotal={p.items_total}
                  variant="completed"
                />
              ))}
            </section>
          )}

          {/* Parcours en cours */}
          {parcoursEnCours.length > 0 && (
            <section className="mb-9">
              <SectionTitle>Parcours en cours</SectionTitle>
              {parcoursEnCours.map((p) => (
                <PathwayCard
                  key={p.id}
                  title={p.pathway.title}
                  slug={p.pathway.slug}
                  percentage={p.percentage}
                  stepsCompleted={p.steps_completed}
                  stepsTotal={p.steps_total}
                  variant="in-progress"
                />
              ))}
            </section>
          )}

          {/* Parcours terminés */}
          {parcoursTermines.length > 0 && (
            <section>
              <SectionTitle>Parcours terminés</SectionTitle>
              {parcoursTermines.map((p) => (
                <PathwayCard
                  key={p.id}
                  title={p.pathway.title}
                  slug={p.pathway.slug}
                  percentage={p.percentage}
                  stepsCompleted={p.steps_completed}
                  stepsTotal={p.steps_total}
                  variant="completed"
                />
              ))}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <section>
            <SectionTitle>Activité récente</SectionTitle>
            <RecentActivityList items={activityItems} />
          </section>
        </aside>
      </div>
    </main>
  )
}
