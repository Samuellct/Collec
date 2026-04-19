import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_items_source_of_truth" AS ENUM('tmdb');
  CREATE TABLE "media_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"original_title" varchar,
  	"year" numeric,
  	"duration" numeric,
  	"synopsis" varchar,
  	"poster_url" varchar,
  	"media_type_id" integer NOT NULL,
  	"tmdb_id" numeric,
  	"imdb_id" varchar,
  	"source_of_truth" "enum_media_items_source_of_truth" DEFAULT 'tmdb',
  	"source_last_synced_at" timestamp(3) with time zone,
  	"source_expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_items_id" integer;
  ALTER TABLE "media_items" ADD CONSTRAINT "media_items_media_type_id_media_types_id_fk" FOREIGN KEY ("media_type_id") REFERENCES "public"."media_types"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_items_media_type_idx" ON "media_items" USING btree ("media_type_id");
  CREATE INDEX "media_items_tmdb_id_idx" ON "media_items" USING btree ("tmdb_id");
  CREATE INDEX "media_items_updated_at_idx" ON "media_items" USING btree ("updated_at");
  CREATE INDEX "media_items_created_at_idx" ON "media_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "tmdb_id_media_type_idx" ON "media_items" USING btree ("tmdb_id","media_type_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_items_fk" FOREIGN KEY ("media_items_id") REFERENCES "public"."media_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_media_items_id_idx" ON "payload_locked_documents_rels" USING btree ("media_items_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_items" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_items_fk";
  
  DROP INDEX "payload_locked_documents_rels_media_items_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_items_id";
  DROP TYPE "public"."enum_media_items_source_of_truth";`)
}
