import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "user_watched_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"media_item_id" integer NOT NULL,
  	"watched_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "user_collection_progress" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"collection_id" integer NOT NULL,
  	"items_seen" numeric DEFAULT 0 NOT NULL,
  	"items_total" numeric DEFAULT 0 NOT NULL,
  	"percentage" numeric DEFAULT 0 NOT NULL,
  	"is_completed" boolean DEFAULT false NOT NULL,
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "user_pathway_progress" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"pathway_id" integer NOT NULL,
  	"steps_completed" numeric DEFAULT 0 NOT NULL,
  	"steps_total" numeric DEFAULT 0 NOT NULL,
  	"percentage" numeric DEFAULT 0 NOT NULL,
  	"is_completed" boolean DEFAULT false NOT NULL,
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_watched_items_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_collection_progress_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_pathway_progress_id" integer;

  ALTER TABLE "user_watched_items" ADD CONSTRAINT "user_watched_items_user_id_customers_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_watched_items" ADD CONSTRAINT "user_watched_items_media_item_id_media_items_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_collection_progress" ADD CONSTRAINT "user_collection_progress_user_id_customers_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_collection_progress" ADD CONSTRAINT "user_collection_progress_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_pathway_progress" ADD CONSTRAINT "user_pathway_progress_user_id_customers_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_pathway_progress" ADD CONSTRAINT "user_pathway_progress_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE set null ON UPDATE no action;

  CREATE INDEX "user_watched_items_user_idx" ON "user_watched_items" USING btree ("user_id");
  CREATE INDEX "user_watched_items_media_item_idx" ON "user_watched_items" USING btree ("media_item_id");
  CREATE INDEX "user_watched_items_updated_at_idx" ON "user_watched_items" USING btree ("updated_at");
  CREATE INDEX "user_watched_items_created_at_idx" ON "user_watched_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "user_media_item_idx" ON "user_watched_items" USING btree ("user_id","media_item_id");

  CREATE INDEX "user_collection_progress_user_idx" ON "user_collection_progress" USING btree ("user_id");
  CREATE INDEX "user_collection_progress_collection_idx" ON "user_collection_progress" USING btree ("collection_id");
  CREATE INDEX "user_collection_progress_updated_at_idx" ON "user_collection_progress" USING btree ("updated_at");
  CREATE INDEX "user_collection_progress_created_at_idx" ON "user_collection_progress" USING btree ("created_at");
  CREATE UNIQUE INDEX "user_collection_idx" ON "user_collection_progress" USING btree ("user_id","collection_id");

  CREATE INDEX "user_pathway_progress_user_idx" ON "user_pathway_progress" USING btree ("user_id");
  CREATE INDEX "user_pathway_progress_pathway_idx" ON "user_pathway_progress" USING btree ("pathway_id");
  CREATE INDEX "user_pathway_progress_updated_at_idx" ON "user_pathway_progress" USING btree ("updated_at");
  CREATE INDEX "user_pathway_progress_created_at_idx" ON "user_pathway_progress" USING btree ("created_at");
  CREATE UNIQUE INDEX "user_pathway_idx" ON "user_pathway_progress" USING btree ("user_id","pathway_id");

  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_watched_items_fk" FOREIGN KEY ("user_watched_items_id") REFERENCES "public"."user_watched_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_collection_progress_fk" FOREIGN KEY ("user_collection_progress_id") REFERENCES "public"."user_collection_progress"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_pathway_progress_fk" FOREIGN KEY ("user_pathway_progress_id") REFERENCES "public"."user_pathway_progress"("id") ON DELETE cascade ON UPDATE no action;

  CREATE INDEX "payload_locked_documents_rels_user_watched_items_id_idx" ON "payload_locked_documents_rels" USING btree ("user_watched_items_id");
  CREATE INDEX "payload_locked_documents_rels_user_collection_progress_i_idx" ON "payload_locked_documents_rels" USING btree ("user_collection_progress_id");
  CREATE INDEX "payload_locked_documents_rels_user_pathway_progress_id_idx" ON "payload_locked_documents_rels" USING btree ("user_pathway_progress_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "user_watched_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "user_collection_progress" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "user_pathway_progress" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "user_watched_items" CASCADE;
  DROP TABLE "user_collection_progress" CASCADE;
  DROP TABLE "user_pathway_progress" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_watched_items_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_collection_progress_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_pathway_progress_fk";
  DROP INDEX "payload_locked_documents_rels_user_watched_items_id_idx";
  DROP INDEX "payload_locked_documents_rels_user_collection_progress_i_idx";
  DROP INDEX "payload_locked_documents_rels_user_pathway_progress_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_watched_items_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_collection_progress_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_pathway_progress_id";`)
}
