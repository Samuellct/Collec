import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Ajout nullable pour permettre le backfill
  await db.execute(sql`
    ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "pseudo" varchar;
  `)
  // Backfill des comptes existants (comptes de dev uniquement)
  await db.execute(sql`
    UPDATE "customers" SET "pseudo" = 'user_' || id WHERE "pseudo" IS NULL;
  `)
  // Contrainte NOT NULL et index unique
  await db.execute(sql`
    ALTER TABLE "customers" ALTER COLUMN "pseudo" SET NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS "customers_pseudo_idx" ON "customers" USING btree ("pseudo");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "customers_pseudo_idx";
    ALTER TABLE "customers" DROP COLUMN IF EXISTS "pseudo";
  `)
}
