import { describe, it, expect, vi, beforeEach } from 'vitest'
import { recalculateForUserAndMedia } from '../hooks/recalculate.ts'

function makeReq(overrides: Record<string, unknown> = {}) {
  const find = vi.fn()
  const create = vi.fn().mockResolvedValue({ id: 99 })
  const update = vi.fn().mockResolvedValue({ id: 1 })
  return { payload: { find, create, update, ...overrides } }
}

const userId = 1
const mediaItemId = 10

describe('recalculateForUserAndMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates UserCollectionProgress when media is in one collection and not yet tracked', async () => {
    const req = makeReq()
    req.payload.find.mockImplementation(async ({ collection, where }: { collection: string; where: Record<string, Record<string, unknown>> }) => {
      if (collection === 'user-watched-items') {
        return { docs: [{ media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'collection-items' && where?.media_item?.equals === mediaItemId) {
        return { docs: [{ collection: 42, media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'collection-items' && where?.collection?.equals === 42) {
        return { docs: [{ collection: 42, media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'user-collection-progress') {
        return { docs: [], totalDocs: 0 }
      }
      if (collection === 'pathway-steps' && where?.media_item?.equals === mediaItemId) {
        return { docs: [], totalDocs: 0 }
      }
      return { docs: [], totalDocs: 0 }
    })

    await recalculateForUserAndMedia(req as never, userId, mediaItemId)

    expect(req.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'user-collection-progress',
        data: expect.objectContaining({
          user: userId,
          collection: 42,
          items_seen: 1,
          items_total: 1,
          percentage: 100,
          is_completed: true,
        }),
      }),
    )
  })

  it('updates existing UserCollectionProgress on re-mark (no completion change)', async () => {
    const req = makeReq()
    req.payload.find.mockImplementation(async ({ collection, where }: { collection: string; where: Record<string, Record<string, unknown>> }) => {
      if (collection === 'user-watched-items') {
        return { docs: [{ media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'collection-items' && where?.media_item?.equals === mediaItemId) {
        return { docs: [{ collection: 42, media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'collection-items' && where?.collection?.equals === 42) {
        return { docs: [{ collection: 42, media_item: mediaItemId }, { collection: 42, media_item: 20 }], totalDocs: 2 }
      }
      if (collection === 'user-collection-progress') {
        return { docs: [{ id: 5, is_completed: false, completed_at: null }], totalDocs: 1 }
      }
      if (collection === 'pathway-steps' && where?.media_item?.equals === mediaItemId) {
        return { docs: [], totalDocs: 0 }
      }
      return { docs: [], totalDocs: 0 }
    })

    await recalculateForUserAndMedia(req as never, userId, mediaItemId)

    expect(req.payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'user-collection-progress',
        id: 5,
        data: expect.objectContaining({
          items_seen: 1,
          items_total: 2,
          percentage: 50,
          is_completed: false,
        }),
      }),
    )
    expect(req.payload.create).not.toHaveBeenCalled()
  })

  it('sets is_completed and completed_at when all items are watched', async () => {
    const req = makeReq()
    req.payload.find.mockImplementation(async ({ collection, where }: { collection: string; where: Record<string, Record<string, unknown>> }) => {
      if (collection === 'user-watched-items') {
        return { docs: [{ media_item: 10 }, { media_item: 20 }], totalDocs: 2 }
      }
      if (collection === 'collection-items' && where?.media_item?.equals === mediaItemId) {
        return { docs: [{ collection: 42, media_item: 10 }], totalDocs: 1 }
      }
      if (collection === 'collection-items' && where?.collection?.equals === 42) {
        return { docs: [{ collection: 42, media_item: 10 }, { collection: 42, media_item: 20 }], totalDocs: 2 }
      }
      if (collection === 'user-collection-progress') {
        return { docs: [{ id: 5, is_completed: false, completed_at: null }], totalDocs: 1 }
      }
      if (collection === 'pathway-steps' && where?.media_item?.equals === mediaItemId) {
        return { docs: [], totalDocs: 0 }
      }
      return { docs: [], totalDocs: 0 }
    })

    await recalculateForUserAndMedia(req as never, userId, mediaItemId)

    const call = req.payload.update.mock.calls[0][0]
    expect(call.data.is_completed).toBe(true)
    expect(call.data.completed_at).toBeTruthy()
  })

  it('resets is_completed and completed_at when a watched item is removed', async () => {
    const req = makeReq()
    req.payload.find.mockImplementation(async ({ collection, where }: { collection: string; where: Record<string, Record<string, unknown>> }) => {
      if (collection === 'user-watched-items') {
        return { docs: [], totalDocs: 0 }
      }
      if (collection === 'collection-items' && where?.media_item?.equals === mediaItemId) {
        return { docs: [{ collection: 42, media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'collection-items' && where?.collection?.equals === 42) {
        return { docs: [{ collection: 42, media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'user-collection-progress') {
        return { docs: [{ id: 5, is_completed: true, completed_at: '2026-01-01' }], totalDocs: 1 }
      }
      if (collection === 'pathway-steps' && where?.media_item?.equals === mediaItemId) {
        return { docs: [], totalDocs: 0 }
      }
      return { docs: [], totalDocs: 0 }
    })

    await recalculateForUserAndMedia(req as never, userId, mediaItemId)

    const call = req.payload.update.mock.calls[0][0]
    expect(call.data.is_completed).toBe(false)
    expect(call.data.completed_at).toBeNull()
    expect(call.data.percentage).toBe(0)
  })

  it('returns 0% without dividing by zero when collection is empty', async () => {
    const req = makeReq()
    req.payload.find.mockImplementation(async ({ collection, where }: { collection: string; where: Record<string, Record<string, unknown>> }) => {
      if (collection === 'user-watched-items') {
        return { docs: [{ media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'collection-items' && where?.media_item?.equals === mediaItemId) {
        return { docs: [{ collection: 42, media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'collection-items' && where?.collection?.equals === 42) {
        return { docs: [], totalDocs: 0 }
      }
      if (collection === 'user-collection-progress') {
        return { docs: [], totalDocs: 0 }
      }
      if (collection === 'pathway-steps' && where?.media_item?.equals === mediaItemId) {
        return { docs: [], totalDocs: 0 }
      }
      return { docs: [], totalDocs: 0 }
    })

    await recalculateForUserAndMedia(req as never, userId, mediaItemId)

    const call = req.payload.create.mock.calls[0][0]
    expect(call.data.percentage).toBe(0)
    expect(call.data.is_completed).toBe(false)
  })

  it('does not call create or update when media is in no collection or pathway', async () => {
    const req = makeReq()
    req.payload.find.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'user-watched-items') {
        return { docs: [{ media_item: mediaItemId }], totalDocs: 1 }
      }
      return { docs: [], totalDocs: 0 }
    })

    await recalculateForUserAndMedia(req as never, userId, mediaItemId)

    expect(req.payload.create).not.toHaveBeenCalled()
    expect(req.payload.update).not.toHaveBeenCalled()
  })

  it('updates all collections that contain the media', async () => {
    const req = makeReq()
    req.payload.find.mockImplementation(async ({ collection, where }: { collection: string; where: Record<string, Record<string, unknown>> }) => {
      if (collection === 'user-watched-items') {
        return { docs: [{ media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'collection-items' && where?.media_item?.equals === mediaItemId) {
        return {
          docs: [
            { collection: 42, media_item: mediaItemId },
            { collection: 43, media_item: mediaItemId },
          ],
          totalDocs: 2,
        }
      }
      if (collection === 'collection-items' && (where?.collection?.equals === 42 || where?.collection?.equals === 43)) {
        return { docs: [{ collection: where.collection?.equals, media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'user-collection-progress') {
        return { docs: [], totalDocs: 0 }
      }
      if (collection === 'pathway-steps' && where?.media_item?.equals === mediaItemId) {
        return { docs: [], totalDocs: 0 }
      }
      return { docs: [], totalDocs: 0 }
    })

    await recalculateForUserAndMedia(req as never, userId, mediaItemId)

    expect(req.payload.create).toHaveBeenCalledTimes(2)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collections = req.payload.create.mock.calls.map((c: any) => c[0].data.collection)
    expect(collections).toContain(42)
    expect(collections).toContain(43)
  })

  it('updates UserPathwayProgress when media is in a pathway', async () => {
    const req = makeReq()
    req.payload.find.mockImplementation(async ({ collection, where }: { collection: string; where: Record<string, Record<string, unknown>> }) => {
      if (collection === 'user-watched-items') {
        return { docs: [{ media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'collection-items' && where?.media_item?.equals === mediaItemId) {
        return { docs: [], totalDocs: 0 }
      }
      if (collection === 'pathway-steps' && where?.media_item?.equals === mediaItemId) {
        return { docs: [{ pathway: 7, media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'pathway-steps' && where?.pathway?.equals === 7) {
        return { docs: [{ pathway: 7, media_item: mediaItemId }], totalDocs: 1 }
      }
      if (collection === 'user-pathway-progress') {
        return { docs: [], totalDocs: 0 }
      }
      return { docs: [], totalDocs: 0 }
    })

    await recalculateForUserAndMedia(req as never, userId, mediaItemId)

    expect(req.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'user-pathway-progress',
        data: expect.objectContaining({
          user: userId,
          pathway: 7,
          steps_completed: 1,
          steps_total: 1,
          percentage: 100,
          is_completed: true,
        }),
      }),
    )
  })
})
