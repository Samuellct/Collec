import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"display_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_types_id" integer;
  CREATE UNIQUE INDEX "media_types_slug_idx" ON "media_types" USING btree ("slug");
  CREATE INDEX "media_types_updated_at_idx" ON "media_types" USING btree ("updated_at");
  CREATE INDEX "media_types_created_at_idx" ON "media_types" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_types_fk" FOREIGN KEY ("media_types_id") REFERENCES "public"."media_types"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_media_types_id_idx" ON "payload_locked_documents_rels" USING btree ("media_types_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_types" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_types" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_types_fk";
  
  DROP INDEX "payload_locked_documents_rels_media_types_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_types_id";`)
}
