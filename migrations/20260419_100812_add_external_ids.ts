import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_external_ids_provider" AS ENUM('tmdb', 'imdb');
  CREATE TABLE "external_ids" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_item_id" integer NOT NULL,
  	"provider" "enum_external_ids_provider" NOT NULL,
  	"external_id" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "external_ids_id" integer;
  ALTER TABLE "external_ids" ADD CONSTRAINT "external_ids_media_item_id_media_items_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media_items"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "external_ids_media_item_idx" ON "external_ids" USING btree ("media_item_id");
  CREATE INDEX "external_ids_updated_at_idx" ON "external_ids" USING btree ("updated_at");
  CREATE INDEX "external_ids_created_at_idx" ON "external_ids" USING btree ("created_at");
  CREATE UNIQUE INDEX "provider_external_id_idx" ON "external_ids" USING btree ("provider","external_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_external_ids_fk" FOREIGN KEY ("external_ids_id") REFERENCES "public"."external_ids"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_external_ids_id_idx" ON "payload_locked_documents_rels" USING btree ("external_ids_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "external_ids" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "external_ids" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_external_ids_fk";
  
  DROP INDEX "payload_locked_documents_rels_external_ids_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "external_ids_id";
  DROP TYPE "public"."enum_external_ids_provider";`)
}
