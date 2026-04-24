import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getNextUnwatchedItem, getNextUnwatchedStep } from '../lib/next-unwatched-item.ts'

function makePayload(findImpl: (opts: { collection: string; where: Record<string, unknown> }) => Promise<{ docs: unknown[]; totalDocs: number }>) {
  return { find: vi.fn().mockImplementation(findImpl) }
}

const userId = 1
const collectionId = 42
const pathwayId = 7

const items = [
  { id: 1, collection: collectionId, media_item: { id: 10, release_date: '2000-01-01' } },
  { id: 2, collection: collectionId, media_item: { id: 20, release_date: '2005-06-15' } },
  { id: 3, collection: collectionId, media_item: { id: 30, release_date: '2010-12-01' } },
]

const steps = [
  { id: 1, pathway: pathwayId, position: 1, media_item: { id: 10 } },
  { id: 2, pathway: pathwayId, position: 2, media_item: { id: 20 } },
  { id: 3, pathway: pathwayId, position: 3, media_item: { id: 30 } },
]

describe('getNextUnwatchedItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the first item when none are watched', async () => {
    const payload = makePayload(async ({ collection }) => {
      if (collection === 'collection-items') return { docs: items, totalDocs: 3 }
      return { docs: [], totalDocs: 0 }
    })

    const result = await getNextUnwatchedItem(payload as never, userId, collectionId)

    expect(result).toEqual(items[0])
  })

  it('returns the first unwatched item when some are watched', async () => {
    const payload = makePayload(async ({ collection }) => {
      if (collection === 'collection-items') return { docs: items, totalDocs: 3 }
      if (collection === 'user-watched-items') return { docs: [{ media_item: 10 }], totalDocs: 1 }
      return { docs: [], totalDocs: 0 }
    })

    const result = await getNextUnwatchedItem(payload as never, userId, collectionId)

    expect(result).toEqual(items[1])
  })

  it('returns null when all items are watched', async () => {
    const payload = makePayload(async ({ collection }) => {
      if (collection === 'collection-items') return { docs: items, totalDocs: 3 }
      if (collection === 'user-watched-items') {
        return { docs: [{ media_item: 10 }, { media_item: 20 }, { media_item: 30 }], totalDocs: 3 }
      }
      return { docs: [], totalDocs: 0 }
    })

    const result = await getNextUnwatchedItem(payload as never, userId, collectionId)

    expect(result).toBeNull()
  })

  it('returns null when collection has no items', async () => {
    const payload = makePayload(async () => ({ docs: [], totalDocs: 0 }))

    const result = await getNextUnwatchedItem(payload as never, userId, collectionId)

    expect(result).toBeNull()
  })
})

describe('getNextUnwatchedStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the first step (position 1) when none are watched', async () => {
    const payload = makePayload(async ({ collection }) => {
      if (collection === 'pathway-steps') return { docs: steps, totalDocs: 3 }
      return { docs: [], totalDocs: 0 }
    })

    const result = await getNextUnwatchedStep(payload as never, userId, pathwayId)

    expect(result).toEqual(steps[0])
  })

  it('returns the next step when first is watched', async () => {
    const payload = makePayload(async ({ collection }) => {
      if (collection === 'pathway-steps') return { docs: steps, totalDocs: 3 }
      if (collection === 'user-watched-items') return { docs: [{ media_item: 10 }], totalDocs: 1 }
      return { docs: [], totalDocs: 0 }
    })

    const result = await getNextUnwatchedStep(payload as never, userId, pathwayId)

    expect(result).toEqual(steps[1])
  })

  it('returns null when all steps are watched', async () => {
    const payload = makePayload(async ({ collection }) => {
      if (collection === 'pathway-steps') return { docs: steps, totalDocs: 3 }
      if (collection === 'user-watched-items') {
        return { docs: [{ media_item: 10 }, { media_item: 20 }, { media_item: 30 }], totalDocs: 3 }
      }
      return { docs: [], totalDocs: 0 }
    })

    const result = await getNextUnwatchedStep(payload as never, userId, pathwayId)

    expect(result).toBeNull()
  })
})
