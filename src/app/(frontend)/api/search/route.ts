import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres/drizzle'
import { checkRateLimit } from '@/lib/rate-limit'

type DrizzleExecutable = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: <T = any>(query: unknown) => Promise<{ rows: T[] }>
}

const MAX_RESULTS = 20

interface SearchResultRow {
  id: number
  title: string
  original_title: string | null
  year: number | null
  poster_url: string | null
  director: string | null
  cast: string | null
  media_type_slug: string | null
  media_type_label: string | null
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2 || q.length > 100) {
    return NextResponse.json({ error: 'Query must be between 2 and 100 characters' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const drizzle = (payload.db as unknown as { drizzle: DrizzleExecutable }).drizzle

  const result = await drizzle.execute<SearchResultRow>(sql`
    SELECT
      mi.id,
      mi.title,
      mi.original_title,
      mi.year,
      mi.poster_url,
      mi.director,
      mi."cast",
      mt.slug  AS media_type_slug,
      mt.label AS media_type_label,
      ts_rank(
        to_tsvector('simple',
          coalesce(mi.title, '') || ' ' ||
          coalesce(mi.original_title, '') || ' ' ||
          coalesce(mi.synopsis, '') || ' ' ||
          coalesce(mi.director, '') || ' ' ||
          coalesce(mi."cast", '')
        ),
        plainto_tsquery('simple', ${q})
      ) AS fts_rank,
      greatest(
        similarity(mi.title, ${q}),
        coalesce(similarity(mi.original_title, ${q}), 0)
      ) AS trgm_rank
    FROM media_items mi
    LEFT JOIN media_types mt ON mt.id = mi.media_type_id
    WHERE
      to_tsvector('simple',
        coalesce(mi.title, '') || ' ' ||
        coalesce(mi.original_title, '') || ' ' ||
        coalesce(mi.synopsis, '') || ' ' ||
        coalesce(mi.director, '') || ' ' ||
        coalesce(mi."cast", '')
      ) @@ plainto_tsquery('simple', ${q})
      OR similarity(mi.title, ${q}) > 0.2
      OR coalesce(similarity(mi.original_title, ${q}), 0) > 0.2
      OR coalesce(word_similarity(${q}, mi.director), 0) > 0.4
    ORDER BY fts_rank DESC, trgm_rank DESC
    LIMIT ${MAX_RESULTS}
  `)

  return NextResponse.json({ results: result.rows })
}
