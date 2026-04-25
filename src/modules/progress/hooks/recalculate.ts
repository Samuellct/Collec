import type { Payload } from 'payload'

export async function recalculateForUserAndMedia(
  payload: Payload,
  userId: number,
  mediaItemId: number,
): Promise<void> {
  const watchedResult = await payload.find({
    collection: 'user-watched-items',
    where: { user: { equals: userId } },
    limit: 0,
    depth: 0,
  })
  const watchedIds = new Set(
    watchedResult.docs.map((doc) => {
      const mi = doc.media_item
      return typeof mi === 'object' && mi !== null ? (mi as { id: number }).id : (mi as number)
    }),
  )

  await recalculateCollections(payload, userId, mediaItemId, watchedIds)
  await recalculatePathways(payload, userId, mediaItemId, watchedIds)
}

async function recalculateCollections(
  payload: Payload,
  userId: number,
  mediaItemId: number,
  watchedIds: Set<number>,
): Promise<void> {
  const linkResult = await payload.find({
    collection: 'collection-items',
    where: { media_item: { equals: mediaItemId } },
    limit: 0,
    depth: 0,
  })

  const collectionIds = [
    ...new Set(
      linkResult.docs.map((doc) => {
        const c = doc.collection
        return typeof c === 'object' && c !== null ? (c as { id: number }).id : (c as number)
      }),
    ),
  ]

  for (const collectionId of collectionIds) {
    const allItemsResult = await payload.find({
      collection: 'collection-items',
      where: { collection: { equals: collectionId } },
      limit: 0,
      depth: 0,
    })

    const itemsTotal = allItemsResult.totalDocs
    const itemsSeen = allItemsResult.docs.filter((doc) => {
      const mi = doc.media_item
      const id = typeof mi === 'object' && mi !== null ? (mi as { id: number }).id : (mi as number)
      return watchedIds.has(id)
    }).length

    const percentage = itemsTotal > 0 ? Math.round((itemsSeen / itemsTotal) * 100) : 0
    const isCompleted = percentage === 100

    const existing = await payload.find({
      collection: 'user-collection-progress',
      where: {
        and: [{ user: { equals: userId } }, { collection: { equals: collectionId } }],
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      const prev = existing.docs[0]
      const wasCompleted = prev.is_completed as boolean
      const completedAt =
        isCompleted && !wasCompleted
          ? new Date().toISOString()
          : isCompleted
            ? (prev.completed_at as string | null)
            : null

      await payload.update({
        collection: 'user-collection-progress',
        id: prev.id,
        data: {
          items_seen: itemsSeen,
          items_total: itemsTotal,
          percentage,
          is_completed: isCompleted,
          completed_at: completedAt,
        },
      })
    } else {
      await payload.create({
        collection: 'user-collection-progress',
        data: {
          user: userId,
          collection: collectionId,
          items_seen: itemsSeen,
          items_total: itemsTotal,
          percentage,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        },
      })
    }
  }
}

async function recalculatePathways(
  payload: Payload,
  userId: number,
  mediaItemId: number,
  watchedIds: Set<number>,
): Promise<void> {
  const linkResult = await payload.find({
    collection: 'pathway-steps',
    where: { media_item: { equals: mediaItemId } },
    limit: 0,
    depth: 0,
  })

  const pathwayIds = [
    ...new Set(
      linkResult.docs.map((doc) => {
        const p = doc.pathway
        return typeof p === 'object' && p !== null ? (p as { id: number }).id : (p as number)
      }),
    ),
  ]

  for (const pathwayId of pathwayIds) {
    const allStepsResult = await payload.find({
      collection: 'pathway-steps',
      where: { pathway: { equals: pathwayId } },
      limit: 0,
      depth: 0,
    })

    const stepsTotal = allStepsResult.totalDocs
    const stepsCompleted = allStepsResult.docs.filter((doc) => {
      const mi = doc.media_item
      const id = typeof mi === 'object' && mi !== null ? (mi as { id: number }).id : (mi as number)
      return watchedIds.has(id)
    }).length

    const percentage = stepsTotal > 0 ? Math.round((stepsCompleted / stepsTotal) * 100) : 0
    const isCompleted = percentage === 100

    const existing = await payload.find({
      collection: 'user-pathway-progress',
      where: {
        and: [{ user: { equals: userId } }, { pathway: { equals: pathwayId } }],
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      const prev = existing.docs[0]
      const wasCompleted = prev.is_completed as boolean
      const completedAt =
        isCompleted && !wasCompleted
          ? new Date().toISOString()
          : isCompleted
            ? (prev.completed_at as string | null)
            : null

      await payload.update({
        collection: 'user-pathway-progress',
        id: prev.id,
        data: {
          steps_completed: stepsCompleted,
          steps_total: stepsTotal,
          percentage,
          is_completed: isCompleted,
          completed_at: completedAt,
        },
      })
    } else {
      await payload.create({
        collection: 'user-pathway-progress',
        data: {
          user: userId,
          pathway: pathwayId,
          steps_completed: stepsCompleted,
          steps_total: stepsTotal,
          percentage,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        },
      })
    }
  }
}
