import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { UserWatchedItem } from '@/payload-types'
import { recalculateForUserAndMedia } from './recalculate.ts'

export const afterWatchChange: CollectionAfterChangeHook<UserWatchedItem> = async ({
  doc,
  req,
}) => {
  const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
  const mediaItemId = typeof doc.media_item === 'object' ? doc.media_item.id : doc.media_item
  await recalculateForUserAndMedia(req.payload, userId, mediaItemId)
  return doc
}

export const afterWatchDelete: CollectionAfterDeleteHook<UserWatchedItem> = async ({
  doc,
  req,
}) => {
  const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
  const mediaItemId = typeof doc.media_item === 'object' ? doc.media_item.id : doc.media_item
  await recalculateForUserAndMedia(req.payload, userId, mediaItemId)
}
