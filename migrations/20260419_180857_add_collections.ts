import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_collections_type" AS ENUM('filmography_complete', 'filmography_studio', 'saga', 'franchise', 'movement', 'subgenre', 'prize_complete', 'prize_edition', 'national_cinema', 'thematic');
  CREATE TYPE "public"."enum_collections_accessibility_level" AS ENUM('accessible', 'curieux', 'cinephile');
  CREATE TABLE "collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"short_description" varchar NOT NULL,
  	"editorial_note" varchar,
  	"type" "enum_collections_type" NOT NULL,
  	"accessibility_level" "enum_collections_accessibility_level" NOT NULL,
  	"cover_image_url" varchar,
  	"is_open" boolean DEFAULT false,
  	"is_published" boolean DEFAULT false,
  	"display_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "collections_id" integer;
  CREATE UNIQUE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");
  CREATE INDEX "collections_display_order_idx" ON "collections" USING btree ("display_order");
  CREATE INDEX "collections_updated_at_idx" ON "collections" USING btree ("updated_at");
  CREATE INDEX "collections_created_at_idx" ON "collections" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_collections_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("collections_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "collections" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "collections" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_collections_fk";

  DROP INDEX "payload_locked_documents_rels_collections_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "collections_id";
  DROP TYPE "public"."enum_collections_type";
  DROP TYPE "public"."enum_collections_accessibility_level";`)
}
