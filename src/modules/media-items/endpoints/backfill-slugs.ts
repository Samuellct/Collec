import type { Endpoint } from 'payload'

const COMBINING_DIACRITICS = /\p{M}/gu

function toSlug(title: string, year?: number | null): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return year ? `${base}-${year}` : base
}

export const backfillSlugsEndpoint: Endpoint = {
  path: '/backfill-slugs',
  method: 'post',
  handler: async (req) => {
    if (req.user?.collection !== 'admins') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const payload = req.payload

    const all = await payload.find({
      collection: 'media-items',
      where: { slug: { exists: false } },
      depth: 0,
      limit: 0,
      overrideAccess: true,
    })

    let updated = 0
    let skipped = 0

    for (const item of all.docs) {
      if (item.slug) {
        skipped++
        continue
      }
      const slug = toSlug(item.title, item.year)
      try {
        await payload.update({
          collection: 'media-items',
          id: item.id,
          data: { slug },
          overrideAccess: true,
        })
        updated++
      } catch {
        skipped++
      }
    }

    return Response.json({ updated, skipped, total: all.docs.length })
  },
}
