import { getPayload } from 'payload'
import config from '@payload-config'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { ExplorerGrid } from '@/components/explorer/ExplorerGrid'
import type { Collection, Pathway, CollectionItem, MediaItem, UserCollectionProgress } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Découvrir · Collec Club',
  description: 'Explorez les collections et parcours disponibles sur Collec Club.',
}

type CollectionCardData = {
  id: number
  slug: string
  title: string
  short_description: string
  accessibility_level: 'accessible' | 'curieux' | 'cinephile'
  cover_image_url: string | null
  posterUrls: string[]
  itemCount: number
  userProgress: { percentage: number; is_completed: boolean } | null
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

export type { CollectionCardData }

type PopulatedCollectionItem = Omit<CollectionItem, 'media_item'> & { media_item: MediaItem }

export default async function ExplorerPage() {
  const payload = await getPayload({ config })
  const user = await getCurrentUser()

  const [collectionsResult, pathwaysResult] = await Promise.all([
    payload.find({
      collection: 'collections',
      where: { is_published: { equals: true } },
      sort: 'display_order',
      depth: 0,
      limit: 100,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'pathways',
      where: { is_published: { equals: true } },
      sort: 'display_order',
      depth: 0,
      limit: 100,
      overrideAccess: true,
    }),
  ])

  const collectionIds = collectionsResult.docs.map((c) => c.id)

  const [allItemsResult, userProgressResult] = await Promise.all([
    collectionIds.length > 0
      ? payload.find({
          collection: 'collection-items',
          where: { collection: { in: collectionIds } },
          depth: 1,
          limit: 0,
          overrideAccess: true,
        })
      : Promise.resolve({ docs: [] as CollectionItem[] }),
    user
      ? payload.find({
          collection: 'user-collection-progress',
          where: { user: { equals: user.id } },
          depth: 0,
          overrideAccess: true,
        })
      : Promise.resolve({ docs: [] as UserCollectionProgress[] }),
  ])

  const itemsByCollection = new Map<number, PopulatedCollectionItem[]>()
  for (const item of allItemsResult.docs as PopulatedCollectionItem[]) {
    const collId = typeof item.collection === 'number' ? item.collection : (item.collection as Collection).id
    if (!itemsByCollection.has(collId)) itemsByCollection.set(collId, [])
    itemsByCollection.get(collId)!.push(item)
  }

  const progressByCollection = new Map<number, { percentage: number; is_completed: boolean }>()
  for (const p of userProgressResult.docs) {
    const collId = typeof p.collection === 'number' ? p.collection : (p.collection as Collection).id
    progressByCollection.set(collId, { percentage: p.percentage, is_completed: p.is_completed })
  }

  const collections: CollectionCardData[] = collectionsResult.docs.map((c) => {
    const items = itemsByCollection.get(c.id) ?? []
    const posterUrls = items
      .map((i) => (i.media_item as MediaItem)?.poster_url)
      .filter((url): url is string => typeof url === 'string' && url.length > 0)
      .slice(0, 4)
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      short_description: c.short_description,
      accessibility_level: c.accessibility_level,
      cover_image_url: c.cover_image_url ?? null,
      posterUrls,
      itemCount: items.length,
      userProgress: progressByCollection.get(c.id) ?? null,
    }
  })

  const pathways: PathwayCardData[] = (pathwaysResult.docs as Pathway[]).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle ?? null,
    accessibility_level: p.accessibility_level,
    estimated_duration_hours: p.estimated_duration_hours ?? null,
    stepCount: p.steps?.totalDocs ?? 0,
  }))

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-10">
      <h1 className="mb-2 font-display text-[2rem] font-bold tracking-[-0.04em] text-ink">
        Découvrir
      </h1>
      <p className="mb-8 font-serif text-[1rem]" style={{ color: 'var(--muted)' }}>
        Collections et parcours à compléter.
      </p>
      <ExplorerGrid collections={collections} pathways={pathways} />
    </main>
  )
}
