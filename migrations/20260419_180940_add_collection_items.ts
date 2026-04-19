import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "collection_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"collection_id" integer NOT NULL,
  	"media_item_id" integer NOT NULL,
  	"item_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "collection_items_id" integer;
  ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_media_item_id_media_items_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media_items"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "collection_items_collection_idx" ON "collection_items" USING btree ("collection_id");
  CREATE INDEX "collection_items_media_item_idx" ON "collection_items" USING btree ("media_item_id");
  CREATE INDEX "collection_items_updated_at_idx" ON "collection_items" USING btree ("updated_at");
  CREATE INDEX "collection_items_created_at_idx" ON "collection_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "collection_media_item_idx" ON "collection_items" USING btree ("collection_id","media_item_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_collection_items_fk" FOREIGN KEY ("collection_items_id") REFERENCES "public"."collection_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_collection_items_id_idx" ON "payload_locked_documents_rels" USING btree ("collection_items_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "collection_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "collection_items" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_collection_items_fk";

  DROP INDEX "payload_locked_documents_rels_collection_items_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "collection_items_id";`)
}
