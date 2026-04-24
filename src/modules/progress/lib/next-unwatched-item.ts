import type { Payload } from 'payload'
import type { CollectionItem, PathwayStep } from '@/payload-types'

export async function getNextUnwatchedItem(
  payload: Payload,
  userId: number,
  collectionId: number,
): Promise<CollectionItem | null> {
  const [itemsResult, watchedResult] = await Promise.all([
    payload.find({
      collection: 'collection-items',
      where: { collection: { equals: collectionId } },
      limit: 0,
      depth: 1,
      sort: 'media_item.release_date',
    }),
    payload.find({
      collection: 'user-watched-items',
      where: { user: { equals: userId } },
      limit: 0,
      depth: 0,
    }),
  ])

  const watchedIds = new Set(
    watchedResult.docs.map((doc) => {
      const mi = doc.media_item
      return typeof mi === 'object' && mi !== null ? (mi as { id: number }).id : (mi as number)
    }),
  )

  const next = itemsResult.docs.find((doc) => {
    const mi = doc.media_item
    const id = typeof mi === 'object' && mi !== null ? (mi as { id: number }).id : (mi as number)
    return !watchedIds.has(id)
  })

  return next ?? null
}

export async function getNextUnwatchedStep(
  payload: Payload,
  userId: number,
  pathwayId: number,
): Promise<PathwayStep | null> {
  const [stepsResult, watchedResult] = await Promise.all([
    payload.find({
      collection: 'pathway-steps',
      where: { pathway: { equals: pathwayId } },
      limit: 0,
      depth: 1,
      sort: 'position',
    }),
    payload.find({
      collection: 'user-watched-items',
      where: { user: { equals: userId } },
      limit: 0,
      depth: 0,
    }),
  ])

  const watchedIds = new Set(
    watchedResult.docs.map((doc) => {
      const mi = doc.media_item
      return typeof mi === 'object' && mi !== null ? (mi as { id: number }).id : (mi as number)
    }),
  )

  const next = stepsResult.docs.find((doc) => {
    const mi = doc.media_item
    const id = typeof mi === 'object' && mi !== null ? (mi as { id: number }).id : (mi as number)
    return !watchedIds.has(id)
  })

  return next ?? null
}
