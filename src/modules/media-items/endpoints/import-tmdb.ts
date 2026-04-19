import type { Endpoint } from 'payload'
import { fetchMovieDetail, fetchTvDetail } from '../tmdb/fetch-detail.ts'
import { normalizeMovie, normalizeTv } from '../tmdb/normalize.ts'

interface ImportBody {
  tmdbId: number
  mediaType: 'movie' | 'tv'
}

function parseBody(body: unknown): ImportBody | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const tmdbId = b['tmdbId']
  const mediaType = b['mediaType']
  if (typeof tmdbId !== 'number' || (mediaType !== 'movie' && mediaType !== 'tv')) return null
  return { tmdbId, mediaType }
}

export const importTmdbEndpoint: Endpoint = {
  path: '/import-tmdb',
  method: 'post',
  handler: async (req) => {
    if (req.user?.collection !== 'admins') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    let rawBody: unknown
    try {
      rawBody = await (req as Request).json()
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const body = parseBody(rawBody)
    if (!body) {
      return Response.json({ error: 'Invalid body: tmdbId (number) and mediaType (movie|tv) required' }, { status: 400 })
    }

    const { tmdbId, mediaType } = body

    try {
      const detail = mediaType === 'movie' ? await fetchMovieDetail(tmdbId) : await fetchTvDetail(tmdbId)
      const normalized = mediaType === 'movie' ? normalizeMovie(detail as Parameters<typeof normalizeMovie>[0]) : normalizeTv(detail as Parameters<typeof normalizeTv>[0])

      const payload = req.payload

      // Find media-type record for relationship
      const mediaTypeSlug = mediaType === 'movie' ? 'film' : 'series'
      const mediaTypeRecord = await payload.find({
        collection: 'media-types',
        where: { slug: { equals: mediaTypeSlug } },
        limit: 1,
      })

      if (mediaTypeRecord.docs.length === 0) {
        return Response.json(
          { error: `media-type '${mediaTypeSlug}' not found. Run the seed script first.` },
          { status: 500 },
        )
      }

      const mediaTypeId = mediaTypeRecord.docs[0]!.id

      // Check for existing MediaItem
      const existing = await payload.find({
        collection: 'media-items',
        where: {
          and: [
            { tmdb_id: { equals: tmdbId } },
            { media_type: { equals: mediaTypeId } },
          ],
        },
        limit: 1,
      })

      let docId: number | string
      let created = false

      const data = {
        ...normalized,
        media_type: mediaTypeId,
      }

      if (existing.docs.length > 0) {
        const updated = await payload.update({
          collection: 'media-items',
          id: existing.docs[0]!.id,
          data,
        })
        docId = updated.id
      } else {
        const created_doc = await payload.create({
          collection: 'media-items',
          data,
        })
        docId = created_doc.id
        created = true
      }

      // Upsert ExternalId for TMDB
      const existingExtId = await payload.find({
        collection: 'external-ids',
        where: {
          and: [
            { provider: { equals: 'tmdb' } },
            { external_id: { equals: String(tmdbId) } },
          ],
        },
        limit: 1,
      })

      if (existingExtId.docs.length === 0) {
        await payload.create({
          collection: 'external-ids',
          data: {
            media_item: docId,
            provider: 'tmdb',
            external_id: String(tmdbId),
          },
        })
      }

      // Upsert ExternalId for IMDb if available
      if (normalized.imdb_id) {
        const existingImdbId = await payload.find({
          collection: 'external-ids',
          where: {
            and: [
              { provider: { equals: 'imdb' } },
              { external_id: { equals: normalized.imdb_id } },
            ],
          },
          limit: 1,
        })

        if (existingImdbId.docs.length === 0) {
          await payload.create({
            collection: 'external-ids',
            data: {
              media_item: docId,
              provider: 'imdb',
              external_id: normalized.imdb_id,
            },
          })
        }
      }

      return Response.json({ id: docId, created })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return Response.json({ error: `Import failed: ${message}` }, { status: 502 })
    }
  },
}
