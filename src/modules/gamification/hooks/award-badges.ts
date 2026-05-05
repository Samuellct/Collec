import type { Payload } from 'payload'
import type { Badge, UserBadge } from '@/payload-types'

const MILESTONE_MAP: Record<string, number> = {
  milestone_10: 10,
  milestone_50: 50,
  milestone_100: 100,
  milestone_250: 250,
  milestone_500: 500,
}

export async function checkAndAwardBadges(payload: Payload, userId: number): Promise<void> {
  const [badgesResult, earnedResult] = await Promise.all([
    payload.find({
      collection: 'badges',
      limit: 50,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'user-badges',
      where: { user: { equals: userId } },
      limit: 50,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const badges = badgesResult.docs as Badge[]
  const earnedBadgeIds = new Set(
    (earnedResult.docs as UserBadge[]).map((ub) =>
      typeof ub.badge === 'object' ? ub.badge.id : ub.badge,
    ),
  )

  const unearnedBadges = badges.filter((b) => !earnedBadgeIds.has(b.id))
  if (unearnedBadges.length === 0) return

  let watchCount: number | null = null

  for (const badge of unearnedBadges) {
    const conditionMet = await checkCondition(payload, userId, badge, () => {
      if (watchCount !== null) return Promise.resolve(watchCount)
      return payload
        .count({ collection: 'user-watched-items', where: { user: { equals: userId } }, overrideAccess: true })
        .then(({ totalDocs }) => {
          watchCount = totalDocs
          return totalDocs
        })
    })

    if (conditionMet) {
      await payload.create({
        collection: 'user-badges',
        data: {
          user: userId,
          badge: badge.id,
          earned_at: new Date().toISOString(),
        },
        overrideAccess: true,
      })
    }
  }
}

async function checkCondition(
  payload: Payload,
  userId: number,
  badge: Badge,
  getWatchCount: () => Promise<number>,
): Promise<boolean> {
  const { condition_type } = badge

  if (condition_type === 'first_collection') {
    const { totalDocs } = await payload.count({
      collection: 'user-collection-progress',
      where: { and: [{ user: { equals: userId } }, { is_completed: { equals: true } }] },
      overrideAccess: true,
    })
    return totalDocs >= 1
  }

  if (condition_type === 'first_pathway') {
    const { totalDocs } = await payload.count({
      collection: 'user-pathway-progress',
      where: { and: [{ user: { equals: userId } }, { is_completed: { equals: true } }] },
      overrideAccess: true,
    })
    return totalDocs >= 1
  }

  const threshold = MILESTONE_MAP[condition_type]
  if (threshold !== undefined) {
    const count = await getWatchCount()
    return count >= threshold
  }

  return false
}
