import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pathways_type" AS ENUM('historical', 'author', 'thematic', 'national', 'genre', 'blockbuster');
  CREATE TYPE "public"."enum_pathways_accessibility_level" AS ENUM('accessible', 'curieux', 'cinephile');
  CREATE TABLE "pathways" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"introduction" varchar NOT NULL,
  	"type" "enum_pathways_type" NOT NULL,
  	"accessibility_level" "enum_pathways_accessibility_level" NOT NULL,
  	"estimated_duration_hours" numeric,
  	"linked_collection_id" integer,
  	"is_published" boolean DEFAULT false,
  	"display_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pathways_id" integer;
  ALTER TABLE "pathways" ADD CONSTRAINT "pathways_linked_collection_id_collections_id_fk" FOREIGN KEY ("linked_collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "pathways_slug_idx" ON "pathways" USING btree ("slug");
  CREATE INDEX "pathways_display_order_idx" ON "pathways" USING btree ("display_order");
  CREATE INDEX "pathways_linked_collection_idx" ON "pathways" USING btree ("linked_collection_id");
  CREATE INDEX "pathways_updated_at_idx" ON "pathways" USING btree ("updated_at");
  CREATE INDEX "pathways_created_at_idx" ON "pathways" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pathways_fk" FOREIGN KEY ("pathways_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pathways_id_idx" ON "payload_locked_documents_rels" USING btree ("pathways_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pathways" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pathways" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pathways_fk";
  DROP INDEX "payload_locked_documents_rels_pathways_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pathways_id";
  DROP TYPE "public"."enum_pathways_type";
  DROP TYPE "public"."enum_pathways_accessibility_level";`)
}
