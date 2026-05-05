import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "collections" ADD COLUMN "linked_pathway_id" integer;
  ALTER TABLE "collections" ADD CONSTRAINT "collections_linked_pathway_id_pathways_id_fk" FOREIGN KEY ("linked_pathway_id") REFERENCES "public"."pathways"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "collections_linked_pathway_idx" ON "collections" USING btree ("linked_pathway_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "collections" DROP CONSTRAINT "collections_linked_pathway_id_pathways_id_fk";
  DROP INDEX "collections_linked_pathway_idx";
  ALTER TABLE "collections" DROP COLUMN "linked_pathway_id";`)
}
