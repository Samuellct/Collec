import { getPayload } from 'payload'
import config from '@payload-config'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { HeroSection } from '@/components/homepage/HeroSection'
import { CollectionsPreview } from '@/components/homepage/CollectionsPreview'
import { PathwaysPreview } from '@/components/homepage/PathwaysPreview'
import { UserProgressSection } from '@/components/homepage/UserProgressSection'
import type {
  Collection,
  Pathway,
  CollectionItem,
  MediaItem,
  UserCollectionProgress,
  UserWatchedItem,
  MediaType,
} from '@/payload-types'

export const metadata: Metadata = {
  title: 'Collec Club — La culture à compléter.',
  description:
    'Construis ta culture film après film. Complète des collections et suis des parcours éditoriaux sur Collec Club.',
}

export type CollectionCardData = {
  id: number
  slug: string
  title: string
  short_description: string
  accessibility_level: 'accessible' | 'curieux' | 'cinephile'
  cover_image_url: string | null
  posterUrls: string[]
  itemCount: number
}

export type PathwayCardData = {
  id: number
  slug: string
  title: string
  subtitle: string | null
  accessibility_level: 'accessible' | 'curieux' | 'cinephile'
  estimated_duration_hours: number | null
  stepCount: number
}

export type InProgressCollection = {
  id: number
  slug: string
  title: string
  percentage: number
  itemsSeen: number
  itemsTotal: number
  posterUrls: string[]
}

export type RecentlyWatchedItem = {
  id: number
  title: string
  year: number | null
  poster_url: string | null
  slug: string
}

type PopulatedCollectionItem = Omit<CollectionItem, 'media_item'> & { media_item: MediaItem }
type PopulatedProgress = Omit<UserCollectionProgress, 'collection'> & { collection: Collection }
type PopulatedWatchedItem = Omit<UserWatchedItem, 'media_item'> & {
  media_item: Omit<MediaItem, 'media_type'> & { media_type: MediaType }
}

export default async function HomePage() {
  const payload = await getPayload({ config })
  const user = await getCurrentUser()

  const [collectionsResult, pathwaysResult] = await Promise.all([
    payload.find({
      collection: 'collections',
      where: { is_published: { equals: true } },
      sort: 'display_order',
      depth: 0,
      limit: 6,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'pathways',
      where: { is_published: { equals: true } },
      sort: 'display_order',
      depth: 0,
      limit: 3,
      overrideAccess: true,
    }),
  ])

  const collectionIds = collectionsResult.docs.map((c) => c.id)

  const [allItemsResult, userProgressResult, recentWatchedResult] = await Promise.all([
    collectionIds.length > 0
      ? payload.find({
          collection: 'collection-items',
          where: { collection: { in: collectionIds } },
          depth: 1,
          limit: 0,
          overrideAccess: true,
        })
      : Promise.resolve({ docs: [] as CollectionItem[], totalDocs: 0 }),
    user
      ? payload.find({
          collection: 'user-collection-progress',
          where: {
            user: { equals: user.id },
            is_completed: { equals: false },
            percentage: { greater_than: 0 },
          },
          sort: '-percentage',
          depth: 1,
          limit: 3,
          overrideAccess: true,
        })
      : Promise.resolve({ docs: [], totalDocs: 0 }),
    user
      ? payload.find({
          collection: 'user-watched-items',
          where: { user: { equals: user.id } },
          sort: '-watched_at',
          depth: 2,
          limit: 8,
          overrideAccess: true,
        })
      : Promise.resolve({ docs: [], totalDocs: 0 }),
  ])

  // Build item map (collection_id → items) for poster URLs and counts
  const itemsByCollection = new Map<number, PopulatedCollectionItem[]>()
  for (const item of allItemsResult.docs as PopulatedCollectionItem[]) {
    const collId =
      typeof item.collection === 'number' ? item.collection : (item.collection as Collection).id
    if (!itemsByCollection.has(collId)) itemsByCollection.set(collId, [])
    itemsByCollection.get(collId)!.push(item)
  }

  const featuredCollections: CollectionCardData[] = collectionsResult.docs.map((c) => {
    const items = itemsByCollection.get(c.id) ?? []
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      short_description: c.short_description,
      accessibility_level: c.accessibility_level,
      cover_image_url: c.cover_image_url ?? null,
      posterUrls: items
        .map((i) => (i.media_item as MediaItem)?.poster_url)
        .filter((url): url is string => typeof url === 'string' && url.length > 0)
        .slice(0, 4),
      itemCount: items.length,
    }
  })

  const featuredPathways: PathwayCardData[] = (pathwaysResult.docs as Pathway[]).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle ?? null,
    accessibility_level: p.accessibility_level,
    estimated_duration_hours: p.estimated_duration_hours ?? null,
    stepCount: p.steps?.totalDocs ?? 0,
  }))

  // Connected-user data
  const inProgressCollections: InProgressCollection[] = (
    userProgressResult.docs as PopulatedProgress[]
  ).map((p) => {
    const coll = p.collection as Collection
    const items = itemsByCollection.get(coll.id) ?? []
    return {
      id: coll.id,
      slug: coll.slug,
      title: coll.title,
      percentage: p.percentage,
      itemsSeen: p.items_seen,
      itemsTotal: p.items_total,
      posterUrls: items
        .map((i) => (i.media_item as MediaItem)?.poster_url)
        .filter((url): url is string => typeof url === 'string' && url.length > 0)
        .slice(0, 3),
    }
  })

  const recentWatched: RecentlyWatchedItem[] = (
    recentWatchedResult.docs as PopulatedWatchedItem[]
  ).map((w) => {
    const mi = w.media_item as MediaItem
    return {
      id: mi.id,
      title: mi.title,
      year: mi.year ?? null,
      poster_url: mi.poster_url ?? null,
      slug: mi.slug ?? '',
    }
  })

  // totalDocs from payload is the full count regardless of `limit`
  const filmsVus = recentWatchedResult.totalDocs

  const showUserSection =
    user && (inProgressCollections.length > 0 || recentWatched.length > 0)

  return (
    // -mx-6 -mt-8 cancels the layout's px-6 py-8 so each section controls its own padding
    <div className="-mx-6 -mt-8">
      <HeroSection user={user ? { pseudo: user.pseudo ?? 'Cinéphile', filmsVus } : null} />
      {showUserSection && (
        <UserProgressSection
          inProgress={inProgressCollections}
          recentWatched={recentWatched}
        />
      )}
      <CollectionsPreview collections={featuredCollections} />
      <PathwaysPreview pathways={featuredPathways} />
    </div>
  )
}
