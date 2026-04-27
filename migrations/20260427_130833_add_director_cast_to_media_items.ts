import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_items" ADD COLUMN "director" varchar;
  ALTER TABLE "media_items" ADD COLUMN "cast" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_items" DROP COLUMN "director";
  ALTER TABLE "media_items" DROP COLUMN "cast";`)
}
