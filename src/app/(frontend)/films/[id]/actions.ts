'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/get-current-user'

export async function markWatched(mediaItemId: number, watchedAt: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifié')

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'user-watched-items',
    where: { and: [{ user: { equals: user.id } }, { media_item: { equals: mediaItemId } }] },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length === 0) {
    await payload.create({
      collection: 'user-watched-items',
      data: { user: user.id, media_item: mediaItemId, watched_at: watchedAt },
      overrideAccess: true,
    })
  }

  revalidatePath(`/films/${mediaItemId}`)
}

export async function removeWatched(watchedItemId: number, mediaItemId: number): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifié')

  const payload = await getPayload({ config })

  const item = await payload.findByID({
    collection: 'user-watched-items',
    id: watchedItemId,
    overrideAccess: true,
  })
  const itemUserId = typeof item.user === 'number' ? item.user : item.user.id
  if (itemUserId !== user.id) throw new Error('Accès refusé')

  await payload.delete({
    collection: 'user-watched-items',
    id: watchedItemId,
    overrideAccess: true,
  })

  revalidatePath(`/films/${mediaItemId}`)
}
