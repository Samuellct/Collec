import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS media_items_fts_idx
      ON media_items
      USING GIN (
        to_tsvector('simple',
          coalesce(title, '') || ' ' ||
          coalesce(original_title, '') || ' ' ||
          coalesce(synopsis, '') || ' ' ||
          coalesce(director, '') || ' ' ||
          coalesce("cast", '')
        )
      )
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS media_items_title_trgm_idx
      ON media_items USING GIN (title gin_trgm_ops)
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS media_items_original_title_trgm_idx
      ON media_items USING GIN (original_title gin_trgm_ops)
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS media_items_fts_idx`)
  await db.execute(sql`DROP INDEX IF EXISTS media_items_title_trgm_idx`)
  await db.execute(sql`DROP INDEX IF EXISTS media_items_original_title_trgm_idx`)
}
