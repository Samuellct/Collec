import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media_items" ADD COLUMN "slug" varchar;
    CREATE UNIQUE INDEX IF NOT EXISTS "media_items_slug_idx" ON "media_items" ("slug");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_items_slug_idx";
    ALTER TABLE "media_items" DROP COLUMN "slug";
  `)
}
