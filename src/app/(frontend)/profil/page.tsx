import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { ProfileStats } from '@/components/profile/ProfileStats'
import type {
  MediaType,
  MediaItem,
  Collection,
  Pathway,
  UserWatchedItem,
  UserCollectionProgress,
  UserPathwayProgress,
} from '@/payload-types'

// Populated types — depth 2 for watched items, depth 1 for progress
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

  const filmsVus = watchedItems.filter(
    (w) => w.media_item.media_type.slug === 'film',
  ).length
  const seriesVues = watchedItems.filter(
    (w) => w.media_item.media_type.slug === 'series',
  ).length
  const collectionsCompletees = collectionProgress.filter((p) => p.is_completed).length
  const parcoursComplets = pathwayProgress.filter((p) => p.is_completed).length

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
        <div>{/* Main column — content à venir */}</div>
        <aside>{/* Sidebar — content à venir */}</aside>
      </div>
    </main>
  )
}
